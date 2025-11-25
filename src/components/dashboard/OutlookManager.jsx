import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Mail, Trash2, Reply, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const WEBHOOK_URL = "/local-n8n/webhook-test/outLook";

export default function OutlookManager() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [emails, setEmails] = useState(null);

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

        if (data.emails) return data.emails;
        if (data.inbox) return data.inbox;
        if (data.messages) return data.messages;
        if (data.text) return extractTextFromResponse(data.text);
        if (data.content) return extractTextFromResponse(data.content);
        if (data.message) return extractTextFromResponse(data.message);
        if (data.result) return extractTextFromResponse(data.result);
        if (data.data) return extractTextFromResponse(data.data);

        return data;
    };

    const handleCheckInbox = async () => {
        setError(null);
        setEmails(null);
        setLoading(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "fetch_inbox" }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch emails. Please try again.");
            }

            const data = await response.json();
            const extractedData = extractTextFromResponse(data);
            setEmails(extractedData);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const parseEmails = (data) => {
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            return [{ content: data }];
        }
        if (typeof data === 'object' && data !== null) {
            return [data];
        }
        return [];
    };

    const renderEmailContent = (email) => {
        if (typeof email === 'string') return email;
        if (email.content) return String(email.content);
        if (email.preview) return String(email.preview);
        if (email.body) return String(email.body);
        if (email.text) return String(email.text);
        return '';
    };

    return (
        <div className="space-y-6">
            <p className="text-slate-300 leading-relaxed">
                View and manage your latest Outlook emails in one place
            </p>

            <Button
                onClick={handleCheckInbox}
                disabled={loading}
                variant="glow"
                className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-purple-500/80 to-indigo-500/80 hover:from-purple-500 hover:to-indigo-500 border-none shadow-lg shadow-indigo-500/20"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Checking Inbox...
                    </>
                ) : (
                    <>
                        <Mail className="w-5 h-5 mr-2" />
                        Check Outlook Inbox
                    </>
                )}
            </Button>

            {error && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {emails && (
                <div className="glass-panel rounded-xl p-6 border-indigo-500/30 animate-slide-up">
                    <div className="flex items-center gap-2 mb-6">
                        <Mail className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-xl font-bold text-white">Your Inbox</h3>
                    </div>

                    <div className="space-y-4">
                        {parseEmails(emails).map((email, index) => (
                            <div
                                key={index}
                                className="p-5 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 group"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                Email {index + 1}
                                            </Badge>
                                            {email.subject && (
                                                <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{String(email.subject)}</h4>
                                            )}
                                        </div>
                                        {email.from && (
                                            <p className="text-sm text-slate-400 mb-2">
                                                <span className="font-medium text-slate-300">From:</span> {String(email.from)}
                                            </p>
                                        )}
                                        {email.date && (
                                            <p className="text-sm text-slate-500 mb-3">{String(email.date)}</p>
                                        )}
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {renderEmailContent(email)}
                                        </p>
                                    </div>
                                    <div className="flex md:flex-col gap-2">
                                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10">
                                            <Eye className="w-4 h-4 md:mr-0 mr-2" />
                                            <span className="md:hidden">View</span>
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-green-400 hover:bg-green-500/10">
                                            <Reply className="w-4 h-4 md:mr-0 mr-2" />
                                            <span className="md:hidden">Reply</span>
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4 md:mr-0 mr-2" />
                                            <span className="md:hidden">Delete</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
