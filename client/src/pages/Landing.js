import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ChefHat, ArrowRight, Star, 
    Utensils, Target, TrendingUp, Award, Zap, CheckCircle, BarChart3,
    Calendar, Trophy, Activity, Download, Sparkles
} from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-emerald-100">

            {/* --- Navigation Bar --- */}
            <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3 text-emerald-700 font-bold text-2xl tracking-tight">
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200">
                            <ChefHat size={26} />
                        </div>
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            NutriFit
                        </span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</a>
                        <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Testimonials</a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="hidden md:block text-slate-600 font-semibold hover:text-emerald-700 transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <header className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
                            <Sparkles size={16} />
                            <span>AI-Powered Nutrition Tracking</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                            Transform Your Health with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600">
                                NutriFit
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                            Track calories, balance macros, compete on leaderboards, and get AI-powered meal recommendations. 
                            Your complete nutrition companion for a healthier lifestyle.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Link
                                to="/register"
                                className="inline-flex justify-center items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-xl shadow-emerald-200 transform hover:-translate-y-1"
                            >
                                Start Free Trial <ArrowRight size={20} />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="inline-flex justify-center items-center gap-3 bg-white text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-50 transition-all border-2 border-slate-200"
                            >
                                See How It Works
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 text-sm">
                            <div>
                                <div className="text-2xl font-bold text-slate-900">10K+</div>
                                <div className="text-slate-500">Active Users</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">500K+</div>
                                <div className="text-slate-500">Meals Logged</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">4.9★</div>
                                <div className="text-slate-500">User Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative lg:h-[650px] w-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-[3rem] transform rotate-3 -z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80"
                            alt="Healthy Nutrition Tracking"
                            className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-8 border-white transform -rotate-2 hover:rotate-0 transition-all duration-700"
                        />

                        {/* Floating Card 1 - Calorie Tracking */}
                        <div className="absolute top-10 -left-10 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 hidden lg:block animate-float" style={{ animationDuration: '3s' }}>
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl text-emerald-600">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Daily Goal</p>
                                    <p className="text-lg font-bold text-slate-900">1,850 / 2,000 kcal</p>
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card 2 - Macro Balance */}
                        <div className="absolute bottom-20 -right-5 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 hidden lg:block animate-float" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl text-blue-600">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Macros</p>
                                    <p className="text-sm font-bold text-slate-900">Perfect Balance</p>
                                    <div className="flex gap-1 mt-1">
                                        <div className="w-8 h-1 bg-blue-500 rounded"></div>
                                        <div className="w-8 h-1 bg-green-500 rounded"></div>
                                        <div className="w-8 h-1 bg-orange-500 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card 3 - Achievement */}
                        <div className="absolute top-1/2 -right-10 bg-gradient-to-br from-yellow-400 to-orange-500 p-5 rounded-2xl shadow-2xl text-white hidden lg:block animate-float" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <Trophy size={28} />
                                <div>
                                    <p className="text-xs font-semibold opacity-90">Achievement</p>
                                    <p className="text-sm font-bold">7 Day Streak!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- How It Works Section --- */}
            <section className="py-24 bg-white" id="how-it-works">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
                            <Zap size={16} />
                            <span>Simple & Powerful</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            How NutriFit Works
                        </h2>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Three simple steps to transform your nutrition journey. Track, analyze, and achieve your health goals with AI-powered insights.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-1 bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-200 -z-10 rounded-full"></div>

                        {[
                            { 
                                step: "01",
                                title: "Set Your Goals", 
                                desc: "Create your profile with calorie goals, dietary preferences, and health objectives. Our AI learns your needs.",
                                icon: Target,
                                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                                color: "from-emerald-500 to-teal-500"
                            },
                            { 
                                step: "02",
                                title: "Log Your Meals", 
                                desc: "Track everything you eat with our intuitive meal logger. Get instant nutrition breakdowns and macro analysis.",
                                icon: Utensils,
                                image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
                                color: "from-blue-500 to-purple-500"
                            },
                            { 
                                step: "03",
                                title: "Get Insights & Compete", 
                                desc: "View personalized insights, compete on leaderboards, unlock achievements, and get AI meal recommendations.",
                                icon: TrendingUp,
                                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                                color: "from-orange-500 to-pink-500"
                            }
                        ].map((step, i) => (
                            <div key={i} className="relative group">
                                {/* Step Number */}
                                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10`}>
                                    {step.step}
                                </div>
                                
                                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={step.image}
                                            alt={step.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-20`}></div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl">
                                            <step.icon size={24} className={`text-transparent bg-clip-text bg-gradient-to-r ${step.color}`} />
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                        <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section className="py-24 bg-gradient-to-br from-slate-50 to-emerald-50" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Everything You Need for Better Nutrition
                        </h2>
                        <p className="text-xl text-slate-600">
                            Comprehensive tools to track, analyze, and optimize your nutrition journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { 
                                title: "Smart Calorie Tracking", 
                                desc: "Track daily calories with precision. Set custom goals and get real-time progress updates.",
                                icon: Target,
                                color: "emerald"
                            },
                            { 
                                title: "Macro Analysis", 
                                desc: "Monitor protein, carbs, and fats. Get insights on macro balance and recommendations.",
                                icon: BarChart3,
                                color: "blue"
                            },
                            { 
                                title: "AI Meal Recommendations", 
                                desc: "Get personalized recipe suggestions based on your eating patterns and preferences.",
                                icon: Sparkles,
                                color: "purple"
                            },
                            { 
                                title: "Leaderboard Competition", 
                                desc: "Compete with others, climb rankings, and stay motivated with daily and weekly challenges.",
                                icon: Trophy,
                                color: "yellow"
                            },
                            { 
                                title: "Achievement System", 
                                desc: "Unlock badges and achievements as you reach milestones and build healthy habits.",
                                icon: Award,
                                color: "orange"
                            },
                            { 
                                title: "Meal Planning", 
                                desc: "Plan your weekly meals, generate grocery lists, and stay organized with meal prep tools.",
                                icon: Calendar,
                                color: "teal"
                            },
                            { 
                                title: "Water Intake Tracking", 
                                desc: "Monitor daily hydration with visual progress bars and customizable water goals.",
                                icon: Activity,
                                color: "cyan"
                            },
                            { 
                                title: "Nutrition Insights", 
                                desc: "Get personalized insights and recommendations based on your eating patterns.",
                                icon: TrendingUp,
                                color: "pink"
                            },
                            { 
                                title: "Data Export", 
                                desc: "Export your nutrition data as CSV for offline tracking and analysis.",
                                icon: Download,
                                color: "indigo"
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
                                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Testimonials Section --- */}
            <section className="py-24 bg-white" id="testimonials">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Loved by Thousands
                        </h2>
                        <p className="text-xl text-slate-600">
                            See what our users are saying about NutriFit
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Fitness Enthusiast",
                                image: "https://i.pravatar.cc/150?img=47",
                                rating: 5,
                                text: "NutriFit transformed how I track my nutrition. The leaderboard keeps me motivated, and the AI recommendations are spot-on!"
                            },
                            {
                                name: "Michael Chen",
                                role: "Health Coach",
                                image: "https://i.pravatar.cc/150?img=33",
                                rating: 5,
                                text: "As a health coach, I recommend NutriFit to all my clients. The macro tracking and insights are incredibly detailed and accurate."
                            },
                            {
                                name: "Emily Rodriguez",
                                role: "Busy Professional",
                                image: "https://i.pravatar.cc/150?img=20",
                                rating: 5,
                                text: "The meal planning feature saves me hours each week. I love how it generates grocery lists automatically!"
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} size={20} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                                        <div className="text-sm text-slate-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Call to Action Section --- */}
            <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}></div>
                
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="text-center">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
                            <Sparkles size={40} className="text-white" />
                        </div>
                        
                        {/* Heading */}
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                            Ready to Start Your Nutrition Journey?
                        </h2>
                        
                        {/* Description */}
                        <p className="text-xl text-emerald-50 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Join thousands of users who are transforming their health with NutriFit. 
                            Track your meals, compete on leaderboards, and achieve your fitness goals.
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link 
                                to="/register" 
                                className="inline-flex items-center gap-3 bg-white text-emerald-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                            >
                                Get Started Free
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
                            >
                                Already have an account? Log In
                            </Link>
                        </div>
                        
                        {/* Trust Indicators */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-emerald-100 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} />
                                <span>Free forever plan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA Footer --- */}
            <section className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Transform Your Nutrition?</h2>
                    <p className="text-emerald-100 text-xl mb-10 leading-relaxed">
                        Join thousands of users who are achieving their health goals with NutriFit. 
                        Start your free journey today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/register" 
                            className="inline-block bg-white text-emerald-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl transform hover:-translate-y-1"
                        >
                            Start Free Trial
                        </Link>
                        <a 
                            href="#how-it-works" 
                            className="inline-block bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 rounded-lg">
                                <ChefHat size={20} className="text-white" />
                            </div>
                            <span className="text-white font-bold text-xl">NutriFit</span>
                        </div>
                        <div className="text-sm">
                            © 2025 NutriFit. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
