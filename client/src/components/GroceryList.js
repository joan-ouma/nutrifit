import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Check, DollarSign } from 'lucide-react';
import { generateGroceryList, getGroceryLists } from '../api';

export default function GroceryList({ recipeIds, mealPlanId }) {
    const [currentList, setCurrentList] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const loadLists = useCallback(async () => {
        try {
            const response = await getGroceryLists();
            if (response.success) {
                if (response.data?.length > 0) {
                    setCurrentList(response.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load grocery lists:', error);
        }
    }, []);

    useEffect(() => {
        loadLists();
    }, [loadLists]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await generateGroceryList({
                recipeIds,
                mealPlanId,
                name: `Grocery List - ${new Date().toLocaleDateString()}`
            });
            if (response.success) {
                setCurrentList(response.data);
                loadLists();
            }
        } catch (error) {
            alert('Failed to generate grocery list');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleItem = (itemId) => {
        if (!currentList) return;
        const updatedItems = currentList.items.map(item =>
            item._id === itemId ? { ...item, checked: !item.checked } : item
        );
        setCurrentList({ ...currentList, items: updatedItems });
    };

    const categoryColors = {
        produce: 'bg-green-100 text-green-800',
        meat: 'bg-red-100 text-red-800',
        dairy: 'bg-blue-100 text-blue-800',
        pantry: 'bg-yellow-100 text-yellow-800',
        frozen: 'bg-cyan-100 text-cyan-800',
        beverages: 'bg-purple-100 text-purple-800',
        other: 'bg-gray-100 text-gray-800'
    };

    const groupedItems = currentList?.items.reduce((acc, item) => {
        const cat = item.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {}) || {};

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ShoppingCart size={24} className="text-emerald-600" />
                    <h3 className="text-xl font-bold text-slate-900">Grocery List</h3>
                </div>
                {(!currentList || (recipeIds?.length > 0 || mealPlanId)) && (
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                    >
                        <Plus size={18} />
                        {isGenerating ? 'Generating...' : 'Generate List'}
                    </button>
                )}
            </div>

            {!currentList ? (
                <div className="text-center py-12 text-slate-400">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No grocery list yet</p>
                    <p className="text-sm mt-1">Generate a list from recipes or meal plans</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-600">Total Items</div>
                                <div className="text-2xl font-bold text-slate-900">
                                    {currentList.items.length}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-600">Estimated Cost</div>
                                <div className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
                                    <DollarSign size={20} />
                                    {currentList.totalEstimatedCost.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grouped Items */}
                    {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                                {category}
                            </h4>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div
                                        key={item._id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                            item.checked
                                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                                : 'bg-white border-slate-200 hover:border-emerald-300'
                                        }`}
                                        onClick={() => toggleItem(item._id)}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                            item.checked
                                                ? 'bg-emerald-600 border-emerald-600'
                                                : 'border-slate-300'
                                        }`}>
                                            {item.checked && <Check size={14} className="text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900">{item.name}</div>
                                            <div className="text-sm text-slate-500">
                                                {item.quantity} {item.unit}
                                                {item.estimatedCost > 0 && (
                                                    <span className="ml-2">• ${item.estimatedCost.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${categoryColors[category] || categoryColors.other}`}>
                                            {category}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

