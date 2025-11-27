import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
            newErrors.email = 'Email is invalid';
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-slate-900">Welcome Back</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                        className={`w-full p-3 border rounded-lg outline-none transition-colors ${
                            errors.email
                                ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                                : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={e => {
                            setFormData({...formData, email: e.target.value});
                            if (errors.email) setErrors({...errors, email: ''});
                        }}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                        className={`w-full p-3 border rounded-lg outline-none transition-colors ${
                            errors.password
                                ? 'border-red-300 focus:ring-2 focus:ring-red-500'
                                : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => {
                            setFormData({...formData, password: e.target.value});
                            if (errors.password) setErrors({...errors, password: ''});
                        }}
                        required
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Logging in...
                        </>
                    ) : (
                        'Log In'
                    )}
                </button>
                <p className="mt-4 text-center text-slate-500">
                    No account? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Sign up</Link>
                </p>
            </form>
        </div>
    );
}
