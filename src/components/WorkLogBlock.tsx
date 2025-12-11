import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import type { WorkTag, DailyWorkLog, WorkAmountLevel } from '../types/workLogTypes';
import { WORK_LEVEL_LABELS } from '../types/workLogTypes';
import { WorkTagSettingsModal } from './WorkTagSettingsModal';

type WorkLogBlockProps = {
    workTags: WorkTag[];
    workLogs: DailyWorkLog;
    dateStr: string;
    onToggle: (dateStr: string, tagId: string) => void;
    onUpdateTags: (tags: WorkTag[]) => void;
};

/**
 * Get chip styling based on work level
 */
function getChipStyle(level: WorkAmountLevel | undefined): string {
    if (!level) {
        // OFF state - neutral/outline style
        return 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50';
    }
    switch (level) {
        case 1:
            return 'bg-blue-100 border-blue-300 text-blue-700';
        case 2:
            return 'bg-blue-300 border-blue-500 text-blue-800';
        case 3:
            return 'bg-blue-500 border-blue-700 text-white';
    }
}

/**
 * Get level indicator dots
 */
function LevelIndicator({ level }: { level: WorkAmountLevel | undefined }) {
    if (!level) return null;
    
    return (
        <span className="ml-1.5 inline-flex gap-0.5">
            {Array.from({ length: level }, (_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${level === 3 ? 'bg-white' : 'bg-current'}`} />
            ))}
        </span>
    );
}

export const WorkLogBlock: React.FC<WorkLogBlockProps> = ({
    workTags,
    workLogs,
    dateStr,
    onToggle,
    onUpdateTags
}) => {
    const [showSettings, setShowSettings] = useState(false);
    
    // Filter only active tags and sort by order
    const activeTags = workTags
        .filter(tag => tag.isActive)
        .sort((a, b) => a.order - b.order);

    const dayLogs = workLogs[dateStr] || {};

    return (
        <>
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">今日の作業ログ</h3>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="タグ編集"
                    >
                        <Settings2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {activeTags.map(tag => {
                        const level = dayLogs[tag.id] as WorkAmountLevel | undefined;
                        
                        return (
                            <button
                                key={tag.id}
                                onClick={() => onToggle(dateStr, tag.id)}
                                className={`
                                    px-3 py-1.5 rounded-full border text-sm font-medium
                                    transition-all duration-200 active:scale-95
                                    ${getChipStyle(level)}
                                `}
                            >
                                {tag.label}
                                <LevelIndicator level={level} />
                                {level && (
                                    <span className="ml-1 text-xs opacity-75">
                                        ({WORK_LEVEL_LABELS[level]})
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {activeTags.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                        タグがありません。<button onClick={() => setShowSettings(true)} className="text-blue-500 underline">タグ編集</button>から追加してください。
                    </p>
                )}
            </div>

            {showSettings && (
                <WorkTagSettingsModal
                    workTags={workTags}
                    onSave={onUpdateTags}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </>
    );
};
