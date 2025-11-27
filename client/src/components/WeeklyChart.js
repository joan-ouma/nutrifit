import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

export default function WeeklyChart({ weeklyData }) {
    if (!weeklyData || !weeklyData.dailyLogs || weeklyData.dailyLogs.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500">No data for this week</p>
                <p className="text-sm text-slate-400 mt-2">Start logging meals to see your weekly progress</p>
            </div>
        );
    }

    const maxCalories = Math.max(
        ...weeklyData.dailyLogs.map(log => log.totalNutrition?.calories || 0),
        weeklyData.averages?.calories || 2000
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create a map of dates to logs
    const logMap = {};
    weeklyData.dailyLogs.forEach(log => {
        const date = new Date(log.date);
        const dayIndex = date.getDay();
        logMap[dayIndex] = log;
    });

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Weekly Overview</h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <TrendingUp size={16} />
                    <span>Avg: {weeklyData.averages?.calories || 0} kcal/day</span>
                </div>
            </div>

            <div className="space-y-4">
                {days.map((day, index) => {
                    const log = logMap[index];
                    const calories = log?.totalNutrition?.calories || 0;
                    const height = maxCalories > 0 ? (calories / maxCalories) * 100 : 0;
                    const isToday = new Date().getDay() === index;

                    return (
                        <div key={day} className="flex items-end gap-3">
                            <div className="w-12 text-xs font-medium text-slate-600 text-right">
                                {day}
                            </div>
                            <div className="flex-1 relative">
                                <div
                                    className={`rounded-t-lg transition-all ${
                                        isToday
                                            ? 'bg-emerald-500'
                                            : calories > 0
                                            ? 'bg-slate-300'
                                            : 'bg-slate-100'
                                    }`}
                                    style={{ height: `${Math.max(height, 5)}px` }}
                                />
                                {calories > 0 && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-700 whitespace-nowrap">
                                        {Math.round(calories)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-slate-900">{Math.round(weeklyData.weeklyTotals?.calories || 0)}</div>
                    <div className="text-xs text-slate-500 mt-1">Total Calories</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900">{Math.round(weeklyData.averages?.protein || 0)}g</div>
                    <div className="text-xs text-slate-500 mt-1">Avg Protein</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900">{weeklyData.daysLogged || 0}</div>
                    <div className="text-xs text-slate-500 mt-1">Days Logged</div>
                </div>
            </div>
        </div>
    );
}

