import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Edit3,
    ArrowUp,
    ArrowDown,
    Plus,
    Trash2,
    Check
} from 'lucide-react';
import type { Habit, RecordMap } from '../types';
import { formatDate } from '../utils/dateUtils';
import { IconDisplay } from './IconDisplay';

type TodayViewProps = {
    currentDate: Date;
    changeDate: (days: number) => void;
    habits: Habit[];
    records: RecordMap;
    isEditing: boolean;
    newHabitName: string;
    setNewHabitName: (name: string) => void;
    addHabit: () => void;
    deletingId: string | null;
    setDeletingId: (id: string | null) => void;
    confirmDeleteHabit: (id: string) => void;
    moveHabit: (index: number, direction: 'up' | 'down') => void;
    toggleHabit: (dateStr: string, habitId: string) => void;
};

export const TodayView: React.FC<TodayViewProps> = ({
    currentDate,
    changeDate,
    habits,
    records,
    isEditing,
    newHabitName,
    setNewHabitName,
    addHabit,
    deletingId,
    setDeletingId,
    confirmDeleteHabit,
    moveHabit,
    toggleHabit
}) => {
    const dateStr = formatDate(currentDate);
    const completedIds = records[dateStr] || [];
    const isToday = formatDate(new Date()) === dateStr;

    return (
        <div className="space-y-6">
            {/* Date Navigator */}
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-100">
                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-slate-800">
                        {currentDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </h2>
                    {isToday && <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Today</span>}
                </div>
                <button
                    onClick={() => changeDate(1)}
                    disabled={formatDate(new Date()) === dateStr}
                    className={`p-2 rounded-full transition ${formatDate(new Date()) === dateStr ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100'}`}
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* Edit Mode Header (if Editing) */}
            {isEditing && (
                <div className="bg-yellow-50/90 backdrop-blur-sm border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    <span>リストを編集モード中です</span>
                </div>
            )}

            {/* Habits Grid */}
            <div className={`grid gap-3 ${isEditing ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {habits.map((habit, index) => {
                    const isDone = completedIds.includes(habit.id);

                    if (isEditing) {
                        // Edit Mode Row (Keep as list for easier sorting/deleting)
                        return (
                            <div key={habit.id} className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveHabit(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <button
                                        onClick={() => moveHabit(index, 'down')}
                                        disabled={index === habits.length - 1}
                                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>

                                <div className={`p-2 rounded-lg ${habit.color} bg-opacity-10 text-slate-600 shrink-0`}>
                                    <IconDisplay iconName={habit.icon} className="w-5 h-5" />
                                </div>

                                <span className="font-medium text-base flex-grow truncate">{habit.name}</span>

                                {deletingId === habit.id ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setDeletingId(null)}
                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg text-xs"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={() => confirmDeleteHabit(habit.id)}
                                            className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg text-xs font-bold"
                                        >
                                            削除
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeletingId(habit.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        );
                    }

                    // Normal Mode Row (Grid Item)
                    return (
                        <button
                            key={habit.id}
                            onClick={() => toggleHabit(dateStr, habit.id)}
                            className={`
                  group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border h-full
                  ${isDone
                                    ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white border-transparent shadow-md transform scale-[1.01]'
                                    : 'bg-white/60 backdrop-blur-sm hover:bg-white/80 text-slate-700 border-slate-200/50 shadow-sm'
                                }
                `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-lg shrink-0 ${isDone ? 'bg-white/20' : `${habit.color} bg-opacity-10 text-slate-600`}`}>
                                    <IconDisplay iconName={habit.icon} className={`w-5 h-5 ${isDone ? 'text-white' : ''}`} />
                                </div>
                                <span className="font-medium text-sm sm:text-base truncate">{habit.name}</span>
                            </div>

                            <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ml-2
                  ${isDone ? 'border-white bg-white text-slate-800' : 'border-slate-300 group-hover:border-slate-400'}
                `}>
                                {isDone && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Add New Habit Form (Only in Edit Mode) */}
            {isEditing && (
                <div className="mt-4 p-4 bg-slate-100/90 backdrop-blur-sm rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 mb-2">新しい習慣を追加</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            placeholder="例: 筋トレをする"
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                        />
                        <button
                            onClick={addHabit}
                            disabled={!newHabitName.trim()}
                            className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
