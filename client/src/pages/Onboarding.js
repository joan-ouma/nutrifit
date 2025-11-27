import React from 'react';
import { ChefHat, ArrowRight } from 'lucide-react';

export default function Onboarding({ userProfile, setUserProfile, onSave }) {
    const handleChange = (key, value) => {
        setUserProfile(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mt-10">
            <div className="text-center mb-8">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome to NutriFit</h1>
                <p className="text-slate-500">Personalized, AI-powered nutrition for your budget.</p>
            </div>

            <div className="space-y-4">
                {/* Goal Select */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Goal</label>
                    <select
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={userProfile.goal}
                        onChange={(e) => handleChange('goal', e.target.value)}
                    >
                        <option value="balanced">Balanced Diet</option>
                        <option value="muscle">Muscle Gain</option>
                        <option value="weight-loss">Weight Loss</option>
                    </select>
                </div>

                {/* Budget Select */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Budget Level</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['low', 'medium', 'high'].map((level) => (
                            <button
                                key={level}
                                onClick={() => handleChange('budget', level)}
                                className={`p-2 rounded-lg border text-sm font-medium capitalize ${
                                    userProfile.budget === level
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onSave}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4"
                >
                    Start Cooking <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}