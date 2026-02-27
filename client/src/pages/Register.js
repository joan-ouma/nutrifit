import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ChefHat, ArrowLeft, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import API_URL from '../config';
import { useToastContext } from '../contexts/ToastContext';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const toast = useToastContext();

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Minimum 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await axios.post(`${API_URL}/auth/register`, registerData);
            toast.success('Account created! Please sign in.', 'Welcome to NutriFit');
            navigate('/login');
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || 'Registration failed. Please try again.';
            toast.error(errorMsg, 'Registration Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = (field) => {
        if (errors[field]) setErrors({ ...errors, [field]: '' });
    };

    const inputClass = (field) => `w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm transition-colors ${errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 hover:border-slate-300'
        }`;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

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
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
                        <p className="text-slate-500 text-sm">Start your nutrition journey today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className={inputClass('username')}
                                    type="text"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={e => { setFormData({ ...formData, username: e.target.value }); clearError('username'); }}
                                    required
                                />
                            </div>
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className={inputClass('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => { setFormData({ ...formData, email: e.target.value }); clearError('email'); }}
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
                                    className={inputClass('password')}
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => { setFormData({ ...formData, password: e.target.value }); clearError('password'); }}
                                    required
                                    minLength={6}
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                            <div className="relative">
                                <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className={inputClass('confirmPassword')}
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={e => { setFormData({ ...formData, confirmPassword: e.target.value }); clearError('confirmPassword'); }}
                                    required
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
