import {
    Check,
    BarChart2,
    Calendar as CalendarIcon,
    List,
    BookOpen,
    Video,
    Image as ImageIcon,
    PenTool,
    Sunrise,
    Coffee,
    Home,
    Code,
    FileText,
    Activity,
    Sparkles,
} from 'lucide-react';
import type { Habit } from '../types';
import React from 'react';

export const DEFAULT_HABITS: Habit[] = [
    { id: 'h1', name: '読書', icon: 'BookOpen', color: 'bg-blue-500' },
    { id: 'h2', name: '動画編集', icon: 'Video', color: 'bg-red-500' },
    { id: 'h3', name: '写真編集', icon: 'ImageIcon', color: 'bg-pink-500' },
    { id: 'h4', name: '日記', icon: 'PenTool', color: 'bg-yellow-500' },
    { id: 'h5', name: 'Drawthings', icon: 'Activity', color: 'bg-purple-500' },
    { id: 'h6', name: '朝活', icon: 'Sunrise', color: 'bg-orange-500' },
    { id: 'h7', name: 'スタバで作業', icon: 'Coffee', color: 'bg-green-600' },
    { id: 'h8', name: '直帰', icon: 'Home', color: 'bg-teal-500' },
    { id: 'h9', name: 'プログラミング学習', icon: 'Code', color: 'bg-indigo-600' },
    { id: 'h10', name: 'note記事作成', icon: 'FileText', color: 'bg-emerald-500' },
];

export const ICONS: { [key: string]: React.ElementType } = {
    BookOpen, Video, ImageIcon, PenTool, Activity, Sunrise, Coffee, Home, Code, FileText, Check, List, BarChart2, CalendarIcon, Sparkles
};

export const COLOR_PALETTE = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const BACKGROUND_COLORS = [
    { name: 'Slate', value: 'bg-slate-50' },
    { name: 'Gray', value: 'bg-gray-50' },
    { name: 'Zinc', value: 'bg-zinc-50' },
    { name: 'Neutral', value: 'bg-neutral-50' },
    { name: 'Stone', value: 'bg-stone-50' },
    { name: 'Red', value: 'bg-red-50' },
    { name: 'Orange', value: 'bg-orange-50' },
    { name: 'Amber', value: 'bg-amber-50' },
    { name: 'Yellow', value: 'bg-yellow-50' },
    { name: 'Lime', value: 'bg-lime-50' },
    { name: 'Green', value: 'bg-green-50' },
    { name: 'Emerald', value: 'bg-emerald-50' },
    { name: 'Teal', value: 'bg-teal-50' },
    { name: 'Cyan', value: 'bg-cyan-50' },
    { name: 'Sky', value: 'bg-sky-50' },
    { name: 'Blue', value: 'bg-blue-50' },
    { name: 'Indigo', value: 'bg-indigo-50' },
    { name: 'Violet', value: 'bg-violet-50' },
    { name: 'Purple', value: 'bg-purple-50' },
    { name: 'Fuchsia', value: 'bg-fuchsia-50' },
    { name: 'Pink', value: 'bg-pink-50' },
    { name: 'Rose', value: 'bg-rose-50' },
];
