"use client";

import { useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      setFeedback("Error getting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Write your idea here..."
                disabled={loading}
                className="w-full h-32 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!idea.trim() || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
            >
              {loading ? "Getting Feedback..." : "GO"}
            </button>
          </form>

          {feedback && (
            <div className="mt-8 p-6 bg-indigo-50 dark:bg-gray-700 border-l-4 border-indigo-600 rounded-lg">
              <h2 className="font-bold text-gray-900 dark:text-white mb-2">
                Feedback:
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
