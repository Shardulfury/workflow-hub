import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Sparkles, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CONFIG = {
    isProduction: true, // Toggle this to switch environments
    urls: {
        production: "https://shardul2004.tail258c66.ts.net/webhook/youtubeSummarizer",
        test: "https://shardul2004.tail258c66.ts.net/webhook-test/youtubeSummarizer"
    }
};

export default function YouTubeSummarizer() {
    const currentWebhookUrl = CONFIG.isProduction ? CONFIG.urls.production : CONFIG.urls.test;

    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    const extractTextFromResponse = (data) => {
        if (typeof data === 'string') return data;
        if (data === null || data === undefined) return '';

        if (data.output !== undefined) {
            if (typeof data.output === 'string') return data.output;
            return extractTextFromResponse(data.output);
        }

        if (data.summary) return extractTextFromResponse(data.summary);
        if (data.text) return extractTextFromResponse(data.text);
        if (data.content) return extractTextFromResponse(data.content);
        if (data.message) return extractTextFromResponse(data.message);
        if (data.result) return extractTextFromResponse(data.result);
        if (data.data) return extractTextFromResponse(data.data);

        if (Array.isArray(data)) {
            return data.map(item => extractTextFromResponse(item)).join('\n\n');
        }

        if (typeof data === 'object') {
            return JSON.stringify(data, null, 2);
        }

        return String(data);
    };

    const getProxyUrl = (url) => {
        if (!url) return url;

        // Use Vercel proxy for Tailscale URLs to avoid CORS issues
        if (url.includes('.ts.net')) {
            try {
                const urlObj = new URL(url);
                return `/local-n8n${urlObj.pathname}${urlObj.search}`;
            } catch (e) {
                console.error("Invalid URL:", url);
                return url;
            }
        }

        // If it's localhost, use the proxy to avoid mixed content/CORS
        if (url.includes('localhost')) {
            // If it contains 'webhook', replace everything before it with /local-n8n
            const webhookIndex = url.indexOf('/webhook');
            if (webhookIndex !== -1) {
                return '/local-n8n' + url.substring(webhookIndex);
            }
        }

        // If it's already a relative path, return it
        if (url.startsWith('/')) return url;

        return url;
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
            const proxyUrl = getProxyUrl(currentWebhookUrl);
            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ youtube_url: url }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch summary. Please try again.");
            }

            const data = await response.json();
            const summaryText = extractTextFromResponse(data);
            setSummary(summaryText);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            {!CONFIG.isProduction && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                    TEST MODE
                </div>
            )}
            <p className="text-slate-300 leading-relaxed">
                Enter a YouTube video URL to generate a concise summary of its content
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="url" className="text-white font-medium">
                        YouTube URL
                    </Label>
                    <Input
                        id="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={loading}
                        className="py-6 bg-white/5 border-white/10 focus:border-red-500/50 focus:ring-red-500/20 transition-all duration-300"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-red-600/80 to-orange-600/80 hover:from-red-600 hover:to-orange-600 border-none shadow-lg shadow-red-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Summarizing...
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
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">Video Summary</h3>
                    </div>
                    <div className="prose prose-invert prose-slate max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {summary}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
