export interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  is_emergency: boolean;
  emergency_reasons: string[];
  disclaimer: string;
}

export interface AnalysisResponse {
  id: number;
  filename: string;
  analysis_type: "report" | "image";
  content: string;
  is_emergency: boolean;
  emergency_reasons: string[];
  disclaimer: string;
}

export interface AnalysisHistoryItem {
  id: number;
  analysis_type: "report" | "image";
  filename: string;
  result: string;
  created_at: string;
}
