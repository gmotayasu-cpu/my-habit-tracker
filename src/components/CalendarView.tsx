import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Activity } from 'lucide-react';
import type { Habit, RecordMap, ReadingLog } from '../types';
import { getDaysInMonth, formatDate } from '../utils/dateUtils';

type CalendarViewProps = {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    setActiveTab: (tab: 'today' | 'calendar' | 'stats') => void;
    records: RecordMap;
    habits: Habit[];
    readingLogs?: ReadingLog[];
};

type ViewMode = 'habits' | 'reading';

const GENRE_EMOJI: Record<string, string> = {
    novel: '📕',
    practical: '📗',
    manga: '📚'
};

const GENRE_LABEL: Record<string, string> = {
    novel: '小説',
    practical: '実用書',
    manga: '漫画'
};

export const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    setCurrentDate,
    setActiveTab,
    records,
    habits,
    readingLogs = []
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('habits');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const getReadingForDate = (dateStr: string) => {
        return readingLogs.filter(l => l.date === dateStr);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-100">
                <button onClick={() => {
                    const d = new Date(currentDate);
                    d.setMonth(d.getMonth() - 1);
                    setCurrentDate(d);
                }} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="font-bold text-lg text-slate-800">
                    {year}年 {month + 1}月
                </span>
                <button onClick={() => {
                    const d = new Date(currentDate);
                    d.setMonth(d.getMonth() + 1);
                    setCurrentDate(d);
                }} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-slate-100">
                <button
                    onClick={() => setViewMode('habits')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                        viewMode === 'habits'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    習慣
                </button>
                <button
                    onClick={() => setViewMode('reading')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                        viewMode === 'reading'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    読書
                </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-7 mb-2">
                    {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                        <div key={d} className="text-center text-xs text-slate-400 font-medium py-2">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        if (!day) return <div key={idx} className="aspect-square"></div>;

                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isToday = formatDate(new Date()) === dateStr;

                        if (viewMode === 'habits') {
                            const completedCount = (records[dateStr] || []).length;
                            const intensity = Math.min(completedCount / habits.length, 1);

                            let bgClass = 'bg-slate-50';
                            let textClass = 'text-slate-500';

                            if (completedCount > 0) {
                                if (intensity < 0.3) bgClass = 'bg-blue-100';
                                else if (intensity < 0.6) bgClass = 'bg-blue-300';
                                else if (intensity < 0.9) bgClass = 'bg-blue-500';
                                else bgClass = 'bg-blue-700';

                                textClass = intensity > 0.5 ? 'text-white' : 'text-blue-900';
                            }

                            return (
                                <div
                                    key={dateStr}
                                    onClick={() => {
                                        setCurrentDate(new Date(year, month, day));
                                        setActiveTab('today');
                                    }}
                                    className={`
                                        aspect-square rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer transition-transform hover:scale-110
                                        ${bgClass} ${textClass} ${isToday ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
                                    `}
                                >
                                    {day}
                                </div>
                            );
                        } else {
                            const dayReadings = getReadingForDate(dateStr);
                            const hasReading = dayReadings.length > 0;

                            let bgClass = 'bg-slate-50';
                            let textClass = 'text-slate-500';

                            if (hasReading) {
                                bgClass = 'bg-emerald-100';
                                textClass = 'text-emerald-800';
                            }

                            return (
                                <div
                                    key={dateStr}
                                    onClick={() => {
                                        setCurrentDate(new Date(year, month, day));
                                        setActiveTab('today');
                                    }}
                                    className={`
                                        aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium cursor-pointer transition-transform hover:scale-110 relative
                                        ${bgClass} ${textClass} ${isToday ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
                                    `}
                                    title={hasReading ? dayReadings.map(r => `${GENRE_EMOJI[r.genre]} ${r.title || GENRE_LABEL[r.genre]}`).join('\n') : ''}
                                >
                                    {day}
                                    {hasReading && (
                                        <div className="flex gap-0.5 mt-0.5">
                                            {dayReadings.slice(0, 3).map((r, i) => (
                                                <span key={i} className="text-[8px]">{GENRE_EMOJI[r.genre]}{r.genre === 'manga' && r.count && r.count > 1 ? `×${r.count}` : ''}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    })}
                </div>
                
                <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-400">
                    {viewMode === 'habits' ? (
                        <>
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded bg-slate-50"></div>
                                <div className="w-3 h-3 rounded bg-blue-100"></div>
                                <div className="w-3 h-3 rounded bg-blue-300"></div>
                                <div className="w-3 h-3 rounded bg-blue-500"></div>
                                <div className="w-3 h-3 rounded bg-blue-700"></div>
                            </div>
                            <span>More</span>
                        </>
                    ) : (
                        <>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-slate-50"></div> 記録なし
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-emerald-100"></div> 読書あり
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
