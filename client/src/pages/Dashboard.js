import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard, ChefHat, ShoppingBag, User, LogOut, Search, Bell,
    Menu, X, Loader2, Flame, Star, Camera, Save, Plus, Trash2, Sparkles, Send, Activity, ListChecks, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import NutritionDashboard from './NutritionDashboard';
import GroceryList from '../components/GroceryList';
import Leaderboard from '../components/Leaderboard';
import API_URL from '../config';

// --- SUB-COMPONENTS ---

const OverviewTab = ({ user, trendingRecipes }) => (
    <div className="space-y-8 animate-fadeIn pb-10">
        {/* Hero Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        Hello, {user.username} <span className="text-2xl">👋</span>
                    </h2>
                    <p className="text-slate-300 max-w-xl text-lg">
                        Your goal is <span className="text-emerald-400 font-bold uppercase tracking-wide">{user.goals || 'Balanced'}</span>.
                        Let's find something delicious.
                    </p>
                </div>
            </div>
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Trending Section */}
        <div>
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-emerald-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Trending Recipes</h3>
            </div>

            {trendingRecipes.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-300">
                    <p className="text-slate-500">Start generating recipes to see them appear here!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-4 gap-6">
                    {trendingRecipes.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group cursor-pointer transform hover:-translate-y-1">
                            <div className="h-40 overflow-hidden relative bg-slate-100">
                                <img
                                    src={item.image || `https://source.unsplash.com/featured/?food,${item.name}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                    <Star size={12} className="fill-yellow-400 text-yellow-400" /> 4.9
                                </div>
                            </div>
                            <div className="p-5">
                                <h4 className="font-bold text-slate-800 mb-1 truncate text-lg">{item.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                    <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded"><Flame size={14} /> {item.nutrition?.calories || 400} kcal</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// In client/src/pages/Dashboard.js

const AIChefTab = ({ pantryInput, setPantryInput, handleGenerateRecipes, isGenerating, aiRecipes, setAiRecipes, user }) => {
    
    // --- STATE & HANDLERS ---
    const [preferences, setPreferences] = useState({
        cuisine: 'any',
        mealType: 'any',
        dietaryRestrictions: user?.dietaryRestrictions || [],
        maxCalories: '',
        maxPrepTime: ''
    });

    const handlePreferenceChange = (key, value) => {
        setPreferences({ ...preferences, [key]: value });
    };

    const handleGenerateWithPreferences = () => {
        handleGenerateRecipes(preferences);
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col animate-fadeIn">
            
            {/* --- SECTION 1: THE INPUT BAR (Always at Top) --- */}
            <div className="bg-white p-6 rounded-b-3xl shadow-sm border-x border-b border-slate-200 z-10 sticky top-0">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                        <ChefHat size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">AI Chef Assistant</h2>
                </div>

                {/* Input Field */}
                <div className="relative flex items-center gap-2 mb-4">
                    <div className="absolute left-4 text-slate-400"><ShoppingBag size={20}/></div>
                    <input
                        type="text"
                        className="w-full pl-12 pr-36 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                        placeholder="e.g., chicken, rice, garlic..."
                        value={pantryInput}
                        onChange={(e) => setPantryInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateWithPreferences()}
                    />
                    <button
                        onClick={handleGenerateWithPreferences}
                        disabled={isGenerating || !pantryInput.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : "Generate"}
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['cuisine', 'mealType'].map((filter) => (
                        <select 
                            key={filter}
                            value={preferences[filter]}
                            onChange={(e) => handlePreferenceChange(filter, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none"
                        >
                            <option value="any">Any {filter === 'cuisine' ? 'Cuisine' : 'Meal'}</option>
                            {filter === 'cuisine' 
                                ? ['Italian', 'Mexican', 'Asian', 'Indian'].map(c => <option key={c} value={c}>{c}</option>)
                                : ['breakfast', 'lunch', 'dinner'].map(t => <option key={t} value={t}>{t}</option>)
                            }
                        </select>
                    ))}
                    <input 
                        type="number" 
                        placeholder="Max Cals"
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 w-24 outline-none"
                        value={preferences.maxCalories}
                        onChange={(e) => handlePreferenceChange('maxCalories', e.target.value)}
                    />
                </div>
            </div>

            {/* --- SECTION 2: THE RESULTS (Scrolls Below) --- */}
            <div className="flex-1 p-4 pb-20 overflow-y-auto">
                {isGenerating && (
                    <div className="text-center py-10 animate-pulse">
                        <div className="inline-block p-4 rounded-full bg-emerald-50 mb-3">
                            <ChefHat size={32} className="text-emerald-600" />
                        </div>
                        <p className="text-slate-500 font-medium">Creating recipes...</p>
                    </div>
                )}

                {aiRecipes.length > 0 && !isGenerating && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Results</h3>
                            <button onClick={() => setAiRecipes([])} className="text-xs text-red-400 hover:text-red-500">Clear</button>
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

const PantryTab = ({ pantry, setPantry, handleUpdateProfile, user }) => {
    const [newItem, setNewItem] = useState('');

    const addItem = () => {
        if (!newItem.trim()) return;
        const updatedPantry = [...(pantry || []), newItem];
        setPantry(updatedPantry);
        handleUpdateProfile({ ...user, pantry: updatedPantry }, false);
        setNewItem('');
    };

    const removeItem = (index) => {
        const updatedPantry = pantry.filter((_, i) => i !== index);
        setPantry(updatedPantry);
        handleUpdateProfile({ ...user, pantry: updatedPantry }, false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[600px]">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">My Pantry</h2>
                        <p className="text-slate-500">Manage what you have in stock.</p>
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl">
                        {pantry?.length || 0} Items
                    </div>
                </div>

                <div className="flex gap-2 mb-8">
                    <input
                        className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Add an item (e.g., Olive Oil)"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    />
                    <button
                        onClick={addItem}
                        className="bg-slate-900 text-white px-6 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                {(!pantry || pantry.length === 0) ? (
                    <div className="text-center py-20 text-slate-400">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Your pantry is empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {pantry.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center group hover:border-emerald-300 transition-all">
                                <span className="font-medium text-slate-700">{item}</span>
                                <button onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
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
    const [trendingRecipes, setTrendingRecipes] = useState([]);

    const [pantryInput, setPantryInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiRecipes, setAiRecipes] = useState([]);
    const [searchQuery, setSearchQuery] =	useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('nutrifit_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/recipes/trending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setTrendingRecipes(res.data.data);
        } catch (err) {
            console.log("Trending fetch error", err);
        }
    };
    

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nutrifit_user');
        navigate('/');
    };

    const handleUpdateProfile = async (updatedData, showToast = true) => {
        try {
            setUser(updatedData);
            localStorage.setItem('nutrifit_user', JSON.stringify(updatedData));
    
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/user/profile`, updatedData, {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (res.data.success && showToast) {
                alert("Saved!");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            alert(err.response?.data?.message || "Failed to save changes");
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
        try {
            const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // 👈 REQUIRED
            }
        };
            const res = await axios.post(`${API_URL}/recommend`, {
                pantry: pantryInput,
                userGoal: user.goals || 'balanced',
                budget: user.budgetLevel || 'medium',
                cuisine: preferences.cuisine || 'any',
                mealType: preferences.mealType || 'any',
                dietaryRestrictions: preferences.dietaryRestrictions || [],
                maxCalories: preferences.maxCalories || null,
                maxPrepTime: preferences.maxPrepTime || null
            }, config);
            if (res.data.success) setAiRecipes(res.data.data);
        } catch (err) {
            console.error("Full Error:", err);
            alert(err.response?.data?.error || "Chef is busy right now. Check server logs.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 shadow-2xl z-20`}>
                <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
                    <div className="flex items-center gap-4 text-white font-bold text-xl tracking-tight">
                        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-900/50">
                            <ChefHat className="text-white" size={24} />
                        </div>
                        {sidebarOpen && <span>NutriFit</span>}
                    </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'nutrition', icon: Activity, label: 'Nutrition' },
                        { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
                        { id: 'ai-chef', icon: ChefHat, label: 'Chef Gemini' },
                        { id: 'grocery', icon: ListChecks, label: 'Grocery' },
                        { id: 'pantry', icon: ShoppingBag, label: 'My Pantry' },
                        { id: 'profile', icon: User, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                                activeTab === item.id
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900'
                                    : 'hover:bg-white/5 hover:text-white'
                            }`}
                        >
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
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="pl-12 pr-4 py-3 bg-slate-100 rounded-2xl text-sm w-80 focus:w-96 transition-all outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            <Bell size={24} />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold overflow-hidden cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('profile')}>
                            {user.profileImage ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" /> : user.username.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {activeTab === 'overview' && <OverviewTab user={user} trendingRecipes={trendingRecipes} />}
                    {activeTab === 'nutrition' && <NutritionDashboard />}
                    {activeTab === 'leaderboard' && <Leaderboard />}
                    {activeTab === 'grocery' && <GroceryList />}
                    {activeTab === 'ai-chef' && (
                        <AIChefTab
                            pantryInput={pantryInput}
                            setPantryInput={setPantryInput}
                            handleGenerateRecipes={handleGenerateRecipes}
                            isGenerating={isGenerating}
                            aiRecipes={aiRecipes}
                            setAiRecipes={setAiRecipes}
                            user={user}
                        />
                    )}
                    {activeTab === 'pantry' && (
                        <PantryTab
                            pantry={user.pantry}
                            setPantry={(p) => setUser({...user, pantry: p})}
                            handleUpdateProfile={handleUpdateProfile}
                            user={user}
                        />
                    )}
                    {activeTab === 'profile' && (
                        <ProfileTab
                            user={user}
                            handleUpdateProfile={handleUpdateProfile}
                            handleImageUpload={handleImageUpload}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

