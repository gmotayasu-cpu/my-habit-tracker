import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Habit, RecordMap } from '../types';
import { getDaysInMonth, formatDate } from '../utils/dateUtils';

type CalendarViewProps = {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    setActiveTab: (tab: 'today' | 'calendar' | 'stats') => void;
    records: RecordMap;
    habits: Habit[];
};

export const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    setCurrentDate,
    setActiveTab,
    records,
    habits
}) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

    const days = [];
    // Padding for prev month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

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
                        const completedCount = (records[dateStr] || []).length;
                        const intensity = Math.min(completedCount / habits.length, 1);

                        // Color calculation for heatmap effect (Blue base)
                        let bgClass = 'bg-slate-50';
                        let textClass = 'text-slate-500';

                        if (completedCount > 0) {
                            if (intensity < 0.3) bgClass = 'bg-blue-100';
                            else if (intensity < 0.6) bgClass = 'bg-blue-300';
                            else if (intensity < 0.9) bgClass = 'bg-blue-500';
                            else bgClass = 'bg-blue-700';

                            textClass = intensity > 0.5 ? 'text-white' : 'text-blue-900';
                        }

                        const isToday = formatDate(new Date()) === dateStr;

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
                    })}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded bg-slate-50"></div>
                        <div className="w-3 h-3 rounded bg-blue-100"></div>
                        <div className="w-3 h-3 rounded bg-blue-300"></div>
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <div className="w-3 h-3 rounded bg-blue-700"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};
