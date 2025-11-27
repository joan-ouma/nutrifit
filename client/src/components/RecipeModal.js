import React from 'react';
import { X, Clock, DollarSign, Flame, Save, Share2, Heart } from 'lucide-react';
import NutritionBar from './NutritionBar';

const RecipeModal = ({ recipe, onClose, onSave, onShare, isSaved = false }) => {
    if (!recipe) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-slideUp">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-3xl sticky top-0 z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">{recipe.name}</h2>
                            <div className="flex gap-4 text-sm font-medium text-emerald-50">
                                <span className="flex items-center gap-1">
                                    <Clock size={16} /> {recipe.time}
                                </span>
                                <span className="flex items-center gap-1">
                                    <DollarSign size={16} /> {recipe.costPerServing}/serving
                                </span>
                                <span className="flex items-center gap-1">
                                    <Flame size={16} /> {recipe.nutrition?.calories} kcal
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {onSave && (
                            <button
                                onClick={() => onSave(recipe)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                    isSaved
                                        ? 'bg-white text-emerald-600'
                                        : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                            >
                                {isSaved ? <Heart className="fill-current" size={18} /> : <Save size={18} />}
                                {isSaved ? 'Saved' : 'Save Recipe'}
                            </button>
                        )}
                        {onShare && (
                            <button
                                onClick={() => onShare(recipe)}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                            >
                                <Share2 size={18} /> Share
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Why It Works */}
                    {recipe.whyItWorks && (
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <span className="text-2xl">✨</span> Why This Works For You
                            </h3>
                            <p className="text-slate-700 leading-relaxed italic">"{recipe.whyItWorks}"</p>
                        </div>
                    )}

                    {/* Ingredients */}
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Ingredients</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {recipe.ingredients.map((ingredient, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                                    >
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        <span className="text-slate-700">{ingredient}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Missing Ingredients */}
                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">⚠️</span> Missing Ingredients
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {recipe.missingIngredients.map((ing, idx) => (
                                    <span
                                        key={idx}
                                        className="bg-white px-3 py-1 rounded-lg border border-amber-300 text-amber-800 font-medium text-sm"
                                    >
                                        + {ing}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nutrition */}
                    {recipe.nutrition && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Nutrition Profile</h3>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <NutritionBar label="Protein" value={recipe.nutrition.protein} max={50} color="bg-blue-500" />
                                    <NutritionBar label="Carbs" value={recipe.nutrition.carbs} max={60} color="bg-emerald-500" />
                                    <NutritionBar label="Fats" value={recipe.nutrition.fats} max={30} color="bg-yellow-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    {recipe.instructions && recipe.instructions.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Instructions</h3>
                            <ol className="space-y-4">
                                {recipe.instructions.map((step, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="text-slate-700 leading-relaxed">{step}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeModal;


