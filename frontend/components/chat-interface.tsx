"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Check, Copy, History, LoaderCircle, Plus, Send, UserRound } from "lucide-react";

import { EmergencyBanner } from "@/components/emergency-banner";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { ChatMessage, Conversation } from "@/types";

const welcome: ChatMessage = {
  role: "assistant",
  content:
    "Hello, I’m MediGuide. I can explain health topics and help you prepare for a conversation with a healthcare professional. I cannot diagnose or prescribe.\n\nThis information is for educational purposes only and is not medical advice.",
};

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<number>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emergencyReasons, setEmergencyReasons] = useState<string[]>([]);
  const [copied, setCopied] = useState<number>();
  const endRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    try {
      setHistory(await api.history());
    } catch {
      // Chat remains usable if history cannot be loaded.
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (event: FormEvent) => {
  event.preventDefault();

  const message = input.trim();

  if (!message || loading) return;

  setInput("");
  setError("");
  setEmergencyReasons([]);

  setMessages((current) => [
    ...current,
    {
      role: "user",
      content: message,
    },
  ]);

  setLoading(true);

  try {
    const result = await api.chat(message, conversationId);

    console.log("Chat Result:", result);

    setConversationId(result.conversation_id);

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: result.response,
      },
    ]);

    if (result.is_emergency) {
      setEmergencyReasons(result.emergency_reasons || []);
    }

    // History refresh should never break chat
    try {
      await loadHistory();
    } catch (historyError) {
      console.error("History loading failed:", historyError);
    }

    // Clear previous errors after success
    setError("");
  } catch (caught) {
    console.error("Chat Error:", caught);

    setError(
      caught instanceof Error
        ? caught.message
        : "Unable to reach the assistant."
    );
  } finally {
    setLoading(false);
  }
};

  const selectConversation = (conversation: Conversation) => {
    setConversationId(conversation.id);
    setMessages(conversation.messages);
    setEmergencyReasons([]);
    setError("");
  };

  const newConversation = () => {
    setConversationId(undefined);
    setMessages([welcome]);
    setEmergencyReasons([]);
    setError("");
  };

  const copy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopied(index);
    window.setTimeout(() => setCopied(undefined), 1500);
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-border bg-muted/30 p-4 lg:block">
        <Button className="w-full" onClick={newConversation}><Plus className="h-4 w-4" />New conversation</Button>
        <div className="mt-6 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <History className="h-4 w-4" />History
        </div>
        <div className="mt-2 space-y-1">
          {history.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => selectConversation(conversation)}
              className="w-full truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-background"
            >
              {conversation.title}
            </button>
          ))}
          {!history.length && <p className="px-3 py-4 text-sm text-muted-foreground">No saved conversations yet.</p>}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold">Medical assistant</h1>
              <p className="text-xs text-muted-foreground">Educational guidance with safety screening</p>
            </div>
            <Button variant="outline" size="sm" className="lg:hidden" onClick={newConversation}>
              <Plus className="h-4 w-4" />New
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {emergencyReasons.length > 0 && <EmergencyBanner reasons={emergencyReasons} />}
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </span>
              )}
              <div className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[75%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {message.role === "assistant" ? <MarkdownContent>{message.content}</MarkdownContent> : <p className="whitespace-pre-wrap">{message.content}</p>}
                {message.role === "assistant" && (
                  <button
                    aria-label="Copy response"
                    onClick={() => copy(message.content, index)}
                    className="absolute -right-9 top-2 rounded-md p-2 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100 focus:opacity-100"
                  >
                    {copied === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {message.role === "user" && (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                  <UserRound className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></span>
              <span className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3"><LoaderCircle className="h-4 w-4 animate-spin" />Reviewing your question...</span>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">{error}</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="border-t border-border p-4 sm:p-6">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/30">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Describe a symptom or ask a health question..."
              rows={2}
              maxLength={5000}
              className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
            />
            <Button size="icon" type="submit" disabled={!input.trim() || loading} aria-label="Send message">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">Educational information only. For emergencies, contact local emergency services.</p>
        </form>
      </section>
    </div>
  );
}
