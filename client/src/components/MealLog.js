import React, { useState } from 'react';
import { Plus, Trash2, Utensils, Flame, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { logMeal, deleteMeal } from '../api';

export default function MealLog({ meals, dailyLog, onMealAdded, onMealDeleted, selectedDate }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [mealForm, setMealForm] = useState({
        name: '',
        type: 'breakfast',
        nutrition: { calories: '', protein: '', carbs: '', fats: '' },
        servingSize: '1 serving',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Professional Styling Config
    const mealConfig = {
        breakfast: { label: 'Breakfast', icon: '🌅', style: 'bg-orange-50 text-orange-700 border-orange-100', iconBg: 'bg-orange-100' },
        lunch: { label: 'Lunch', icon: '☀️', style: 'bg-sky-50 text-sky-700 border-sky-100', iconBg: 'bg-sky-100' },
        dinner: { label: 'Dinner', icon: '🌙', style: 'bg-indigo-50 text-indigo-700 border-indigo-100', iconBg: 'bg-indigo-100' },
        snack: { label: 'Snack', icon: '🍎', style: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconBg: 'bg-emerald-100' }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await logMeal({
                ...mealForm,
                date: selectedDate || new Date().toISOString().split('T')[0],
                nutrition: {
                    calories: parseFloat(mealForm.nutrition.calories) || 0,
                    protein: parseFloat(mealForm.nutrition.protein) || 0,
                    carbs: parseFloat(mealForm.nutrition.carbs) || 0,
                    fats: parseFloat(mealForm.nutrition.fats) || 0
                }
            });
            setShowAddForm(false);
            setMealForm({ name: '', type: 'breakfast', servingSize: '1 serving', nutrition: { calories: '', protein: '', carbs: '', fats: '' }, notes: '' });
            if (onMealAdded) onMealAdded();
        } catch (error) {
            alert('Failed to log meal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (mealId) => {
        if (!window.confirm('Delete this meal?')) return;
        try {
            await deleteMeal(mealId);
            if (onMealDeleted) onMealDeleted();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Today's Meals</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95
                        ${showAddForm ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}
                    `}
                >
                    {showAddForm ? <ChevronUp size={18} /> : <Plus size={18} />}
                    {showAddForm ? 'Close' : 'Log Meal'}
                </button>
            </div>

            {/* ADD FORM (Animated Slide Down) */}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl mb-6 animate-slideDown relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                        <Utensils size={18} className="text-emerald-500"/> New Entry
                    </h4>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Name</label>
                                <input required type="text" value={mealForm.name} onChange={(e) => setMealForm({...mealForm, name: e.target.value})} 
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-700" 
                                    placeholder="e.g. Oatmeal & Berries" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Time</label>
                                <select value={mealForm.type} onChange={(e) => setMealForm({...mealForm, type: e.target.value})} 
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer font-medium text-slate-700">
                                    {Object.entries(mealConfig).map(([key, conf]) => (
                                        <option key={key} value={key}>{conf.icon} {conf.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {['Calories', 'Protein', 'Carbs', 'Fats'].map((field) => (
                                <div key={field}>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{field}</label>
                                    <input type="number" placeholder="0" 
                                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 outline-none text-center font-bold text-slate-700" 
                                        value={mealForm.nutrition[field.toLowerCase()]}
                                        onChange={(e) => setMealForm({...mealForm, nutrition: {...mealForm.nutrition, [field.toLowerCase()]: e.target.value}})}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex justify-center items-center gap-2">
                                {isSubmitting ? 'Saving...' : <><Plus size={18}/> Save Meal</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- MEAL GRID DISPLAY --- */}
            {meals.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Utensils size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Your daily log is empty.</p>
                    <p className="text-xs text-slate-400 mt-1">Start tracking to reach your goals.</p>
                </div>
            ) : (
                // ✅ THIS IS THE GRID LAYOUT (3 Columns on large screens)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meals.map((meal) => {
                        const config = mealConfig[meal.type] || mealConfig.breakfast;
                        return (
                            <div key={meal._id} className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-white ${config.iconBg}`}>
                                            {config.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-base leading-tight line-clamp-1">{meal.name}</h4>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.style}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(meal._id)} 
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Macros Grid */}
                                <div className="grid grid-cols-4 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                                    <div className="bg-slate-50 p-2 flex flex-col items-center justify-center">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Cals</span>
                                        <span className="text-xs font-black text-slate-700">{meal.nutrition?.calories || 0}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2 flex flex-col items-center justify-center">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Prot</span>
                                        <span className="text-xs font-bold text-blue-600">{Math.round(meal.nutrition?.protein || 0)}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2 flex flex-col items-center justify-center">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Carb</span>
                                        <span className="text-xs font-bold text-emerald-600">{Math.round(meal.nutrition?.carbs || 0)}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2 flex flex-col items-center justify-center">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Fat</span>
                                        <span className="text-xs font-bold text-yellow-600">{Math.round(meal.nutrition?.fats || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}