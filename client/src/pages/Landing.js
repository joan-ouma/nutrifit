import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Menu, X, Star,
    Utensils, Target, TrendingUp,
    Flame, Dumbbell, Heart, BarChart3,
    Play, Leaf, Headphones
} from 'lucide-react';
import Footer from '../components/Footer';
import '../Landing.css';

/* ──────────────────────────── ANIMATION HOOK ──────────────────────────── */
function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

function Reveal({ children, className = '', delay = 0 }) {
    const [ref, visible] = useReveal();
    return (
        <div
            ref={ref}
            className={`reveal-item ${visible ? 'revealed' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ──────────────────────────── LANDING PAGE ──────────────────────────── */
export default function Landing() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('meal');
    const [activeSection, setActiveSection] = useState('plans');

    // Scroll shadow on navbar
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Scroll-spy: update active nav pill based on visible section
    useEffect(() => {
        const ids = ['hero', 'plans', 'how-it-works', 'testimonials'];
        const observers = [];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
                { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    const mealPlans = [
        {
            title: 'Weight Loss',
            desc: 'Calorie-deficit meals with balanced nutrition to help you shed weight sustainably.',
            cal: '1,200 - 1,500 Cal',
            tag: 'Low Calorie',
            price: '400',
            img: '/images/meal-weight-loss.png',
            icon: Flame,
        },
        {
            title: 'Build Muscle',
            desc: 'High-protein meal plans designed to fuel muscle growth and recovery.',
            cal: '2,200 - 2,800 Cal',
            tag: 'High Protein',
            price: '400',
            img: '/images/meal-muscle.png',
            icon: Dumbbell,
        },
        {
            title: 'Stay Healthy',
            desc: 'Balanced nutrition plans to maintain your ideal weight and wellness.',
            cal: '1,800 - 2,200 Cal',
            tag: 'Balanced',
            price: '300',
            img: '/images/meal-healthy.png',
            icon: Heart,
        },
    ];

    const customDiets = [
        {
            title: 'Keto Diet',
            desc: 'High-fat, very low-carb meals to shift your body into a fat-burning state.',
            cal: '1,500 - 2,000 Cal',
            tag: 'Low Carb',
            price: '500',
            img: '/images/meal-muscle.png',
            icon: Flame,
        },
        {
            title: 'Vegan Plan',
            desc: '100% plant-based meals packed with nutrients, fiber, and natural goodness.',
            cal: '1,600 - 2,100 Cal',
            tag: 'Plant-Based',
            price: '450',
            img: '/images/meal-healthy.png',
            icon: Leaf,
        },
        {
            title: 'Intermittent Fasting',
            desc: 'Structured eating windows with optimized meals for maximum results.',
            cal: '1,400 - 1,800 Cal',
            tag: 'Time-Restricted',
            price: '400',
            img: '/images/meal-weight-loss.png',
            icon: Target,
        },
    ];

    const plans = activeTab === 'meal' ? mealPlans : customDiets;

    const steps = [
        {
            num: '1',
            title: 'Set Your Goal',
            desc: 'Tell us about your goals, dietary preferences, and body metrics for personalized targets.',
            icon: Target,
            color: '#16a34a',
        },
        {
            num: '2',
            title: 'Get Your Plan',
            desc: 'Receive personalized meal plans and nutritional guidance tailored to your unique profile.',
            icon: Utensils,
            color: '#16a34a',
        },
        {
            num: '3',
            title: 'Stay On Track',
            desc: 'Track your daily intake, view progress charts, and unlock achievement badges.',
            icon: TrendingUp,
            color: '#16a34a',
        },
    ];

    const testimonials = [
        {
            name: 'Aboki Ali',
            role: 'Lost 12kg in 3 months',
            text: 'NutriFit completely changed my relationship with food. The personalized meal plans made it so easy to stay consistent.',
            rating: 5,
            avatar: 'A',
        },
        {
            name: 'Sara Muthoni',
            role: 'Fitness Nutritionist',
            text: 'As a nutritionist, I recommend NutriFit to all my clients. The macro tracking and AI-powered insights are incredibly accurate.',
            rating: 5,
            avatar: 'S',
        },
        {
            name: 'Ochieng Otieno',
            role: 'Gained 8kg muscle',
            text: 'The high-protein plans and progress tracking kept me motivated. I\'ve never felt stronger or more energized.',
            rating: 4,
            avatar: 'O',
        },
        {
            name: 'Amina Hassan',
            role: 'Busy Professional',
            text: 'Meal planning used to take me hours. NutriFit generates grocery lists automatically — it\'s a game changer.',
            rating: 5,
            avatar: 'A',
        },
    ];

    const stats = [
        { value: '20K+', label: 'Daily Meals Tracked' },
        { value: '95%', label: 'Goal Achievement' },
        { value: '300+', label: 'Healthy Recipes' },
        { value: '12K+', label: 'Active Users' },
    ];

    return (
        <div className="landing-page">

            {/* ═══════════════════ NAVBAR ═══════════════════ */}
            <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="nav-inner">
                    <Link to="/" className="nav-brand" id="nav-logo">
                        <div className="nav-logo-icon"><Leaf size={20} /></div>
                        <span className="nav-logo-text">NutriFit</span>
                    </Link>

                    <div className="nav-links" id="nav-links">
                        <a href="#hero" className={`nav-pill ${activeSection === 'hero' ? 'active' : ''}`}>Home</a>
                        <a href="#plans" className={`nav-pill ${activeSection === 'plans' ? 'active' : ''}`}>Plans</a>
                        <a href="#how-it-works" className={`nav-pill ${activeSection === 'how-it-works' ? 'active' : ''}`}>How it Works</a>
                        <a href="#testimonials" className={`nav-pill ${activeSection === 'testimonials' ? 'active' : ''}`}>Nutritionists</a>
                    </div>

                    <div className="nav-actions" id="nav-actions">
                        <Link to="/login" className="nav-login">Log In</Link>
                        <Link to="/register" className="nav-signup" id="nav-cta">Sign Up</Link>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="nav-mobile-toggle"
                        aria-label="Toggle menu"
                        id="nav-mobile-toggle"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="nav-mobile-menu animate-slideDown">
                        <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Home</a>
                        <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Plans</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="mobile-link">How it Works</a>
                        <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="mobile-link">Nutritionists</a>
                        <div className="mobile-actions">
                            <Link to="/login" className="mobile-login">Log In</Link>
                            <Link to="/register" className="mobile-signup">Get Started</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ═══════════════════ HERO ═══════════════════ */}
            <section className="hero-section" id="hero">
                <div className="hero-bg-blur hero-bg-1"></div>
                <div className="hero-bg-blur hero-bg-2"></div>

                <div className="hero-inner">
                    <div className="hero-content">
                        <Reveal>
                            <h1 className="hero-title">
                                Eat Better.<br />
                                Live <span className="hero-highlight">Stronger.</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={100}>
                            <p className="hero-subtitle">
                                Personalized diet plans using AI to help you achieve your goals. Track your fitness and live a healthy life.
                            </p>
                        </Reveal>
                        <Reveal delay={200}>
                            <div className="hero-buttons">
                                <Link to="/register" className="btn-primary" id="hero-cta">
                                    Get Started <ArrowRight size={16} />
                                </Link>
                                <a href="#how-it-works" className="btn-outline" id="hero-secondary">
                                    <Play size={14} /> Watch Demo
                                </a>
                            </div>
                        </Reveal>
                        <Reveal delay={300}>
                            <div className="hero-social-proof">
                                <div className="avatar-stack">
                                    {['W', 'S', 'O', 'A'].map((l, i) => (
                                        <div key={i} className="avatar-circle" style={{ zIndex: 4 - i }}>{l}</div>
                                    ))}
                                </div>
                                <div className="social-proof-text">
                                    <div className="social-stars">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className="star-filled" />)}
                                    </div>
                                    <span>20+ happy users</span>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="hero-visual">
                        <Reveal delay={200}>
                            <div className="hero-image-wrapper">
                                <img
                                    src="/images/hero-person.png"
                                    alt="Healthy lifestyle"
                                    className="hero-person-img"
                                />
                                {/* Floating cards */}
                                <div className="floating-card card-calories">
                                    <div className="fc-icon fc-green"><Flame size={16} /></div>
                                    <div>
                                        <div className="fc-value">185<span className="fc-unit">kcal</span></div>
                                        <div className="fc-label">Calories burned</div>
                                    </div>
                                </div>
                                <div className="floating-card card-progress">
                                    <div className="fc-icon fc-emerald"><TrendingUp size={16} /></div>
                                    <div>
                                        <div className="fc-value">78%</div>
                                        <div className="fc-label">Daily goal</div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ FEATURE BADGES ═══════════════════ */}
            <section className="badges-section">
                <div className="badges-inner">
                    {[
                        { icon: Utensils, title: 'Personalized Plans', desc: 'AI-driven meal plans tailored to your goals' },
                        { icon: Leaf, title: 'Healthy & Delicious', desc: 'Nutritionist-approved recipes you\'ll love' },
                        { icon: BarChart3, title: 'Track Progress', desc: 'Visual dashboards for your fitness journey' },
                        { icon: Headphones, title: 'Expert Support', desc: 'Guidance from certified nutrition coaches' },
                    ].map((b, i) => (
                        <Reveal key={i} delay={i * 80}>
                            <div className="badge-card" id={`badge-${i}`}>
                                <div className="badge-icon"><b.icon size={20} /></div>
                                <div>
                                    <div className="badge-title">{b.title}</div>
                                    <div className="badge-desc">{b.desc}</div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ═══════════════════ MEAL PLANS ═══════════════════ */}
            <section className="plans-section" id="plans">
                <div className="section-container">
                    <Reveal>
                        <div className="section-header">
                            <h2 className="section-title">
                                Choose the Plan That <span className="text-green">Fits You</span>
                            </h2>
                            <p className="section-subtitle">
                                Healthy meals and nutrition guidance, made simple for your goals
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="plans-tabs" id="meals">
                            <button className={`plan-tab ${activeTab === 'meal' ? 'active' : ''}`} onClick={() => setActiveTab('meal')}>Meal Plans</button>
                            <button className={`plan-tab ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>Custom Diets</button>
                        </div>
                    </Reveal>

                    <div className="plans-grid">
                        {plans.map((plan, i) => (
                            <Reveal key={i} delay={i * 120}>
                                <div className="plan-card" id={`plan-${plan.title.toLowerCase().replace(/\s/g, '-')}`}>
                                    <div className="plan-image-wrap">
                                        <img src={plan.img} alt={plan.title} className="plan-image" />
                                    </div>
                                    <div className="plan-body">
                                        <h3 className="plan-title">{plan.title}</h3>
                                        <p className="plan-desc">{plan.desc}</p>
                                        <div className="plan-meta">
                                            <span className="plan-cal"><Flame size={14} /> {plan.cal}</span>
                                            <span className="plan-tag">{plan.tag}</span>
                                        </div>
                                        <div className="plan-footer">
                                            <div className="plan-price">
                                                <span className="price-amount">{plan.price}</span>
                                                <span className="price-period">KES/week</span>
                                            </div>
                                            <Link to="/register" className="plan-btn">
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ STATS BAR ═══════════════════ */}
            <section className="stats-section">
                <div className="stats-inner">
                    {stats.map((s, i) => (
                        <Reveal key={i} delay={i * 100}>
                            <div className="stat-item" id={`stat-${i}`}>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
            <section className="steps-section" id="how-it-works">
                <div className="section-container">
                    <Reveal>
                        <div className="section-header">
                            <h2 className="section-title">
                                Start Your Journey in 3 <span className="text-green">Simple Steps</span>
                            </h2>
                            <p className="section-subtitle">
                                Set your goal, get a personalized meal plan, and track your progress with ease.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={50}>
                        <p className="steps-label">How it Works</p>
                    </Reveal>

                    <div className="steps-grid">
                        {steps.map((step, i) => (
                            <Reveal key={i} delay={i * 150}>
                                <div className="step-card" id={`step-${i}`}>
                                    <div className="step-num-badge">{step.num}</div>
                                    <div className="step-icon-wrap">
                                        <step.icon size={32} />
                                    </div>
                                    <h3 className="step-title">{step.title}</h3>
                                    <p className="step-desc">{step.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
            <section className="testimonials-section" id="testimonials">
                <div className="section-container">
                    <Reveal>
                        <div className="section-header">
                            <h2 className="section-title">
                                Real People, <span className="text-green">Real Results</span>
                            </h2>
                            <p className="section-subtitle">
                                See how NutriFit is helping people achieve their health goals every day.
                            </p>
                        </div>
                    </Reveal>

                    <div className="testimonials-grid">
                        {testimonials.map((t, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className="testimonial-card" id={`testimonial-${i}`}>
                                    <div className="testimonial-stars">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} size={14} className={j < t.rating ? 'star-filled' : 'star-empty'} />
                                        ))}
                                    </div>
                                    <p className="testimonial-text">"{t.text}"</p>
                                    <div className="testimonial-author">
                                        <div className="testimonial-avatar">{t.avatar}</div>
                                        <div>
                                            <div className="testimonial-name">{t.name}</div>
                                            <div className="testimonial-role">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ CTA BANNER ═══════════════════ */}
            <section className="cta-section">
                <div className="section-container">
                    <Reveal>
                        <div className="cta-banner" id="cta-banner">
                            <div className="cta-bg-leaf"></div>
                            <div className="cta-content">
                                <h2 className="cta-title">
                                    Start Your Healthy<br />Journey Today
                                </h2>
                                <Link to="/register" className="cta-button" id="cta-button">
                                    Get Started Now <ArrowRight size={16} />
                                </Link>
                            </div>
                            <p className="cta-subtext">
                                Take the first step towards a better, healthier you with personalized meal plans today.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}
