"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { VoiceInput } from "@/components/VoiceInput";
import { TTSPlayer } from "@/components/TTSPlayer";
import { CitationChip } from "@/components/CitationChip";
import { MessageSquareText, Send, Bot, User, Sparkles } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    try {
      const data = await fetchApi("/chat/history");
      setMessages(data);
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: userMessage, created_at: new Date().toISOString() },
    ]);

    setLoading(true);

    try {
      const resp = await fetchApi("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
      });

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== Date.now()),
        { id: Date.now() - 1, role: "user", content: userMessage, created_at: new Date().toISOString() },
        resp,
      ]);
    } catch (err: any) {
      alert(err.message || "Failed to send chat query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[82vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Smart Life-Admin Chat + RAG</h1>
            <p className="text-xs text-slate-400">Answers grounded directly in your uploaded vault documents</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-full border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inline Source Citations Active</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Bot className="w-12 h-12 text-sky-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Ask your life vault anything</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              "When does my gym pass expire?", "What is the cancellation policy on my internet bill?", or "Summarize my health insurance deductible."
            </p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`flex items-start space-x-3 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === "user"
                    ? "bg-sky-500 text-white"
                    : "bg-slate-800 text-sky-400 border border-slate-700"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-sky-600 text-white"
                    : "bg-slate-950 border border-slate-800 text-slate-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Render Expandable Citations */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-xs font-semibold text-sky-400 mb-1">Grounded Source Citations:</p>
                    <div className="flex flex-wrap">
                      {m.citations.map((c: any, cIdx: number) => (
                        <CitationChip key={cIdx} citation={c} />
                      ))}
                    </div>
                  </div>
                )}

                {m.role === "assistant" && (
                  <div className="mt-3 flex items-center justify-end">
                    <TTSPlayer text={m.content} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center space-x-3 text-sm text-slate-400">
            <Bot className="w-6 h-6 text-sky-400 animate-pulse" />
            <span>Searching vector store & formatting answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-3">
        <VoiceInput onTranscript={(text) => setInput(text)} />
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your bills, insurance, or warranties..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/25 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
