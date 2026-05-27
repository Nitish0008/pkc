/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, CornerDownLeft, Loader2, RotateCcw } from "lucide-react";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface LibrarianChatProps {
  id?: string;
  onRefreshDatabase: () => void; // Reload db items when transactions occur
}

export default function LibrarianChat({ id, onRefreshDatabase }: LibrarianChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello! I am Alex, your Smart AI Librarian Assistant. I have live access to our current physical book archives, member registration indexes, and circulation logs. You can ask me to search books, review who has overdue materials, or recommend reading lists based on current shelf quantities!"
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: "🔍 Shelf Lookup", query: "Where are Tara Westover's Educated or Robert Martin's books located on shelves?" },
    { label: "⏰ Overdue Flags", query: "Which books are currently flagged overdue, who has them, and what are their emails?" },
    { label: "💡 Learn programming", query: "What Computer Science books do we have currently in stock on our shelves? Suggest one for me and teach me why I should check it out." }
  ];

  // Auto-scroll chat history to base on append
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setLoading(true);

    try {
      const response = await fetch("/api/library/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          chatHistory: messages.slice(-8) // Take last 8 message frames for rolling history context
        })
      });

      if (!response.ok) {
        throw new Error("API route returned network fail state.");
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        role: "model",
        text: data.response || "I had difficulty connecting to our shelf archives. Please try again."
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "⚠️ Connection Exception: Unable to contact the AI Librarian database. Please confirm your API servers are running and you are online!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "model",
        text: "Librarian interface reset! How may I help you search or manage our catalogs today?"
      }
    ]);
  };

  return (
    <div
      id={id || "librarian-assistant-chat"}
      className="flex flex-col h-[650px] bg-slate-900/40 rounded-2xl border border-slate-800 backdrop-blur-md overflow-hidden shadow-xl"
    >
      {/* Mini AI banner header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-400">
              <Bot className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h4 className="font-sans text-xs font-semibold text-slate-400">AI Assistant Companion</h4>
            <h2 className="font-sans text-sm font-bold text-white flex items-center gap-1.5">
              Alex the AI Librarian
              <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400 animate-pulse" />
            </h2>
          </div>
        </div>
        
        <button
          onClick={handleResetChat}
          title="Clear Conversation"
          className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Preset guidelines quick selection bar */}
      <div className="bg-slate-900/20 px-4 py-2.5 border-b border-slate-800/50 flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase mr-1">
          Preset Inquiries:
        </span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSendPrompt(preset.query)}
            className="text-[11px] font-sans px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 transition text-slate-300 hover:text-white cursor-pointer hover:border-slate-700 font-medium"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Chat messages viewport */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20">
        {messages.map((msg, index) => {
          const isModel = msg.role === "model";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${
                isModel ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              <div
                className={`flex-shrink-0 rounded-lg p-2 border ${
                  isModel
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-800 text-emerald-400 border-slate-700"
                }`}
              >
                {isModel ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              </div>
              <div
                className={`rounded-xl px-4 py-2.5 border font-sans text-sm leading-relaxed ${
                  isModel
                    ? "bg-slate-900/80 text-slate-200 border-slate-800/80 rounded-tl-none pr-6"
                    : "bg-emerald-950/30 text-white border-emerald-900/40 rounded-tr-none"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 max-w-[85%] mr-auto">
            <div className="flex-shrink-0 rounded-lg p-2 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-spin">
              <Loader2 className="h-3.5 w-3.5" />
            </div>
            <div className="bg-slate-900/50 text-slate-400 border border-slate-800/80 rounded-xl px-4 py-3 rounded-tl-none text-xs font-mono tracking-wide flex items-center gap-2">
              Alex is consulting current shelves reference index...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send message textfield form */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputMsg);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={loading}
            placeholder="Query physical locations, check borrow statuses, or request recommendations..."
            className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-3 pl-4 pr-12 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/70 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || loading}
            className="absolute right-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-40 disabled:hover:bg-emerald-600 flex items-center justify-center cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
          Powered by Gemini 3.5. Smart knowledge integrates physical inventories dynamically.
        </p>
      </div>
    </div>
  );
}
