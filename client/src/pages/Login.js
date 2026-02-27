import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ChefHat, ArrowLeft, Mail, Lock } from 'lucide-react';
import API_URL from '../config';
import { setAuth } from '../utils/auth';
import { useToastContext } from '../contexts/ToastContext';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const toast = useToastContext();

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, formData);
            setAuth(res.data.token, res.data.user);
            toast.success('Welcome back!', 'Login successful');
            navigate('/app');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Login failed. Please try again.';
            toast.error(errorMsg, 'Login Failed');
            if (err.response?.status === 401) {
                setErrors({ password: 'Invalid email or password' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3"></div>

            {/* Header */}
            <div className="relative z-10 px-6 pt-6">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={16} />
                    Back
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="bg-emerald-600 p-2 rounded-lg text-white">
                                <ChefHat size={20} />
                            </div>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">NutriFit</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
                        <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm transition-colors ${errors.email
                                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                        : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 hover:border-slate-300'
                                        }`}
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (errors.email) setErrors({ ...errors, email: '' });
                                    }}
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm transition-colors ${errors.password
                                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                        : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 hover:border-slate-300'
                                        }`}
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => {
                                        setFormData({ ...formData, password: e.target.value });
                                        if (errors.password) setErrors({ ...errors, password: '' });
                                    }}
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
