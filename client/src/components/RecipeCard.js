import React, { useState } from 'react';
import { DollarSign, Clock, Flame, Plus,ArrowRight, Utensils } from 'lucide-react';
import NutritionBar from './NutritionBar';
import { logMeal } from '../api';

export default function RecipeCard({ recipe, onMealAdded }) {
    const [addingTo, setAddingTo] = useState(null); // Tracks which button is loading
    const [successMsg, setSuccessMsg] = useState('');

    // --- HELPER: Extracts a clean number ---
    const cleanNumber = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const match = val.toString().match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    const handleQuickAdd = async (mealType) => {
        setAddingTo(mealType);
        try {
            // 1. Convert Ingredients to Objects
            const formattedIngredients = (recipe.ingredients || []).map(ing => ({
                name: ing,
                amount: "1 serving",
                calories: 0
            }));

            // 2. Prepare Payload
            const payload = {
                name: recipe.name || "Unknown Recipe",
                type: mealType,
                date: new Date().toISOString().split('T')[0],
                nutrition: {
                    calories: cleanNumber(recipe.nutrition?.calories),
                    protein: cleanNumber(recipe.nutrition?.protein),
                    carbs: cleanNumber(recipe.nutrition?.carbs),
                    fats: cleanNumber(recipe.nutrition?.fats)
                },
                ingredients: formattedIngredients,
                servingSize: recipe.servingSize || '1 serving',
                notes: `Added from NutriChef AI: ${recipe.name}`
            };

            // 3. Send
            await logMeal(payload);
            
            if (onMealAdded) onMealAdded();
            
            // Show inline success message
            setSuccessMsg(`Added to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}! Check the Nutrition tab.`);
            setTimeout(() => setSuccessMsg(''), 4000);

        } catch (error) {
            console.error("ADD MEAL ERROR:", error);
            alert("Failed to add meal. Please check your connection.");
        } finally {
            setAddingTo(null);
        }
    };

    // Button configurations
    const buttons = [
        { type: 'breakfast', label: 'Breakfast', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200', icon: '🌅' },
        { type: 'lunch', label: 'Lunch', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200', icon: '☀️' },
        { type: 'dinner', label: 'Dinner', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200', icon: '🌙' }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all animate-fadeIn group">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold leading-tight">{recipe.name}</h3>
                        {recipe.matchScore && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                                {recipe.matchScore}% Match
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4 text-slate-300 text-xs font-medium">
                        <span className="flex items-center gap-1"><Clock size={14} /> {recipe.time}</span>
                        <span className="flex items-center gap-1"><Flame size={14} /> {cleanNumber(recipe.nutrition?.calories)} kcal</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex flex-col gap-5">
                
                {/* AI Insight */}
                {recipe.whyItWorks && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                        "{recipe.whyItWorks}"
                    </div>
                )}

                {/* Nutrition */}
                <div className="grid grid-cols-2 gap-3">
                    <NutritionBar label="Protein" value={cleanNumber(recipe.nutrition?.protein)} max={50} color="bg-blue-500" />
                    <NutritionBar label="Carbs" value={cleanNumber(recipe.nutrition?.carbs)} max={60} color="bg-emerald-500" />
                </div>

                {/* Instructions Preview */}
                <div className="flex-1">
                    <h4 className="text-xs uppercase text-slate-400 font-bold mb-3 tracking-wider flex items-center gap-2">
                        <Utensils size={12} /> Instructions
                    </h4>
                    <div className="space-y-2">
                        {(recipe.instructions || []).slice(0, 3).map((step, idx) => (
                            <p key={idx} className="text-sm text-slate-600 line-clamp-2 pl-2 border-l-2 border-slate-100">
                                {idx + 1}. {step}
                            </p>
                        ))}
                        {(recipe.instructions?.length > 3) && (
                            <p className="text-xs text-slate-400 pl-2">...and {recipe.instructions.length - 3} more steps</p>
                        )}
                    </div>
                </div>

                {/* SUCCESS MESSAGE (If added) */}
                {successMsg && (
                    <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl text-center animate-bounce">
                        {successMsg}
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                    {buttons.map((btn) => (
                        <button
                            key={btn.type}
                            onClick={() => handleQuickAdd(btn.type)}
                            disabled={addingTo !== null}
                            className={`
                                flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all
                                ${btn.color}
                                ${addingTo === btn.type ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                            `}
                        >
                            {addingTo === btn.type ? (
                                <Clock size={16} className="animate-spin" />
                            ) : (
                                <span className="text-lg leading-none">{btn.icon}</span>
                            )}
                            <span className="text-[10px] uppercase font-bold tracking-wide">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}