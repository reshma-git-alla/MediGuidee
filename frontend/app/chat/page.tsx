import type { Metadata } from "next";
import { ChatInterface } from "@/components/chat-interface";

export const metadata: Metadata = { title: "Medical Chat" };

export default function ChatPage() {
  return <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><ChatInterface /></main>;
}
