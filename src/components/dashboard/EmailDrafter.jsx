import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, FileEdit, Edit3, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const CONFIG = {
    isProduction: true, // Toggle this to switch environments
    urls: {
        production: "/local-n8n/webhook/emailDrafter",
        test: "/local-n8n/webhook-test/emailDrafter"
    }
};

export default function EmailDrafter() {
    const currentWebhookUrl = CONFIG.isProduction ? CONFIG.urls.production : CONFIG.urls.test;

    const [formData, setFormData] = useState({
        recipient_name: "",
        subject: "",
        intent: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedEmail, setGeneratedEmail] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [userSuggestion, setUserSuggestion] = useState("");
    const [resumeLink, setResumeLink] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const extractTextFromResponse = (data) => {
        if (typeof data === 'string') return data;
        if (data === null || data === undefined) return '';

        if (data.output !== undefined) {
            if (typeof data.output === 'string') return data.output;
            return extractTextFromResponse(data.output);
        }

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

        if (data.email) return extractTextFromResponse(data.email);
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

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getProxyUrl = (url) => {
        if (!url) return url;
        // If it's already a relative path, return it
        if (url.startsWith('/')) return url;

        // If it contains 'webhook', replace everything before it with /local-n8n
        const webhookIndex = url.indexOf('/webhook');
        if (webhookIndex !== -1) {
            return '/local-n8n' + url.substring(webhookIndex);
        }
        return url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setShowSuccess(false);

        if (!formData.recipient_name || !formData.subject || !formData.intent) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(currentWebhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();
            console.log("Raw backend response:", text);

            if (!text) {
                throw new Error("Backend returned an empty response. Please check your n8n workflow output.");
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                throw new Error(`Invalid JSON response from backend: ${text.substring(0, 100)}...`);
            }

            if (data.resumeLink) {
                setResumeLink(data.resumeLink);
            }

            const emailContent = extractTextFromResponse(data);
            setGeneratedEmail(emailContent);
            setShowDialog(true);
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefineDraft = async () => {
        if (!userSuggestion.trim()) return;
        if (!resumeLink) {
            setError("Session expired. Please start over.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const proxyResumeLink = getProxyUrl(resumeLink);
            const response = await fetch(proxyResumeLink, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                    feedback: userSuggestion
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to refine draft. Please try again.");
            }

            const data = await response.json();

            if (data.resumeLink) {
                setResumeLink(data.resumeLink);
            }

            const refinedEmail = extractTextFromResponse(data);
            setGeneratedEmail(refinedEmail);
            setUserSuggestion("");
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!resumeLink) {
            setError("Session expired. Please start over.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const proxyResumeLink = getProxyUrl(resumeLink);
            const response = await fetch(proxyResumeLink, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({
                    feedback: "Approved"
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send email. Please try again.");
            }

            const text = await response.text();
            console.log("Raw backend response (Send Email):", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                // If it's not JSON, it might be a plain text success message
                if (text.toLowerCase().includes("sent")) {
                    setShowDialog(false);
                    setShowSuccess(true);
                    setFormData({ recipient_name: "", subject: "", intent: "" });
                    setResumeLink(null);
                    setGeneratedEmail("");
                    return;
                }
                throw new Error(`Invalid response: ${text.substring(0, 100)}`);
            }

            // Check if backend returns a success message or no new resume link
            const message = data.message || extractTextFromResponse(data);
            if (!data.resumeLink || message.toLowerCase().includes("sent")) {
                setShowDialog(false);
                setShowSuccess(true);
                setFormData({ recipient_name: "", subject: "", intent: "" });
                setResumeLink(null);
                setGeneratedEmail("");
            } else {
                // Unexpected state, but maybe they want to continue?
                setGeneratedEmail(message);
            }

        } catch (err) {
            console.error("Send Email Error:", err);
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
                Generate professional emails instantly with AI assistance
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-white font-medium">
                        Recipient Name
                    </Label>
                    <Input
                        id="recipient"
                        placeholder="e.g., John Doe"
                        value={formData.recipient_name}
                        onChange={(e) => handleChange("recipient_name", e.target.value)}
                        disabled={loading}
                        className="py-6 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-300"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white font-medium">
                        Subject
                    </Label>
                    <Input
                        id="subject"
                        placeholder="e.g., Project Update"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        disabled={loading}
                        className="py-6 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-300"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="intent" className="text-white font-medium">
                        What is this email about?
                    </Label>
                    <Textarea
                        id="intent"
                        placeholder="Describe the main points you want to cover..."
                        value={formData.intent}
                        onChange={(e) => handleChange("intent", e.target.value)}
                        disabled={loading}
                        className="min-h-[120px] bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-300"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 border-none shadow-lg shadow-purple-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Draft...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Email
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

            {showSuccess && (
                <Alert className="border-green-500/50 bg-green-500/10 text-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="font-medium">
                        Email sent successfully!
                    </AlertDescription>
                </Alert>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl text-white">
                            <FileEdit className="w-6 h-6 text-purple-400" />
                            Generated Draft
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Review and refine your email draft below
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        <div className="p-5 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {generatedEmail}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="suggestion" className="text-white font-medium">
                                Refine Draft
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="suggestion"
                                    placeholder="e.g., Make it more formal, shorter, etc."
                                    value={userSuggestion}
                                    onChange={(e) => setUserSuggestion(e.target.value)}
                                    disabled={loading}
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50"
                                />
                                <Button
                                    onClick={handleRefineDraft}
                                    disabled={loading || !userSuggestion.trim()}
                                    variant="secondary"
                                    className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 whitespace-nowrap px-4"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Refine Draft
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDialog(false)}
                            disabled={loading}
                            className="text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendEmail}
                            disabled={loading}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-none shadow-lg shadow-green-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Email
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
