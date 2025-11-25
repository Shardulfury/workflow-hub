import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Zap, Home, LayoutDashboard, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarProvider,
} from "@/components/ui/sidebar";

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const isLandingPage = location.pathname === createPageUrl("Home");

    const handleLogout = async () => {
        await base44.auth.logout();
    };

    if (isLandingPage) {
        return <div className="min-h-screen">{children}</div>;
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-transparent">
                {/* Desktop Sidebar - Hidden on Mobile */}
                <Sidebar className="hidden md:flex border-r border-white/10 backdrop-blur-xl bg-black/20 text-white">
                    <SidebarHeader className="border-b border-white/10 p-6">
                        <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-neon-blue via-violet-600 to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/20 group-hover:shadow-neon-blue/40 transition-all duration-300 group-hover:scale-110">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg tracking-tight">WorkflowHub</h2>
                                <p className="text-xs text-slate-400">n8n Integration</p>
                            </div>
                        </Link>
                    </SidebarHeader>

                    <SidebarContent className="p-3">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className={`hover:bg-white/10 hover:text-neon-blue transition-all duration-200 rounded-xl mb-1 ${location.pathname === createPageUrl("Home") ? 'bg-white/10 text-neon-blue shadow-glow' : 'text-slate-300'
                                                }`}
                                        >
                                            <Link to={createPageUrl("Home")} className="flex items-center gap-3 px-4 py-3">
                                                <Home className="w-5 h-5" />
                                                <span className="font-medium">Home</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            className={`hover:bg-white/10 hover:text-neon-blue transition-all duration-200 rounded-xl ${location.pathname === createPageUrl("Dashboard") ? 'bg-white/10 text-neon-blue shadow-glow' : 'text-slate-300'
                                                }`}
                                        >
                                            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 px-4 py-3">
                                                <LayoutDashboard className="w-5 h-5" />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-white/10 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 text-slate-400"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 flex flex-col overflow-hidden relative pb-20 md:pb-0">
                    {/* Mobile Header */}
                    <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 md:hidden sticky top-0 z-40">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-neon-blue via-violet-600 to-neon-purple rounded-lg flex items-center justify-center shadow-lg shadow-neon-blue/20">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-lg font-bold text-white">WorkflowHub</h1>
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto p-4 md:p-6">
                        {children}
                    </div>

                    {/* Mobile Bottom Navigation */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
                        <div className="flex justify-around items-center p-2">
                            <Link
                                to={createPageUrl("Home")}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px] ${location.pathname === createPageUrl("Home") ? 'text-neon-blue' : 'text-slate-400'}`}
                            >
                                <Home className={`w-6 h-6 ${location.pathname === createPageUrl("Home") ? 'fill-neon-blue/20' : ''}`} />
                                <span className="text-[10px] font-medium">Home</span>
                            </Link>

                            <Link
                                to={createPageUrl("Dashboard")}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px] ${location.pathname === createPageUrl("Dashboard") ? 'text-neon-blue' : 'text-slate-400'}`}
                            >
                                <LayoutDashboard className={`w-6 h-6 ${location.pathname === createPageUrl("Dashboard") ? 'fill-neon-blue/20' : ''}`} />
                                <span className="text-[10px] font-medium">Dashboard</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px] text-slate-400 hover:text-red-400"
                            >
                                <LogOut className="w-6 h-6" />
                                <span className="text-[10px] font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
