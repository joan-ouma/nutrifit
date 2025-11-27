import React from 'react';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

export default function NutritionChart({ dailyLog, calorieGoal = 2000 }) {
    const calories = dailyLog?.totalNutrition?.calories || 0;
    const protein = dailyLog?.totalNutrition?.protein || 0;
    const carbs = dailyLog?.totalNutrition?.carbs || 0;
    const fats = dailyLog?.totalNutrition?.fats || 0;
    
    const remainingCalories = Math.max(0, calorieGoal - calories);
    const caloriePercentage = Math.min(100, (calories / calorieGoal) * 100);
    
    // Calculate macro percentages
    const totalMacroCalories = protein * 4 + carbs * 4 + fats * 9;
    const proteinPercent = totalMacroCalories > 0 ? (protein * 4 / totalMacroCalories) * 100 : 0;
    const carbsPercent = totalMacroCalories > 0 ? (carbs * 4 / totalMacroCalories) * 100 : 0;
    const fatsPercent = totalMacroCalories > 0 ? (fats * 9 / totalMacroCalories) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Today's Nutrition</h3>
                <div className="flex items-center gap-2 text-sm">
                    <Target size={16} className="text-emerald-600" />
                    <span className="text-slate-600">Goal: {calorieGoal} kcal</span>
                </div>
            </div>

            {/* Calorie Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Calories</span>
                    <span className="text-sm font-bold text-slate-900">
                        {calories} / {calorieGoal} kcal
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            caloriePercentage >= 100
                                ? 'bg-red-500'
                                : caloriePercentage >= 90
                                ? 'bg-yellow-500'
                                : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, caloriePercentage)}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                        {remainingCalories > 0 ? `${remainingCalories} remaining` : 'Goal exceeded'}
                    </span>
                    {caloriePercentage >= 100 ? (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                            <TrendingUp size={12} /> Over goal
                        </span>
                    ) : (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <TrendingDown size={12} /> On track
                        </span>
                    )}
                </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{Math.round(protein)}g</div>
                    <div className="text-xs text-slate-500 mb-2">Protein</div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, proteinPercent)}%` }}
                        />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{Math.round(proteinPercent)}%</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{Math.round(carbs)}g</div>
                    <div className="text-xs text-slate-500 mb-2">Carbs</div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, carbsPercent)}%` }}
                        />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{Math.round(carbsPercent)}%</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{Math.round(fats)}g</div>
                    <div className="text-xs text-slate-500 mb-2">Fats</div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, fatsPercent)}%` }}
                        />
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{Math.round(fatsPercent)}%</div>
                </div>
            </div>
        </div>
    );
}

