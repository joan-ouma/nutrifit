import React from 'react';
import { ChefHat, Mail, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer({ onNavigate }) {
    const handleNavClick = (tab) => {
        if (onNavigate) {
            onNavigate(tab);
        }
    };

    return (
        <footer className="bg-slate-950 text-slate-400 mt-auto w-full shrink-0 border-t border-slate-900 overflow-hidden relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-900/50">
                                <ChefHat size={22} strokeWidth={2.5} />
                            </div>
                            <span className="text-white text-2xl font-black tracking-tight">NutriFit</span>
                        </div>
                        <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-sm">
                            Your intelligent companion for nutrition planning, smart pantry management, and personalized health insights. Build habits that last.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 lg:col-start-6">
                        <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Platform</h4>
                        <ul className="space-y-4 text-slate-400 font-medium">
                            {onNavigate ? (
                                <>
                                    <li><button onClick={() => handleNavClick('overview')} className="hover:text-emerald-400 transition-colors">Overview</button></li>
                                    <li><button onClick={() => handleNavClick('ai-chef')} className="hover:text-emerald-400 transition-colors">AI Assistant</button></li>
                                    <li><button onClick={() => handleNavClick('nutrition')} className="hover:text-emerald-400 transition-colors">Food Diary</button></li>
                                    <li><button onClick={() => handleNavClick('leaderboard')} className="hover:text-emerald-400 transition-colors">Leaderboard</button></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/app" className="hover:text-emerald-400 transition-colors">Overview</Link></li>
                                    <li><Link to="/app" className="hover:text-emerald-400 transition-colors">AI Assistant</Link></li>
                                    <li><Link to="/app" className="hover:text-emerald-400 transition-colors">Food Diary</Link></li>
                                    <li><Link to="/app" className="hover:text-emerald-400 transition-colors">Leaderboard</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Resources</h4>
                        <ul className="space-y-4 text-slate-400 font-medium">
                            <li><a href="#!" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#!" className="hover:text-white transition-colors">Dietary Guides</a></li>
                            <li><a href="#!" className="hover:text-white transition-colors">API Documentation</a></li>
                            <li><a href="#!" className="hover:text-white transition-colors">Community Forum</a></li>
                        </ul>
                    </div>

                    {/* Legal & Contact */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Connect</h4>
                        <ul className="space-y-4 text-slate-400 font-medium">
                            <li>
                                <a href="mailto:jullietech676@outlook.com" className="group flex items-center gap-3 hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-slate-700 transition-colors">
                                        <Mail size={14} className="text-slate-400" />
                                    </div>
                                    <span className="truncate">jullietech676@outlook.com</span>
                                </a>
                            </li>
                            <li>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        <MapPin size={14} className="text-slate-400" />
                                    </div>
                                    <span>Nairobi, Kenya</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 mt-16 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-slate-500">
                    <p>© 2026 NutriFit Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#!" className="hover:text-slate-300 transition-colors">Privacy</a>
                        <a href="#!" className="hover:text-slate-300 transition-colors">Terms</a>
                        <p className="flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800">
                            Built with <Heart size={14} className="text-emerald-500 fill-emerald-500 animate-pulse" /> by Joan Ouma
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}