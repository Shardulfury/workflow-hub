import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Mail, Search, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CONFIG = {
    isProduction: true, // Toggle this to switch environments
    urls: {
        production: "https://shardul2004.tail258c66.ts.net/webhook/outlook-manager",
        test: "https://shardul2004.tail258c66.ts.net/webhook-test/outlook-manager"
    }
};

export default function OutlookManager() {
    const currentWebhookUrl = CONFIG.isProduction ? CONFIG.urls.production : CONFIG.urls.test;

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const getProxyUrl = (url) => {
        if (!url) return url;

        // If it's the public Tailscale URL, use it directly (HTTPS is safe and trusted)
        if (url.includes('.ts.net')) {
            return url;
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
        setResult("");

        if (!query.trim()) {
            setError("Please enter a query");
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
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error("Failed to process request. Please try again.");
            }

            const data = await response.json();

            // Handle various response formats from n8n
            let outputText = "";
            if (data.output) outputText = data.output;
            else if (data.text) outputText = data.text;
            else if (data.message) outputText = data.message;
            else if (typeof data === 'string') outputText = data;
            else outputText = JSON.stringify(data, null, 2);

            setResult(outputText);
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
                Manage your Outlook emails and calendar with natural language.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="query" className="text-white font-medium">
                        What would you like to do?
                    </Label>
                    <div className="relative">
                        <Textarea
                            id="query"
                            placeholder="e.g., Summarize my last 5 emails, or Find emails from John about the project..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                            className="min-h-[100px] bg-white/5 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300 pl-4 pr-4 py-3"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-500 border-none shadow-lg shadow-blue-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Run Action
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

            {result && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Label className="text-white font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        Result
                    </Label>
                    <div className="p-5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {result}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
