import React from 'react';
import { ChefHat, Github, Linkedin, Mail, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer({ onNavigate }) {
    const handleNavClick = (tab) => {
        if (onNavigate) {
            onNavigate(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto w-full shrink-0">
            <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>

            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                    <div className="md:col-span-4">
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <div className="bg-emerald-500 p-1.5 rounded-lg text-slate-900">
                                <ChefHat size={24} />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">NutriFit</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Empowering your health journey with AI-driven nutrition planning, smart pantry management, and personalized insights.
                        </p>
                        <div className="flex gap-4">
                             <a href="https://github.com/julie-tech" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><Github size={18} /></a>
                             <a href="https://www.linkedin.com/in/julie-tech" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Linkedin size={18} /></a>
                             <a href="mailto:julietech676@outlook.com" className="bg-slate-800 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Mail size={18} /></a>
                        </div>
                    </div>

                    <div className="md:col-span-2 md:col-start-6">
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            {onNavigate ? (
                                <>
                                    <li><button onClick={() => handleNavClick('overview')} className="hover:text-emerald-400 transition-colors text-left">Overview</button></li>
                                    <li><button onClick={() => handleNavClick('ai-chef')} className="hover:text-emerald-400 transition-colors text-left">AI Assistant</button></li>
                                    <li><button onClick={() => handleNavClick('nutrition')} className="hover:text-emerald-400 transition-colors text-left">Food Diary</button></li>
                                    <li><button onClick={() => handleNavClick('leaderboard')} className="hover:text-emerald-400 transition-colors text-left">Leaderboard</button></li>
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

                    <div className="md:col-span-2">
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#!" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#!" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                            <li><a href="#!" className="hover:text-emerald-400 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3">
                                <Mail size={16} className="text-emerald-500"/>
                                <a href="mailto:julietech676@outlook.com" className="hover:text-white transition-colors">julietech676@outlook.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin size={16} className="text-emerald-500"/>
                                <span className="text-slate-400">Nairobi, Kenya</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2025 NutriFit Inc. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart size={10} className="text-red-500 fill-red-500"/> by Julie-Tech
                    </p>
                </div>
            </div>
        </footer>
    );
}