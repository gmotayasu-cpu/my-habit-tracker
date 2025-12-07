import React, { useState, useEffect, useMemo } from 'react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    BarChart2,
    Calendar as CalendarIcon,
    List,
    Trophy,
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
    Loader2,
    RefreshCw,
    ArrowUp,
    ArrowDown,
    Plus,
    Trash2,
    Edit3,
    X,
    Settings,
    Palette,
    Image,
    LogOut,
    User,
    Eye,
    EyeOff
} from 'lucide-react';
import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- Gemini API Configuration ---
const apiKey = "AIzaSyBVHOIcspWeLcH1Idq6QL2SbdMnTrt4YJ0"; // API Key injected by environment

// --- Types ---

type Habit = {
    id: string;
    name: string;
    icon: string;
    color: string;
    hideInStats?: boolean;
};

type RecordMap = {
    [date: string]: string[]; // date string (YYYY-MM-DD) -> array of habit IDs
};

// --- Constants & Defaults ---

const DEFAULT_HABITS: Habit[] = [
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

const ICONS: { [key: string]: React.ElementType } = {
    BookOpen, Video, ImageIcon, PenTool, Activity, Sunrise, Coffee, Home, Code, FileText, Check, List, BarChart2, CalendarIcon, Sparkles
};

const COLOR_PALETTE = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

const BACKGROUND_COLORS = [
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

// --- Helper Functions ---

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getPast7Days = (baseDate: Date) => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        days.push(d);
    }
    return days;
};

const getRelativeTime = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDaysNormalized = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDaysNormalized === 0) return '今日';
    if (diffDaysNormalized === 1) return '昨日';
    return `${diffDaysNormalized}日前`;
};

// --- Components ---

const IconDisplay = ({ iconName, className }: { iconName: string, className?: string }) => {
    const Icon = ICONS[iconName] || Activity;
    return <Icon className={className} />;
};

export default function App() {
    // --- State ---
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'stats'>('today');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
    const [records, setRecords] = useState<RecordMap>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('bg-slate-50');
    const [backgroundImage, setBackgroundImage] = useState('');

    // AI State
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // --- Effects ---

    // Auth & Data Sync
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Logged in: Sync with Firestore
                const userDocRef = doc(db, 'users', currentUser.uid);

                // Listen to real-time updates
                const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.habits) setHabits(data.habits);
                        if (data.records) setRecords(data.records);
                        if (data.aiAnalysis) setAiAnalysis(data.aiAnalysis);
                        if (data.settings) {
                            if (data.settings.backgroundColor !== undefined) setBackgroundColor(data.settings.backgroundColor);
                            if (data.settings.backgroundImage !== undefined) setBackgroundImage(data.settings.backgroundImage);
                        }
                        setIsLoaded(true);
                    } else {
                        // First time login or no data: Upload local data to Firestore
                        // (Simple migration strategy: just push what we have locally)
                        const initialData = {
                            habits,
                            records,
                            aiAnalysis,
                            settings: { backgroundColor, backgroundImage }
                        };
                        setDoc(userDocRef, initialData, { merge: true }).catch(err => console.error("Initial save failed", err));
                        setIsLoaded(true);
                    }
                });

                return () => unsubscribeSnapshot();
            } else {
                // Guest: Load from localStorage
                const savedRecords = localStorage.getItem('habit_tracker_records');
                const savedHabits = localStorage.getItem('habit_tracker_habits');
                const savedAnalysis = localStorage.getItem('habit_tracker_ai_analysis');
                const savedBg = localStorage.getItem('habit_tracker_bg_color');
                const savedBgImage = localStorage.getItem('habit_tracker_bg_image');

                if (savedRecords) setRecords(JSON.parse(savedRecords));
                if (savedHabits) setHabits(JSON.parse(savedHabits));
                if (savedAnalysis) setAiAnalysis(savedAnalysis);
                if (savedBg) setBackgroundColor(savedBg);
                if (savedBgImage) setBackgroundImage(savedBgImage);
                setIsLoaded(true);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Save data (Effect depends on auth state)
    useEffect(() => {
        if (!isLoaded) return;

        if (user) {
            // Save to Firestore
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, {
                habits,
                records,
                aiAnalysis: aiAnalysis || null,
                settings: { backgroundColor, backgroundImage }
            }, { merge: true }).catch(err => console.error("Save failed", err));
        } else {
            // Save to localStorage
            localStorage.setItem('habit_tracker_records', JSON.stringify(records));
            localStorage.setItem('habit_tracker_habits', JSON.stringify(habits));
            localStorage.setItem('habit_tracker_bg_color', backgroundColor);
            localStorage.setItem('habit_tracker_bg_image', backgroundImage);
            if (aiAnalysis) {
                localStorage.setItem('habit_tracker_ai_analysis', aiAnalysis);
            }
        }
    }, [records, habits, backgroundColor, backgroundImage, aiAnalysis, isLoaded, user]);


    // --- Handlers ---

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            setShowSettings(false);
        } catch (error) {
            console.error("Login failed", error);
            alert("ログインに失敗しました。");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.reload();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const toggleHabit = (dateStr: string, habitId: string) => {
        if (isEditing) return; // Disable toggling in edit mode
        setRecords(prev => {
            const currentHabits = prev[dateStr] || [];
            const isCompleted = currentHabits.includes(habitId);

            let newHabits;
            if (isCompleted) {
                newHabits = currentHabits.filter(id => id !== habitId);
            } else {
                newHabits = [...currentHabits, habitId];
            }

            return {
                ...prev,
                [dateStr]: newHabits
            };
        });
    };

    const toggleHabitVisibility = (id: string) => {
        setHabits(habits.map(h =>
            h.id === id ? { ...h, hideInStats: !h.hideInStats } : h
        ));
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    // Edit Handlers
    const addHabit = () => {
        if (!newHabitName.trim()) return;
        const newHabit: Habit = {
            id: `h${Date.now()}`,
            name: newHabitName,
            icon: 'Activity', // Default icon
            color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
        };
        setHabits([...habits, newHabit]);
        setNewHabitName('');
    };

    const confirmDeleteHabit = (id: string) => {
        setHabits(habits.filter(h => h.id !== id));
        setDeletingId(null);
    };

    const moveHabit = (index: number, direction: 'up' | 'down') => {
        const newHabits = [...habits];
        if (direction === 'up' && index > 0) {
            [newHabits[index], newHabits[index - 1]] = [newHabits[index - 1], newHabits[index]];
        } else if (direction === 'down' && index < newHabits.length - 1) {
            [newHabits[index], newHabits[index + 1]] = [newHabits[index + 1], newHabits[index]];
        }
        setHabits(newHabits);
    };

    // --- Gemini API Handler ---

    const generateAIReview = async () => {
        setIsAiLoading(true);
        setAiError(null);

        try {
            const past7Days = getPast7Days(new Date());
            const weekData = past7Days.map(d => {
                const dStr = formatDate(d);
                const completed = records[dStr] || [];
                const completedNames = completed.map(id => habits.find(h => h.id === id)?.name).filter(Boolean);
                return { date: dStr, completed: completedNames };
            });

            const prompt = `
        あなたは親切でモチベーションを上げるのが上手な「AI習慣コーチ」です。
        ユーザーの直近7日間の習慣トラッカーのデータをもとに、日本語で短いフィードバックを行ってください。

        【ユーザーの習慣リスト】
        ${habits.map(h => h.name).join(', ')}

        【直近7日間の実績】
        ${JSON.stringify(weekData)}

        【出力フォーマット】
        以下の3つのセクションで構成してください。マークダウン形式は使わず、プレーンテキストで見やすく改行してください。絵文字を効果的に使ってください。
        
        1. 👏 今週のGoodポイント
        (一番頑張った習慣や、継続できている点を具体的に褒める)
        
        2. 💡 気づきと分析
        (サボり気味な傾向や、曜日による偏りなどがあれば優しく指摘。なければ全体のバランスについてコメント)
        
        3. 🎯 来週のワンポイント・アドバイス
        (来週意識すると良い小さな目標や、モチベーションが上がる言葉)
      `;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                setAiAnalysis(text);
            } else {
                throw new Error('No content generated');
            }

        } catch (error) {
            console.error('Error fetching AI review:', error);
            setAiError('AIコーチの呼び出しに失敗しました。もう一度試してみてください。');
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- Analytics Logic ---

    const currentMonthStats = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);

        let totalPossible = daysInMonth * habits.length;
        let totalCompleted = 0;
        const habitCounts: { [key: string]: number } = {};

        habits.forEach(h => habitCounts[h.id] = 0);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRecords = records[dateStr] || [];
            totalCompleted += dayRecords.length;
            dayRecords.forEach(hId => {
                if (habitCounts[hId] !== undefined) {
                    habitCounts[hId]++;
                }
            });
        }

        return {
            totalPossible,
            totalCompleted,
            percentage: totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100),
            habitCounts
        };
    }, [currentDate, records, habits]);

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

    // --- Render Views ---

    const renderTodayView = () => {
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

                                    <button
                                        onClick={() => toggleHabitVisibility(habit.id)}
                                        className={`p-2 rounded-lg transition ${habit.hideInStats ? 'text-slate-400 bg-slate-100 hover:bg-slate-200' : 'text-blue-500 hover:bg-blue-50'}`}
                                        title={habit.hideInStats ? "分析リストに表示する" : "分析リストから隠す"}
                                    >
                                        {habit.hideInStats ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>

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

    const renderStatsView = () => {
        // Sort habits by completion count for the month
        const sortedHabits = [...habits].sort((a, b) => {
            return (currentMonthStats.habitCounts[b.id] || 0) - (currentMonthStats.habitCounts[a.id] || 0);
        });

        const maxCount = Math.max(...Object.values(currentMonthStats.habitCounts), 1);

        return (

            <div className="space-y-6">

                {/* Last Activity List */}
                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-slate-500" />
                        最終実施日リスト
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[...habits]
                            .filter(h => !h.hideInStats)
                            .map(habit => {
                                // Find last completed date
                                const allDates = Object.keys(records).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                                const lastDateStr = allDates.find(date => records[date]?.includes(habit.id));
                                return {
                                    ...habit,
                                    lastDate: lastDateStr ? new Date(lastDateStr) : null
                                };
                            })
                            .sort((a, b) => {
                                if (!a.lastDate) return 1;
                                if (!b.lastDate) return -1;
                                return b.lastDate.getTime() - a.lastDate.getTime();
                            })
                            .map(habit => (
                                <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${habit.color} bg-opacity-10 text-slate-600`}>
                                            <IconDisplay iconName={habit.icon} className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium text-slate-700">{habit.name}</span>
                                    </div>
                                    <div className="text-right">
                                        {habit.lastDate ? (
                                            <div>
                                                <span className="block text-xs font-bold text-slate-800">
                                                    {getRelativeTime(habit.lastDate)}
                                                </span>
                                                <span className="block text-[10px] text-slate-400">
                                                    {habit.lastDate.toLocaleDateString('ja-JP')}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">ー</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* AI Analysis Card */}
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

                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-100 text-center">
                    <h3 className="text-slate-500 text-sm font-medium mb-1">
                        {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月 の達成率
                    </h3>
                    <div className="text-4xl font-black text-slate-800 mb-2">
                        {currentMonthStats.percentage}<span className="text-2xl text-slate-400">%</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        全習慣の合計: {currentMonthStats.totalCompleted}回
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        習慣別ランキング
                    </h3>
                    <div className="space-y-4">
                        {sortedHabits.map((habit, idx) => {
                            const count = currentMonthStats.habitCounts[habit.id] || 0;
                            const barWidth = (count / maxCount) * 100;

                            return (
                                <div key={habit.id} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold w-4 ${idx < 3 ? 'text-yellow-600' : 'text-slate-400'}`}>#{idx + 1}</span>
                                            <span className="text-slate-700 font-medium">{habit.name}</span>
                                        </div>
                                        <span className="text-slate-500 font-bold">{count}回</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${idx < 3 ? 'bg-yellow-400' : 'bg-slate-300'}`}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderCalendarView = () => {
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

    return (
        <div
            className={`min-h-screen text-slate-800 font-sans pb-24 transition-colors duration-500 bg-cover bg-center bg-fixed`}
            style={{
                backgroundColor: backgroundImage ? 'transparent' : undefined,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            }}
        >
            {/* Background Color Layer (if no image) */}
            {!backgroundImage && (
                <div className={`fixed inset-0 -z-10 ${backgroundColor} transition-colors duration-500`} />
            )}

            {/* Overlay for readability if image is present */}
            {backgroundImage && (
                <div className="fixed inset-0 -z-10 bg-white/30 backdrop-blur-[2px]" />
            )}

            {/* Header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 px-4 py-4 shadow-sm">
                <div className="px-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">My Habit Tracker</h1>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-full transition ${showSettings ? 'bg-slate-100 text-slate-800' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            title="設定"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-2 rounded-full transition ${isEditing ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            title="リストを編集"
                        >
                            {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="mx-2 mt-4 p-4 bg-slate-50/95 backdrop-blur-sm rounded-xl border border-slate-200 animate-in slide-in-from-top-2 shadow-lg">

                        {/* Account Settings */}
                        <div className="mb-6 border-b border-slate-200 pb-6">
                            <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                アカウント設定
                            </h3>
                            {user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {user.displayName?.[0] || 'U'}
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-800">{user.displayName}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                        >
                                            <LogOut className="w-3 h-3" />
                                            ログアウト
                                        </button>
                                    </div>

                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                        <p className="text-xs text-amber-800 mb-2 font-medium">
                                            ⚠️ 同期がうまくいかない場合
                                        </p>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('現在のこの端末のデータで、クラウド上のデータを上書きしますか？\n（他の端末の未同期データは消える可能性があります）')) return;
                                                try {
                                                    const userDocRef = doc(db, 'users', user.uid);
                                                    await setDoc(userDocRef, {
                                                        habits,
                                                        records,
                                                        aiAnalysis,
                                                        settings: { backgroundColor, backgroundImage }
                                                    }, { merge: true });
                                                    alert('クラウドへの上書き保存が完了しました！\n他の端末で再読み込みして確認してください。');
                                                } catch (error) {
                                                    console.error("Force upload failed", error);
                                                    alert('保存に失敗しました。');
                                                }
                                            }}
                                            className="w-full bg-white hover:bg-amber-100 text-amber-700 text-xs font-bold py-2 px-3 rounded border border-amber-200 transition flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            この端末のデータをクラウドに強制アップロード
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                                    <p className="text-sm text-blue-800 mb-3 font-medium">
                                        Googleアカウントでログインすると、<br />複数デバイスでデータを同期できます。
                                    </p>
                                    <button
                                        onClick={handleLogin}
                                        className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-full text-sm shadow-sm border border-slate-200 transition flex items-center gap-2 mx-auto"
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                                        Googleでログイン
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                                <Image className="w-4 h-4" />
                                背景画像設定
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="画像のURLを入力 (例: https://source.unsplash.com/random)"
                                    value={backgroundImage}
                                    onChange={(e) => setBackgroundImage(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                                />
                                {backgroundImage && (
                                    <button
                                        onClick={() => setBackgroundImage('')}
                                        className="px-3 py-2 text-xs bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600 transition"
                                    >
                                        クリア
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                ※ インターネット上の画像URLを入力してください。画像を設定すると背景色は無効になります。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                背景カラー設定
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {BACKGROUND_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => {
                                            setBackgroundColor(color.value);
                                            setBackgroundImage(''); // Clear image when color is selected
                                        }}
                                        className={`
                      w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                      ${color.value.replace('bg-', 'bg-')}
                      ${backgroundColor === color.value && !backgroundImage ? 'border-slate-800 scale-110' : 'border-transparent'}
                    `}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="px-3 py-4">
                {activeTab === 'today' && renderTodayView()}
                {activeTab === 'calendar' && renderCalendarView()}
                {activeTab === 'stats' && renderStatsView()}
            </main>

            {/* Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 px-6 py-3 pb-safe z-20">
                <div className="max-w-md mx-auto flex justify-between items-center relative">
                    <button
                        onClick={() => setActiveTab('today')}
                        className={`flex flex-col items-center gap-1 transition ${activeTab === 'today' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="w-6 h-6" />
                        <span className="text-[10px] font-bold">記録</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('calendar');
                            setCurrentDate(new Date()); // Reset to current month when clicking tab
                        }}
                        className={`flex flex-col items-center gap-1 transition ${activeTab === 'calendar' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <CalendarIcon className="w-6 h-6" />
                        <span className="text-[10px] font-bold">カレンダー</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('stats');
                            setCurrentDate(new Date()); // Reset to current month stats
                        }}
                        className={`flex flex-col items-center gap-1 transition ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <BarChart2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">分析</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
