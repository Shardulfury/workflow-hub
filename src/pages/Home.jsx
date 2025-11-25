import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
    Zap,
    ArrowRight,
    Youtube,
    Video,
    Mail,
    Calendar,
    FileEdit,
    Check,
    Star,
    Shield,
    Clock,
    ChevronDown
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    const [openFaq, setOpenFaq] = React.useState(null);

    const features = [
        {
            id: "youtube",
            icon: Youtube,
            title: "YouTube Summarizer",
            description: "Instantly generate concise summaries from any YouTube video URL",
            color: "from-red-500 to-pink-500"
        },
        {
            id: "video",
            icon: Video,
            title: "Video Summarizer",
            description: "Upload videos and get AI-powered summaries in seconds",
            color: "from-blue-500 to-cyan-500"
        },
        {
            id: "outlook",
            icon: Mail,
            title: "Outlook Manager",
            description: "Manage your inbox efficiently with smart email organization",
            color: "from-purple-500 to-indigo-500"
        },
        {
            id: "email",
            icon: FileEdit,
            title: "Email Drafting",
            description: "Generate professional email drafts with AI assistance",
            color: "from-green-500 to-emerald-500"
        },
        {
            id: "meeting",
            icon: Calendar,
            title: "Meeting Scheduler",
            description: "Schedule meetings seamlessly with automated coordination",
            color: "from-orange-500 to-amber-500"
        }
    ];

    const benefits = [
        { icon: Clock, title: "Save Time", description: "Automate repetitive tasks" },
        { icon: Shield, title: "Secure", description: "Enterprise-grade security" },
        { icon: Zap, title: "Fast", description: "Lightning-quick responses" }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Product Manager",
            content: "WorkflowHub has transformed how our team handles daily tasks. The YouTube summarizer alone saves us hours every week.",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Marketing Director",
            content: "The email drafting feature is incredible. It's like having a personal assistant that knows exactly what to write.",
            rating: 5
        },
        {
            name: "Emily Rodriguez",
            role: "Operations Lead",
            content: "Meeting scheduling has never been easier. This tool has streamlined our entire workflow process.",
            rating: 5
        }
    ];

    const faqs = [
        {
            question: "How does WorkflowHub integrate with n8n?",
            answer: "WorkflowHub seamlessly connects to your n8n workflows through webhook integrations, allowing real-time automation of your tasks."
        },
        {
            question: "Is my data secure?",
            answer: "Yes, we use enterprise-grade encryption and follow industry best practices to ensure your data remains private and secure."
        },
        {
            question: "Can I customize the workflows?",
            answer: "Absolutely! Each feature is powered by customizable n8n workflows that you can adapt to your specific needs."
        },
        {
            question: "What file formats are supported for video uploads?",
            answer: "We support all major video formats including MP4, AVI, MOV, and more for the video summarizer feature."
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-xl border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-neon-blue via-violet-600 to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/20">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">WorkflowHub</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-300 hover:text-neon-blue transition-colors font-medium">Features</a>
                            <a href="#pricing" className="text-slate-300 hover:text-neon-blue transition-colors font-medium">Pricing</a>
                            <a href="#testimonials" className="text-slate-300 hover:text-neon-blue transition-colors font-medium">Testimonials</a>
                            <a href="#faq" className="text-slate-300 hover:text-neon-blue transition-colors font-medium">FAQ</a>
                            <Link to={createPageUrl("Dashboard")}>
                                <Button variant="glow" className="transition-all duration-300">
                                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-24 pb-12 md:pt-32 md:pb-20 px-4 md:px-6 animate-fade-in">
                <div className="max-w-7xl mx-auto text-center">
                    <Badge className="mb-6 bg-white/10 text-neon-blue border-neon-blue/30 px-4 py-2 text-sm font-medium backdrop-blur-md animate-slide-up">
                        Powered by n8n Workflows
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up" style={{ animationDelay: "0.1s" }}>
                        Automate Your Workflow
                        <br />
                        <span className="bg-gradient-to-r from-neon-blue via-violet-500 to-neon-purple bg-clip-text text-transparent text-glow">
                            The Smart Way
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.2s" }}>
                        Streamline your daily tasks with AI-powered automation. From video summaries to email management,
                        WorkflowHub brings enterprise-grade efficiency to your fingertips.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
                        <Link to={createPageUrl("Dashboard")}>
                            <Button size="lg" variant="glow" className="w-full sm:w-auto text-lg px-8 py-6 transition-all duration-300">
                                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/20 hover:border-neon-blue hover:bg-white/5 text-white text-lg px-8 py-6 transition-all duration-300">
                            Watch Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Proof Section */}
            <section className="py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {benefits.map((benefit, index) => (
                            <GlassCard key={index} className="flex items-center gap-4 justify-center hover:bg-white/5 p-4 md:p-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/20">
                                    <benefit.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{benefit.title}</h3>
                                    <p className="text-slate-400">{benefit.description}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-12 md:py-24 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                            Everything you need to automate your workflow and boost productivity
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {features.map((feature, index) => (
                            <Link key={index} to={createPageUrl(`Dashboard?service=${feature.id}`)}>
                                <GlassCard className="group h-full hover:border-neon-blue/50 hover:shadow-glow transition-all duration-500 p-6">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-neon-blue transition-colors">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-12 md:py-24 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400">Choose the plan that works for you</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                        <GlassCard className="border-white/10 hover:border-white/30 p-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-white">$29</span>
                                <span className="text-slate-400">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">100 summaries/month</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Email management</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Basic support</span>
                                </li>
                            </ul>
                            <Button className="w-full border-white/20 text-white hover:bg-white/10" variant="outline">Get Started</Button>
                        </GlassCard>

                        <GlassCard className="border-neon-blue/50 shadow-glow scale-100 md:scale-105 relative bg-white/10 p-6 mt-4 md:mt-0">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-neon-blue text-black px-4 py-1 font-bold">
                                    Most Popular
                                </Badge>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-white">$79</span>
                                <span className="text-slate-400">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Unlimited summaries</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">All features included</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Priority support</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Custom workflows</span>
                                </li>
                            </ul>
                            <Button variant="glow" className="w-full">
                                Get Started
                            </Button>
                        </GlassCard>

                        <GlassCard className="border-white/10 hover:border-white/30 p-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-white">Custom</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Everything in Pro</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Dedicated support</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">Custom integrations</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-neon-blue" />
                                    <span className="text-slate-300">SLA guarantee</span>
                                </li>
                            </ul>
                            <Button className="w-full border-white/20 text-white hover:bg-white/10" variant="outline">Contact Sales</Button>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-12 md:py-24 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Loved by Teams Worldwide
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400">See what our users have to say</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {testimonials.map((testimonial, index) => (
                            <GlassCard key={index} className="hover:bg-white/10 p-6">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                                <div>
                                    <p className="font-bold text-white">{testimonial.name}</p>
                                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-12 md:py-24 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400">Everything you need to know</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <GlassCard key={index} className="p-0 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <h3 className="font-bold text-white text-lg pr-4">{faq.question}</h3>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-6">
                                        <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-12 md:py-24 px-4 md:px-6 pb-24 md:pb-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg md:text-xl text-slate-400 mb-10">
                        Join thousands of teams already using WorkflowHub to streamline their workflows
                    </p>
                    <Link to={createPageUrl("Dashboard")}>
                        <Button size="lg" variant="glow" className="w-full sm:w-auto text-lg px-10 py-6 transition-all duration-300">
                            Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 text-white py-12 px-6 mb-16 md:mb-0">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-neon-blue via-violet-600 to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/20">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-xl">WorkflowHub</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                Automate your workflow the smart way with AI-powered n8n integrations.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-neon-blue">Product</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-neon-blue">Company</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-neon-blue">Legal</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 text-center text-slate-400">
                        <p>© 2024 WorkflowHub. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
