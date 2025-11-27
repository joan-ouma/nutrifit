import React, { useState, useEffect, useCallback } from 'react';
import { Droplet, Plus } from 'lucide-react';
import axios from 'axios';
import API_URL from '../config';

export default function WaterTracker({ date }) {
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000);
    const [isLogging, setIsLogging] = useState(false);

    const loadWaterData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const targetDate = date || new Date().toISOString().split('T')[0];
            const response = await axios.get(`${API_URL}/water?startDate=${targetDate}&endDate=${targetDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success && response.data.data.length > 0) {
                const log = response.data.data[0];
                setWaterIntake(log.waterIntake || 0);
                setWaterGoal(log.waterGoal || 2000);
            }
        } catch (error) {
            console.error('Failed to load water data:', error);
        }
    }, [date]);

    useEffect(() => {
        loadWaterData();
    }, [loadWaterData]);

    const addWater = async (amount) => {
        setIsLogging(true);
        try {
            const token = localStorage.getItem('token');
            const targetDate = date || new Date().toISOString().split('T')[0];
            await axios.post(`${API_URL}/water/log`, {
                amount,
                date: targetDate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadWaterData();
        } catch (error) {
            alert('Failed to log water intake');
        } finally {
            setIsLogging(false);
        }
    };

    const percentage = Math.min(100, (waterIntake / waterGoal) * 100);
    const remaining = Math.max(0, waterGoal - waterIntake);

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Droplet size={24} className="text-blue-500" />
                    <h3 className="text-lg font-bold text-slate-900">Water Intake</h3>
                </div>
                <div className="text-sm text-slate-600">
                    Goal: {waterGoal}ml
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                        {waterIntake}ml / {waterGoal}ml
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                        {Math.round(percentage)}%
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                {remaining > 0 && (
                    <div className="text-xs text-slate-500 mt-1 text-center">
                        {remaining}ml remaining
                    </div>
                )}
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-2">
                {[250, 500, 750, 1000].map(amount => (
                    <button
                        key={amount}
                        onClick={() => addWater(amount)}
                        disabled={isLogging}
                        className="flex flex-col items-center gap-1 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-50 border border-blue-200"
                    >
                        <Plus size={16} className="text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">{amount}ml</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

