import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Sparkles, Upload, File, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from "@/api/base44Client";

const WEBHOOK_URL = "/local-n8n/webhook-test/video-summary";

export default function VideoSummarizer() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);

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

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith('video/')) {
                setError("Please select a valid video file");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSummary(null);
            setVideoUrl(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setSummary(null);
        setVideoUrl(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSummary(null);

        if (!file) {
            setError("Please select a video file");
            return;
        }

        setLoading(true);

        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setVideoUrl(file_url);

            // Set up timeout for long-running operations (60 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            // Create FormData to send the actual file binary
            const formData = new FormData();
            formData.append('data', file); // Matches 'Field Name for Binary Data' in n8n

            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: {
                    // Content-Type is automatically set by browser for FormData
                    "ngrok-skip-browser-warning": "true",
                },
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to process video. Please try again.");
                } catch (parseError) {
                    throw new Error("Failed to process video. Please try again.");
                }
            }

            // Try to parse JSON response, handle HTML error pages
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error("Server returned an invalid response. The video might be too long to process.");
            }

            // Extract summary - prioritize data.summary field
            const extractedText = data.summary || extractTextFromResponse(data);
            setSummary(extractedText);
        } catch (err) {
            if (err.name === 'AbortError') {
                setError("Request timed out. Please try a shorter video (under 5 minutes recommended).");
            } else {
                setError(err.message || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-slate-300 leading-relaxed">
                Upload a video file and receive an AI-generated summary
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="video-file" className="text-white font-medium">
                        Video File
                    </Label>
                    <div className="relative">
                        <input
                            id="video-file"
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="hidden"
                        />
                        {!file ? (
                            <label
                                htmlFor="video-file"
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-neon-blue/50 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-slate-300 group-hover:text-neon-blue" />
                                </div>
                                <span className="text-slate-300 font-medium group-hover:text-white">Click to upload video</span>
                                <span className="text-slate-500 text-sm mt-1">MP4, AVI, MOV, etc.</span>
                            </label>
                        ) : (
                            <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center">
                                        <File className="w-5 h-5 text-neon-blue" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{file.name}</p>
                                        <p className="text-sm text-slate-400">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={removeFile}
                                    disabled={loading}
                                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !file}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300"
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

            {
                error && (
                    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )
            }

            {
                summary && (
                    <div className="mt-8 animate-slide-up">
                        <div className="glass-panel rounded-xl p-6 border-neon-blue/30">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-neon-blue" />
                                <h3 className="text-xl font-bold text-white">Here is the Summary</h3>
                            </div>
                            {videoUrl && (
                                <video
                                    controls
                                    className="w-full rounded-lg mb-6 shadow-lg border border-white/10"
                                    src={videoUrl}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {summary}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
