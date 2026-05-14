import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useCreateMemo } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMemo = useCreateMemo();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both a title and the memo content.",
        variant: "destructive"
      });
      return;
    }

    createMemo.mutate(
      { data: { title, content, fileName: fileName || undefined } },
      {
        onSuccess: (memo) => {
          setLocation(`/memo/${memo.id}`);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create memo. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/memos/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to process file");
      }
      
      const data = await response.json();
      
      if (!title) {
        // Auto-generate title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
      
      setContent(data.text);
      setFileName(data.fileName);
      
      toast({
        title: "Document extracted",
        description: "Successfully extracted text from document."
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not extract text from this document. Please paste the text manually.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset so we can upload the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-primary mb-3">New Brief</h1>
        <p className="text-lg text-muted-foreground">Transform dense legal advice into clear, action-oriented business summaries.</p>
      </div>

      <div className="space-y-8 bg-card p-8 rounded-xl border shadow-sm">
        <div className="space-y-3">
          <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Internal Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Project Phoenix IP Analysis" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg py-6"
            data-testid="input-memo-title"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Source Material</Label>
          
          <div 
            className={`border-2 border-dashed rounded-lg transition-colors p-8 text-center
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}
              ${isUploading ? "opacity-50 pointer-events-none" : ""}
            `}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept=".pdf,.docx,.txt"
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {isUploading ? "Extracting text..." : "Drag and drop a PDF or DOCX file here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Or <button onClick={() => fileInputRef.current?.click()} className="text-primary font-medium hover:underline" data-testid="button-browse-file">browse files</button>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-border flex-1"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">OR PASTE TEXT</span>
            <div className="h-px bg-border flex-1"></div>
          </div>

          <Textarea 
            placeholder="Paste the full legal memo here..." 
            className="min-h-[300px] font-serif resize-y text-base p-6 leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            data-testid="textarea-memo-content"
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            size="lg" 
            className="gap-2 text-base px-8 h-14"
            onClick={handleCreate}
            disabled={createMemo.isPending || !title.trim() || !content.trim()}
            data-testid="button-create-memo"
          >
            {createMemo.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to configuration"}
            {!createMemo.isPending && <ArrowRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
