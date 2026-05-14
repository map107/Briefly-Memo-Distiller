import { Router } from "express";
import multer from "multer";
import { db } from "@workspace/db";
import { memosTable, summariesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateMemoBody,
  GetMemoParams,
  DeleteMemoParams,
  ListSummariesParams,
  GenerateSummaryParams,
  GenerateSummaryBody,
  DeleteSummaryParams,
} from "@workspace/api-zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/memos/upload — file upload (not in codegen, handled manually)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;
    let text = "";

    if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
      const pdfParse = await import("pdf-parse");
      const data = await pdfParse.default(buffer);
      text = data.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      originalname.endsWith(".docx")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimetype === "text/plain" || originalname.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      res.status(400).json({ error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." });
      return;
    }

    res.json({ text: text.trim(), fileName: originalname });
  } catch (err) {
    req.log.error({ err }, "Failed to parse file");
    res.status(500).json({ error: "Failed to extract text from file" });
  }
});

// GET /api/memos/stats
router.get("/stats", async (req, res) => {
  try {
    const [memoCountResult] = await db.select({ count: sql<number>`count(*)::int` }).from(memosTable);
    const [summaryCountResult] = await db.select({ count: sql<number>`count(*)::int` }).from(summariesTable);
    
    const summaryCountsByMemo = await db
      .select({ memoId: summariesTable.memoId, count: sql<number>`count(*)::int` })
      .from(summariesTable)
      .groupBy(summariesTable.memoId);
    
    const countMap = new Map(summaryCountsByMemo.map((r) => [r.memoId, r.count]));

    const recentMemos = await db.select().from(memosTable).orderBy(desc(memosTable.createdAt)).limit(5);

    res.json({
      totalMemos: memoCountResult?.count ?? 0,
      totalSummaries: summaryCountResult?.count ?? 0,
      recentMemos: recentMemos.map((m) => ({
        id: m.id,
        title: m.title,
        content: m.content,
        fileName: m.fileName ?? null,
        createdAt: m.createdAt.toISOString(),
        summaryCount: countMap.get(m.id) ?? 0,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get memo stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /api/memos
router.get("/", async (req, res) => {
  try {
    const memos = await db.select().from(memosTable).orderBy(desc(memosTable.createdAt));

    const summaryCountsByMemo = await db
      .select({ memoId: summariesTable.memoId, count: sql<number>`count(*)::int` })
      .from(summariesTable)
      .groupBy(summariesTable.memoId);

    const countMap = new Map(summaryCountsByMemo.map((r) => [r.memoId, r.count]));

    res.json(
      memos.map((m) => ({
        id: m.id,
        title: m.title,
        content: m.content,
        fileName: m.fileName ?? null,
        createdAt: m.createdAt.toISOString(),
        summaryCount: countMap.get(m.id) ?? 0,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list memos");
    res.status(500).json({ error: "Failed to list memos" });
  }
});

// POST /api/memos
router.post("/", async (req, res) => {
  try {
    const parsed = CreateMemoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { title, content, fileName } = parsed.data;
    const [memo] = await db
      .insert(memosTable)
      .values({ title, content, fileName: fileName ?? null })
      .returning();

    res.status(201).json({
      id: memo!.id,
      title: memo!.title,
      content: memo!.content,
      fileName: memo!.fileName ?? null,
      createdAt: memo!.createdAt.toISOString(),
      summaryCount: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create memo");
    res.status(500).json({ error: "Failed to create memo" });
  }
});

// GET /api/memos/:id
router.get("/:id", async (req, res) => {
  try {
    const parsed = GetMemoParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid memo ID" });
      return;
    }

    const [memo] = await db.select().from(memosTable).where(eq(memosTable.id, parsed.data.id));
    if (!memo) {
      res.status(404).json({ error: "Memo not found" });
      return;
    }

    const [summaryCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(summariesTable)
      .where(eq(summariesTable.memoId, memo.id));

    res.json({
      id: memo.id,
      title: memo.title,
      content: memo.content,
      fileName: memo.fileName ?? null,
      createdAt: memo.createdAt.toISOString(),
      summaryCount: summaryCountResult?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get memo");
    res.status(500).json({ error: "Failed to get memo" });
  }
});

// DELETE /api/memos/:id
router.delete("/:id", async (req, res) => {
  try {
    const parsed = DeleteMemoParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid memo ID" });
      return;
    }

    await db.delete(memosTable).where(eq(memosTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete memo");
    res.status(500).json({ error: "Failed to delete memo" });
  }
});

// GET /api/memos/:id/summaries
router.get("/:id/summaries", async (req, res) => {
  try {
    const parsed = ListSummariesParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid memo ID" });
      return;
    }

    const summaries = await db
      .select()
      .from(summariesTable)
      .where(eq(summariesTable.memoId, parsed.data.id))
      .orderBy(desc(summariesTable.createdAt));

    res.json(
      summaries.map((s) => ({
        id: s.id,
        memoId: s.memoId,
        audience: s.audience,
        goal: s.goal,
        format: s.format,
        content: s.content,
        createdAt: s.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list summaries");
    res.status(500).json({ error: "Failed to list summaries" });
  }
});

function buildSummaryPrompt(
  memoContent: string,
  audience: string,
  goal: string,
  format: string
): string {
  const formatInstructions: Record<string, string> = {
    email: `Write a short, professional email summary (no more than 250 words). Structure it as: opening sentence stating the bottom line, 2-3 bullet points with key actions or decisions needed, and a closing sentence on what happens next. No legal jargon. Use plain English.`,
    "one-pager": `Write a structured one-pager with the following sections:
- **Bottom line** (1-2 sentences): What does this mean for us?
- **Key points** (3-5 bullets): The most important things to know
- **What we need to do** (2-4 bullets): Concrete next steps or decisions required
- **Key risks** (2-3 bullets): What could go wrong if we don't act
No legal jargon. Use plain English throughout.`,
    slack: `Write a concise Slack-style message with:
- One sentence summary at the top (the TLDR)
- 3-5 bullet points with the key things to know and do
Keep it short enough to read in 30 seconds. No legal jargon. Plain English only.`,
  };

  return `You are an expert at translating complex legal advice into clear, practical guidance for business people.

You have been given a legal memo. Your job is to summarize it for a specific audience with a specific goal.

**Recipient:** ${audience}
**What they need:** ${goal}
**Output format:** ${formatInstructions[format] ?? formatInstructions["email"]}

**Important rules:**
- Zero legal jargon. If you must use a legal term, explain it in plain English immediately after.
- Be practical and action-oriented. Tell them what to DO, not just what the law says.
- Be direct. Business people need clarity, not hedging.
- Focus on what matters to THEM, not what's interesting to a lawyer.
- Never start with "I" or "This memo".

**Legal memo to summarize:**
---
${memoContent.slice(0, 15000)}
---

Write the summary now:`;
}

// POST /api/memos/:id/summaries
router.post("/:id/summaries", async (req, res) => {
  try {
    const paramsParsed = GenerateSummaryParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid memo ID" });
      return;
    }

    const bodyParsed = GenerateSummaryBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const memoId = paramsParsed.data.id;
    const { audience, goal, format } = bodyParsed.data;

    const [memo] = await db.select().from(memosTable).where(eq(memosTable.id, memoId));
    if (!memo) {
      res.status(404).json({ error: "Memo not found" });
      return;
    }

    const prompt = buildSummaryPrompt(memo.content, audience, goal, format);

    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content ?? "";

    const [summary] = await db
      .insert(summariesTable)
      .values({ memoId, audience, goal, format, content })
      .returning();

    res.status(201).json({
      id: summary!.id,
      memoId: summary!.memoId,
      audience: summary!.audience,
      goal: summary!.goal,
      format: summary!.format,
      content: summary!.content,
      createdAt: summary!.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate summary");
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// DELETE /api/memos/:memoId/summaries/:summaryId
router.delete("/:memoId/summaries/:summaryId", async (req, res) => {
  try {
    const parsed = DeleteSummaryParams.safeParse({
      memoId: Number(req.params.memoId),
      summaryId: Number(req.params.summaryId),
    });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    await db.delete(summariesTable).where(eq(summariesTable.id, parsed.data.summaryId));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete summary");
    res.status(500).json({ error: "Failed to delete summary" });
  }
});

export default router;
