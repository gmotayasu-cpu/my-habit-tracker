import React, { useState } from 'react';
import { X, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import type { WorkTag } from '../types/workLogTypes';

type WorkTagSettingsModalProps = {
    workTags: WorkTag[];
    onSave: (tags: WorkTag[]) => void;
    onClose: () => void;
};

export const WorkTagSettingsModal: React.FC<WorkTagSettingsModalProps> = ({
    workTags,
    onSave,
    onClose
}) => {
    const [editedTags, setEditedTags] = useState<WorkTag[]>([...workTags].sort((a, b) => a.order - b.order));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');

    const handleStartEdit = (tag: WorkTag) => {
        setEditingId(tag.id);
        setEditLabel(tag.label);
    };

    const handleSaveLabel = (tagId: string) => {
        if (!editLabel.trim()) return;
        setEditedTags(prev => prev.map(t => 
            t.id === tagId ? { ...t, label: editLabel.trim() } : t
        ));
        setEditingId(null);
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newTags = [...editedTags];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newTags.length) return;
        
        // Swap
        [newTags[index], newTags[targetIndex]] = [newTags[targetIndex], newTags[index]];
        
        // Update order values
        newTags.forEach((tag, i) => { tag.order = i + 1; });
        
        setEditedTags(newTags);
    };

    const handleToggleActive = (tagId: string) => {
        setEditedTags(prev => prev.map(t => 
            t.id === tagId ? { ...t, isActive: !t.isActive } : t
        ));
    };

    const handleSave = () => {
        onSave(editedTags);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="font-bold text-lg text-slate-800">タグ編集</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {editedTags.map((tag, index) => (
                            <div
                                key={tag.id}
                                className={`flex items-center gap-2 p-3 rounded-lg border ${tag.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300 opacity-60'}`}
                            >
                                {/* Move buttons */}
                                <div className="flex flex-col gap-0.5">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-3 h-3 text-slate-500" />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === editedTags.length - 1}
                                        className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-3 h-3 text-slate-500" />
                                    </button>
                                </div>

                                {/* Label */}
                                <div className="flex-1 min-w-0">
                                    {editingId === tag.id ? (
                                        <input
                                            type="text"
                                            value={editLabel}
                                            onChange={(e) => setEditLabel(e.target.value)}
                                            onBlur={() => handleSaveLabel(tag.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveLabel(tag.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                            autoFocus
                                        />
                                    ) : (
                                        <button
                                            onClick={() => handleStartEdit(tag)}
                                            className="text-left w-full text-sm font-medium text-slate-700 hover:text-blue-600 truncate"
                                        >
                                            {tag.label}
                                        </button>
                                    )}
                                    <div className="text-xs text-slate-400 truncate">{tag.id}</div>
                                </div>

                                {/* Active toggle */}
                                <button
                                    onClick={() => handleToggleActive(tag.id)}
                                    className={`p-1.5 rounded ${tag.isActive ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}
                                    title={tag.isActive ? '表示中' : '非表示'}
                                >
                                    {tag.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition font-medium"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};
