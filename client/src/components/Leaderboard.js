import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Activity, Users } from 'lucide-react'; // Added Users icon
import { getUserRank, getDailyLeaderboard } from '../api';

export default function Leaderboard() {
    const [myStats, setMyStats] = useState({ rank: '-', score: 0, mealsLogged: 0, streak: 0 });
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- HELPER: MASK USERNAME ---
    // Turns "joanouma48" into "joa***"
    const maskName = (name) => {
        if (!name) return "User";
        if (name.length <= 3) return name;
        return name.substring(0, 3) + "***";
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get My Rank
                const myRankRes = await getUserRank();
                if (myRankRes) {
                    setMyStats(prev => ({ ...prev, ...myRankRes }));
                }

                // 2. Get Top Players
                const dailyRes = await getDailyLeaderboard();
                if (dailyRes && dailyRes.success && Array.isArray(dailyRes.data)) {
                    setLeaders(dailyRes.data);
                } else {
                    setLeaders([]); 
                }
            } catch (err) {
                console.error("Leaderboard Error:", err);
                setLeaders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getMedalColor = (idx) => {
        if (idx === 0) return "text-yellow-500"; // Gold
        if (idx === 1) return "text-slate-400";  // Silver
        if (idx === 2) return "text-orange-500"; // Bronze
        return "text-slate-300";
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            
            {/* --- HEADER --- */}
            <div style={{ position: "relative", overflow: "hidden", backgroundColor: "#faf8f2" }} className="rounded-3xl p-8 shadow-sm mb-8 border border-slate-200">
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(20,184,166,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.08) 1px, transparent 1px)", backgroundSize: "48px 48px", mixBlendMode: "normal", opacity: 0.8, pointerEvents: "none", transform: "translateZ(0)" }} aria-hidden="true" />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 45% at 48% 45%, rgba(45,212,191,0.22) 0%, transparent 75%)", mixBlendMode: "normal", filter: "blur(234px)", pointerEvents: "none", transform: "translateZ(0)" }} aria-hidden="true" />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 25%, rgba(125,211,252,0.18) 0%, transparent 35%)", mixBlendMode: "normal", filter: "blur(180px)", pointerEvents: "none", transform: "translateZ(0)" }} aria-hidden="true" />
                
                <div style={{ position: "relative", zIndex: 1 }} className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-1 flex items-center gap-3 text-slate-900">
                            <Trophy className="text-teal-600" /> Leaderboard
                        </h2>
                        <p className="text-slate-600">
                            Compete with {leaders.length > 0 ? leaders.length : 'other'} users today.
                        </p>
                    </div>
                    
                    {/* Privacy Badge */}
                    <div className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-slate-200 text-slate-800">
                        <Users size={14} className="text-teal-600" /> Community Active
                    </div>
                </div>
            </div>

            {/* --- MY STATS CARD --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 transform hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
                        {(myStats.data?.username || "Me").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">My Performance</h3>
                        <p className="text-sm text-slate-500">
                            You are currently ranked <span className="text-indigo-600 font-bold">#{myStats.rank}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-3xl font-black text-indigo-600">{myStats.score || myStats.points || 0}</div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Points</p>
                    </div>
                    <div className="border-l border-slate-100">
                        <div className="text-3xl font-bold text-slate-800">{myStats.mealsLogged || 0}</div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Meals</p>
                    </div>
                    <div className="border-l border-slate-100">
                        <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
                            {myStats.streak || 0} <Flame size={20} fill="currentColor" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Streak</p>
                    </div>
                </div>
            </div>

            {/* --- LEADERBOARD LIST --- */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-lg">Top Performers Today</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase">Points</span>
                </div>
                
                {loading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                        <Activity className="animate-spin text-slate-300" size={32} />
                        <p>Loading rankings...</p>
                    </div>
                ) : (!leaders || leaders.length === 0) ? (
                    <div className="p-12 text-center text-slate-400">
                        The race is on! Log a meal to take the lead.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {leaders.map((player, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                                {/* Rank Medal/Number */}
                                <div className="w-8 text-center font-bold text-lg flex justify-center">
                                    {idx < 3 ? <Medal className={getMedalColor(idx)} size={24} /> : <span className="text-slate-400">#{idx + 1}</span>}
                                </div>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                                    {player.username ? player.username.charAt(0).toUpperCase() : '?'}
                                </div>

                                {/* User Details (MASKED) */}
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800 flex items-center gap-2">
                                        {/* ✅ PRIVACY FIX: Mask the username */}
                                        {maskName(player.username)}
                                        
                                        {/* Identify "You" */}
                                        {player.username === myStats.data?.username && (
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">You</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        {player.mealsLogged} meals • {player.streak} day streak
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <div className="font-bold text-indigo-600 text-lg">{player.score || player.points || 0}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}