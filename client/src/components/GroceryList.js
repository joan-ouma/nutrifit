import React, { useState, useEffect, useCallback } from 'react';
import { 
    ShoppingCart, Plus, Minus, Check, Loader2, Sparkles, 
    ShoppingBag, CheckCircle, Trash2, ArrowRight, ArrowDown 
} from 'lucide-react';
import axios from 'axios'; // ✅ Fixed Import
import { generateGroceryList, getGroceryLists, API_URL } from '../api'; // ✅ Fixed Import

export default function GroceryList({ recipeIds, mealPlanId, user, handleUpdateProfile }) {
    
    const [currentList, setCurrentList] = useState({ items: [] });
    const [newItem, setNewItem] = useState(''); 
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- 1. DATA LOADING ---
    const loadLists = useCallback(async () => {
        try {
            const response = await getGroceryLists();
            if (response.success && response.data?.length > 0) {
                setCurrentList(response.data[0]);
            } else {
                setCurrentList({ items: [] });
            }
        } catch (error) {
            console.error('Failed to load grocery lists:', error);
            setCurrentList({ items: [] });
        }
    }, []);

    useEffect(() => {
        loadLists();
    }, [loadLists]);

    // --- 2. SMART ACTIONS ---
    const handleManualAdd = () => {
        if (!newItem.trim()) return;
        const itemName = newItem.trim();
        
        const existingIndex = currentList.items.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase() && !i.checked);

        let updatedItems;
        if (existingIndex >= 0) {
            updatedItems = [...currentList.items];
            updatedItems[existingIndex].quantity += 1;
        } else {
            const newItemObj = {
                _id: Date.now().toString(),
                name: itemName,
                quantity: 1,
                unit: 'item',
                category: 'other',
                checked: false
            };
            updatedItems = [newItemObj, ...currentList.items];
        }
        setCurrentList({ ...currentList, items: updatedItems });
        setNewItem('');
    };

    const updateQuantity = (itemId, change) => {
        const updatedItems = currentList.items.map(item => {
            if (item._id === itemId) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        setCurrentList({ ...currentList, items: updatedItems });
    };

    const toggleItem = (itemId) => {
        const updatedItems = currentList.items.map(item =>
            item._id === itemId ? { ...item, checked: !item.checked } : item
        );
        setCurrentList({ ...currentList, items: updatedItems });
    };

    const deleteItem = (itemId) => {
        const updatedItems = currentList.items.filter(item => item._id !== itemId);
        setCurrentList({ ...currentList, items: updatedItems });
    };

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
            alert('Save recipes to a Meal Plan first.');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- 3. CHECKOUT LOGIC (Robust) ---
    const handleCheckout = async () => {
        const boughtItems = currentList.items.filter(i => i.checked);
        if (boughtItems.length === 0) return;

        if (window.confirm(`Checkout ${boughtItems.length} items to Pantry?`)) {
            setIsSaving(true);
            try {
                const token = localStorage.getItem('token');
                
                // 1. Fetch FRESH user profile
                const userRes = await axios.get(`${API_URL}/user/profile`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                const currentPantry = userRes.data.data.pantry || [];
                
                // 2. Add new items (Merge & Deduplicate)
                const newItems = boughtItems.map(i => i.name);
                const updatedPantry = [...new Set([...currentPantry, ...newItems])];

                // 3. Send ONLY the pantry update
                await axios.post(`${API_URL}/user/profile`, 
                    { pantry: updatedPantry }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // 4. Update Frontend State
                if (handleUpdateProfile) {
                    handleUpdateProfile({ ...user, pantry: updatedPantry }, false); 
                }

                // 5. Clean up Grocery List
                const remainingItems = currentList.items.filter(i => !i.checked);
                setCurrentList({ ...currentList, items: remainingItems });

                alert(`Success! Added ${boughtItems.length} items to Pantry.`);

            } catch (err) {
                console.error("Checkout Error:", err);
                alert("Failed to update pantry. Check connection.");
            } finally {
                setIsSaving(false);
            }
        }
    };

    // --- 4. RENDER HELPERS ---
    const itemsToBuy = currentList?.items?.filter(i => !i.checked) || [];
    const itemsInCart = currentList?.items?.filter(i => i.checked) || [];

    const categoryColors = {
        produce: 'bg-green-100 text-green-700',
        meat: 'bg-red-100 text-red-700',
        dairy: 'bg-blue-100 text-blue-700',
        pantry: 'bg-amber-100 text-amber-700',
        frozen: 'bg-cyan-100 text-cyan-700',
        other: 'bg-slate-100 text-slate-600'
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            
            {/* HERO HEADER */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl mb-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <ShoppingBag className="text-emerald-400" /> Smart Shopper
                        </h2>
                        <p className="text-slate-300 mt-2">
                            {itemsToBuy.length} items remaining • {itemsInCart.length} in cart
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        {(!currentList.items.length || recipeIds?.length > 0) && (
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                Auto-Plan
                            </button>
                        )}
                        {itemsInCart.length > 0 && (
                            <button
                                onClick={handleCheckout}
                                disabled={isSaving}
                                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                Checkout
                            </button>
                        )}
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            </div>

            {/* INPUT BAR */}
            <div className="bg-white p-2 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 mb-8 flex gap-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all transform hover:-translate-y-1">
                <input 
                    className="flex-1 p-4 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400 text-lg"
                    placeholder="Add item (e.g., Milk)..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                />
                <button 
                    onClick={handleManualAdd}
                    disabled={!newItem.trim()}
                    className="bg-slate-900 text-white p-4 rounded-xl hover:bg-slate-800 transition-colors shadow-md"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* TO BUY LIST */}
            <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold text-slate-700 px-2 flex items-center gap-2">
                    <ShoppingCart size={20} /> To Buy <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{itemsToBuy.length}</span>
                </h3>
                
                {itemsToBuy.length === 0 && itemsInCart.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400">Your list is empty. Add items or generate a plan!</p>
                    </div>
                ) : itemsToBuy.length === 0 ? (
                    <div className="text-center py-8 bg-emerald-50 rounded-3xl border border-emerald-100 text-emerald-700 font-medium">
                        All items found! Ready to checkout?
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {itemsToBuy.map(item => (
                            <div key={item._id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-emerald-400 transition-all">
                                <div className={`w-1.5 h-12 rounded-full ${categoryColors[item.category] || 'bg-slate-200'}`}></div>
                                
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800 text-lg">{item.name}</div>
                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{item.category}</div>
                                </div>

                                <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
                                    <button onClick={() => updateQuantity(item._id, -1)} className="p-2 hover:bg-white rounded-lg text-slate-500 transition-all"><Minus size={14}/></button>
                                    <span className="w-8 text-center font-bold text-slate-700">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item._id, 1)} className="p-2 hover:bg-white rounded-lg text-slate-500 transition-all"><Plus size={14}/></button>
                                </div>

                                <button 
                                    onClick={() => toggleItem(item._id)}
                                    className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all shadow-sm"
                                    title="Mark as Found"
                                >
                                    <Check size={24} />
                                </button>
                                <button 
                                    onClick={() => deleteItem(item._id)}
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* IN CART LIST */}
            {itemsInCart.length > 0 && (
                <div className="space-y-4 animate-slideUp">
                    <h3 className="text-lg font-bold text-emerald-700 px-2 flex items-center gap-2">
                        <CheckCircle size={20} /> In Cart <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">{itemsInCart.length}</span>
                    </h3>
                    
                    <div className="bg-slate-50 rounded-3xl p-2 border border-slate-200">
                        {itemsInCart.map(item => (
                            <div key={item._id} className="flex items-center gap-4 p-3 rounded-2xl opacity-60 hover:opacity-100 transition-opacity group">
                                <button 
                                    onClick={() => toggleItem(item._id)}
                                    className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-red-500 transition-colors"
                                    title="Move back to list"
                                >
                                    <ArrowDown size={16} className="rotate-180" />
                                </button>
                                <div className="flex-1 font-medium text-slate-600 line-through decoration-slate-400">
                                    {item.name}
                                </div>
                                <div className="bg-white px-3 py-1 rounded-lg text-sm font-bold text-slate-500 border border-slate-200">
                                    Qty: {item.quantity}
                                </div>
                                <button 
                                    onClick={() => deleteItem(item._id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}