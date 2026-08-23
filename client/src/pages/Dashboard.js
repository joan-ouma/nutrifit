import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard, ChefHat, ShoppingBag, User, LogOut, Search, Bell,
    Menu, X, Loader2, Flame, Camera, Save, Plus, Trash2, Sparkles,
    Activity, ListChecks, Trophy, Check, ArrowRight, CheckCircle, Droplet, Leaf,
    Coffee, Apple, Salad, CupSoda, Milk, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, logMeal } from '../api';

import RecipeCard from '../components/RecipeCard';
import NutritionDashboard from './NutritionDashboard';
import GroceryList from '../components/GroceryList';
import Leaderboard from '../components/Leaderboard';
import Footer from '../components/Footer';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`
            fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transform transition-all duration-500 animate-slideUp
            ${type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-slate-900 text-white border border-slate-700'}
        `}>
            {type === 'error' ? <X size={20} /> : <CheckCircle size={20} className="text-emerald-400" />}
            <div>
                <p className="font-bold text-sm">{type === 'error' ? 'Error' : 'Success'}</p>
                <p className="text-xs opacity-90">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={14} /></button>
        </div>
    );
};

const OverviewTab = ({ user, setActiveTab, showToast, refreshUserData }) => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const nextMeal = hour < 11 ? 'Breakfast' : hour < 15 ? 'Lunch' : hour < 20 ? 'Dinner' : 'Snack';
    const streakDays = user.streak || 0;

    const [todayStats, setTodayStats] = useState({ calories: 0, goal: user.calorieGoal || 2000 });
    const [waterStats, setWaterStats] = useState({ current: 0, goal: user.waterGoal || 2500 });
    const [addingItem, setAddingItem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const today = new Date().toISOString().split('T')[0];

                const resMeals = await axios.get(`${API_URL}/meals/date/${today}`, { headers: { Authorization: `Bearer ${token}` } });
                const meals = resMeals.data.meals || [];
                const totalCals = meals.reduce((sum, m) => sum + (m.nutrition?.calories || 0), 0);

                const resWater = await axios.get(`${API_URL}/water?startDate=${today}&endDate=${today}`, { headers: { Authorization: `Bearer ${token}` } });
                const totalWater = resWater.data.summary?.totalWater || 0;

                setTodayStats({ calories: totalCals, goal: user.calorieGoal || 2000 });
                setWaterStats({ current: totalWater, goal: user.waterGoal || 2500 });

                if (refreshUserData) {
                    await refreshUserData();
                }
            } catch (err) { console.error("Stats error", err); }
        };
        fetchData();
    }, [user, refreshUserData]);

    const handleQuickAdd = async (item) => {
        setAddingItem(item.name);
        try {
            const token = localStorage.getItem('token');
            const today = new Date().toISOString().split('T')[0];

            if (item.name.toLowerCase().includes('water') || item.name.toLowerCase().includes('coffee')) {
                await axios.post(`${API_URL}/water/log`, { amount: 250, date: today }, { headers: { Authorization: `Bearer ${token}` } });
                setWaterStats(prev => ({ ...prev, current: prev.current + 250 }));
                if (showToast) showToast("Hydration tracked! +250ml", "success");
            } else {
                await logMeal({
                    name: item.name, type: 'snack', date: today,
                    nutrition: { calories: item.cal, protein: 0, carbs: 0, fats: 0 },
                    servingSize: '1 portion', notes: 'Quick add from Dashboard'
                });
                setTodayStats(prev => ({ ...prev, calories: prev.calories + item.cal }));
                if (refreshUserData) await refreshUserData();
                if (showToast) showToast(`${item.name} logged!`, "success");
            }
        } catch (error) {
            if (showToast) showToast("Failed to log item.", "error");
        } finally { setAddingItem(null); }
    };

    const fuelPercent = Math.min((todayStats.calories / todayStats.goal) * 100, 100);
    const waterPercent = Math.min((waterStats.current / waterStats.goal) * 100, 100);

    return (
        <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto w-full">
            {/* HERO HEADER */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 shadow-xl mb-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <LayoutDashboard className="text-emerald-200" /> Dashboard Overview
                        </h2>
                        <p className="text-emerald-100">Track your daily progress and hit your goals.</p>
                    </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex-1 min-w-[150px]">
                        <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Daily Fuel</div>
                        <div className="text-xl font-bold text-slate-900 mb-2">{Math.round(todayStats.calories)} / {todayStats.goal} <span className="text-sm font-normal text-slate-500">kcal</span></div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-[#16a34a] transition-all" style={{ width: `${fuelPercent}%` }}></div></div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex-1 min-w-[150px]">
                        <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Day Streak</div>
                        <div className="text-xl font-bold text-slate-900">{streakDays} <span className="text-sm font-normal text-slate-500">days</span></div>
                    </div>
                </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* DASHBOARD WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div onClick={() => setActiveTab('ai-chef')} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-[#16a34a] transition-colors cursor-pointer flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-50 p-3 rounded-lg text-slate-700 border border-slate-200"><ChefHat size={20} /></div>
                            <ArrowRight size={18} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Meal Planner</h3>
                        <p className="text-slate-500 text-sm">Find recipes based on your pantry and goals.</p>
                    </div>
                </div>
                <div onClick={() => setActiveTab('nutrition')} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-50 p-3 rounded-lg text-slate-700 border border-slate-200"><Droplet size={20} /></div>
                            <ArrowRight size={18} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Hydration</h3>
                        <div className="flex justify-between text-sm text-slate-500 font-medium mb-2"><span>{waterStats.current}ml</span><span>{waterStats.goal}ml</span></div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${waterPercent}%` }}></div></div>
                    </div>
                </div>
            </div>

            {/* QUICK ADD */}
            <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 px-1">Quick Log</h3>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-1">
                    {[{ name: 'Water (250ml)', icon: <Droplet size={24} className="text-blue-500" />, cal: 0 }, { name: 'Coffee', icon: <Coffee size={24} className="text-amber-700" />, cal: 5 }, { name: 'Fruit', icon: <Apple size={24} className="text-red-500" />, cal: 105 }, { name: 'Salad', icon: <Salad size={24} className="text-green-500" />, cal: 95 }, { name: 'Protein Shake', icon: <CupSoda size={24} className="text-indigo-500" />, cal: 180 }, { name: 'Yogurt', icon: <Milk size={24} className="text-slate-600" />, cal: 120 }].map((item, idx) => (
                        <button key={idx} onClick={() => handleQuickAdd(item)} disabled={addingItem !== null} className="flex-shrink-0 bg-white border border-slate-200 p-3 rounded-lg min-w-[140px] hover:border-slate-300 transition-all text-left shadow-sm relative">
                            {addingItem === item.name ? <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-20"><Loader2 className="animate-spin text-slate-600" size={20} /></div> : null}
                            <span className="text-xl mb-2 block">{item.icon}</span><div className="font-semibold text-slate-900 text-sm">{item.name}</div><div className="text-xs text-slate-500">{item.cal} kcal</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AIChefTab = ({ pantryInput, setPantryInput, handleGenerateRecipes, isGenerating, aiRecipes, setAiRecipes, user }) => {
    const [preferences, setPreferences] = useState({ cuisine: 'any', mealType: 'any', dietaryRestrictions: user?.dietaryRestrictions || [], maxCalories: '' });
    const cuisines = ['any', 'Kenyan', 'Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American'];
    const mealTypes = ['any', 'breakfast', 'lunch', 'dinner', 'snack'];
    const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein', 'nut-free'];

    const handlePreferenceChange = (key, value) => {
        if (key === 'dietaryRestrictions') {
            const current = preferences.dietaryRestrictions || [];
            setPreferences({ ...preferences, dietaryRestrictions: current.includes(value) ? current.filter(r => r !== value) : [...current, value] });
        } else { setPreferences({ ...preferences, [key]: value }); }
    };

    return (
        <div className="max-w-5xl mx-auto flex flex-col animate-fadeIn relative min-h-full">
            
            {/* HERO HEADER */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 shadow-xl mb-8 text-white relative overflow-hidden mx-6 mt-6">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <ChefHat className="text-emerald-200" /> AI Recipe Assistant
                    </h2>
                    <p className="text-emerald-100">Find and generate personalized recipes based on what's in your kitchen.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <div className={`px-6 z-20 transition-all duration-500 ${aiRecipes.length > 0 ? 'sticky top-0 bg-slate-50/95 backdrop-blur-md pt-4 pb-4 border-b border-slate-200' : 'pb-6'}`}>
                <div className="max-w-3xl mx-auto space-y-5">
                    <div className="relative flex items-center">
                        <div className="absolute left-4 text-slate-400"><Search size={18} /></div>
                        <input type="text" className="w-full py-3.5 pl-11 pr-28 bg-white rounded-lg border border-slate-200 shadow-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400 transition-all" placeholder="e.g. chicken, rice" value={pantryInput} onChange={(e) => setPantryInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateRecipes(preferences)} />
                        <button onClick={() => handleGenerateRecipes(preferences)} disabled={isGenerating || !pantryInput.trim()} className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#16a34a] text-white px-6 rounded-md font-medium text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-all">{isGenerating ? <Loader2 className="animate-spin" size={16} /> : "Search"}</button>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <div className="relative group">
                                <select value={preferences.cuisine} onChange={(e) => handlePreferenceChange('cuisine', e.target.value)} className="appearance-none bg-white pl-3 pr-8 py-2 rounded-md border border-slate-200 text-sm font-medium text-slate-600 outline-none hover:border-slate-300 shadow-sm cursor-pointer transition-colors">
                                    {cuisines.map(c => <option key={c} value={c}>{c === 'any' ? 'Any Cuisine' : c}</option>)}
                                </select>
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ArrowRight size={10} className="rotate-90" /></div>
                            </div>
                            <div className="relative group">
                                <select value={preferences.mealType} onChange={(e) => handlePreferenceChange('mealType', e.target.value)} className="appearance-none bg-white pl-3 pr-8 py-2 rounded-md border border-slate-200 text-sm font-medium text-slate-600 outline-none hover:border-slate-300 shadow-sm cursor-pointer transition-colors capitalize">
                                    {mealTypes.map(t => <option key={t} value={t}>{t === 'any' ? 'Any Meal' : t}</option>)}
                                </select>
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ArrowRight size={10} className="rotate-90" /></div>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0 mr-2">Diet:</span>
                            {dietaryOptions.map(option => (
                                <button key={option} onClick={() => handlePreferenceChange('dietaryRestrictions', option)} className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm ${preferences.dietaryRestrictions.includes(option) ? 'bg-white border-[#16a34a] text-[#16a34a]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}>
                                    {option.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 px-6 pb-8 overflow-y-auto custom-scrollbar">
                {isGenerating && <div className="flex flex-col items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-[#16a34a] mb-4" /><h3 className="font-semibold text-slate-800">Searching recipes...</h3></div>}
                
                {!isGenerating && aiRecipes.length === 0 && user?.searchHistory?.length > 0 && (
                    <div className="max-w-3xl mx-auto mt-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Recent Searches</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.searchHistory.slice().reverse().slice(0, 8).map((history, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => {
                                        const mainQuery = history.query.split(' (')[0];
                                        setPantryInput(mainQuery);
                                    }}
                                    className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-md text-xs font-medium hover:border-slate-300 shadow-sm transition-all flex items-center gap-1.5"
                                >
                                    <Clock size={12} className="text-slate-400" />
                                    {history.query}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!isGenerating && aiRecipes.length > 0 && <div>
                    <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-2">
                        <h3 className="font-bold text-slate-900 text-lg">Results</h3>
                        <button onClick={() => setAiRecipes([])} className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">Clear Search</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {aiRecipes.map((recipe, idx) => <RecipeCard key={idx} recipe={recipe} />)}
                    </div>
                </div>}
            </div>
        </div>
    );
};

const PantryTab = ({ pantry, setPantry, handleUpdateProfile, user, setActiveTab, setPantryInput }) => {
    const [newItem, setNewItem] = useState('');
    const [newQuantity, setNewQuantity] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const refreshPantry = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
                if (isMounted) setPantry(res.data.data.pantry || []);
            } catch (err) { console.error("Failed to refresh pantry:", err); }
            finally { if (isMounted) setIsLoading(false); }
        };
        refreshPantry();
        return () => { isMounted = false; };
    }, []);

    const addItem = () => {
        if (!newItem.trim()) return;
        
        const itemName = newItem.trim();
        let updatedPantry = [...(pantry || [])];
        
        // Find if item already exists (either as string or object)
        const existingIndex = updatedPantry.findIndex(i => 
            (typeof i === 'string' ? i.toLowerCase() : i.name.toLowerCase()) === itemName.toLowerCase()
        );

        if (existingIndex >= 0) {
            // Update quantity of existing item
            const existing = updatedPantry[existingIndex];
            const currentQty = typeof existing === 'string' ? 1 : (existing.quantity || 1);
            updatedPantry[existingIndex] = { name: itemName, quantity: currentQty + Number(newQuantity) };
        } else {
            // Add new item
            updatedPantry = [{ name: itemName, quantity: Number(newQuantity) }, ...updatedPantry];
        }

        setPantry(updatedPantry);
        handleUpdateProfile({ ...user, pantry: updatedPantry }, false);
        setNewItem('');
        setNewQuantity(1);
    };

    const toggleSelection = (item) => {
        if (selectedItems.includes(item)) setSelectedItems(selectedItems.filter(i => i !== item));
        else setSelectedItems([...selectedItems, item]);
    };

    const deleteSelected = () => {
        if (window.confirm(`Remove ${selectedItems.length} items from pantry?`)) {
            const updatedPantry = pantry.filter(item => !selectedItems.includes(item));
            setPantry(updatedPantry);
            handleUpdateProfile({ ...user, pantry: updatedPantry }, false);
            setSelectedItems([]);
        }
    };

    const cookSelected = () => {
        const ingredients = selectedItems.map(i => typeof i === 'string' ? i : i.name).join(', ');
        setPantryInput(ingredients);
        setActiveTab('ai-chef');
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            
            {/* HERO HEADER */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 shadow-xl mb-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <ShoppingBag className="text-emerald-200" /> Digital Pantry
                        </h2>
                        <p className="text-emerald-100">Manage your inventory and track what you have.</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 border border-white/20">
                        {isLoading ? <><Loader2 size={16} className="animate-spin" /><span>Syncing...</span></> : <><CheckCircle size={16} /><span>{pantry?.length || 0} Items</span></>}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <input className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all text-sm font-medium text-slate-700" placeholder="Add item (e.g. Maize Flour)..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Plus size={18} /></div>
                    </div>
                    <div className="w-24">
                        <input type="number" min="1" className="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm font-medium text-slate-700 text-center" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
                    </div>
                    <button onClick={addItem} disabled={!newItem.trim()} className="bg-amber-500 text-white px-6 rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50">Add</button>
                </div>
            </div>
            {selectedItems.length > 0 && (
                <div className="sticky top-4 z-20 mb-6">
                    <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-md flex justify-between items-center mx-auto max-w-lg">
                        <span className="font-semibold text-slate-900 ml-2">{selectedItems.length} Selected</span>
                        <div className="flex gap-2">
                            <button onClick={deleteSelected} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-all flex items-center gap-2 border border-slate-200"><Trash2 size={16} /> Remove</button>
                            <button onClick={cookSelected} className="px-4 py-2 bg-[#16a34a] text-white hover:bg-green-700 rounded-md text-sm font-semibold transition-all flex items-center gap-2"><Search size={16} /> Find Recipes</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {isLoading && (!pantry || pantry.length === 0) ? <div className="text-center py-20 text-slate-400 text-sm">Loading inventory...</div> : (!pantry || pantry.length === 0) ? <div className="text-center py-20 text-slate-400 text-sm">Your pantry is empty. Add items or shop from Grocery list.</div> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {pantry.map((item, idx) => {
                            const isSelected = selectedItems.includes(item);
                            const itemName = typeof item === 'string' ? item : item.name;
                            const itemQty = typeof item === 'string' ? 1 : (item.quantity || 1);
                            return (
                                <div key={idx} onClick={() => toggleSelection(item)} className={`cursor-pointer p-4 rounded-lg border transition-all flex items-center justify-between group ${isSelected ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className={`font-semibold text-sm capitalize truncate pr-2 ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>{itemName}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Qty: {itemQty}</span>
                                    </div>
                                    {isSelected && <CheckCircle size={18} className="text-amber-500 flex-shrink-0" />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileTab = ({ user, handleUpdateProfile, handleImageUpload }) => {
    const [editForm, setEditForm] = useState({ ...user });
    const fileInputRef = useRef(null);
    useEffect(() => { setEditForm({ ...user }); }, [user]);

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2><button onClick={() => handleUpdateProfile(editForm)} className="flex items-center gap-2 bg-[#16a34a] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 transition-all"><Save size={16} /> Save Changes</button></div>
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-100">
                <div className="relative mb-4">
                    <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-4 border-white shadow-xl overflow-hidden">{editForm.profileImage ? <img src={editForm.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User size={48} />}</div>
                    <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 shadow-lg border-4 border-white transition-transform hover:scale-110"><Camera size={16} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <h3 className="font-bold text-xl text-slate-900">{editForm.username}</h3>
                <p className="text-slate-500">{editForm.email}</p>
            </div>
            <div className="space-y-6">
                <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Bio</label><textarea className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-1 focus:ring-[#16a34a] focus:border-[#16a34a]" rows="3" value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}></textarea></div>
                <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Goal</label><select value={editForm.goals || 'balanced'} onChange={e => setEditForm({ ...editForm, goals: e.target.value })} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-1 focus:ring-[#16a34a] focus:border-[#16a34a]"><option value="balanced">Balanced Diet</option><option value="weight-loss">Weight Loss</option><option value="muscle">Muscle Gain</option></select></div>
                    <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Calorie Goal</label><input type="number" value={editForm.calorieGoal || 2000} onChange={e => setEditForm({ ...editForm, calorieGoal: parseInt(e.target.value) || 2000 })} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-1 focus:ring-[#16a34a] focus:border-[#16a34a]" /></div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    const [user, setUser] = useState({ username: 'User', email: '', profileImage: null, pantry: [] });
    const [pantryInput, setPantryInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiRecipes, setAiRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);

    const mainRef = useRef(null);
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
            else setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const refreshUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success && res.data.data) {
                setUser(res.data.data);
                localStorage.setItem('nutrifit_user', JSON.stringify(res.data.data));
            }
        } catch (error) {
            console.error("Failed to refresh user data:", error);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            const storedUser = localStorage.getItem('nutrifit_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            }
            await refreshUserData();
        };
        loadUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nutrifit_user');
        navigate('/');
    };

    const handleUpdateProfile = async (updatedData, showSuccess = true) => {
        try {
            setUser(updatedData);
            localStorage.setItem('nutrifit_user', JSON.stringify(updatedData));
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/user/profile`, updatedData, {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            if (res.data.success && showSuccess) showToast("Saved!", "success");
        } catch (err) {
            console.error("Profile update error:", err);
            showToast(err.response?.data?.message || "Failed to save changes", "error");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newUserData = { ...user, profileImage: reader.result };
                handleUpdateProfile(newUserData);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateRecipes = async (preferences = {}) => {
        if (!pantryInput.trim()) return;
        setIsGenerating(true);
        setAiRecipes([]);
        try {
            const token = localStorage.getItem('token');
            if (!token) { showToast('Please log in', 'error'); setIsGenerating(false); return; }

            const res = await axios.post(`${API_URL}/recommend`, {
                pantry: pantryInput,
                userGoal: user.goals || 'balanced',
                budget: user.budgetLevel || 'medium',
                cuisine: preferences.cuisine || 'any',
                mealType: preferences.mealType || 'any',
                dietaryRestrictions: preferences.dietaryRestrictions || [],
                maxCalories: preferences.maxCalories || null
            }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });

            if (res.data.success) setAiRecipes(res.data.data);
        } catch (err) { showToast(`Failed to generate recipes: ${err.message}`, "error"); }
        finally { setIsGenerating(false); }
    };

    const handleNavClick = (tabId) => {
        setActiveTab(tabId);
        if (window.innerWidth < 768) setSidebarOpen(false);
        if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab user={user} setActiveTab={setActiveTab} showToast={showToast} refreshUserData={refreshUserData} />;
            case 'nutrition': return <NutritionDashboard />;
            case 'leaderboard': return <Leaderboard currentUser={user} />;
            case 'grocery': return <GroceryList user={user} handleUpdateProfile={handleUpdateProfile} />;
            case 'ai-chef': return <AIChefTab pantryInput={pantryInput} setPantryInput={setPantryInput} handleGenerateRecipes={handleGenerateRecipes} isGenerating={isGenerating} aiRecipes={aiRecipes} setAiRecipes={setAiRecipes} user={user} />;
            case 'pantry': return <PantryTab pantry={user.pantry} setPantry={(p) => setUser({ ...user, pantry: p })} handleUpdateProfile={handleUpdateProfile} user={user} setActiveTab={setActiveTab} setPantryInput={setPantryInput} />;
            case 'profile': return <ProfileTab user={user} handleUpdateProfile={handleUpdateProfile} handleImageUpload={handleImageUpload} />;
            default: return <OverviewTab user={user} setActiveTab={setActiveTab} showToast={showToast} refreshUserData={refreshUserData} />;
        }
    };

    return (
        <div className="flex h-[100dvh] font-sans text-slate-900 overflow-hidden bg-transparent">
            {sidebarOpen && window.innerWidth < 768 && (
                <div className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)}></div>
            )}

            <aside className={`fixed md:relative top-0 bottom-0 left-0 z-40 bg-slate-50/50 border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col py-6 px-4 gap-6 ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-[88px]'}`}>
                {/* Floating Desktop Toggle */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)} 
                    className="hidden md:flex absolute -right-3.5 top-9 bg-white border border-slate-200 shadow-sm rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 z-50 transition-all hover:scale-110"
                >
                    {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Logo Section */}
                <div className={`flex items-center ${sidebarOpen ? 'justify-between px-2' : 'justify-center'}`}>
                    <div className={`bg-white shadow-sm border border-slate-100 flex items-center p-1.5 transition-all duration-300 overflow-hidden ${sidebarOpen ? 'w-full gap-3 px-3 rounded-[24px]' : 'w-[56px] h-[56px] justify-center rounded-full mx-auto'}`}>
                        <div className="bg-[#352846] p-2.5 rounded-full flex-shrink-0 flex items-center justify-center">
                            <Leaf className="text-white" size={20} />
                        </div>
                        <span className={`font-bold text-slate-800 transition-all duration-300 whitespace-nowrap ${!sidebarOpen ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                            NutriFit
                        </span>
                    </div>
                    {window.innerWidth < 768 && sidebarOpen && (
                        <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-700 ml-2 absolute right-6">
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Main Nav Items */}
                <nav className={`flex-1 bg-white shadow-sm border border-slate-100 py-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar transition-all duration-300 ${sidebarOpen ? 'rounded-[24px] px-4' : 'rounded-[40px] px-2 items-center w-[56px] mx-auto'}`}>
                    {[{ id: 'overview', icon: LayoutDashboard, label: 'Overview' }, { id: 'nutrition', icon: Activity, label: 'Nutrition' }, { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' }, { id: 'ai-chef', icon: ChefHat, label: 'AI Assistant' }, { id: 'grocery', icon: ListChecks, label: 'Grocery' }, { id: 'pantry', icon: ShoppingBag, label: 'My Pantry' }].map((item) => (
                        <button key={item.id} onClick={() => handleNavClick(item.id)} className={`flex items-center gap-3 p-3 rounded-full transition-all group whitespace-nowrap overflow-hidden ${sidebarOpen ? 'w-full px-4' : 'w-10 h-10 justify-center'} ${activeTab === item.id ? 'bg-[#352846] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
                            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className="flex-shrink-0" />
                            <span className={`font-medium transition-all duration-300 ${!sidebarOpen ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Bottom Nav Items */}
                <div className={`bg-white shadow-sm border border-slate-100 py-4 flex flex-col gap-3 transition-all duration-300 ${sidebarOpen ? 'rounded-[24px] px-4' : 'rounded-[40px] px-2 items-center w-[56px] mx-auto'}`}>
                    <button onClick={() => handleNavClick('profile')} className={`flex items-center gap-3 p-3 rounded-full transition-all group whitespace-nowrap overflow-hidden ${sidebarOpen ? 'w-full px-4' : 'w-10 h-10 justify-center'} ${activeTab === 'profile' ? 'bg-[#352846] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <User size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} className="flex-shrink-0" />
                        <span className={`font-medium transition-all duration-300 ${!sidebarOpen ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Settings</span>
                    </button>

                    <button onClick={handleLogout} className={`flex items-center gap-3 p-3 rounded-full transition-all group whitespace-nowrap overflow-hidden ${sidebarOpen ? 'w-full px-4' : 'w-10 h-10 justify-center'} text-slate-400 hover:bg-red-50 hover:text-red-500`}>
                        <LogOut size={20} className="flex-shrink-0" />
                        <span className={`font-medium transition-all duration-300 ${!sidebarOpen ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Log Out</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-slate-50 z-0">
                <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 flex justify-between items-center px-6 md:px-10 z-20 flex-shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors md:hidden"><Menu size={24} /></button>
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input type="text" placeholder="Search..." className="pl-12 pr-4 py-3 bg-slate-100/80 rounded-2xl text-sm w-64 lg:w-96 focus:w-[28rem] transition-all duration-300 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white border border-transparent focus:border-emerald-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 text-slate-500 hover:bg-slate-100/80 rounded-xl transition-all hover:text-emerald-600"><Bell size={22} strokeWidth={2.5} /><span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span></button>
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold overflow-hidden cursor-pointer active:scale-95 transition-all hover:shadow-md" onClick={() => setActiveTab('profile')}>
                            {user.profileImage ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" /> : user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main ref={mainRef} className="flex-1 overflow-y-auto bg-transparent relative scroll-smooth flex flex-col pt-6">
                    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-12">
                        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                        {renderContent()}
                    </div>
                    {/* Fixed global footer positioned neatly at the bottom of the scrolling area */}
                    <div className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 pt-8 pb-20 md:pb-8 px-6 mt-auto">
                        <div className="max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-slate-500 text-sm font-medium">© 2024 NutriFit. Build healthier habits.</p>
                            <div className="flex gap-6 text-sm font-bold text-slate-400">
                                <button onClick={() => setActiveTab('profile')} className="hover:text-emerald-600 transition-colors">Settings</button>
                                <button onClick={handleLogout} className="hover:text-red-500 transition-colors">Log Out</button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Mobile Bottom Tab Bar */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                    <div className="flex justify-around items-center h-16 px-2">
                        {[
                            { id: 'overview', icon: LayoutDashboard, label: 'Home' },
                            { id: 'nutrition', icon: Activity, label: 'Nutrition' },
                            { id: 'ai-chef', icon: ChefHat, label: 'AI Chef' },
                            { id: 'pantry', icon: ShoppingBag, label: 'Pantry' },
                            { id: 'profile', icon: User, label: 'Profile' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all ${activeTab === item.id
                                    ? 'text-emerald-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <div className={`p-1 rounded-lg transition-all ${activeTab === item.id ? 'bg-emerald-50' : ''}`}>
                                    <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-semibold ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}