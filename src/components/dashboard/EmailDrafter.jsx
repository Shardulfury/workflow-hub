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
} from "@/components/ui/dialog";

const CONFIG = {
    isProduction: true, // Toggle this to switch environments
    urls: {
        production: "https://shardul2004.tail258c66.ts.net/webhook/emailDrafter",
        test: "https://shardul2004.tail258c66.ts.net/webhook-test/emailDrafter"
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
    const [refinementInstructions, setRefinementInstructions] = useState("");
    const [resumeLink, setResumeLink] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const extractTextFromResponse = (data) => {
        if (typeof data === 'string') return data;
        if (data === null || data === undefined) return '';

        if (data.output !== undefined) {
            if (typeof data.output === 'string') return data.output;
            return extractTextFromResponse(data.output);
        }

        if (data.email) return extractTextFromResponse(data.email);
        if (data.message) return extractTextFromResponse(data.message);
        if (data.text) return extractTextFromResponse(data.text);
        if (data.content) return extractTextFromResponse(data.content);
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
        if (!url) return "";

        // 1. If it is a Tailscale URL (Production), return it AS-IS.
        // Do NOT rewrite it. Direct HTTPS access is safe and required for Vercel.
        if (url.includes('.ts.net')) {
            return url;
        }

        // 2. Only use the local proxy if we are actually running on Localhost
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            const webhookIndex = url.indexOf('/webhook');
            if (webhookIndex !== -1) {
                return '/local-n8n' + url.substring(webhookIndex);
            }
        }

        // 3. Fallback: Return the original URL
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
            const proxyUrl = getProxyUrl(currentWebhookUrl);
            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("EmailDrafter Backend Response:", data); // Debug log

            if (data.error) {
                throw new Error(data.error);
            }

            // Check for email content in various possible fields
            const emailContent = data.email || data.message || data.output || data.text;

            if (emailContent) {
                setGeneratedEmail(emailContent);
                setResumeLink(data.resumeLink || "");
                setShowDialog(true);
            } else {
                console.error("Invalid Data Keys:", Object.keys(data));
                throw new Error(`Invalid response format. Received keys: ${Object.keys(data).join(", ")}`);
            }

        } catch (err) {
            console.error("Error generating draft:", err);
            setError(err.message || "Failed to generate email draft");
        } finally {
            setLoading(false);
        }
    };

    const handleRefine = async () => {
        if (!refinementInstructions.trim()) return;

        setLoading(true);
        try {
            const proxyUrl = getProxyUrl(resumeLink);
            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "refine",
                    instructions: refinementInstructions
                })
            });

            if (!response.ok) throw new Error("Failed to refine email");

            const data = await response.json();
            console.log("Refine Response:", data);

            const refinedContent = extractTextFromResponse(data);
            if (refinedContent) {
                setGeneratedEmail(refinedContent);
            }

            if (data.resumeLink) {
                setResumeLink(data.resumeLink);
            }

            setRefinementInstructions("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        setLoading(true);
        try {
            const proxyUrl = getProxyUrl(resumeLink);
            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "send" })
            });

            if (!response.ok) throw new Error("Failed to send email");

            setShowDialog(false);
            setShowSuccess(true);
            setFormData({ recipient_name: "", subject: "", intent: "" });
            setTimeout(() => setShowSuccess(false), 3000);

        } catch (err) {
            setError(err.message);
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
                Generate professional emails instantly. Provide the recipient, subject, and your intent, and let AI draft the perfect message for you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipient" className="text-white font-medium">Recipient Name</Label>
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
                        <Label htmlFor="subject" className="text-white font-medium">Subject</Label>
                        <Input
                            id="subject"
                            placeholder="e.g., Project Update"
                            value={formData.subject}
                            onChange={(e) => handleChange("subject", e.target.value)}
                            disabled={loading}
                            className="py-6 bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="intent" className="text-white font-medium">What is this email about?</Label>
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
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 border-none shadow-lg shadow-purple-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Draft...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Draft
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
                            Review Draft
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Review the generated email. You can refine it with instructions or send it as is.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        <div className="p-5 rounded-lg bg-white/5 border border-white/10">
                            <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                                {generatedEmail}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="refine" className="text-white font-medium">
                                Refinement Instructions (Optional)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="refine"
                                    placeholder="e.g., Make it more formal, add a deadline..."
                                    value={refinementInstructions}
                                    onChange={(e) => setRefinementInstructions(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50"
                                />
                                <Button
                                    onClick={handleRefine}
                                    disabled={loading || !refinementInstructions.trim()}
                                    variant="outline"
                                    className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Refine
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button
                                variant="ghost"
                                onClick={() => setShowDialog(false)}
                                className="text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-none shadow-lg shadow-purple-500/20"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Send Email
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
