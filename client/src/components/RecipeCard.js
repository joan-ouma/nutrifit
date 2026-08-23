import React, { useState } from 'react';
import { DollarSign, Clock, Flame, Plus,ArrowRight, Utensils } from 'lucide-react';
import NutritionBar from './NutritionBar';
import { logMeal } from '../api';

export default function RecipeCard({ recipe, onMealAdded }) {
    const [addingTo, setAddingTo] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const cleanNumber = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const match = val.toString().match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    const handleQuickAdd = async (mealType) => {
        setAddingTo(mealType);
        try {
            const formattedIngredients = (recipe.ingredients || []).map(ing => ({
                name: ing, amount: "1 serving", calories: 0
            }));

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
                notes: `Added from AI Chef: ${recipe.name}`
            };

            await logMeal(payload);
            if (onMealAdded) onMealAdded();
            
            setSuccessMsg(`Added to ${mealType}`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error("ADD MEAL ERROR:", error);
            alert("Failed to add meal.");
        } finally {
            setAddingTo(null);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full hover:border-slate-300 transition-colors shadow-sm">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-lg font-semibold text-slate-900 leading-snug">{recipe.name}</h3>
                    {recipe.matchScore && (
                        <span className="shrink-0 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                            {recipe.matchScore}% Match
                        </span>
                    )}
                </div>
                <div className="flex gap-4 text-slate-500 text-sm font-medium">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {recipe.time}</span>
                    <span className="flex items-center gap-1.5"><Flame size={14} className="text-slate-400" /> {cleanNumber(recipe.nutrition?.calories)} kcal</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col gap-6">
                
                {/* Description */}
                {recipe.whyItWorks && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {recipe.whyItWorks}
                    </p>
                )}

                {/* Macros - Minimal Tabular */}
                <div className="flex justify-between border-y border-slate-100 py-4">
                    <div className="text-center flex-1 border-r border-slate-100 last:border-0">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Protein</div>
                        <div className="text-sm font-semibold text-slate-900">{cleanNumber(recipe.nutrition?.protein)}g</div>
                    </div>
                    <div className="text-center flex-1 border-r border-slate-100 last:border-0">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Carbs</div>
                        <div className="text-sm font-semibold text-slate-900">{cleanNumber(recipe.nutrition?.carbs)}g</div>
                    </div>
                    <div className="text-center flex-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Fats</div>
                        <div className="text-sm font-semibold text-slate-900">{cleanNumber(recipe.nutrition?.fats)}g</div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="flex-1">
                    <h4 className="text-xs uppercase text-slate-900 font-bold tracking-wider mb-3">
                        Instructions
                    </h4>
                    <ol className="space-y-2.5 list-decimal list-outside ml-4 text-sm text-slate-600">
                        {(recipe.instructions || []).slice(0, 3).map((step, idx) => (
                            <li key={idx} className="pl-1 leading-relaxed">{step}</li>
                        ))}
                    </ol>
                    {(recipe.instructions?.length > 3) && (
                        <div className="text-xs text-slate-400 font-medium mt-3 ml-4">
                            +{recipe.instructions.length - 3} more steps
                        </div>
                    )}
                </div>

                {/* Success Message */}
                {successMsg && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold p-3 rounded-lg text-center">
                        {successMsg}
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-2">
                    {['breakfast', 'lunch', 'dinner'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleQuickAdd(type)}
                            disabled={addingTo !== null}
                            className={`
                                flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-colors
                                ${addingTo === type ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            {addingTo === type ? (
                                <Plus size={14} className="animate-spin" />
                            ) : (
                                <Plus size={14} />
                            )}
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}