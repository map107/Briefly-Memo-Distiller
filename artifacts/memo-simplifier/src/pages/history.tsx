import { useLocation } from "wouter";
import {
  useListMemos,
  getListMemosQueryKey,
  useGetMemoStats,
  getGetMemoStatsQueryKey,
  useDeleteMemo,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Trash2, PlusCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function History() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: memos, isLoading: memosLoading } = useListMemos({
    query: { queryKey: getListMemosQueryKey() },
  });

  const { data: stats, isLoading: statsLoading } = useGetMemoStats({
    query: { queryKey: getGetMemoStatsQueryKey() },
  });

  const deleteMemo = useDeleteMemo();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMemo.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMemosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMemoStatsQueryKey() });
          toast({ title: "Memo deleted" });
        },
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary">History</h1>
          <p className="text-muted-foreground mt-1">All your legal memos and generated summaries.</p>
        </div>
        <Button onClick={() => setLocation("/new")} className="gap-2" data-testid="button-new-memo">
          <PlusCircle className="w-4 h-4" />
          New memo
        </Button>
      </div>

      {!statsLoading && stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-6 shadow-sm" data-testid="stat-total-memos">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total memos</span>
            </div>
            <p className="text-4xl font-serif font-bold text-foreground">{stats.totalMemos}</p>
          </div>
          <div className="bg-card border rounded-xl p-6 shadow-sm" data-testid="stat-total-summaries">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Summaries generated</span>
            </div>
            <p className="text-4xl font-serif font-bold text-foreground">{stats.totalSummaries}</p>
          </div>
        </div>
      )}

      {memosLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : memos && memos.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            All memos ({memos.length})
          </h2>
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
              onClick={() => setLocation(`/memo/${memo.id}`)}
              data-testid={`card-memo-${memo.id}`}
            >
              <div className="flex items-center justify-between p-5 gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-semibold text-foreground text-lg truncate group-hover:text-primary transition-colors">
                      {memo.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">{formatDate(memo.createdAt)}</span>
                      {memo.fileName && (
                        <span className="text-xs text-muted-foreground truncate max-w-48">
                          {memo.fileName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {memo.content.slice(0, 200)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {memo.summaryCount != null && memo.summaryCount > 0 && (
                    <Badge variant="secondary" className="text-xs font-medium" data-testid={`badge-summary-count-${memo.id}`}>
                      {memo.summaryCount} {memo.summaryCount === 1 ? "summary" : "summaries"}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(memo.id, e)}
                    disabled={deleteMemo.isPending}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-delete-memo-${memo.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border rounded-xl bg-card" data-testid="empty-state-history">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-primary/50" />
          </div>
          <h3 className="font-serif font-semibold text-foreground text-lg mb-1">No memos yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Upload your first legal memo to get started.</p>
          <Button onClick={() => setLocation("/new")} data-testid="button-get-started">
            Upload a memo
          </Button>
        </div>
      )}
    </div>
  );
}
