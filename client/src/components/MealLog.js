import React, { useState } from 'react';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { logMeal, deleteMeal } from '../api';

export default function MealLog({ meals, dailyLog, onMealAdded, onMealDeleted, selectedDate }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [mealForm, setMealForm] = useState({
        name: '',
        type: 'breakfast',
        nutrition: {
            calories: '',
            protein: '',
            carbs: '',
            fats: ''
        },
        servingSize: '1 serving',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mealTypes = [
        { value: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'lunch', label: 'Lunch', icon: '☀️', color: 'bg-orange-100 text-orange-800' },
        { value: 'dinner', label: 'Dinner', icon: '🌙', color: 'bg-blue-100 text-blue-800' },
        { value: 'snack', label: 'Snack', icon: '🍎', color: 'bg-green-100 text-green-800' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const mealData = {
                ...mealForm,
                date: selectedDate || new Date().toISOString().split('T')[0],
                nutrition: {
                    calories: parseFloat(mealForm.nutrition.calories) || 0,
                    protein: parseFloat(mealForm.nutrition.protein) || 0,
                    carbs: parseFloat(mealForm.nutrition.carbs) || 0,
                    fats: parseFloat(mealForm.nutrition.fats) || 0
                }
            };

            await logMeal(mealData);
            setShowAddForm(false);
            setMealForm({
                name: '',
                type: 'breakfast',
                nutrition: { calories: '', protein: '', carbs: '', fats: '' },
                servingSize: '1 serving',
                notes: ''
            });
            if (onMealAdded) onMealAdded();
        } catch (error) {
            alert('Failed to log meal. Please try again.');
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
            alert('Failed to delete meal.');
        }
    };

    const groupedMeals = meals.reduce((acc, meal) => {
        if (!acc[meal.type]) acc[meal.type] = [];
        acc[meal.type].push(meal);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Meals</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                >
                    <Plus size={18} /> Log Meal
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Meal Name</label>
                                <input
                                    type="text"
                                    required
                                    value={mealForm.name}
                                    onChange={(e) => setMealForm({...mealForm, name: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="e.g., Grilled Chicken Salad"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Meal Type</label>
                                <select
                                    value={mealForm.type}
                                    onChange={(e) => setMealForm({...mealForm, type: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {mealTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Calories</label>
                                <input
                                    type="number"
                                    value={mealForm.nutrition.calories}
                                    onChange={(e) => setMealForm({
                                        ...mealForm,
                                        nutrition: {...mealForm.nutrition, calories: e.target.value}
                                    })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Protein (g)</label>
                                <input
                                    type="number"
                                    value={mealForm.nutrition.protein}
                                    onChange={(e) => setMealForm({
                                        ...mealForm,
                                        nutrition: {...mealForm.nutrition, protein: e.target.value}
                                    })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Carbs (g)</label>
                                <input
                                    type="number"
                                    value={mealForm.nutrition.carbs}
                                    onChange={(e) => setMealForm({
                                        ...mealForm,
                                        nutrition: {...mealForm.nutrition, carbs: e.target.value}
                                    })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fats (g)</label>
                                <input
                                    type="number"
                                    value={mealForm.nutrition.fats}
                                    onChange={(e) => setMealForm({
                                        ...mealForm,
                                        nutrition: {...mealForm.nutrition, fats: e.target.value}
                                    })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Meal'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {meals.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                    <Utensils size={48} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-500 mb-2">No meals logged today</p>
                    <p className="text-sm text-slate-400">Click "Log Meal" to start tracking your nutrition</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {mealTypes.map(type => {
                        const typeMeals = groupedMeals[type.value] || [];
                        if (typeMeals.length === 0) return null;

                        return (
                            <div key={type.value} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">{type.icon}</span>
                                    <h4 className="font-bold text-slate-900">{type.label}</h4>
                                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${type.color}`}>
                                        {typeMeals.length} {typeMeals.length === 1 ? 'meal' : 'meals'}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {typeMeals.map(meal => {
                                        const totalCalories = meal.nutrition?.calories || 0;
                                        return (
                                            <div key={meal._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors">
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-900 mb-1">{meal.name}</div>
                                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                                        <span>{totalCalories} kcal</span>
                                                        {meal.nutrition?.protein && <span>P: {Math.round(meal.nutrition.protein)}g</span>}
                                                        {meal.nutrition?.carbs && <span>C: {Math.round(meal.nutrition.carbs)}g</span>}
                                                        {meal.nutrition?.fats && <span>F: {Math.round(meal.nutrition.fats)}g</span>}
                                                        {meal.servingSize && <span className="text-slate-400">{meal.servingSize}</span>}
                                                    </div>
                                                    {meal.notes && (
                                                        <div className="text-xs text-slate-500 mt-1 italic">{meal.notes}</div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(meal._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

