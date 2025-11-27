import React, { useState } from 'react';
import { DollarSign, Clock, Flame, Plus } from 'lucide-react';
import NutritionBar from './NutritionBar';
import { logMeal } from '../api';

export default function RecipeCard({ recipe, onMealAdded }) {
    const [isAdding, setIsAdding] = useState(false);

    const handleQuickAdd = async (mealType) => {
        setIsAdding(true);
        try {
            const nutrition = recipe.nutrition || {};
            // Convert string values to numbers if needed
            const calories = typeof nutrition.calories === 'string' 
                ? parseInt(nutrition.calories) || 0 
                : nutrition.calories || 0;
            
            const protein = typeof nutrition.protein === 'string'
                ? parseFloat(nutrition.protein.replace('g', '')) || 0
                : nutrition.protein || 0;
            
            const carbs = typeof nutrition.carbs === 'string'
                ? parseFloat(nutrition.carbs.replace('g', '')) || 0
                : nutrition.carbs || 0;
            
            const fats = typeof nutrition.fats === 'string'
                ? parseFloat(nutrition.fats.replace('g', '')) || 0
                : nutrition.fats || 0;

            await logMeal({
                name: recipe.name,
                type: mealType,
                date: new Date().toISOString().split('T')[0],
                nutrition: {
                    calories,
                    protein,
                    carbs,
                    fats
                },
                ingredients: recipe.ingredients || [],
                servingSize: recipe.servingSize || '1 serving',
                notes: `Added from recipe: ${recipe.name}`
            });
            
            if (onMealAdded) onMealAdded();
            alert('Meal added successfully!');
        } catch (error) {
            alert('Failed to add meal. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-full animate-fadeIn hover:shadow-xl transition-shadow">
            {/* Card Header */}
            <div className="bg-slate-900 text-white p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold leading-tight">{recipe.name}</h3>
                    <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm whitespace-nowrap ml-2">
                        {recipe.matchScore ? `${recipe.matchScore}% Match` : 'Recommended'}
                    </div>
                </div>

                <div className="flex gap-4 text-slate-300 text-xs font-medium">
                    <span className="flex items-center gap-1"><Clock size={14} /> {recipe.time}</span>
                    <span className="flex items-center gap-1"><DollarSign size={14} /> {recipe.costPerServing}/serving</span>
                    <span className="flex items-center gap-1"><Flame size={14} /> {recipe.nutrition?.calories} kcal</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col gap-6">

                {/* 1. AI Insight (Why this works for you) */}
                {recipe.whyItWorks && (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <p className="text-sm text-slate-700 italic">
                            " {recipe.whyItWorks} "
                        </p>
                    </div>
                )}

                {/* 2. Nutrition Section */}
                <div>
                    <h4 className="text-xs uppercase text-slate-400 font-bold mb-3 tracking-wider flex items-center gap-2">
                        Nutrition Profile
                    </h4>
                    {recipe.nutrition && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <NutritionBar label="Protein" value={recipe.nutrition.protein} max={50} color="bg-blue-500" />
                                <NutritionBar label="Fats" value={recipe.nutrition.fats} max={30} color="bg-yellow-500" />
                            </div>
                            <div>
                                <NutritionBar label="Carbs" value={recipe.nutrition.carbs} max={60} color="bg-emerald-500" />
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Missing Ingredients Warning */}
                {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <span className="text-xs font-bold text-amber-800 block mb-2 uppercase tracking-wide">You need to buy:</span>
                        <div className="flex flex-wrap gap-2">
                            {recipe.missingIngredients.map((ing, idx) => (
                                <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-amber-200 text-amber-800 font-medium shadow-sm">
                  + {ing}
                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Add to Meals */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleQuickAdd('breakfast')}
                        disabled={isAdding}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        <Plus size={16} />
                        {isAdding ? 'Adding...' : 'Add to Breakfast'}
                    </button>
                    <button
                        onClick={() => handleQuickAdd('lunch')}
                        disabled={isAdding}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        <Plus size={16} />
                        {isAdding ? 'Adding...' : 'Add to Lunch'}
                    </button>
                    <button
                        onClick={() => handleQuickAdd('dinner')}
                        disabled={isAdding}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        <Plus size={16} />
                        {isAdding ? 'Adding...' : 'Add to Dinner'}
                    </button>
                </div>

                <hr className="border-slate-100" />

                {/* 4. Step-by-Step Instructions */}
                <div className="flex-1">
                    <h4 className="text-xs uppercase text-slate-400 font-bold mb-4 tracking-wider flex items-center gap-2">
                        Preparation Steps
                    </h4>
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                        <ol className="space-y-4">
                            {recipe.instructions.map((step, idx) => (
                                <li key={idx} className="text-sm text-slate-700 flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                                    <span className="leading-relaxed">{step}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Instructions not available.</p>
                    )}
                </div>

            </div>
        </div>
    );
}