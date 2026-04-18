"use client";

import { useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Dashboard() {
    const { getToken } = useAuth();

    const [topic, setTopic] = useState("");
    const [type, setType] = useState("idea");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================
    // 🚀 GENERATE CONTENT
    // =========================
    const generate = async () => {
        setOutput("");
        setLoading(true);

        let buffer = "";

        try {
            const jwt = await getToken();

            if (!jwt) {
                setOutput("❌ Authentication required");
                setLoading(false);
                return;
            }

            await fetchEventSource(
                `/api?type=${type}&topic=${encodeURIComponent(topic)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },

                    // =========================
                    // 🔥 STREAM VALIDATION
                    // =========================
                    onopen: async (res: Response): Promise<void> => {
                        const contentType = res.headers.get("content-type") || "";

                        if (!contentType.includes("text/event-stream")) {
                            throw new Error("Invalid response type: " + contentType);
                        }
                    },

                    // =========================
                    // 📡 STREAM DATA
                    // =========================
                    onmessage(ev) {
                        if (!ev.data || ev.data === "[DONE]") return;

                        buffer += ev.data + "\n";
                        setOutput(buffer);
                    },

                    // =========================
                    // ❌ ERROR HANDLING
                    // =========================
                    onerror(err) {
                        console.error("SSE Error:", err);
                        setOutput("❌ Error generating content");
                        setLoading(false);
                        throw err;
                    },
                }
            );
        } catch (err) {
            console.error(err);
            setOutput("❌ Something went wrong");
        }

        setLoading(false);
    };

    // =========================
    // 🎨 UI
    // =========================
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">

            {/* =========================
          SIDEBAR
      ========================= */}
            <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">

                <h1 className="text-xl font-bold mb-6">IdeaGen Pro</h1>

                <div className="space-y-3">

                    <button
                        onClick={() => setType("idea")}
                        className={`w-full text-left p-2 rounded ${type === "idea" ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        💡 Idea Generator
                    </button>

                    <button
                        onClick={() => setType("blog")}
                        className={`w-full text-left p-2 rounded ${type === "blog" ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        📝 Blog Writer
                    </button>

                    <button
                        onClick={() => setType("tweet")}
                        className={`w-full text-left p-2 rounded ${type === "tweet" ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        🐦 Tweets
                    </button>

                    <button
                        onClick={() => setType("ad")}
                        className={`w-full text-left p-2 rounded ${type === "ad" ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        📢 Ads Copy
                    </button>

                    <button
                        onClick={() => setType("product")}
                        className={`w-full text-left p-2 rounded ${type === "product" ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                    >
                        🛍 Product Description
                    </button>

                </div>

                {/* User */}
                <div className="absolute bottom-4 left-4">
                    <UserButton />
                </div>

            </aside>

            {/* =========================
          MAIN CONTENT
      ========================= */}
            <div className="flex-1 p-6">

                {/* INPUT SECTION */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">

                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter topic (e.g. AI agents, fitness, crypto...)"
                        className="w-full p-3 border rounded mb-3 dark:bg-gray-900"
                    />

                    <button
                        onClick={generate}
                        disabled={loading || !topic}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? "Generating..." : "Generate"}
                    </button>

                </div>

                {/* OUTPUT */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow min-h-[400px]">

                    {output ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {output}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-gray-400">
                            Your AI-generated content will appear here...
                        </p>
                    )}

                </div>

            </div>
        </main>
    );
}