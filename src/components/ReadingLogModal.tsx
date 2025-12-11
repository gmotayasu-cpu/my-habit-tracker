import React, { useState } from 'react';
import { X, BookOpen, Plus, Minus, Check } from 'lucide-react';
import type { BookGenre, BookStatus, ReadingLog } from '../types';

type PendingLog = Omit<ReadingLog, 'id' | 'habitId' | 'date'>;

type ReadingLogModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (logs: PendingLog[]) => void;
    previousTitles?: string[]; // For autocomplete suggestions
};

const GENRE_EMOJI: Record<BookGenre, string> = {
    novel: '📕',
    practical: '📗',
    manga: '📚',
};

const GENRE_LABEL: Record<BookGenre, string> = {
    novel: '小説',
    practical: '実用書',
    manga: '漫画',
};

export const ReadingLogModal: React.FC<ReadingLogModalProps> = ({ isOpen, onClose, onSave, previousTitles = [] }) => {
    const [genre, setGenre] = useState<BookGenre>('novel');
    const [status, setStatus] = useState<BookStatus>('reading');
    const [title, setTitle] = useState('');
    const [count, setCount] = useState(1);
    const [pendingLogs, setPendingLogs] = useState<PendingLog[]>([]);

    if (!isOpen) return null;

    const resetForm = () => {
        setTitle('');
        setGenre('novel');
        setStatus('reading');
        setCount(1);
    };

    const handleAddMore = () => {
        const newLog: PendingLog = {
            genre,
            status,
            title,
            ...(genre === 'manga' ? { count } : {}),
        };
        setPendingLogs([...pendingLogs, newLog]);
        resetForm();
    };

    const handleComplete = () => {
        // Include current form if it has content or if no pending logs
        let allLogs = [...pendingLogs];
        if (title || pendingLogs.length === 0) {
            const currentLog: PendingLog = {
                genre,
                status,
                title,
                ...(genre === 'manga' ? { count } : {}),
            };
            allLogs = [...allLogs, currentLog];
        }
        onSave(allLogs);
        // Reset everything
        resetForm();
        setPendingLogs([]);
    };

    const handleClose = () => {
        resetForm();
        setPendingLogs([]);
        onClose();
    };

    const removePendingLog = (index: number) => {
        setPendingLogs(pendingLogs.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
                    <h3 className="font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        読書ログを記録
                    </h3>
                    <button onClick={handleClose} className="hover:bg-blue-700/50 p-1 rounded-full text-white/80 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-5 space-y-4 overflow-y-auto">
                    {/* Pending Logs Preview */}
                    {pendingLogs.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <div className="text-xs font-bold text-slate-500 mb-2">
                                📝 追加済み ({pendingLogs.length}件)
                            </div>
                            <div className="space-y-1.5">
                                {pendingLogs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm bg-white rounded-md px-2.5 py-1.5 border border-slate-100">
                                        <span className="truncate flex-1">
                                            {GENRE_EMOJI[log.genre]} {log.title || GENRE_LABEL[log.genre]}
                                            {log.genre === 'manga' && log.count && log.count > 1 && (
                                                <span className="text-slate-400 ml-1">×{log.count}</span>
                                            )}
                                        </span>
                                        <button
                                            onClick={() => removePendingLog(i)}
                                            className="ml-2 text-slate-400 hover:text-red-500 transition shrink-0"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">本のタイトル・メモ</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="本のタイトルを入力..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            autoFocus
                            list="previous-titles"
                        />
                        <datalist id="previous-titles">
                            {previousTitles.map((t, i) => (
                                <option key={i} value={t} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">ジャンル</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['novel', 'practical', 'manga'] as const).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setGenre(g)}
                                    className={`
                                        py-2 px-1 text-xs font-bold rounded-lg border transition-all
                                        ${genre === g 
                                            ? 'bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                                    `}
                                >
                                    {GENRE_LABEL[g]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Manga Count Field */}
                    {genre === 'manga' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">冊数</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCount(Math.max(1, count - 1))}
                                    className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition disabled:opacity-30"
                                    disabled={count <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-bold text-slate-700">{count}</span>
                                    <span className="text-sm text-slate-500 ml-1">冊</span>
                                </div>
                                <button
                                    onClick={() => setCount(count + 1)}
                                    className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">状態</label>
                        <div className="flex gap-2">
                             {(['reading', 'finished'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`
                                        flex-1 py-2 px-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1
                                        ${status === s 
                                            ? (s === 'finished' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 ring-1 ring-yellow-500' : 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500')
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                                    `}
                                >
                                    {s === 'reading' ? '📖 読み途中' : '🎉 読了！'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 space-y-2">
                        {/* Add More Button */}
                        <button
                            onClick={handleAddMore}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-sm transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            記録して続けて追加
                        </button>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg text-sm transition"
                            >
                                {pendingLogs.length > 0 ? 'キャンセル' : 'スキップ'}
                            </button>
                            <button
                                onClick={handleComplete}
                                className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check className="w-4 h-4" />
                                {pendingLogs.length > 0 ? `完了 (${pendingLogs.length + 1}件)` : '記録する'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
