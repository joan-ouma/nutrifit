import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { exportNutritionCSV, exportMealsCSV } from '../api';

export default function ExportButton() {
    const [isExporting, setIsExporting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleExport = async (type) => {
        setIsExporting(true);
        try {
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30); // Last 30 days
            
            if (type === 'nutrition') {
                await exportNutritionCSV(startDate.toISOString().split('T')[0], endDate);
            } else {
                await exportMealsCSV(startDate.toISOString().split('T')[0], endDate);
            }
            
            setShowMenu(false);
        } catch (error) {
            alert('Failed to export data. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
                <Download size={18} />
                Export Data
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-slate-200 z-20 min-w-[200px]">
                        <div className="p-2">
                            <button
                                onClick={() => handleExport('nutrition')}
                                disabled={isExporting}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                            >
                                <FileText size={18} className="text-blue-600" />
                                <div>
                                    <div className="font-medium text-slate-900">Nutrition Data</div>
                                    <div className="text-xs text-slate-500">CSV format</div>
                                </div>
                            </button>
                            <button
                                onClick={() => handleExport('meals')}
                                disabled={isExporting}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                            >
                                <FileText size={18} className="text-emerald-600" />
                                <div>
                                    <div className="font-medium text-slate-900">Meal Log</div>
                                    <div className="text-xs text-slate-500">CSV format</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

