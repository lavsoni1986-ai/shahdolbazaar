import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Loader2 } from "lucide-react";

export default function AIChat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic: Jab response aaye toh chat bottom par scroll ho jaye
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [response, loading]);

  const generateContent = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      // Replit Secrets (VITE_GEMINI_API_KEY) se key uthayega
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful assistant for ShahdolBazaar. Generate professional and attractive Hindi/English marketing content or shop descriptions for: ${prompt}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await res.json();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setResponse(data.candidates[0].content.parts[0].text);
        setPrompt(""); // Success ke baad input saaf
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setResponse(
        "❌ AI temporarily unavailable. Check your API key in Secrets.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-28 right-6 w-80 bg-white rounded-2xl shadow-2xl border z-50 max-h-[450px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
      {/* --- HEADER --- */}
      <div className="p-4 border-b bg-orange-500 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <h3 className="font-bold text-sm">ShahdolBazaar AI</h3>
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto bg-slate-50 min-h-[200px] scroll-smooth"
      >
        {!response && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 mt-4">
            <div className="bg-orange-100 p-2 rounded-full">
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-xs text-slate-500 px-4">
              "Medical shop offers" ya "Grocery shop description" likh kar try
              karein.
            </p>
          </div>
        )}

        {response && (
          <div className="bg-white border border-orange-100 rounded-2xl p-3 text-sm leading-relaxed shadow-sm text-slate-700 whitespace-pre-wrap">
            {response}
          </div>
        )}

        {loading && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        )}
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Kiske liye content chahiye?"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm transition-all"
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && generateContent()
            }
          />
          <Button
            size="sm"
            onClick={generateContent}
            disabled={loading || !prompt.trim()}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 shadow-md transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Powered by Gemini 1.5 Flash
        </p>
      </div>
    </div>
  );
}
