import React from 'react';
import { User, LogOut, RefreshCw, Image, Palette } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Habit, RecordMap } from '../types';
import { BACKGROUND_COLORS } from '../constants';

type SettingsModalProps = {
    user: FirebaseUser | null;
    handleLogin: () => void;
    handleLogout: () => void;
    habits: Habit[];
    records: RecordMap;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    backgroundImage: string;
    setBackgroundImage: (image: string) => void;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
    user,
    handleLogin,
    handleLogout,
    habits,
    records,
    backgroundColor,
    setBackgroundColor,
    backgroundImage,
    setBackgroundImage
}) => {
    return (
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
    );
};
