/* app/exchange/components/TradeChat.tsx */
"use client";

import { useEffect, useRef, useState } from "react";

type ChatMsg = {
  _id: string;
  role: "user" | "admin";
  text?: string;
  imageUrl?: string;
  ts: number;
};

export default function TradeChat({
  tradeId,
  onUpload,
}: {
  tradeId: string;
  onUpload?: (file: File) => Promise<void>;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    function poll() {
      if (typeof window === "undefined") return;
      const key = `demo-trade-msgs:${tradeId}`;
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      if (mounted) setMessages(arr);
    }
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [tradeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    try {
      const key = `demo-trade-msgs:${tradeId}`;
      const arr: ChatMsg[] = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push({ _id: crypto.randomUUID(), role: "user", text, ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(arr));
      setText("");
      setMessages(arr);
    } finally {
      setSending(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (onUpload) {
      await onUpload(f);
      return;
    }
    const url = URL.createObjectURL(f); // preview only
    const key = `demo-trade-msgs:${tradeId}`;
    const arr: ChatMsg[] = JSON.parse(localStorage.getItem(key) || "[]");
    arr.push({ _id: crypto.randomUUID(), role: "user", imageUrl: url, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(arr));
    setMessages(arr);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur ring-1 ring-white/50">
      <h2 className="text-lg font-extrabold tracking-tight">Chat for this trade</h2>

      <div ref={scrollRef} className="mt-3 max-h-80 overflow-y-auto rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
        {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet. Share a note or a screenshot.</p>}
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m._id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                m.role === "user" ? "bg-gray-900 text-white" : "bg-white text-gray-900 ring-1 ring-gray-200"}`}>
                {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                {m.imageUrl && <img alt="upload" src={m.imageUrl} className="mt-2 h-auto max-h-64 w-full rounded-xl object-contain" />}
                <div className={`mt-1 text-[10px] ${m.role === "user" ? "text-white/70" : "text-gray-500"}`}>
                  {new Date(m.ts).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…" className="flex-1 rounded-xl border px-3 py-2 text-sm" />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50">
          Image
        </button>
        <button onClick={send} disabled={sending || !text.trim()}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
