import React, { useState } from 'react';
import { DollarSign, Clock, Flame, Plus, Check } from 'lucide-react';
import NutritionBar from './NutritionBar';
import { logMeal } from '../api';

export default function RecipeCard({ recipe, onMealAdded }) {
    const [isAdding, setIsAdding] = useState(false);

    // --- HELPER: Extracts a clean number from text ---
    const cleanNumber = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const match = val.toString().match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    const handleQuickAdd = async (mealType) => {
        setIsAdding(true);
        try {
            // 1. FIX: Convert AI strings ["Rice"] to Backend Objects [{name: "Rice"}]
            const formattedIngredients = (recipe.ingredients || []).map(ing => ({
                name: ing,
                amount: "1 serving", // Default since AI doesn't specify amounts per line
                calories: 0
            }));

            // 2. Prepare the payload
            const payload = {
                name: recipe.name || "Unknown Recipe",
                type: mealType, // 'breakfast', 'lunch', 'dinner'
                date: new Date().toISOString().split('T')[0],
                nutrition: {
                    calories: cleanNumber(recipe.nutrition?.calories),
                    protein: cleanNumber(recipe.nutrition?.protein),
                    carbs: cleanNumber(recipe.nutrition?.carbs),
                    fats: cleanNumber(recipe.nutrition?.fats)
                },
                ingredients: formattedIngredients, // <--- THE FIX IS HERE
                servingSize: recipe.servingSize || '1 serving',
                notes: `Added from AI Chef: ${recipe.name}`
            };

            console.log("SENDING MEAL:", payload); // Debug log

            // 3. Send to backend
            await logMeal(payload);
            
            if (onMealAdded) onMealAdded();
            alert(`Successfully added to ${mealType}!`);

        } catch (error) {
            console.error("ADD MEAL ERROR:", error.response?.data || error);
            alert(`Failed to add meal: ${error.response?.data?.message || "Check console"}`);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow animate-fadeIn">
            {/* Card Header */}
            <div className="bg-slate-900 text-white p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold leading-tight">{recipe.name}</h3>
                    {recipe.matchScore && (
                        <span className="bg-emerald-500 text-xs font-bold px-2 py-1 rounded">
                            {recipe.matchScore}% Match
                        </span>
                    )}
                </div>
                <div className="flex gap-4 text-slate-300 text-xs font-medium">
                    <span className="flex items-center gap-1"><Clock size={14} /> {recipe.time}</span>
                    <span className="flex items-center gap-1"><DollarSign size={14} /> {recipe.costPerServing}/serving</span>
                    <span className="flex items-center gap-1"><Flame size={14} /> {cleanNumber(recipe.nutrition?.calories)} kcal</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col gap-6">
                
                {/* AI Insight */}
                {recipe.whyItWorks && (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-sm text-slate-700 italic">
                        "{recipe.whyItWorks}"
                    </div>
                )}

                {/* Nutrition Bars */}
                <div className="grid grid-cols-2 gap-4">
                    <NutritionBar label="Protein" value={cleanNumber(recipe.nutrition?.protein)} max={50} color="bg-blue-500" />
                    <NutritionBar label="Carbs" value={cleanNumber(recipe.nutrition?.carbs)} max={60} color="bg-emerald-500" />
                </div>

                {/* Preparation Steps */}
                <div className="flex-1">
                    <h4 className="text-xs uppercase text-slate-400 font-bold mb-3 tracking-wider">Instructions</h4>
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                        <ol className="space-y-3">
                            {recipe.instructions.map((step, idx) => (
                                <li key={idx} className="text-sm text-slate-700 flex gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                    <span className="leading-snug">{step}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-sm text-slate-400">No instructions available.</p>
                    )}
                </div>

                {/* ADD BUTTONS (Fixed Layout) */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100">
                    {['breakfast', 'lunch', 'dinner'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleQuickAdd(type)}
                            disabled={isAdding}
                            className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs font-bold uppercase text-slate-600 active:scale-95"
                        >
                            {isAdding ? <Clock size={18} className="animate-spin text-emerald-600" /> : <Plus size={18} className="text-emerald-600" />}
                            <span className="capitalize">{type}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}