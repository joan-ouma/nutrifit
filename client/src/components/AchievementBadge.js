import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, X } from 'lucide-react';
import { checkAchievements, getAchievements } from '../api';

export default function AchievementBadge() {
    const [achievements, setAchievements] = useState([]);
    const [newAchievements, setNewAchievements] = useState([]);
    const [showNotification, setShowNotification] = useState(false);

    const loadAchievements = useCallback(async () => {
        try {
            const response = await getAchievements();
            if (response.success) {
                setAchievements(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load achievements:', error);
        }
    }, []);

    const checkNewAchievements = useCallback(async () => {
        try {
            const response = await checkAchievements();
            if (response.success && response.newAchievements?.length > 0) {
                setNewAchievements(response.newAchievements);
                setShowNotification(true);
                loadAchievements();
                
                // Auto-hide after 5 seconds
                setTimeout(() => setShowNotification(false), 5000);
            }
        } catch (error) {
            console.error('Failed to check achievements:', error);
        }
    }, [loadAchievements]);

    useEffect(() => {
        loadAchievements();
        checkNewAchievements();
    }, [loadAchievements, checkNewAchievements]);


    if (achievements.length === 0 && !showNotification) return null;

    return (
        <>
            {/* Notification for new achievements */}
            {showNotification && newAchievements.length > 0 && (
                <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-2xl shadow-2xl max-w-sm animate-slideIn">
                    <div className="flex items-start gap-3">
                        <Trophy size={24} className="flex-shrink-0" />
                        <div className="flex-1">
                            <div className="font-bold mb-1">Achievement Unlocked! 🎉</div>
                            {newAchievements.map((ach, idx) => (
                                <div key={idx} className="text-sm mb-1">
                                    <strong>{ach.title}</strong> - {ach.description}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="text-white hover:text-gray-200"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Achievement display */}
            {achievements.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy size={20} className="text-yellow-500" />
                        <h3 className="text-lg font-bold text-slate-900">Achievements</h3>
                        <span className="ml-auto text-sm text-slate-500">{achievements.length} unlocked</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {achievements.slice(0, 8).map((ach, idx) => (
                            <div
                                key={idx}
                                className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-200 text-center"
                            >
                                <div className="text-2xl mb-1">{ach.icon || '🏆'}</div>
                                <div className="text-xs font-medium text-slate-700 line-clamp-2">
                                    {ach.title}
                                </div>
                            </div>
                        ))}
                    </div>
                    {achievements.length > 8 && (
                        <div className="text-center mt-4 text-sm text-slate-500">
                            +{achievements.length - 8} more achievements
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

