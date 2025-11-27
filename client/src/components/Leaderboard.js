import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award, TrendingUp, Calendar, Target } from 'lucide-react';
import { getDailyLeaderboard, getWeeklyLeaderboard, getUserRank } from '../api';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [period, setPeriod] = useState('daily'); // 'daily' or 'weekly'
    const [loading, setLoading] = useState(true);

    const loadLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = period === 'daily' 
                ? await getDailyLeaderboard()
                : await getWeeklyLeaderboard();
            
            if (response.success) {
                setLeaderboard(response.leaderboard || []);
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    const loadUserRank = useCallback(async () => {
        try {
            const response = await getUserRank();
            if (response.success) {
                setUserRank(response);
            }
        } catch (error) {
            console.error('Failed to load user rank:', error);
        }
    }, []);

    useEffect(() => {
        loadLeaderboard();
        loadUserRank();
    }, [loadLeaderboard, loadUserRank]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
        if (rank === 2) return <Medal className="text-gray-400" size={24} />;
        if (rank === 3) return <Award className="text-orange-600" size={24} />;
        return <span className="text-slate-400 font-bold">#{rank}</span>;
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Trophy size={32} />
                            Leaderboard
                        </h2>
                        <p className="text-purple-100">
                            Compete with others and track your progress
                        </p>
                    </div>
                    {userRank && userRank.rank && (
                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center">
                            <div className="text-sm text-purple-100 mb-1">Your Rank</div>
                            <div className="text-4xl font-bold">#{userRank.rank}</div>
                            <div className="text-sm text-purple-100 mt-1">{userRank.score} pts</div>
                        </div>
                    )}
                </div>

                {/* Period Toggle */}
                <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-xl p-1">
                    <button
                        onClick={() => setPeriod('daily')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            period === 'daily'
                                ? 'bg-white text-purple-600 shadow-lg'
                                : 'text-white hover:bg-white/10'
                        }`}
                    >
                        <Calendar size={18} className="inline mr-2" />
                        Daily
                    </button>
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            period === 'weekly'
                                ? 'bg-white text-purple-600 shadow-lg'
                                : 'text-white hover:bg-white/10'
                        }`}
                    >
                        <TrendingUp size={18} className="inline mr-2" />
                        Weekly
                    </button>
                </div>
            </div>

            {/* Leaderboard */}
            {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading leaderboard...</p>
                </div>
            ) : leaderboard.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <Trophy size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 mb-2">No entries yet</p>
                    <p className="text-sm text-slate-400">Start logging meals to appear on the leaderboard!</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Top 3 Podium */}
                    {leaderboard.length >= 3 && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 border-b border-slate-200">
                            <div className="flex items-end justify-center gap-4 max-w-2xl mx-auto">
                                {/* 2nd Place */}
                                <div className="flex-1 text-center">
                                    <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-2xl p-4 mb-2 shadow-lg">
                                        <Medal size={32} className="mx-auto mb-2 text-white" />
                                        <div className="text-white font-bold text-lg mb-1">
                                            {leaderboard[1]?.maskedUsername || '---'}
                                        </div>
                                        <div className="text-white text-sm">{leaderboard[1]?.score || 0} pts</div>
                                    </div>
                                    <div className="text-xs text-slate-600 font-medium">2nd Place</div>
                                </div>

                                {/* 1st Place */}
                                <div className="flex-1 text-center">
                                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-t-2xl p-6 mb-2 shadow-xl transform scale-110">
                                        <Trophy size={40} className="mx-auto mb-2 text-white" />
                                        <div className="text-white font-bold text-xl mb-1">
                                            {leaderboard[0]?.maskedUsername || '---'}
                                        </div>
                                        <div className="text-white text-sm font-medium">{leaderboard[0]?.score || 0} pts</div>
                                    </div>
                                    <div className="text-xs text-slate-600 font-medium">🏆 Champion</div>
                                </div>

                                {/* 3rd Place */}
                                <div className="flex-1 text-center">
                                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-2xl p-4 mb-2 shadow-lg">
                                        <Award size={32} className="mx-auto mb-2 text-white" />
                                        <div className="text-white font-bold text-lg mb-1">
                                            {leaderboard[2]?.maskedUsername || '---'}
                                        </div>
                                        <div className="text-white text-sm">{leaderboard[2]?.score || 0} pts</div>
                                    </div>
                                    <div className="text-xs text-slate-600 font-medium">3rd Place</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Leaderboard List */}
                    <div className="divide-y divide-slate-100">
                        {leaderboard.map((entry, index) => {
                            const rank = entry.rank || index + 1;
                            const isTopThree = rank <= 3;

                            return (
                                <div
                                    key={entry._id || index}
                                    className={`p-4 hover:bg-slate-50 transition-colors ${
                                        isTopThree ? 'bg-gradient-to-r from-purple-50/50 to-pink-50/50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div className="w-12 flex justify-center">
                                            {getRankIcon(rank)}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900 mb-1">
                                                {entry.maskedUsername}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                                {entry.metrics?.perfectDay && (
                                                    <span className="flex items-center gap-1 text-emerald-600">
                                                        <Target size={14} />
                                                        Perfect Day
                                                    </span>
                                                )}
                                                {entry.streak > 1 && (
                                                    <span className="flex items-center gap-1 text-orange-600">
                                                        <TrendingUp size={14} />
                                                        {entry.streak} day streak
                                                    </span>
                                                )}
                                                <span>{entry.mealsLogged || 0} meals</span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-slate-900">
                                                {entry.score || 0}
                                            </div>
                                            <div className="text-xs text-slate-500">points</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info Footer */}
                    <div className="bg-slate-50 p-4 border-t border-slate-200">
                        <div className="text-xs text-slate-500 text-center">
                            💡 Points are calculated based on meeting calorie goals, macro balance, meal logging, and streaks
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

