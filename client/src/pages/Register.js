import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config'; // Import the config

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;

            // Using API_URL
            await axios.post(`${API_URL}/auth/register`, registerData);

            alert('Registration successful! Please log in with your new account.');
            navigate('/login');

        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || 'Registration failed. Please try again.';
            alert(errorMsg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                    <p className="text-slate-500">Join NutriFit today</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            type="text"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                        <input
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                        />
                    </div>

                    <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 mt-2">
                        Sign Up
                    </button>
                </div>

                <p className="mt-6 text-center text-slate-500">
                    Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Log in</Link>
                </p>
            </form>
        </div>
    );
}
