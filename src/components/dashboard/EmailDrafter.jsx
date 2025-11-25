import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, FileEdit, Edit3, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WEBHOOK_URL = "/local-n8n/webhook-test/emailDrafter";

export default function EmailDrafter() {
    const [formData, setFormData] = useState({
        recipientName: "",
        subject: "",
        intent: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [draft, setDraft] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [suggestion, setSuggestion] = useState("");

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
        if (data.draft) return extractTextFromResponse(data.draft);
        if (data.text) return extractTextFromResponse(data.text);
        if (data.content) return extractTextFromResponse(data.content);
        if (data.message) return extractTextFromResponse(data.message);
        if (data.body) return extractTextFromResponse(data.body);
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
        setDraft(null);
        setSuggestion("");

        if (!formData.recipientName.trim() || !formData.subject.trim() || !formData.intent.trim()) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipient_name: formData.recipientName,
                    subject: formData.subject,
                    intent: formData.intent
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to draft email. Please try again.");
            }

            const data = await response.json();
            const extractedText = extractTextFromResponse(data);
            setDraft(extractedText);
            setEditedContent(extractedText);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setDraft(editedContent);
        setIsEditing(false);
    };

    const handleContinue = async () => {
        if (!suggestion.trim()) {
            setError("Please enter your suggestion or confirmation");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    recipient_name: formData.recipientName,
                    subject: formData.subject,
                    intent: formData.intent,
                    current_draft: editedContent,
                    suggestion: suggestion
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to process your request. Please try again.");
            }

            const data = await response.json();
            const extractedText = extractTextFromResponse(data);
            setDraft(extractedText);
            setEditedContent(extractedText);
            setSuggestion("");
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-slate-300 leading-relaxed">
                Enter recipient details and let AI draft a professional email for you
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="recipient-name" className="text-white font-medium">
                        Recipient's Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        id="recipient-name"
                        type="text"
                        placeholder="e.g., John Smith"
                        value={formData.recipientName}
                        onChange={(e) => handleChange("recipientName", e.target.value)}
                        disabled={loading}
                        className="text-lg py-6 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white font-medium">
                        Subject <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        id="subject"
                        type="text"
                        placeholder="e.g., Project Update Meeting"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        disabled={loading}
                        className="text-lg py-6 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="intent" className="text-white font-medium">
                        Intent <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                        id="intent"
                        placeholder="e.g., Request a meeting to discuss Q4 project deliverables"
                        value={formData.intent}
                        onChange={(e) => handleChange("intent", e.target.value)}
                        disabled={loading}
                        className="min-h-[100px] bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all duration-300"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500 hover:to-emerald-500 border-none shadow-lg shadow-emerald-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Drafting Email...
                        </>
                    ) : (
                        <>
                            <FileEdit className="w-5 h-5 mr-2" />
                            Draft Email
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

            {draft && (
                <div className="glass-panel rounded-xl p-6 border-emerald-500/30 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-xl font-bold text-white">Your Draft Email</h3>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={handleEdit}
                                variant="ghost"
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="min-h-[300px] text-slate-300 leading-relaxed bg-white/5 border-white/10 focus:border-emerald-500/50"
                            />
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    onClick={() => setIsEditing(false)}
                                    variant="ghost"
                                    className="text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="prose prose-invert max-w-none p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {editedContent}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="suggestion" className="text-white font-medium">
                                    Suggestion/Confirmation
                                </Label>
                                <Textarea
                                    id="suggestion"
                                    placeholder="e.g., Make it more formal, add a call to action, or confirm to send as is"
                                    value={suggestion}
                                    onChange={(e) => setSuggestion(e.target.value)}
                                    disabled={loading}
                                    className="min-h-[100px] bg-white/5 border-white/10 focus:border-emerald-500/50"
                                />
                            </div>

                            <Button
                                onClick={handleContinue}
                                disabled={loading}
                                variant="glow"
                                className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-500 hover:to-emerald-500 border-none shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Continue
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
