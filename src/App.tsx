import { useState, useEffect } from 'react';
import {
    Activity,
    BarChart2,
    Calendar as CalendarIcon,
    List,
    Settings,
    Edit3,
    X,
} from 'lucide-react';
import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Components
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { StatsView } from './components/StatsView';
import { SettingsModal } from './components/SettingsModal';
import { ReadingLogModal } from './components/ReadingLogModal';

// Utils & Types & Constants
import { formatDate, getPast7Days } from './utils/dateUtils';
import type { Habit, RecordMap, ReadingLog } from './types';
import { DEFAULT_HABITS } from './constants';

// --- Gemini API Configuration ---
const apiKey = "AIzaSyBVHOIcspWeLcH1Idq6QL2SbdMnTrt4YJ0"; 

type Tab = 'today' | 'calendar' | 'stats';

export default function App() {
    // --- State ---
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('today');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
    const [records, setRecords] = useState<RecordMap>({});
    const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('bg-slate-50');
    const [backgroundImage, setBackgroundImage] = useState('');

    // Analysis Page State
    const [hiddenAnalysisIds, setHiddenAnalysisIds] = useState<string[]>([]);
    const [showStreaks, setShowStreaks] = useState(false);
    const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);

    // AI State
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Reading Log Modal State
    const [showReadingModal, setShowReadingModal] = useState(false);
    const [pendingReadingDate, setPendingReadingDate] = useState<string | null>(null);

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
                        if (data.readingLogs) setReadingLogs(data.readingLogs);
                        if (data.settings) {
                            if (data.settings.backgroundColor !== undefined) setBackgroundColor(data.settings.backgroundColor);
                            if (data.settings.backgroundImage !== undefined) setBackgroundImage(data.settings.backgroundImage);
                        }
                        setIsLoaded(true);
                    } else {
                        // First time login or no data: Upload local data to Firestore
                        const initialData = {
                            habits,
                            records,
                            readingLogs,
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
                const savedLogs = localStorage.getItem('habit_tracker_reading_logs');
                const savedAnalysis = localStorage.getItem('habit_tracker_ai_analysis');
                const savedBg = localStorage.getItem('habit_tracker_bg_color');
                const savedBgImage = localStorage.getItem('habit_tracker_bg_image');

                if (savedRecords) setRecords(JSON.parse(savedRecords));
                if (savedHabits) setHabits(JSON.parse(savedHabits));
                if (savedLogs) setReadingLogs(JSON.parse(savedLogs));
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
                readingLogs,
                settings: { backgroundColor, backgroundImage }
            }, { merge: true }).catch(err => console.error("Save failed", err));
        } else {
            // Save to localStorage
            localStorage.setItem('habit_tracker_records', JSON.stringify(records));
            localStorage.setItem('habit_tracker_habits', JSON.stringify(habits));
            localStorage.setItem('habit_tracker_reading_logs', JSON.stringify(readingLogs));
            localStorage.setItem('habit_tracker_bg_color', backgroundColor);
            localStorage.setItem('habit_tracker_bg_image', backgroundImage);
        }
    }, [records, habits, readingLogs, backgroundColor, backgroundImage, isLoaded, user]);

    // Save AI analysis separately
    useEffect(() => {
        if (aiAnalysis) {
            localStorage.setItem('habit_tracker_ai_analysis', aiAnalysis);
        }
    }, [aiAnalysis]);

    // Load Analysis Settings (Local only)
    useEffect(() => {
        const savedHidden = localStorage.getItem('habit_tracker_hidden_analysis_ids');
        const savedStreaks = localStorage.getItem('habit_tracker_show_streaks');
        if (savedHidden) setHiddenAnalysisIds(JSON.parse(savedHidden));
        if (savedStreaks) setShowStreaks(JSON.parse(savedStreaks));
    }, []);

    // Save Analysis Settings (Local only)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('habit_tracker_hidden_analysis_ids', JSON.stringify(hiddenAnalysisIds));
            localStorage.setItem('habit_tracker_show_streaks', JSON.stringify(showStreaks));
        }
    }, [hiddenAnalysisIds, showStreaks, isLoaded]);

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
        if (isEditing) return;
        
        // Reading Log Check Logic
        const habit = habits.find(h => h.id === habitId);
        // Assuming 'Reading' is identified by ID 'h1' or name '読書'
        // If ID is dynamically separated, name check is safer for guest default, but ID is 'h1' in default constant.
        const isReadingHabit = habitId === 'h1' || habit?.name === '読書';
        
        setRecords(prev => {
            const currentHabits = prev[dateStr] || [];
            const isCompleted = currentHabits.includes(habitId);

            if (!isCompleted && isReadingHabit) {
                setPendingReadingDate(dateStr);
                setShowReadingModal(true);
            }

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
    
    const handleSaveReadingLog = (logData: Omit<ReadingLog, 'id' | 'habitId' | 'date'>) => {
        if (!pendingReadingDate) return;
        
        const newLog: ReadingLog = {
            id: `log-${Date.now()}`,
            habitId: 'h1', 
            date: pendingReadingDate,
            ...logData
        };
        
        setReadingLogs(prev => [...prev, newLog]);
        setShowReadingModal(false);
        setPendingReadingDate(null);
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };
    const addHabit = () => {
        if (!newHabitName.trim()) return;
        const newHabit: Habit = {
            id: `h${Date.now()}`,
            name: newHabitName,
            icon: 'Activity', 
            color: 'bg-blue-500' 
        };
        const PALETTE = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
        newHabit.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                }
            );

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) setAiAnalysis(text);
            else throw new Error('No content generated');

        } catch (error) {
            console.error('Error fetching AI review:', error);
            setAiError('AIコーチの呼び出しに失敗しました。もう一度試してみてください。');
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen text-slate-800 font-sans pb-24 transition-colors duration-500 bg-cover bg-center bg-fixed`}
            style={{
                backgroundColor: backgroundImage ? 'transparent' : undefined,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            }}
        >
            {!backgroundImage && (
                <div className={`fixed inset-0 -z-10 ${backgroundColor} transition-colors duration-500`} />
            )}
            {backgroundImage && (
                <div className="fixed inset-0 -z-10 bg-white/30 backdrop-blur-[2px]" />
            )}

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

                {showSettings && (
                    <SettingsModal
                        user={user}
                        handleLogin={handleLogin}
                        handleLogout={handleLogout}
                        habits={habits}
                        records={records}
                        backgroundColor={backgroundColor}
                        setBackgroundColor={setBackgroundColor}
                        backgroundImage={backgroundImage}
                        setBackgroundImage={setBackgroundImage}
                    />
                )}
            </div>

            <main className="px-3 py-4">
                {activeTab === 'today' && (
                    <TodayView
                        currentDate={currentDate}
                        changeDate={changeDate}
                        habits={habits}
                        records={records}
                        isEditing={isEditing}
                        newHabitName={newHabitName}
                        setNewHabitName={setNewHabitName}
                        addHabit={addHabit}
                        deletingId={deletingId}
                        setDeletingId={setDeletingId}
                        confirmDeleteHabit={confirmDeleteHabit}
                        moveHabit={moveHabit}
                        toggleHabit={toggleHabit}
                    />
                )}
                {activeTab === 'calendar' && (
                    <CalendarView
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        setActiveTab={setActiveTab}
                        records={records}
                        habits={habits}
                    />
                )}
                {activeTab === 'stats' && (
                    <StatsView
                        habits={habits}
                        records={records}
                        // Reading Logs
                        readingLogs={readingLogs}
                         // AI Props
                        aiAnalysis={aiAnalysis}
                        isAiLoading={isAiLoading}
                        generateAIReview={generateAIReview}
                        aiError={aiError}
                        // Analysis Props
                        showStreaks={showStreaks}
                        setShowStreaks={setShowStreaks}
                        isEditingAnalysis={isEditingAnalysis}
                        setIsEditingAnalysis={setIsEditingAnalysis}
                        hiddenAnalysisIds={hiddenAnalysisIds}
                        setHiddenAnalysisIds={setHiddenAnalysisIds}
                    />
                )}
            </main>

            <ReadingLogModal 
                isOpen={showReadingModal}
                onClose={() => {
                    setShowReadingModal(false);
                    setPendingReadingDate(null);
                }}
                onSave={handleSaveReadingLog}
            />

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
                            setCurrentDate(new Date()); 
                        }}
                        className={`flex flex-col items-center gap-1 transition ${activeTab === 'calendar' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <CalendarIcon className="w-6 h-6" />
                        <span className="text-[10px] font-bold">カレンダー</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('stats');
                            setCurrentDate(new Date()); 
                        }}
                        className={`flex flex-col items-center gap-1 transition ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <BarChart2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold">分析</span>
                    </button>

                    <div className="absolute -bottom-2 right-0 left-0 text-center pointer-events-none">
                        <span className="text-[8px] text-slate-300">v1.1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
