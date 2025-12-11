import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Briefcase } from 'lucide-react';
import type { WorkTag, DailyWorkLog } from '../types/workLogTypes';
import { formatDate } from '../utils/dateUtils';

type WorkLogStatsProps = {
    workTags: WorkTag[];
    workLogs: DailyWorkLog;
};

type PeriodDays = 7 | 30;

type TagStats = {
    tagId: string;
    label: string;
    activeDays: number;
    totalScore: number;
    avgLevel: number;
};

/**
 * Get array of date strings for the past N days (including today)
 */
function getPastNDays(days: number): string[] {
    const result: string[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        result.push(formatDate(d));
    }
    return result;
}

export const WorkLogStats: React.FC<WorkLogStatsProps> = ({
    workTags,
    workLogs
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [periodDays, setPeriodDays] = useState<PeriodDays>(30);

    const stats = useMemo(() => {
        const dates = getPastNDays(periodDays);
        const tagStats: TagStats[] = [];

        workTags.forEach(tag => {
            let activeDays = 0;
            let totalScore = 0;

            dates.forEach(dateStr => {
                const dayLogs = workLogs[dateStr];
                if (dayLogs && dayLogs[tag.id]) {
                    activeDays++;
                    totalScore += dayLogs[tag.id] as number;
                }
            });

            // Only include tags that are active OR have data in the period
            if (tag.isActive || activeDays > 0) {
                tagStats.push({
                    tagId: tag.id,
                    label: tag.label,
                    activeDays,
                    totalScore,
                    avgLevel: activeDays > 0 ? totalScore / activeDays : 0
                });
            }
        });

        // Sort by totalScore descending
        tagStats.sort((a, b) => b.totalScore - a.totalScore);

        return tagStats;
    }, [workTags, workLogs, periodDays]);

    const maxScore = Math.max(...stats.map(s => s.totalScore), 1);
    const hasData = stats.some(s => s.activeDays > 0);

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                    作業ログ（直近{periodDays}日）
                </h3>
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
            </button>

            {isExpanded && (
                <div className="px-4 pb-4">
                    {/* Period Toggle */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setPeriodDays(7)}
                            className={`px-3 py-1 text-sm rounded-full transition ${
                                periodDays === 7
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            直近7日
                        </button>
                        <button
                            onClick={() => setPeriodDays(30)}
                            className={`px-3 py-1 text-sm rounded-full transition ${
                                periodDays === 30
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            直近30日
                        </button>
                    </div>

                    {!hasData ? (
                        <p className="text-sm text-slate-400 text-center py-6">
                            この期間の作業ログはまだありません。
                        </p>
                    ) : (
                        <>
                            {/* Bar Chart */}
                            <div className="space-y-2 mb-4">
                                {stats.filter(s => s.activeDays > 0).map(stat => (
                                    <div key={stat.tagId} className="group">
                                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                                            <span className="truncate flex-1 font-medium">{stat.label}</span>
                                            <span className="text-slate-400">{stat.totalScore}pt</span>
                                        </div>
                                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-300 group-hover:bg-indigo-600"
                                                style={{ width: `${(stat.totalScore / maxScore) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Text Summary */}
                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-xs font-bold text-slate-500 mb-2">詳細</h4>
                                <div className="space-y-1.5">
                                    {stats.filter(s => s.activeDays > 0).map(stat => (
                                        <div key={stat.tagId} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600 truncate flex-1">{stat.label}</span>
                                            <span className="text-slate-500 text-xs whitespace-nowrap">
                                                {stat.activeDays}日 / スコア {stat.totalScore} / 平均 {stat.avgLevel.toFixed(1)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
