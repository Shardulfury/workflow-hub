import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WEBHOOK_URL = "/local-n8n/webhook-test/youtubeSummarizer";

export default function YouTubeSummarizer() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    const extractTextFromResponse = (data) => {
        if (typeof data === 'string') return data;
        if (data === null || data === undefined) return '';

        // Priority: Check for 'output' field first (n8n workflow output)
        if (data.output !== undefined) {
            if (typeof data.output === 'string') return data.output;
            return extractTextFromResponse(data.output);
        }

        // Handle {parts, role} structure
        if (data.parts) {
            if (Array.isArray(data.parts)) {
                return data.parts.map(part => {
                    if (typeof part === 'string') return part;
                    if (part.text) return part.text;
                    return JSON.stringify(part);
                }).join('\n');
            }
            if (typeof data.parts === 'string') return data.parts;
        }

        // Handle other common text fields
        if (data.summary) return extractTextFromResponse(data.summary);
        if (data.text) return extractTextFromResponse(data.text);
        if (data.content) return extractTextFromResponse(data.content);
        if (data.message) return extractTextFromResponse(data.message);
        if (data.result) return extractTextFromResponse(data.result);
        if (data.data) return extractTextFromResponse(data.data);

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(item => extractTextFromResponse(item)).join('\n\n');
        }

        // Last resort - stringify
        if (typeof data === 'object') {
            return JSON.stringify(data, null, 2);
        }

        return String(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSummary(null);

        if (!url.trim()) {
            setError("Please enter a YouTube URL");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ youtube_url: url }),
            });

            if (!response.ok) {
                throw new Error("Failed to process video. Please try again.");
            }

            const data = await response.json();
            const extractedText = extractTextFromResponse(data);
            setSummary(extractedText);
            setUrl("");
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-slate-300 leading-relaxed">
                Paste any YouTube video URL below and get an instant AI-powered summary
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="youtube-url" className="text-white font-medium">
                        YouTube URL
                    </Label>
                    <div className="relative group">
                        <Input
                            id="youtube-url"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                            className="text-lg py-6 pl-12 bg-white/5 border-white/10 focus:border-neon-purple/50 focus:ring-neon-purple/20 transition-all duration-300"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-neon-purple transition-colors">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-500 hover:to-pink-500 border-none shadow-lg shadow-red-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing Video...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Summarize Video
                        </>
                    )}
                </Button>
            </form>

            {error && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {summary && (
                <div className="mt-8 animate-slide-up">
                    <div className="glass-panel rounded-xl p-6 border-neon-purple/30">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-neon-purple" />
                            <h3 className="text-xl font-bold text-white">Here is the Summary</h3>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {summary}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
