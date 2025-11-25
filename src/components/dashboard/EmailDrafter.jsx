import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, FileEdit, Edit3, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
    const [currentDraft, setCurrentDraft] = useState("");

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

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
                throw new Error("Failed to generate email. Please try again.");
            }

            const data = await response.json();
            const emailContent = extractTextFromResponse(data);

            setGeneratedEmail(emailContent);
            setCurrentDraft(emailContent);
            setShowDialog(true);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefineDraft = async () => {
        if (!userSuggestion.trim()) return;

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
                    current_draft: currentDraft,
                    suggestion: userSuggestion
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to refine draft. Please try again.");
            }

            const data = await response.json();
            const refinedEmail = extractTextFromResponse(data);

            setGeneratedEmail(refinedEmail);
            setCurrentDraft(refinedEmail);
            setUserSuggestion("");
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
                                    className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
