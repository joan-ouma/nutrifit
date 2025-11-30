import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard, ChefHat, ShoppingBag, User, LogOut, Search, Bell,
    Menu, X, Loader2, Flame,Camera, Save, Plus, Trash2, Sparkles, 
    Activity, ListChecks, Trophy, Check, ArrowRight, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { API_URL, logMeal } from '../api';

// Components
import RecipeCard from '../components/RecipeCard';
import NutritionDashboard from './NutritionDashboard';
import GroceryList from '../components/GroceryList';
import Leaderboard from '../components/Leaderboard';


// --- SUB-COMPONENTS ---

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000); // Auto-hide after 3 seconds
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

// --- UPDATED OVERVIEW TAB (Coffee = Hydration) ---
const OverviewTab = ({ user, setActiveTab, showToast }) => {
    // 1. Time Logic
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const nextMeal = hour < 11 ? 'Breakfast' : hour < 15 ? 'Lunch' : hour < 20 ? 'Dinner' : 'Snack';
    const streakDays = user.streak || 1;

    // 2. Stats State
    const [todayStats, setTodayStats] = useState({ calories: 0, goal: user.calorieGoal || 2000 });
    const [waterStats, setWaterStats] = useState({ current: 0, goal: user.waterGoal || 2500 });
    const [addingItem, setAddingItem] = useState(null);

    // 3. Fetch Data on Load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const today = new Date().toISOString().split('T')[0];
                
                // Get Meals
                const resMeals = await axios.get(`${API_URL}/meals/date/${today}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const meals = resMeals.data.meals || [];
                const totalCals = meals.reduce((sum, m) => sum + (m.nutrition?.calories || 0), 0);
                
                // Get Water
                const resWater = await axios.get(`${API_URL}/water?startDate=${today}&endDate=${today}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const totalWater = resWater.data.summary?.totalWater || 0;

                setTodayStats({ calories: totalCals, goal: user.calorieGoal || 2000 });
                setWaterStats({ current: totalWater, goal: user.waterGoal || 2500 });

            } catch (err) {
                console.error("Stats error", err);
            }
        };
        fetchData();
    }, [user]);

    // 4. ✅ SMART QUICK ADD (Updated Logic)
    const handleQuickAdd = async (item) => {
        setAddingItem(item.name); 
        try {
            const token = localStorage.getItem('token');
            const today = new Date().toISOString().split('T')[0];

            // --- BRANCH A: HYDRATION (Water & Coffee) ---
            // Checks for "water" OR "coffee" to log as hydration
            if (item.name.toLowerCase().includes('water') || item.name.toLowerCase().includes('coffee')) {
                await axios.post(`${API_URL}/water/log`, 
                    { amount: 250, date: today }, // Logs 250ml per click
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                // Update Blue Tracker instantly
                setWaterStats(prev => ({ ...prev, current: prev.current + 250 }));
                
                if (showToast) showToast(`Hydration logged! +250ml`, "success");
            } 
            // --- BRANCH B: FOOD (Everything else) ---
            else {
                await logMeal({
                    name: item.name,
                    type: 'snack',
                    date: today,
                    nutrition: { 
                        calories: item.cal, 
                        protein: 0, carbs: 0, fats: 0 
                    },
                    servingSize: '1 portion',
                    notes: 'Quick add from Dashboard'
                });
                
                // Update Fuel Gauge instantly
                setTodayStats(prev => ({ ...prev, calories: prev.calories + item.cal }));
                
                if (showToast) showToast(`${item.name} logged as snack!`, "success");
            }
            
        } catch (error) {
            if (showToast) showToast("Failed to log item. Check connection.", "error");
        } finally {
            setAddingItem(null); 
        }
    };

    // Calculate Percentages
    const fuelPercent = Math.min((todayStats.calories / todayStats.goal) * 100, 100);
    const waterPercent = Math.min((waterStats.current / waterStats.goal) * 100, 100);

    return (
        <div className="space-y-8 animate-fadeIn pb-10 max-w-6xl mx-auto">
            
            {/* 1. HERO SECTION */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs mb-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        Online & Tracking
                    </div>
                    <h2 className="text-3xl font-bold mb-2 capitalize">
                        Good {timeOfDay}, {user.username}.
                    </h2>
                    <p className="text-slate-300 max-w-md mb-4">
                        Consistency is key. You're on a roll with your <span className="text-white font-bold">{user.goals || 'balanced'}</span> journey.
                    </p>
                    
                    {/* Fuel Gauge */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 max-w-sm backdrop-blur-sm">
                        <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                            <span>Daily Fuel</span>
                            <span>{Math.round(todayStats.calories)} / {todayStats.goal} kcal</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 relative"
                                style={{ width: `${fuelPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                
                {/* Streak Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 min-w-[180px] z-10 hover:bg-white/20 transition-colors cursor-default">
                    <div className="bg-orange-500/20 p-3 rounded-xl text-orange-400">
                        <Flame size={32} fill="currentColor" />
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{streakDays}</div>
                        <div className="text-xs text-slate-300 font-medium uppercase tracking-wide">Day Streak</div>
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>

            {/* 2. SMART ACTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* A. AI Chef Prompt */}
                <div 
                    onClick={() => setActiveTab('ai-chef')} 
                    className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 z-10">
                        <ChefHat size={32} />
                    </div>
                    <div className="flex-1 text-center sm:text-left z-10">
                        <h3 className="text-lg font-bold text-slate-900">Time for {nextMeal}?</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            Let NutriFit Assistant check your pantry and suggest a perfect {user.goals} meal.
                        </p>
                        <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 justify-center sm:justify-start group-hover:gap-3 transition-all">
                            Generate {nextMeal} <ArrowRight size={16} />
                        </span>
                    </div>
                </div>

                {/* B. Water Quick Stat */}
                <div 
                    onClick={() => setActiveTab('nutrition')} 
                    className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200 flex flex-col justify-between cursor-pointer hover:bg-blue-700 transition-colors relative overflow-hidden group"
                >
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <h3 className="font-bold text-lg">Hydration</h3>
                            <p className="text-blue-100 text-xs">Goal: {waterStats.goal}ml</p>
                        </div>
                        <Activity size={20} className="text-blue-200" />
                    </div>
                    <div className="z-10 mt-4">
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold">{waterStats.current}</span>
                            <span className="text-sm mb-1 opacity-80">ml</span>
                        </div>
                        <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${waterPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. QUICK ADD */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Quick Add</h3>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-2">
                    {[
                        { name: 'Water (250ml)', icon: '💧', cal: 0 },
                        { name: 'Coffee', icon: '☕', cal: 5 }, // Now behaves like Water!
                        { name: 'Banana', icon: '🍌', cal: 105 },
                        { name: 'Apple', icon: '🍎', cal: 95 },
                        { name: 'Protein Shake', icon: '🥤', cal: 180 },
                        { name: 'Yogurt', icon: '🥣', cal: 120 }
                    ].map((item, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleQuickAdd(item)}
                            disabled={addingItem !== null}
                            className="flex-shrink-0 bg-white border border-slate-100 p-4 rounded-2xl min-w-[140px] hover:border-emerald-500 hover:shadow-md transition-all text-left group relative"
                        >
                            {addingItem === item.name ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-20">
                                    <Loader2 className="animate-spin text-emerald-600" size={24} />
                                </div>
                            ) : null}
                            
                            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">{item.icon}</span>
                            <div className="font-bold text-slate-700 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-400 font-medium group-hover:text-emerald-500">{item.cal} kcal</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// In client/src/pages/Dashboard.js

const AIChefTab = ({ pantryInput, setPantryInput, handleGenerateRecipes, isGenerating, aiRecipes, setAiRecipes, user }) => {
    
    // --- STATE ---
    const [preferences, setPreferences] = useState({
        cuisine: 'any',
        mealType: 'any',
        dietaryRestrictions: user?.dietaryRestrictions || [],
        maxCalories: '',
    });

    const cuisines = ['any', 'Kenyan', 'Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American'];
    const mealTypes = ['any', 'breakfast', 'lunch', 'dinner', 'snack'];
    
    // ✅ RENAMED: clearer, simple English terms
    const dietaryOptions = [
        'vegetarian', 
        'vegan', 
        'gluten-free', 
        'dairy-free', 
        'low-carb',     // Replaced 'keto'
        'high-protein', // Replaced 'paleo'
        'nut-free'
    ];

    const handlePreferenceChange = (key, value) => {
        if (key === 'dietaryRestrictions') {
            const current = preferences.dietaryRestrictions || [];
            const updated = current.includes(value) ? current.filter(r => r !== value) : [...current, value];
            setPreferences({ ...preferences, dietaryRestrictions: updated });
        } else {
            setPreferences({ ...preferences, [key]: value });
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col animate-fadeIn relative">
            
            {/* --- 1. HEADER & STATUS --- */}
            <div className="pt-6 px-6 pb-2 text-center">
                <div className="inline-flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 mb-6">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">NutriFit Assistant Online</span>
                </div>

                {/* Welcome Message (Hides when results appear) */}
                {aiRecipes.length === 0 && !isGenerating && (
                    <div className="max-w-xl mx-auto mb-6 animate-slideDown">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">What are we cooking today?</h2>
                        <p className="text-slate-500">
                            Tell me your ingredients, select your preferences, and I'll generate a chef-quality recipe for you.
                        </p>
                    </div>
                )}
            </div>

            {/* --- 2. PROFESSIONAL INPUT & FILTERS --- */}
            <div className={`px-6 z-20 transition-all duration-500 ${aiRecipes.length > 0 ? 'sticky top-0 bg-slate-50/95 backdrop-blur-md pt-4 pb-4 border-b border-slate-200 shadow-sm' : 'pb-6'}`}>
                <div className="max-w-3xl mx-auto space-y-4">
                    
                    {/* A. Search Bar (Big & Clean) */}
                    <div className="relative flex items-center group">
                        <div className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <ShoppingBag size={22}/>
                        </div>
                        <input
                            type="text"
                            className="w-full py-4 pl-12 pr-36 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-medium text-lg text-slate-700 placeholder:text-slate-400 transition-all"
                            placeholder="e.g. Maize flour, beef, sukuma wiki..."
                            value={pantryInput}
                            onChange={(e) => setPantryInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateRecipes(preferences)}
                        />
                        <button
                            onClick={() => handleGenerateRecipes(preferences)}
                            disabled={isGenerating || !pantryInput.trim()}
                            className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-all shadow-md active:scale-95"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20}/>}
                        </button>
                    </div>

                    {/* B. Filter Cards (Horizontal Scroll) */}
                    <div className="flex flex-col gap-3">
                        
                        {/* Row 1: Primary Dropdowns (Styled as Cards) */}
                        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            
                            {/* Cuisine Card */}
                            <div className="relative flex-shrink-0 group">
                                <select 
                                    value={preferences.cuisine}
                                    onChange={(e) => handlePreferenceChange('cuisine', e.target.value)}
                                    className="appearance-none bg-white pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-all shadow-sm"
                                >
                                    {cuisines.map(c => <option key={c} value={c}>{c === 'any' ? '🌍 Any Cuisine' : c}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ArrowRight size={12} className="rotate-90" />
                                </div>
                            </div>

                            {/* Meal Type Card */}
                            <div className="relative flex-shrink-0 group">
                                <select 
                                    value={preferences.mealType}
                                    onChange={(e) => handlePreferenceChange('mealType', e.target.value)}
                                    className="appearance-none bg-white pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-all shadow-sm"
                                >
                                    {mealTypes.map(t => <option key={t} value={t} className="capitalize">{t === 'any' ? '🍽️ Any Meal' : t}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ArrowRight size={12} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Dietary Tags (Pill Style) */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex-shrink-0 mr-1">Diet:</span>
                            {dietaryOptions.map(option => {
                                const isActive = preferences.dietaryRestrictions.includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handlePreferenceChange('dietaryRestrictions', option)}
                                        className={`
                                            flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border shadow-sm
                                            ${isActive 
                                                ? 'bg-emerald-600 text-white border-emerald-600 scale-105' 
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                                            }
                                        `}
                                    >
                                        {isActive && <Check size={10} className="inline mr-1 -mt-0.5" />}
                                        {option.replace('-', ' ')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. RESULTS AREA --- */}
            <div className="flex-1 px-6 pb-20 overflow-y-auto custom-scrollbar">
                
                {isGenerating && (
                    <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                        <div className="bg-white p-5 rounded-full shadow-xl mb-5 border border-emerald-100">
                            <ChefHat size={40} className="text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Analyzing your ingredients...</h3>
                        <p className="text-slate-500 text-sm">Reviewing {preferences.cuisine !== 'any' ? preferences.cuisine : 'global'} recipes</p>
                    </div>
                )}

                {!isGenerating && aiRecipes.length > 0 && (
                    <div className="animate-slideUp">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Sparkles size={18} className="text-emerald-500" /> 
                                Recommended for you
                            </h3>
                            <button onClick={() => setAiRecipes([])} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wide">
                                Clear Results
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {aiRecipes.map((recipe, idx) => (
                                <RecipeCard key={idx} recipe={recipe} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- UPDATED PANTRY TAB (Professional & Functional) ---
const PantryTab = ({ pantry, setPantry, handleUpdateProfile, user, setActiveTab, setPantryInput }) => {
    const [newItem, setNewItem] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-Refresh Data (with Lint Fix)
    useEffect(() => {
        let isMounted = true; 

        const refreshPantry = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (isMounted) {
                    const serverPantry = res.data.data.pantry || [];
                    setPantry(serverPantry);
                }
            } catch (err) {
                console.error("Failed to refresh pantry:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        refreshPantry();

        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const addItem = () => {
        if (!newItem.trim()) return;
        if (pantry.includes(newItem.trim())) {
            setNewItem('');
            return;
        }
        const updatedPantry = [newItem.trim(), ...(pantry || [])];
        setPantry(updatedPantry);
        handleUpdateProfile({ ...user, pantry: updatedPantry }, false);
        setNewItem('');
    };

    const toggleSelection = (item) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter(i => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
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
        const ingredients = selectedItems.join(', ');
        setPantryInput(ingredients);
        setActiveTab('ai-chef');
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
            {/* --- PROFESSIONAL HEADER --- */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">My Digital Pantry</h2>
                            <p className="text-slate-500">Manage your inventory.</p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`
                            px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all duration-300
                            ${isLoading 
                                ? 'bg-slate-100 text-slate-500' 
                                : 'bg-emerald-100 text-emerald-800'
                            }
                        `}>
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={18} />
                                    <span>{pantry?.length || 0} Items</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Input Field */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                                placeholder="Add item (e.g. Maize Flour)..."
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Plus size={20} />
                            </div>
                        </div>
                        <button 
                            onClick={addItem} 
                            disabled={!newItem.trim()}
                            className="bg-slate-900 text-white px-8 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
            </div>

            {/* Actions Bar (Appears when items selected) */}
            {selectedItems.length > 0 && (
                <div className="sticky top-4 z-20 mb-6 animate-slideDown">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center mx-auto max-w-lg">
                        <span className="font-bold ml-2">{selectedItems.length} Selected</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={deleteSelected}
                                className="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Remove
                            </button>
                            <button 
                                onClick={cookSelected}
                                className="px-6 py-2 bg-emerald-500 text-white hover:bg-emerald-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg"
                            >
                                <ChefHat size={16} /> Plan Meal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Items Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                {isLoading && (!pantry || pantry.length === 0) ? (
                    <div className="text-center py-20 text-slate-400">Loading inventory...</div>
                ) : (!pantry || pantry.length === 0) ? (
                    <div className="text-center py-20 text-slate-400">
                        Your pantry is empty. Add items or shop from Grocery list.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {pantry.map((item, idx) => {
                            const isSelected = selectedItems.includes(item);
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => toggleSelection(item)}
                                    className={`
                                        cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between group
                                        ${isSelected 
                                            ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500' 
                                            : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                                        }
                                    `}
                                >
                                    <span className={`font-bold capitalize truncate pr-2 ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                                        {item}
                                    </span>
                                    {isSelected && <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />}
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

    useEffect(() => {
        setEditForm({ ...user });
    }, [user]);

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
                <button
                    onClick={() => handleUpdateProfile(editForm)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-100">
                <div className="relative mb-4">
                    <div className="w-32 h-32	bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-4 border-white shadow-xl overflow-hidden">
                        {editForm.profileImage ? (
                            <img src={editForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} />
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 shadow-lg border-4 border-white transition-transform hover:scale-110"
                    >
                        <Camera size={16} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
                <h3 className="font-bold text-xl text-slate-900">{editForm.username}</h3>
                <p className="text-slate-500">{editForm.email}</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Bio</label>
                    <textarea
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        rows="3"
                        placeholder="Tell us about your cooking style..."
                        value={editForm.bio || ''}
                        onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Goal</label>
                        <select
                            value={editForm.goals || 'balanced'}
                            onChange={e => setEditForm({...editForm, goals: e.target.value})}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                        >
                            <option value="balanced">Balanced Diet</option>
                            <option value="weight-loss">Weight Loss</option>
                            <option value="muscle">Muscle Gain</option>
                            <option value="weight-gain">Weight Gain</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Budget</label>
                        <select
                            value={editForm.budgetLevel || 'medium'}
                            onChange={e => setEditForm({...editForm, budgetLevel: e.target.value})}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                        >
                            <option value="low">Low Budget</option>
                            <option value="medium">Medium Budget</option>
                            <option value="high">Premium</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Daily Calorie Goal</label>
                    <input
                        type="number"
                        value={editForm.calorieGoal || 2000}
                        onChange={e => setEditForm({...editForm, calorieGoal: parseInt(e.target.value) || 2000})}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="2000"
                        min="1200"
                        max="5000"
                    />
                    <p className="text-xs text-slate-400 mt-1">Recommended: 2000 calories for average adult</p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Dietary Restrictions</label>
                    <div className="flex flex-wrap gap-2">
                        {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map(restriction => (
                            <label key={restriction} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={(editForm.dietaryRestrictions || []).includes(restriction)}
                                    onChange={e => {
                                        const current = editForm.dietaryRestrictions || [];
                                        const updated = e.target.checked
                                            ? [...current, restriction]
                                            : current.filter(r => r !== restriction);
                                        setEditForm({...editForm, dietaryRestrictions: updated});
                                    }}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-slate-700 capitalize">{restriction}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD ---
export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState({ username: 'User', email: '', profileImage: null, pantry: [] });
    const [pantryInput, setPantryInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiRecipes, setAiRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null); // ✅ NEW: Toast State
    const navigate = useNavigate();

    // Helper for showing notifications
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('nutrifit_user');
        if (storedUser) setUser(JSON.parse(storedUser));
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

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 shadow-2xl z-20`}>
                <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
                    <div className="flex items-center gap-4 text-white font-bold text-xl tracking-tight">
                        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-900/50"><ChefHat className="text-white" size={24} /></div>
                        {sidebarOpen && <span>NutriFit</span>}
                    </div>
                </div>
                <nav className="flex-1 py-8 px-4 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'nutrition', icon: Activity, label: 'Nutrition' },
                        { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
                        { id: 'ai-chef', icon: ChefHat, label: 'NutriFit Assistant' },
                        { id: 'grocery', icon: ListChecks, label: 'Grocery' },
                        { id: 'pantry', icon: ShoppingBag, label: 'My Pantry' },
                        { id: 'profile', icon: User, label: 'Settings' },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900' : 'hover:bg-white/5 hover:text-white'}`}>
                            <item.icon size={22} />
                            {sidebarOpen && <span className="font-medium">{item.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-800/50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-2xl transition-colors">
                        <LogOut size={22} />
                        {sidebarOpen && <span className="font-medium">Log Out</span>}
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-24 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-10">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"><Menu size={24} /></button>
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input type="text" placeholder="Search..." className="pl-12 pr-4 py-3 bg-slate-100 rounded-2xl text-sm w-80 focus:w-96 transition-all outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"><Bell size={24} /><span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span></button>
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold overflow-hidden cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('profile')}>
                            {user.profileImage ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" /> : user.username.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 relative">
                    {/* Render Toast if active */}
                    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                    {activeTab === 'overview' && <OverviewTab user={user} setActiveTab={setActiveTab} showToast={showToast} />}
                    {activeTab === 'nutrition' && <NutritionDashboard />}
                    {activeTab === 'leaderboard' && <Leaderboard />}
                    {activeTab === 'grocery' && <GroceryList user={user} handleUpdateProfile={handleUpdateProfile} />}
                    {activeTab === 'ai-chef' && <AIChefTab pantryInput={pantryInput} setPantryInput={setPantryInput} handleGenerateRecipes={handleGenerateRecipes} isGenerating={isGenerating} aiRecipes={aiRecipes} setAiRecipes={setAiRecipes} user={user} />}
                    {activeTab === 'pantry' && <PantryTab pantry={user.pantry} setPantry={(p) => setUser({...user, pantry: p})} handleUpdateProfile={handleUpdateProfile} user={user} setActiveTab={setActiveTab} setPantryInput={setPantryInput} />}
                    {activeTab === 'profile' && <ProfileTab user={user} handleUpdateProfile={handleUpdateProfile} handleImageUpload={handleImageUpload} />}
                    
                    <div className="mt-auto py-8 text-center border-t border-slate-200/60 mx-8">
                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">NutriFit • Health & Wellness</p>
                        <div className="flex justify-center gap-4 mt-2 text-[10px] text-slate-400 font-medium">
                            <a href="#!" className="hover:text-emerald-600 transition-colors">Privacy</a><span>•</span>
                            <a href="#!" className="hover:text-emerald-600 transition-colors">Terms</a><span>•</span>
                            <a href="#!" className="hover:text-emerald-600 transition-colors">Support</a>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

