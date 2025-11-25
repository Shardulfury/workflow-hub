import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Mail, RefreshCw, Inbox, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const CONFIG = {
    isProduction: true, // Toggle this to switch environments
    urls: {
        production: "/local-n8n/webhook/outLook",
        test: "/local-n8n/webhook-test/outLook"
    }
};

export default function OutlookManager() {
    const currentWebhookUrl = CONFIG.isProduction ? CONFIG.urls.production : CONFIG.urls.test;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emails, setEmails] = useState([]);
    const [lastFetched, setLastFetched] = useState(null);

    const extractTextFromResponse = (data) => {
        if (!data) return [];

        // Handle array response directly
        if (Array.isArray(data)) {
            return data;
        }

        // Handle nested structures
        if (data.output && Array.isArray(data.output)) return data.output;
        if (data.emails && Array.isArray(data.emails)) return data.emails;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.result && Array.isArray(data.result)) return data.result;

        // If it's a single object, wrap in array
        if (typeof data === 'object') return [data];

        return [];
    };

    const fetchEmails = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(currentWebhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                    action: "fetch_inbox",
                    limit: 10
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch emails. Please try again.");
            }

            const data = await response.json();
            const emailList = extractTextFromResponse(data);

            setEmails(emailList);
            setLastFetched(new Date());
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchEmails();
    }, []);

    return (
        <div className="space-y-6 relative">
            {!CONFIG.isProduction && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                    TEST MODE
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-300 leading-relaxed">
                        Manage and organize your Outlook inbox efficiently
                    </p>
                    {lastFetched && (
                        <p className="text-xs text-slate-500 mt-1">
                            Last updated: {lastFetched.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <Button
                    onClick={fetchEmails}
                    disabled={loading}
                    variant="outline"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                {loading && emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                        <p>Syncing with Outlook...</p>
                    </div>
                ) : emails.length > 0 ? (
                    <div className="grid gap-4">
                        {emails.map((email, index) => (
                            <div
                                key={index}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="p-2 bg-blue-500/20 rounded-lg mt-1">
                                            <Mail className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="text-white font-medium truncate pr-4">
                                                {email.subject || "No Subject"}
                                            </h4>
                                            <p className="text-sm text-slate-400 truncate">
                                                {email.from || email.sender || "Unknown Sender"}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {email.bodyPreview || email.body || "No preview available"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                            {email.receivedDateTime ? new Date(email.receivedDateTime).toLocaleDateString() : ""}
                                        </span>
                                        {email.isRead === false && (
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-white/10 rounded-xl">
                        <Inbox className="w-12 h-12 mb-4 opacity-50" />
                        <p>No emails found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
