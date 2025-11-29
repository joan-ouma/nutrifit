import React, { useState, useEffect, useCallback } from 'react';
import { Droplet, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';
// We use the standard API_URL import to match your other working components
import { API_URL } from '../api'; 

export default function WaterTracker({ date }) {
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000);
    const [isLogging, setIsLogging] = useState(false);
    const [animating, setAnimating] = useState(false); // For visual feedback

    // 1. FETCH DATA (Using your logic)
    const loadWaterData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            // Default to today if no date provided
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            const response = await axios.get(`${API_URL}/water?startDate=${targetDate}&endDate=${targetDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Your API parsing logic:
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

    // 2. LOG WATER (Optimistic UI Update)
    const addWater = async (amount) => {
        setIsLogging(true);
        setAnimating(true); // Start wave/pulse animation

        // OPTIMISTIC UPDATE: Update UI immediately before server responds
        setWaterIntake(prev => prev + amount);

        try {
            const token = localStorage.getItem('token');
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            await axios.post(`${API_URL}/water/log`, {
                amount,
                date: targetDate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Background refresh to ensure sync
            loadWaterData();
            
            // Stop animation after 1s
            setTimeout(() => setAnimating(false), 1000);

        } catch (error) {
            // Revert if failed
            setWaterIntake(prev => prev - amount);
            alert('Failed to log water intake');
        } finally {
            setIsLogging(false);
        }
    };

    // Calculate percentage safely
    const percentage = Math.min(100, (waterIntake / waterGoal) * 100);
    const remaining = Math.max(0, waterGoal - waterIntake);

    return (
        <div className="bg-blue-500 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden transition-all hover:shadow-blue-300 hover:scale-[1.01]">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Droplet className="fill-current" /> Water Intake
                    </h3>
                    <p className="text-blue-100 text-sm font-medium">Daily Goal: {waterGoal}ml</p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                    {Math.round(percentage)}%
                </div>
            </div>

            {/* Main Progress Visualization */}
            <div className="relative z-10 mb-8">
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold tracking-tight">{waterIntake}</span>
                    <span className="text-lg text-blue-100 mb-1 font-medium">ml</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className={`h-full bg-white transition-all duration-700 ease-out ${animating ? 'animate-pulse' : ''}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <p className="text-xs text-blue-100 mt-2 font-medium">
                    {remaining > 0 
                        ? `${remaining}ml remaining to hit goal` 
                        : "🎉 Daily goal reached! Excellent hydration!"}
                </p>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-3 relative z-10">
                {[250, 500, 750, 1000].map((amount) => (
                    <button
                        key={amount}
                        onClick={() => addWater(amount)}
                        disabled={isLogging}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-50 group"
                    >
                        {isLogging ? (
                            <Loader2 size={20} className="mb-1 animate-spin" />
                        ) : (
                            <Plus size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-xs font-bold">{amount}ml</span>
                    </button>
                ))}
            </div>

            {/* Background Wave Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20 pointer-events-none">
               <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-white fill-current">
                   <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
               </svg>
            </div>
        </div>
    );
}