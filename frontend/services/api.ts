import type { AnalysisHistoryItem, AnalysisResponse, ChatResponse, Conversation } from "@/types";

// Keep browser requests on the same website. Next.js forwards /api to FastAPI.
const API_URL = "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options);

  const text = await response.text();

  let body: unknown;

  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { detail: text };
  }

  if (!response.ok) {
    throw new Error(
      (typeof body === "object" && body !== null && "detail" in body && typeof body.detail === "string"
        ? body.detail
        : undefined) ||
      `Request failed (${response.status})`
    );
  }

  return body as T;
}

export const api = {
  chat(message: string, conversationId?: number) {
    return request<ChatResponse>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  },
  history() {
    return request<Conversation[]>("/history", { cache: "no-store" });
  },
  analysisHistory() {
    return request<AnalysisHistoryItem[]>("/analysis-history", { cache: "no-store" });
  },
  analyze(file: File, kind: "report" | "image") {
    const formData = new FormData();
    formData.append("file", file);
    return request<AnalysisResponse>(kind === "report" ? "/analyze-report" : "/analyze-image", {
      method: "POST",
      body: formData,
    });
  },
};
