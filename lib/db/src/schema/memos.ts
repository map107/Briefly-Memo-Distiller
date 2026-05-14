import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const memosTable = pgTable("memos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMemoSchema = createInsertSchema(memosTable).omit({ id: true, createdAt: true });
export type InsertMemo = z.infer<typeof insertMemoSchema>;
export type Memo = typeof memosTable.$inferSelect;

export const summariesTable = pgTable("summaries", {
  id: serial("id").primaryKey(),
  memoId: integer("memo_id").notNull().references(() => memosTable.id, { onDelete: "cascade" }),
  audience: text("audience").notNull(),
  goal: text("goal").notNull(),
  format: text("format").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSummarySchema = createInsertSchema(summariesTable).omit({ id: true, createdAt: true });
export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summariesTable.$inferSelect;
