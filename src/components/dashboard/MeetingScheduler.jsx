import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Calendar, CheckCircle2, MessageSquare, Send } from "lucide-react";
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
        production: "https://shardul2004.tail258c66.ts.net/webhook/meetingScheduler",
        test: "https://shardul2004.tail258c66.ts.net/webhook-test/meetingScheduler"
    }
};

export default function MeetingScheduler() {
    const currentWebhookUrl = CONFIG.isProduction ? CONFIG.urls.production : CONFIG.urls.test;

    const [formData, setFormData] = useState({
        meetingTitle: "",
        meetingDate: "",
        meetingTime: "",
        participants: "",
        description: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState("");
    const [userInstructions, setUserInstructions] = useState("");
    const [resumeLink, setResumeLink] = useState("");
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

        if (data.confirmation) return extractTextFromResponse(data.confirmation);
        if (data.message) return extractTextFromResponse(data.message);
        if (data.text) return extractTextFromResponse(data.text);
        if (data.content) return extractTextFromResponse(data.content);
        if (data.status) return extractTextFromResponse(data.status);
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

        if (!formData.meetingDate || !formData.meetingTime || !formData.participants.trim()) {
            setError("Please fill in all required fields");
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
                body: JSON.stringify({
                    meeting_title: formData.meetingTitle,
                    meeting_date: formData.meetingDate,
                    meeting_time: formData.meetingTime,
                    participants: formData.participants,
                    description: formData.description
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to schedule meeting. Please try again.");
            }

            const data = await response.json();

            // Extract message and resumeLink from response
            if (!data.message || !data.resumeLink) {
                alert("Error: Invalid response from backend.");
                console.error("Response data:", data);
                setError("Invalid response received. Please try again.");
                setLoading(false);
                return;
            }

            setResumeLink(data.resumeLink);
            setGeneratedMessage(data.message);
            console.log("Resume link received:", data.resumeLink);
            setShowDialog(true);
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendSchedule = async () => {
        if (!userInstructions.trim()) {
            setError("Please provide instructions or confirmation to proceed");
            return;
        }

        if (!resumeLink) {
            setError("Resume link not found. Please try scheduling again.");
            return;
        }

        console.log("Sending request to:", resumeLink);

        const proxyResumeLink = getProxyUrl(resumeLink);
        console.log("Using proxy URL:", proxyResumeLink);

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(proxyResumeLink, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    feedback: userInstructions
                }),
            });

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }

            const data = await response.json();

            // SCENARIO A: Backend has follow-up (resumeLink exists) - Keep dialog open for multi-turn conversation
            if (data.resumeLink) {
                setGeneratedMessage(data.message || "");
                setResumeLink(data.resumeLink);
                setUserInstructions("");
                console.log("New resume link received:", data.resumeLink);
                // Dialog stays open, user can continue the conversation
            }
            // SCENARIO B: Meeting is finalized (no resumeLink) - Close dialog and show success
            else {
                setShowDialog(false);
                setShowSuccess(true);
                setUserInstructions("");
                setTimeout(() => {
                    setShowSuccess(false);
                    setFormData({
                        meetingTitle: "",
                        meetingDate: "",
                        meetingTime: "",
                        participants: "",
                        description: ""
                    });
                }, 3000);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            alert(`Network Error: ${err.message}`);
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setGeneratedMessage("");
        setUserInstructions("");
        setResumeLink("");
    };

    return (
        <div className="space-y-6 relative">
            {!CONFIG.isProduction && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                    TEST MODE
                </div>
            )}
            <p className="text-slate-300 leading-relaxed">
                Schedule meetings effortlessly with automated coordination
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="meeting-title" className="text-white font-medium">
                            Meeting Title
                        </Label>
                        <Input
                            id="meeting-title"
                            type="text"
                            placeholder="e.g., Project Review"
                            value={formData.meetingTitle}
                            onChange={(e) => handleChange("meetingTitle", e.target.value)}
                            disabled={loading}
                            className="py-6 bg-white/5 border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="participants" className="text-white font-medium">
                            Participants <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="participants"
                            type="text"
                            placeholder="e.g., john@example.com, jane@example.com"
                            value={formData.participants}
                            onChange={(e) => handleChange("participants", e.target.value)}
                            disabled={loading}
                            className="py-6 bg-white/5 border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-300"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meeting-date" className="text-white font-medium">
                            Date <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="meeting-date"
                            type="date"
                            value={formData.meetingDate}
                            onChange={(e) => handleChange("meetingDate", e.target.value)}
                            disabled={loading}
                            className="py-6 bg-white/5 border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-300 [color-scheme:dark]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meeting-time" className="text-white font-medium">
                            Time <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="meeting-time"
                            type="time"
                            value={formData.meetingTime}
                            onChange={(e) => handleChange("meetingTime", e.target.value)}
                            disabled={loading}
                            className="py-6 bg-white/5 border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-300 [color-scheme:dark]"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-white font-medium">
                        Description (Optional)
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Add meeting agenda or notes..."
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        disabled={loading}
                        className="min-h-[100px] bg-white/5 border-white/10 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-300"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-orange-500/80 to-amber-500/80 hover:from-orange-500 hover:to-amber-500 border-none shadow-lg shadow-orange-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Scheduling Meeting...
                        </>
                    ) : (
                        <>
                            <Calendar className="w-5 h-5 mr-2" />
                            Schedule Meeting
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
                        Meeting Confirmed! Schedule has been sent successfully.
                    </AlertDescription>
                </Alert>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl text-white">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                            Meeting Schedule Generated
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Review the generated message and provide instructions or confirm to send
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        <div className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="w-5 h-5 text-amber-400" />
                                <h4 className="font-semibold text-amber-200">Generated Message</h4>
                            </div>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {generatedMessage}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instructions" className="text-white font-medium">
                                Suggestions or Instructions
                            </Label>
                            <Textarea
                                id="instructions"
                                placeholder="e.g., Make it more formal, add reminder about documents, or confirm to send as is"
                                value={userInstructions}
                                onChange={(e) => setUserInstructions(e.target.value)}
                                disabled={loading}
                                className="min-h-[120px] bg-white/5 border-white/10 focus:border-orange-500/50 text-white"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleSendSchedule}
                                disabled={loading}
                                variant="glow"
                                className="flex-1 bg-gradient-to-r from-orange-500/80 to-amber-500/80 hover:from-orange-500 hover:to-amber-500 border-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Send Schedule
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleCloseDialog}
                                variant="ghost"
                                disabled={loading}
                                className="text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
