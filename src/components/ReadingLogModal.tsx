import React, { useState } from 'react';
import { X, BookOpen, Save } from 'lucide-react';
import type { BookGenre, BookStatus, ReadingLog } from '../types';

type ReadingLogModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: Omit<ReadingLog, 'id' | 'habitId' | 'date'>) => void;
};

export const ReadingLogModal: React.FC<ReadingLogModalProps> = ({ isOpen, onClose, onSave }) => {
    const [genre, setGenre] = useState<BookGenre>('novel');
    const [status, setStatus] = useState<BookStatus>('reading');
    const [title, setTitle] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave({ genre, status, title });
        // Reset form
        setTitle('');
        setGenre('novel');
        setStatus('reading');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        読書ログを記録
                    </h3>
                    <button onClick={onClose} className="hover:bg-blue-700/50 p-1 rounded-full text-white/80 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">本のタイトル・メモ</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="本のタイトルを入力..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">ジャンル</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['novel', 'practical', 'other'] as const).map((g) => (
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
                                    {g === 'novel' ? '小説' : g === 'practical' ? '実用書' : 'その他'}
                                </button>
                            ))}
                        </div>
                    </div>

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

                    <div className="pt-2 flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg text-sm transition"
                        >
                            スキップ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!title.trim()}
                            className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            記録する
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
