import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChefHat, ArrowRight, Menu, X,
    Utensils, Target, TrendingUp, Zap, CheckCircle, BarChart3,
    Calendar, Trophy, Activity, Download, Sparkles, Award
} from 'lucide-react';
import Footer from '../components/Footer';

export default function Landing() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ===== NAVBAR ===== */}
            <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-emerald-600 p-2 rounded-lg text-white">
                            <ChefHat size={20} />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">NutriFit</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
                        <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it Works</a>
                        <a href="#testimonials" className="hover:text-slate-900 transition-colors">Testimonials</a>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login" className="text-sm text-slate-600 font-medium hover:text-slate-900 px-4 py-2 transition-colors">
                            Log In
                        </Link>
                        <Link to="/register" className="text-sm bg-slate-900 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                            Get Started
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 animate-slideDown">
                        <div className="px-6 py-5 space-y-1">
                            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">Features</a>
                            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">How it Works</a>
                            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-3 px-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">Testimonials</a>
                            <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
                                <Link to="/login" className="block text-center py-3 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Log In</Link>
                                <Link to="/register" className="block text-center bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition-colors">Get Started</Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* ===== HERO & IMAGE COMBINED ===== */}
            <section className="pt-28 pb-20 sm:pt-36 sm:pb-28 px-6 bg-slate-50 overflow-hidden relative border-b border-slate-100">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8 relative z-10">
                    <div className="flex-1 lg:max-w-2xl text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
                            Track your nutrition.
                            <br className="hidden sm:block" />
                            <span className="text-emerald-600">Transform your health.</span>
                        </h1>

                        <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                            Smart calorie tracking, meal recommendations, and gamified leaderboards. Everything you need to build healthier eating habits.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                            <Link to="/register" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-200 transition-all">
                                Start for free <ArrowRight size={16} />
                            </Link>
                            <a href="#how-it-works" className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white text-slate-700 px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm hover:shadow-md">
                                See how it works
                            </a>
                        </div>
                    </div>

                    <div className="flex-1 w-full lg:w-auto relative group perspective-1000">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/50 bg-white p-2 sm:p-3 transform transition-transform duration-700 hover:scale-[1.02]">
                            <img
                                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80"
                                alt="Healthy meal preparation"
                                className="w-full h-72 sm:h-96 lg:h-[500px] object-cover rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-2xl m-2 sm:m-3"></div>


                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden" id="how-it-works">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase tracking-widest text-xs mb-4">Process</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            Three steps to mastery
                        </h2>
                        <p className="text-slate-500 text-lg sm:text-xl leading-relaxed">
                            We've stripped away the complexity. Focus on your goals while our system handles the heavy lifting of nutritional science.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                num: "01",
                                title: "Set your targets",
                                desc: "Tell us about your goals, dietary preferences, and body metrics. Our system calculates the perfect daily targets for you.",
                                icon: Target,
                                color: "emerald",
                            },
                            {
                                num: "02",
                                title: "Log your meals",
                                desc: "Use our massive food database or quick-add features to track your daily intake. Instantly view your macro and micro breakdowns.",
                                icon: Utensils,
                                color: "teal",
                            },
                            {
                                num: "03",
                                title: "Analyze & adapt",
                                desc: "Dive into detailed nutrition charts, uncover eating trends, and adjust your habits to reach your goals faster.",
                                icon: TrendingUp,
                                color: "cyan",
                            }
                        ].map((step, i) => (
                            <div key={i} className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border border-slate-100/50 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group flex flex-col h-full">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 bg-gradient-to-br from-${step.color}-400 to-${step.color}-600 shadow-lg shadow-${step.color}-500/30 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                                    <step.icon size={28} strokeWidth={2} />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10 group-hover:text-emerald-700 transition-colors">{step.title}</h3>
                                <p className="text-slate-500 text-lg leading-relaxed relative z-10 flex-1">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="py-24 sm:py-32 bg-white relative" id="features">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase tracking-widest text-xs mb-4">Features</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            Everything you need
                        </h2>
                        <p className="text-slate-500 text-lg sm:text-xl leading-relaxed mx-auto max-w-2xl">
                            A complete toolkit to track, analyze, and optimize your nutrition journey without any hassle.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            { title: "Calorie Tracking", desc: "Track daily intake with precision. Set custom goals and see real-time progress.", icon: Target, gradient: "from-emerald-400 to-emerald-600" },
                            { title: "Macro Analysis", desc: "Monitor protein, carbs, and fats. Get insights on your unique macro balance.", icon: BarChart3, gradient: "from-blue-400 to-blue-600" },
                            { title: "Personal Predictions", desc: "Get personalized recipe suggestions based on your eating patterns.", icon: Sparkles, gradient: "from-purple-400 to-purple-600" },
                            { title: "Leaderboards", desc: "Compete with others, climb rankings, and stay motivated daily.", icon: Trophy, gradient: "from-amber-400 to-amber-600" },
                            { title: "Achievements", desc: "Unlock beautiful badges as you reach milestones and build habits.", icon: Award, gradient: "from-orange-400 to-orange-600" },
                            { title: "Meal Planning", desc: "Plan weekly meals, generate grocery lists, and stay organized.", icon: Calendar, gradient: "from-teal-400 to-teal-600" },
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 flex-shrink-0`}>
                                    <feature.icon size={26} strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-800">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-lg flex-1 group-hover:text-slate-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-24 sm:py-32 bg-slate-900 text-white relative overflow-hidden" id="testimonials">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-widest text-xs mb-4">Testimonials</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                            Loved by our users
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Wanjiku Kamau",
                                role: "Fitness Enthusiast",
                                text: "NutriFit transformed how I track my nutrition. The leaderboard keeps me motivated, and the personalized recommendations are spot-on!"
                            },
                            {
                                name: "Ochieng Otieno",
                                role: "Health Coach",
                                text: "As a health coach, I recommend NutriFit to all my clients. The macro tracking and insights are incredibly detailed and accurate."
                            },
                            {
                                name: "Amina Hassan",
                                role: "Busy Professional",
                                text: "The meal planning feature saves me hours each week. I love how it generates grocery lists automatically!"
                            }
                        ].map((t, i) => (
                            <div key={i} className="relative bg-white/5 backdrop-blur-sm p-8 sm:p-10 rounded-[2rem] border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transition-all duration-300 flex flex-col h-full overflow-hidden group">
                                <p className="text-slate-300 text-lg leading-relaxed font-medium mb-10 flex-1 relative z-10">"{t.text}"</p>
                                <div className="flex items-center gap-4 mt-auto relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{t.name}</div>
                                        <div className="text-sm text-slate-400 font-medium">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[3rem] p-12 sm:p-20 text-center shadow-[0_20px_50px_-10px_rgba(52,211,153,0.5)] relative overflow-hidden">
                        {/* Decorative background pattern inside CTA */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 blur-3xl opacity-50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-8 leading-tight">
                                Ready to start your journey?
                            </h2>
                            <p className="text-emerald-50 text-xl sm:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                                Join thousands of users who are building healthier eating habits with NutriFit. Free to get started.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-800 px-10 py-4.5 rounded-2xl text-lg font-bold hover:bg-slate-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-1">
                                    Create free account <ArrowRight size={20} />
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-800/50 backdrop-blur-sm text-white px-10 py-4.5 rounded-2xl text-lg font-bold border border-emerald-500/30 hover:bg-emerald-800/80 hover:border-emerald-400/50 shadow-sm transition-all duration-300 transform hover:-translate-y-1">
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
