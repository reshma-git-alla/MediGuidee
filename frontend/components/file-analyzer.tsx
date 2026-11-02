"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Download, FileSearch, ImageIcon, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { EmergencyBanner } from "@/components/emergency-banner";
import { MarkdownContent } from "@/components/markdown-content";
import { PrivacyNotice } from "@/components/privacy-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { AnalysisResponse } from "@/types";

export function FileAnalyzer({ kind }: { kind: "report" | "image" }) {
  const [file, setFile] = useState<File>();
  const [result, setResult] = useState<AnalysisResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const isReport = kind === "report";

  const onDrop = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(undefined);
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: isReport
      ? { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }
      : { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      setResult(await api.analyze(file, kind));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([`${result.filename}\n\n${result.content}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.filename.replace(/\.[^.]+$/, "")}-analysis.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="space-y-4">
        <PrivacyNotice />
        <Card>
          <CardHeader>
            <CardTitle>Upload {isReport ? "a report" : "an image"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"}`}
            >
              <input {...getInputProps()} />
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {isReport ? <FileSearch className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
              </span>
              <p className="font-semibold">{isDragActive ? "Drop it here" : "Drag and drop or browse"}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isReport ? "PDF, JPG, or PNG" : "JPG or PNG"} up to 10 MB
              </p>
            </div>
            {file && (
              <div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
                <span className="truncate font-medium">{file.name}</span>
                <button onClick={() => setFile(undefined)} aria-label="Remove file"><X className="h-4 w-4" /></button>
              </div>
            )}
            {fileRejections.length > 0 && <p className="text-sm text-red-600">Choose one supported file under 10 MB.</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">{error}</p>}
            <Button className="w-full" size="lg" onClick={analyze} disabled={!file || loading}>
              {loading ? <><LoaderCircle className="h-5 w-5 animate-spin" />Analyzing securely...</> : <><UploadCloud className="h-5 w-5" />Analyze {isReport ? "report" : "image"}</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-[540px]">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Analysis</CardTitle>
          {result && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={copy} aria-label="Copy analysis">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={download} aria-label="Download analysis">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
              <LoaderCircle className="h-9 w-9 animate-spin text-primary" />
              <p className="mt-4 font-medium">Reviewing the file</p>
              <p className="mt-1 text-sm text-muted-foreground">This may take a moment.</p>
            </div>
          )}
          {!loading && !result && (
            <div className="flex min-h-96 flex-col items-center justify-center text-center text-muted-foreground">
              <FileSearch className="h-10 w-10 opacity-40" />
              <p className="mt-4 max-w-sm">Your educational analysis will appear here with findings, limitations, and questions for a healthcare professional.</p>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-5">
              {result.is_emergency && <EmergencyBanner reasons={result.emergency_reasons} />}
              <div className="rounded-xl bg-muted/60 p-5 text-sm"><MarkdownContent>{result.content}</MarkdownContent></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
