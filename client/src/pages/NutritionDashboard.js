import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Target, TrendingUp, Sparkles } from 'lucide-react';
import NutritionChart from '../components/NutritionChart';
import MealLog from '../components/MealLog';
import WeeklyChart from '../components/WeeklyChart';
import AchievementBadge from '../components/AchievementBadge';
import ExportButton from '../components/ExportButton';
import WaterTracker from '../components/WaterTracker';
import { getMealsByDate, getWeeklySummary, getNutritionInsights, getPersonalizedRecommendations, getUserProfile, checkAchievements } from '../api';

export default function NutritionDashboard() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState([]);
    const [dailyLog, setDailyLog] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [insights, setInsights] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadMeals = useCallback(async () => {
        try {
            const response = await getMealsByDate(selectedDate);
            if (response.success) {
                setMeals(response.meals || []);
                setDailyLog(response.dailyLog);
            }
        } catch (error) {
            console.error('Failed to load meals:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    const loadRecommendations = useCallback(async () => {
        try {
            const response = await getPersonalizedRecommendations(null, selectedDate);
            if (response.success) {
                setRecommendations(response.recommendations || []);
            }
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        }
    }, [selectedDate]);

    useEffect(() => {
        loadUserData();
        loadMeals();
        loadWeeklyData();
        loadInsights();
        loadRecommendations();
    }, [selectedDate, loadMeals, loadRecommendations]);

    const loadUserData = async () => {
        try {
            const response = await getUserProfile();
            if (response.success) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    };

    const loadWeeklyData = async () => {
        try {
            const response = await getWeeklySummary();
            if (response.success) {
                setWeeklyData(response);
            }
        } catch (error) {
            console.error('Failed to load weekly data:', error);
        }
    };

    const loadInsights = async () => {
        try {
            const response = await getNutritionInsights(7);
            if (response.success) {
                setInsights(response);
            }
        } catch (error) {
            console.error('Failed to load insights:', error);
        }
    };

    const handleMealAdded = () => {
        loadMeals();
        loadWeeklyData();
        loadInsights();
        checkAchievements(); // Check for new achievements when meal is added
    };

    const handleDateChange = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your nutrition data...</p>
                </div>
            </div>
        );
    }

    const calorieGoal = user?.calorieGoal || 2000;

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Nutrition Tracker</h2>
                        <p className="text-emerald-100">Track your meals and reach your health goals</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExportButton />
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                            <Target size={32} />
                        </div>
                    </div>
                </div>

                {/* Date Selector */}
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-4">
                    <button
                        onClick={() => handleDateChange(-1)}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Calendar size={20} />
                        <span className="font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    <button
                        onClick={() => handleDateChange(1)}
                        disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Calories</span>
                        <Target size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {dailyLog?.totalNutrition?.calories || 0}
                    </div>
                    <div className="text-sm text-slate-500">
                        of {calorieGoal} goal
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Protein</span>
                        <TrendingUp size={16} className="text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {Math.round(dailyLog?.totalNutrition?.protein || 0)}g
                    </div>
                    <div className="text-sm text-slate-500">
                        {insights?.insights?.averageProtein ? `Avg: ${Math.round(insights.insights.averageProtein)}g` : 'Tracked today'}
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Meals Logged</span>
                        <Sparkles size={16} className="text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                        {meals.length}
                    </div>
                    <div className="text-sm text-slate-500">
                        {dailyLog?.mealCount ? Object.values(dailyLog.mealCount).reduce((a, b) => a + b, 0) : 0} total today
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Nutrition Chart & Weekly */}
                <div className="lg:col-span-2 space-y-6">
                    <NutritionChart dailyLog={dailyLog} calorieGoal={calorieGoal} />
                    <WeeklyChart weeklyData={weeklyData} />
                </div>

                {/* Right Column - Recommendations */}
                <div className="space-y-6">
                    <WaterTracker date={selectedDate} />
                    <AchievementBadge />
                    
                    {recommendations.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Sparkles size={20} className="text-emerald-600" />
                                Personalized Recommendations
                            </h3>
                            <div className="space-y-4">
                                {recommendations.slice(0, 3).map((recipe, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                        <div className="font-medium text-slate-900 mb-1">{recipe.name}</div>
                                        <div className="text-sm text-slate-600">
                                            {recipe.nutrition?.calories || 0} kcal
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                            {recipe.whyItWorks}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {insights?.recommendations && insights.recommendations.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Insights</h3>
                            <div className="space-y-3">
                                {insights.recommendations.map((rec, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                                        rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                                        'bg-blue-50 border-blue-500'
                                    }`}>
                                        <div className="text-sm font-medium text-slate-900 mb-1">{rec.type}</div>
                                        <div className="text-xs text-slate-600">{rec.message}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Meal Log */}
            <MealLog
                meals={meals}
                dailyLog={dailyLog}
                onMealAdded={handleMealAdded}
                onMealDeleted={handleMealAdded}
                selectedDate={selectedDate}
            />
        </div>
    );
}

