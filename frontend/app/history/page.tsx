"use client";

import { useEffect, useState } from "react";
import { FileHeart, History, ImageIcon, LoaderCircle, MessageCircle } from "lucide-react";

import { MarkdownContent } from "@/components/markdown-content";
import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { AnalysisHistoryItem, Conversation } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.history(), api.analysisHistory()])
      .then(([chatHistory, analysisHistory]) => {
        setConversations(chatHistory);
        setAnalyses(analysisHistory);
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "History could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeading
        eyebrow="Saved activity"
        title="Your MediGuide history"
        description="Review previous health conversations, medical report summaries, and image analyses stored on this device's development database."
      />

      {loading && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-5 text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Loading history...
        </div>
      )}
      {error && <p className="rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/50 dark:text-red-200">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Conversations</h2>
            </div>
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card key={conversation.id} className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base">{conversation.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{formatDate(conversation.updated_at)}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {conversation.messages.at(-1)?.content ?? "No messages"}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {!conversations.length && <EmptyHistory label="No conversations saved yet." />}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <FileHeart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">File analyses</h2>
            </div>
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {analysis.analysis_type === "report" ? <FileHeart className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">{analysis.filename}</CardTitle>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {analysis.analysis_type} · {formatDate(analysis.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                      <MarkdownContent>{analysis.result}</MarkdownContent>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!analyses.length && <EmptyHistory label="No report or image analyses saved yet." />}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function EmptyHistory({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
      <History className="mb-3 h-8 w-8 opacity-50" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
