import React, { useMemo } from 'react';
import {
    Sparkles,
    RefreshCw,
    Loader2,
    Calendar as CalendarIcon,
    Plus,
    X,
    BookOpen
} from 'lucide-react';
import type { Habit, RecordMap, ReadingLog } from '../types';
import { formatDate, getPast7Days } from '../utils/dateUtils';
import { IconDisplay } from './IconDisplay';

type StatsViewProps = {
    habits: Habit[];
    records: RecordMap;
    readingLogs: ReadingLog[]; 
    aiAnalysis: string | null;
    isAiLoading: boolean;
    generateAIReview: () => void;
    aiError: string | null;
    showStreaks: boolean;
    setShowStreaks: (show: boolean) => void;
    isEditingAnalysis: boolean;
    setIsEditingAnalysis: (editing: boolean) => void;
    hiddenAnalysisIds: string[];
    setHiddenAnalysisIds: (ids: string[] | ((prev: string[]) => string[])) => void;
};

export const StatsView: React.FC<StatsViewProps> = ({
    habits,
    records,
    readingLogs = [], 
    aiAnalysis,
    isAiLoading,
    generateAIReview,
    aiError,
    showStreaks,
    setShowStreaks,
    isEditingAnalysis,
    setIsEditingAnalysis,
    hiddenAnalysisIds,
    setHiddenAnalysisIds
}) => {
    // --- Helper Logic ---
    const getLastDoneDate = (habitId: string) => {
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = formatDate(d);
            if (records[dateStr]?.includes(habitId)) {
                return { date: d, daysAgo: i };
            }
        }
        return null;
    };

    const getStreak = (habitId: string) => {
        let streak = 0;
        const today = new Date();
        let d = new Date(today);
        if (!records[formatDate(d)]?.includes(habitId)) {
            d.setDate(d.getDate() - 1);
        }
        while (true) {
            const dateStr = formatDate(d);
            if (records[dateStr]?.includes(habitId)) {
                streak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    const weeklyHistory = useMemo(() => {
        const days = getPast7Days(new Date());
        return days.map(d => {
            const dateStr = formatDate(d);
            return {
                date: d,
                dateStr,
                completed: records[dateStr] || []
            };
        });
    }, [records]);

    // Reading Stats Calculation
    const readingStats = useMemo(() => {
        const novels = readingLogs.filter(l => l.genre === 'novel').sort((a, b) => b.date.localeCompare(a.date));
        const practicals = readingLogs.filter(l => l.genre === 'practical').sort((a, b) => b.date.localeCompare(a.date));
        
        return {
            lastNovel: novels[0] ? novels[0].date : null,
            lastPractical: practicals[0] ? practicals[0].date : null
        };
    }, [readingLogs]);

    const formatLogDate = (dateStr: string | null) => {
        if (!dateStr) return '記録なし';
        const d = new Date(dateStr);
        return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
    };

    return (
        <div className="space-y-6">

            {/* Last Done Date List */}
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        最終実施日
                    </h3>
                    <button
                        onClick={() => setIsEditingAnalysis(!isEditingAnalysis)}
                        className={`text-xs px-2 py-1 rounded transition ${isEditingAnalysis ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {isEditingAnalysis ? '完了' : '表示設定'}
                    </button>
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={showStreaks}
                            onChange={(e) => setShowStreaks(e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>連続達成回数を表示</span>
                    </label>
                </div>

                <div className="space-y-3">
                    {habits.map((habit) => {
                        const isHidden = hiddenAnalysisIds.includes(habit.id);
                        if (isHidden && !isEditingAnalysis) return null;

                        const lastDone = getLastDoneDate(habit.id);
                        const streak = getStreak(habit.id);

                        let dateText = '未実施';
                        if (lastDone) {
                            const diff = lastDone.daysAgo;
                            const dStr = lastDone.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
                            if (diff === 0) dateText = `${dStr} (今日)`;
                            else if (diff === 1) dateText = `${dStr} (昨日)`;
                            else dateText = `${dStr} (${diff}日前)`;
                        }

                        return (
                            <div key={habit.id} className={`flex items-center justify-between p-3 rounded-lg border ${isHidden ? 'bg-slate-50 border-dashed border-slate-300 opacity-60' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${habit.color} bg-opacity-10 text-slate-600`}>
                                        <IconDisplay iconName={habit.icon} className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-700">{habit.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {dateText}
                                            {showStreaks && streak > 0 && <span className="ml-2 text-orange-500 font-bold">🔥 {streak}連続</span>}
                                        </div>
                                    </div>
                                </div>

                                {isEditingAnalysis && (
                                    <button
                                        onClick={() => {
                                            if (isHidden) {
                                                setHiddenAnalysisIds(prev => prev.filter(id => id !== habit.id));
                                            } else {
                                                setHiddenAnalysisIds(prev => [...prev, habit.id]);
                                            }
                                        }}
                                        className={`p-1.5 rounded-full ${isHidden ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {isHidden ? <Plus className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reading Stats */}
            <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    読書データ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                        <div className="text-xs text-slate-400 mb-1">小説</div>
                        <div className="font-bold text-slate-700">
                            {formatLogDate(readingStats.lastNovel)}
                        </div>
                     </div>
                     <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                        <div className="text-xs text-slate-400 mb-1">実用書</div>
                        <div className="font-bold text-slate-700">
                            {formatLogDate(readingStats.lastPractical)}
                        </div>
                     </div>
                </div>
            </div>

            {/* Weekly Quick View */}
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">直近1週間の推移</h3>
                <div className="flex justify-between items-end h-32 gap-2">
                    {weeklyHistory.map((day, i) => {
                        const count = day.completed.length;
                        const heightPercent = Math.min((count / habits.length) * 100, 100);

                        return (
                            <div key={i} className="flex flex-col items-center justify-end flex-1 h-full group">
                                <div
                                    className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 group-hover:bg-blue-600 relative"
                                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {count}個
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 mt-2 font-medium">
                                    {day.date.toLocaleDateString('ja-JP', { weekday: 'short' })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            {/* AI Analysis Card (Moved to Bottom) */}
            <div className="bg-gradient-to-br from-indigo-50/90 to-purple-50/90 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500 fill-current" />
                        AI習慣コーチ
                    </h3>
                    {aiAnalysis && (
                        <button
                            onClick={generateAIReview}
                            className="text-indigo-400 hover:text-indigo-600 p-1 hover:bg-indigo-100 rounded-full transition"
                            title="再生成"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {isAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-6 text-indigo-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">あなたの習慣データを分析中...</p>
                    </div>
                ) : aiAnalysis ? (
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white/50 p-3 rounded-lg border border-indigo-100/50">
                        {aiAnalysis}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-sm text-slate-500 mb-3">過去7日間のデータを分析して、<br />アドバイスをお届けします。</p>
                        <button
                            onClick={generateAIReview}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 mx-auto"
                        >
                            <Sparkles className="w-4 h-4" />
                            今週の振り返りをする
                        </button>
                    </div>
                )}
                {aiError && (
                    <p className="text-xs text-red-500 mt-2 text-center">{aiError}</p>
                )}
            </div>
        </div>
    );
};
