"use client";

import { useRef, useEffect, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [idea, setIdea] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"idle" | "brainstorm">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [brainstormLoading, setBrainstormLoading] = useState(false);
  const [brainstormDone, setBrainstormDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, brainstormLoading]);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await response.json();
      setFeedback(data.feedback || data.error || "Unable to get feedback");
    } catch {
      setFeedback("Error getting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startBrainstorm = async () => {
    if (!idea.trim()) return;
    setMode("brainstorm");
    setFeedback(null);
    setBrainstormDone(false);
    setChatInput("");
    const initial: Message[] = [{ role: "user", content: idea.trim() }];
    setMessages(initial);
    setBrainstormLoading(true);
    try {
      const res = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: initial }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...initial, { role: "assistant", content: data.error }]);
      } else {
        setMessages([...initial, { role: "assistant", content: data.reply }]);
        if (data.done) setBrainstormDone(true);
      }
    } catch {
      setMessages([
        ...initial,
        { role: "assistant", content: "Error starting brainstorm. Please try again." },
      ]);
    } finally {
      setBrainstormLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || brainstormLoading || brainstormDone) return;
    const userMsg: Message = { role: "user", content: chatInput.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setChatInput("");
    setBrainstormLoading(true);
    try {
      const res = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...next, { role: "assistant", content: data.error }]);
      } else if (data.done) {
        setBrainstormDone(true);
        setFeedback(data.reply);
      } else {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Error. Please try again." }]);
    } finally {
      setBrainstormLoading(false);
    }
  };

  const startOver = () => {
    setMode("idle");
    setMessages([]);
    setChatInput("");
    setBrainstormDone(false);
    setFeedback(null);
    setIdea("");
  };

  const questionCount = messages.filter((m) => m.role === "assistant").length;
  const displayMessages = messages.slice(1);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Idea Refiner
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Share your idea and get constructive feedback
          </p>

          <form onSubmit={handleQuickSubmit} className="space-y-6">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Write your idea here..."
              disabled={loading || mode === "brainstorm"}
              className="w-full h-32 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-colors disabled:opacity-50"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!idea.trim() || loading || mode === "brainstorm"}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
              >
                {loading ? "Getting Feedback..." : "GO"}
              </button>
              <button
                type="button"
                onClick={mode === "brainstorm" ? startOver : startBrainstorm}
                disabled={(!idea.trim() && mode === "idle") || loading}
                className="flex-1 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:border-gray-400 disabled:text-gray-400 font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
              >
                {mode === "brainstorm" ? "Start Over" : "Deep Brainstorm"}
              </button>
            </div>
          </form>

          {mode === "brainstorm" && (
            <div className="mt-6 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 flex justify-between">
                <span>
                  {brainstormDone
                    ? "Brainstorm complete — plan generated below"
                    : `Question ${Math.min(questionCount + 1, 5)} of 5`}
                </span>
                {!brainstormDone && (
                  <span className="text-indigo-400">
                    {"●".repeat(questionCount) + "○".repeat(5 - questionCount)}
                  </span>
                )}
              </div>

              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {displayMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {brainstormLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-sm text-gray-400 dark:text-gray-500 italic">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {!brainstormDone && (
                <div className="border-t border-indigo-100 dark:border-indigo-800 p-3 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                    placeholder="Your answer..."
                    disabled={brainstormLoading}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim() || brainstormLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          )}

          {feedback && (
            <div className="mt-8 p-6 bg-indigo-50 dark:bg-gray-700 border-l-4 border-indigo-600 rounded-lg">
              <h2 className="font-bold text-gray-900 dark:text-white mb-2">
                {brainstormDone ? "Your Brainstorm Plan:" : "Feedback:"}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {feedback}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
