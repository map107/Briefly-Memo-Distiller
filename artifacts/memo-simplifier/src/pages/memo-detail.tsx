import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetMemo,
  getGetMemoQueryKey,
  useListSummaries,
  getListSummariesQueryKey,
  useGenerateSummary,
  useDeleteSummary,
  useDeleteMemo,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Mail, FileText, MessageSquare, ChevronDown, ChevronUp, ArrowLeft, Globe, GitBranch } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { WorldMapViz, type WorldMapData } from "@/components/WorldMapViz";
import { FlowchartViz, type FlowchartData } from "@/components/FlowchartViz";

const FORMAT_LABELS: Record<string, { label: string; icon: typeof Mail }> = {
  email: { label: "Short email", icon: Mail },
  "one-pager": { label: "One-pager", icon: FileText },
  slack: { label: "Slack bullets", icon: MessageSquare },
  "world-map": { label: "World map", icon: Globe },
  flowchart: { label: "Flowchart", icon: GitBranch },
};

const VIZ_FORMATS = new Set(["world-map", "flowchart"]);

function SummaryCard({ summary, onDelete }: { summary: { id: number; memoId: number; audience: string; goal: string; format: string; content: string; createdAt: string }; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const formatInfo = FORMAT_LABELS[summary.format] ?? FORMAT_LABELS["email"];
  const FormatIcon = formatInfo.icon;

  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden" data-testid={`card-summary-${summary.id}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-medium text-xs">
            <FormatIcon className="w-3 h-3" />
            {formatInfo.label}
          </Badge>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{summary.audience}</span>
            {" — "}
            {summary.goal}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-toggle-summary-${summary.id}`}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            data-testid={`button-delete-summary-${summary.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="p-6">
          {summary.format === "world-map" ? (
            <WorldMapViz data={JSON.parse(summary.content) as WorldMapData} />
          ) : summary.format === "flowchart" ? (
            <FlowchartViz data={JSON.parse(summary.content) as FlowchartData} />
          ) : (
            <>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {summary.content}
              </pre>
              <div className="mt-4 pt-4 border-t flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(summary.content)}
                  data-testid={`button-copy-summary-${summary.id}`}
                >
                  Copy to clipboard
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MemoDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [format, setFormat] = useState("");
  const [showMemo, setShowMemo] = useState(false);

  const { data: memo, isLoading: memoLoading } = useGetMemo(id, {
    query: { enabled: !!id, queryKey: getGetMemoQueryKey(id) },
  });

  const { data: summaries, isLoading: summariesLoading } = useListSummaries(id, {
    query: { enabled: !!id, queryKey: getListSummariesQueryKey(id) },
  });

  const generateSummary = useGenerateSummary();
  const deleteSummaryMutation = useDeleteSummary();
  const deleteMemoMutation = useDeleteMemo();

  const handleGenerate = () => {
    if (!audience.trim() || !goal.trim() || !format) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before generating a summary.",
        variant: "destructive",
      });
      return;
    }

    generateSummary.mutate(
      { id, data: { audience, goal, format } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSummariesQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetMemoQueryKey(id) });
          toast({ title: "Summary generated", description: "Your summary is ready below." });
        },
        onError: () => {
          toast({
            title: "Generation failed",
            description: "Could not generate summary. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteSummary = (summaryId: number) => {
    deleteSummaryMutation.mutate(
      { memoId: id, summaryId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSummariesQueryKey(id) });
          toast({ title: "Summary deleted" });
        },
      }
    );
  };

  const handleDeleteMemo = () => {
    deleteMemoMutation.mutate(
      { id },
      {
        onSuccess: () => {
          setLocation("/history");
          toast({ title: "Memo deleted" });
        },
      }
    );
  };

  if (memoLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memo) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-muted-foreground">Memo not found.</p>
        <Button variant="link" onClick={() => setLocation("/new")} className="p-0 mt-2">
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => setLocation("/new")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            New memo
          </button>
          <h1 className="text-3xl font-serif font-bold text-primary">{memo.title}</h1>
          {memo.fileName && (
            <p className="text-sm text-muted-foreground mt-1">
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              {memo.fileName}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteMemo}
          disabled={deleteMemoMutation.isPending}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          data-testid="button-delete-memo"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete memo
        </Button>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
          onClick={() => setShowMemo(!showMemo)}
          data-testid="button-toggle-memo"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Source Memo
          </span>
          {showMemo ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        {showMemo && (
          <div className="px-6 pb-6 border-t">
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-muted-foreground mt-4 max-h-80 overflow-y-auto">
              {memo.content}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-1">Generate Summary</h2>
          <p className="text-sm text-muted-foreground">Configure who will receive this and what format you need.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="audience" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Who is the recipient?
            </Label>
            <Input
              id="audience"
              placeholder="e.g. Board of Directors, In-house legal team"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              data-testid="input-audience"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              What do they need?
            </Label>
            <Input
              id="goal"
              placeholder="e.g. Understand the key risks, Decide whether to proceed"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              data-testid="input-goal"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Output format
          </Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full md:w-72" data-testid="select-format">
              <SelectValue placeholder="Choose a format..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Short email</SelectItem>
              <SelectItem value="one-pager">One-pager</SelectItem>
              <SelectItem value="slack">Slack bullets</SelectItem>
              <SelectItem value="world-map">World map</SelectItem>
              <SelectItem value="flowchart">Flowchart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={generateSummary.isPending || !audience.trim() || !goal.trim() || !format}
            className="gap-2 px-8 h-12"
            data-testid="button-generate-summary"
          >
            {generateSummary.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate summary"
            )}
          </Button>
        </div>
      </div>

      {summariesLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : summaries && summaries.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-semibold text-foreground">
            {summaries.length} {summaries.length === 1 ? "Summary" : "Summaries"}
          </h2>
          {summaries.map((summary) => (
            <SummaryCard
              key={summary.id}
              summary={summary}
              onDelete={() => handleDeleteSummary(summary.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-xl bg-card">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No summaries yet</p>
          <p className="text-xs mt-1">Configure the form above and generate your first summary.</p>
        </div>
      )}
    </div>
  );
}
