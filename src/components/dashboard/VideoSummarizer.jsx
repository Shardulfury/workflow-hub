import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Upload, FileVideo, CheckCircle2, Play, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CONFIG = {
    isProduction: true, // Toggle this to switch environments
    urls: {
        production: "https://shardul2004.tail258c66.ts.net/webhook/video-summary",
        test: "https://shardul2004.tail258c66.ts.net/webhook-test/video-summary"
    }
};

export default function VideoSummarizer() {
    const currentWebhookUrl = CONFIG.isProduction ? CONFIG.urls.production : CONFIG.urls.test;

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

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

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
                setError("File size exceeds 100MB limit");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSummary(null);
        }
    };

    const getProxyUrl = (url) => {
        if (!url) return "";

        // 1. Force Vercel Proxy for Tailscale URLs to avoid CORS errors
        if (url.includes('.ts.net')) {
            try {
                const urlObj = new URL(url);
                return `/local-n8n${urlObj.pathname}${urlObj.search}`;
            } catch (e) {
                console.error("Invalid URL:", url);
                return url;
            }
        }

        // 2. Localhost fallback
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            const webhookIndex = url.indexOf('/webhook');
            if (webhookIndex !== -1) {
                return '/local-n8n' + url.substring(webhookIndex);
            }
        }

        // 3. Fallback
        return url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a video file");
            return;
        }

        setLoading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('data', file);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const proxyUrl = getProxyUrl(currentWebhookUrl);
            const response = await fetch(proxyUrl, {
                method: "POST",
                headers: {
                    // No headers needed for FormData, browser sets Content-Type automatically
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                throw new Error(`Server responded with a status of ${response.status}`);
            }

            const data = await response.json();
            const summaryText = extractTextFromResponse(data);
            setSummary(summaryText);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to process video. Please try again.");
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
                Upload a video file and receive an AI-generated summary
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="video-file" className="text-white font-medium">
                        Video File
                    </Label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-cyan-500/50 hover:bg-white/5 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        <Input
                            id="video-file"
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-full bg-white/5 group-hover:bg-cyan-500/20 transition-colors duration-300">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-white">
                                    {file ? file.name : "Drop your video here"}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "or click to browse"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {file && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <FileVideo className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{file.name}</p>
                            <p className="text-xs text-slate-400">Ready to upload</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFile(null)}
                            className="text-slate-400 hover:text-white"
                        >
                            ×
                        </Button>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading || !file}
                    variant="glow"
                    className="w-full text-lg py-6 transition-all duration-300 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-500 hover:to-blue-500 border-none shadow-lg shadow-cyan-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {uploadProgress < 100 ? `Uploading ${uploadProgress}%...` : "Processing..."}
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 mr-2" />
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
                <div className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/30 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <h4 className="font-semibold text-amber-200">Video Summary</h4>
                    </div>
                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {summary}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
