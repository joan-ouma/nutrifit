import React from 'react';

export default function NutritionBar({ label, value, max, color }) {
    // Calculate percentage, capped at 100%
    // Using parseInt ensures we handle string inputs like "30g" correctly
    const numericValue = parseInt(value) || 0;
    const percentage = Math.min((numericValue / max) * 100, 100);

    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-bold text-slate-800">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}