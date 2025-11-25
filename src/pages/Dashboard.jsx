import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Youtube, Video, Mail, FileEdit, Calendar, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import YouTubeSummarizer from "../components/dashboard/YouTubeSummarizer";
import VideoSummarizer from "../components/dashboard/VideoSummarizer";
import OutlookManager from "../components/dashboard/OutlookManager";
import EmailDrafter from "../components/dashboard/EmailDrafter";
import MeetingScheduler from "../components/dashboard/MeetingScheduler";

export default function Dashboard() {
    const [searchParams] = useSearchParams();
    // Force HMR update
    const [activeService, setActiveService] = useState(searchParams.get("service"));

    useEffect(() => {
        const service = searchParams.get("service");
        if (service) {
            setActiveService(service);
        }
    }, [searchParams]);

    const services = [
        {
            id: "youtube",
            title: "YouTube Summarizer",
            icon: Youtube,
            gradient: "from-red-500 to-pink-500",
            component: YouTubeSummarizer
        },
        {
            id: "video",
            title: "Video Summarizer",
            icon: Video,
            gradient: "from-blue-500 to-cyan-500",
            component: VideoSummarizer
        },
        {
            id: "outlook",
            title: "Outlook Inbox Manager",
            icon: Mail,
            gradient: "from-purple-500 to-indigo-500",
            component: OutlookManager
        },
        {
            id: "email",
            title: "Email Drafting",
            icon: FileEdit,
            gradient: "from-green-500 to-emerald-500",
            component: EmailDrafter
        },
        {
            id: "meeting",
            title: "Meeting Scheduler",
            icon: Calendar,
            gradient: "from-orange-500 to-amber-500",
            component: MeetingScheduler
        }
    ];

    if (activeService) {
        const service = services.find(s => s.id === activeService);
        const ServiceComponent = service.component;

        return (
            <div className="min-h-screen p-0 md:p-10 animate-fade-in">
                <div className="max-w-7xl mx-auto">
                    <div className="p-4 md:p-0">
                        <Button
                            variant="ghost"
                            onClick={() => setActiveService(null)}
                            className="mb-4 md:mb-6 hover:bg-white/10 hover:text-neon-blue text-slate-300"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Services
                        </Button>
                    </div>

                    <div className="md:glass-panel md:rounded-xl md:border-neon-blue/30 md:shadow-glow overflow-hidden">
                        <div className={`hidden md:block bg-gradient-to-r ${service.gradient} p-1 opacity-80`}></div>
                        <div className="p-4 md:p-8">
                            <div className="flex items-center gap-4 mb-6 md:mb-8 pb-6 border-b border-white/10">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                                    <service.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{service.title}</h2>
                                    <p className="text-sm md:text-base text-slate-400">Powered by n8n Automation</p>
                                </div>
                            </div>
                            <div className="animate-slide-up">
                                <ServiceComponent />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-10 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 md:mb-12 text-center md:text-left pt-4 md:pt-0">
                    <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 leading-tight">
                        Welcome to Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-violet-500">Dashboard</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto md:mx-0">
                        Select a tool below to launch your automated workflow
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
                    {services.map((service, index) => (
                        <GlassCard
                            key={service.id}
                            onClick={() => setActiveService(service.id)}
                            className="cursor-pointer group hover:border-neon-blue/50 hover:shadow-glow transition-all duration-500 p-6"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex flex-col items-center text-center gap-4 md:gap-6 py-2 md:py-4">
                                <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${service.gradient} rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <service.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">{service.title}</h3>
                                    <p className="text-sm text-slate-400">Click to launch</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
