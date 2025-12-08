# My Habit Tracker - 仕様書

**ドキュメント作成日**: 2024年12月8日  
**バージョン**: v1.1  
**技術スタック**: React 19 + TypeScript + Vite + Firebase

---

## 📋 目次

1. [概要](#概要)
2. [機能要件](#機能要件)
3. [データ構造](#データ構造)
4. [技術仕様](#技術仕様)
5. [画面構成](#画面構成)
6. [外部サービス連携](#外部サービス連携)

---

## 概要

「My Habit Tracker」は、ユーザーの習慣を記録・可視化するためのWebアプリケーションです。日々の習慣達成状況を記録し、カレンダービューやグラフで進捗を確認できます。また、AIコーチ機能により、習慣データを分析してモチベーション向上につながるフィードバックを受けることができます。

### ターゲットユーザー
- 習慣化を目指す個人ユーザー
- 日々のルーティンを可視化したい人
- 複数デバイスでデータを同期したい人

---

## 機能要件

### 1. 習慣管理機能

#### 1.1 習慣の記録 (CRUD)
| 機能 | 説明 |
|------|------|
| **習慣一覧表示** | 登録された習慣をグリッド形式で表示 |
| **習慣の完了/未完了切り替え** | タップ/クリックで当日の習慣達成状態をトグル |
| **習慣の追加** | 編集モードで新しい習慣を追加（名前を入力） |
| **習慣の削除** | 編集モードで既存の習慣を削除（確認ダイアログあり） |
| **習慣の並べ替え** | 編集モードで上下矢印ボタンで順序を変更 |

#### 1.2 日付ナビゲーション
| 機能 | 説明 |
|------|------|
| **日付移動** | 前日/翌日への移動（未来日付は今日まで制限） |
| **今日ラベル表示** | 当日の場合に「Today」バッジを表示 |

### 2. カレンダー機能

| 機能 | 説明 |
|------|------|
| **月間カレンダー表示** | 月ごとのカレンダーグリッドを表示 |
| **月移動** | 前月/翌月への移動 |
| **ヒートマップ表示** | 日ごとの達成度を色の濃さで表現（青系グラデーション） |
| **特定日への遷移** | カレンダーの日付をクリックで記録画面へ遷移 |

### 3. 分析・統計機能

| 機能 | 説明 |
|------|------|
| **最終実施日一覧** | 各習慣の最後に実施した日を一覧表示 |
| **連続達成日数（ストリーク）表示** | 連続で達成している日数を表示（トグル可能） |
| **習慣表示/非表示設定** | 分析画面上での表示項目をカスタマイズ |
| **週間推移グラフ** | 過去7日間の達成習慣数を棒グラフで表示 |

### 4. AI習慣コーチ機能

| 機能 | 説明 |
|------|------|
| **週間レビュー生成** | Gemini APIを使用して過去7日間のデータを分析 |
| **フィードバック内容** | Goodポイント、気づき・分析、来週のアドバイスの3セクション |
| **再生成機能** | 分析結果を再生成可能 |

### 5. ユーザー認証・データ同期

| 機能 | 説明 |
|------|------|
| **Googleログイン** | Firebase Authによるソーシャルログイン |
| **クラウド同期** | ログイン時にFirestoreへデータを自動保存・同期 |
| **ゲストモード** | 未ログイン時はlocalStorageにデータを保存 |
| **強制アップロード** | 同期問題時にローカルデータを強制的にクラウドへ上書き |

### 6. カスタマイズ機能

| 機能 | 説明 |
|------|------|
| **背景色設定** | 22色のプリセットカラーから選択 |
| **背景画像設定** | URLを入力してカスタム背景画像を設定 |

---

## データ構造

### 1. 型定義

\`\`\`typescript
// 習慣データ
type Habit = {
    id: string;        // 一意のID（例: "h1", "h1733570001234"）
    name: string;      // 習慣名（例: "読書"）
    icon: string;      // アイコン名（例: "BookOpen"）
    color: string;     // 背景色クラス（例: "bg-blue-500"）
};

// 記録データ
type RecordMap = {
    [date: string]: string[];  // キー: 日付文字列 "YYYY-MM-DD"
                                // 値: 完了した習慣IDの配列
};
\`\`\`

### 2. Firestoreデータ構造

\`\`\`
/users/{userId}/
├── habits: Habit[]              // 習慣リスト
├── records: RecordMap           // 記録データ
└── settings:                    // 設定
    ├── backgroundColor: string  // 背景色クラス
    └── backgroundImage: string  // 背景画像URL
\`\`\`

### 3. LocalStorageキー一覧

| キー | 型 | 説明 |
|------|------|------|
| \`habit_tracker_records\` | JSON string (RecordMap) | 習慣記録データ |
| \`habit_tracker_habits\` | JSON string (Habit[]) | 習慣リスト |
| \`habit_tracker_ai_analysis\` | string | AI分析結果テキスト |
| \`habit_tracker_bg_color\` | string | 背景色クラス名 |
| \`habit_tracker_bg_image\` | string | 背景画像URL |
| \`habit_tracker_hidden_analysis_ids\` | JSON string (string[]) | 分析画面で非表示の習慣IDリスト |
| \`habit_tracker_show_streaks\` | JSON string (boolean) | ストリーク表示フラグ |

### 4. デフォルト習慣一覧

| ID | 名前 | アイコン | 色 |
|----|------|----------|-----|
| h1 | 読書 | BookOpen | bg-blue-500 |
| h2 | 動画編集 | Video | bg-red-500 |
| h3 | 写真編集 | ImageIcon | bg-pink-500 |
| h4 | 日記 | PenTool | bg-yellow-500 |
| h5 | Drawthings | Activity | bg-purple-500 |
| h6 | 朝活 | Sunrise | bg-orange-500 |
| h7 | スタバで作業 | Coffee | bg-green-600 |
| h8 | 直帰 | Home | bg-teal-500 |
| h9 | プログラミング学習 | Code | bg-indigo-600 |
| h10 | note記事作成 | FileText | bg-emerald-500 |

### 5. 利用可能アイコン一覧

以下のLucide Reactアイコンが利用可能:
- \`BookOpen\`, \`Video\`, \`ImageIcon\`, \`PenTool\`, \`Activity\`
- \`Sunrise\`, \`Coffee\`, \`Home\`, \`Code\`, \`FileText\`
- \`Check\`, \`List\`, \`BarChart2\`, \`CalendarIcon\`, \`Sparkles\`

### 6. カラーパレット

#### 習慣カラー (17色)
\`\`\`
bg-red-500, bg-orange-500, bg-amber-500, bg-yellow-500,
bg-lime-500, bg-green-500, bg-emerald-500, bg-teal-500,
bg-cyan-500, bg-sky-500, bg-blue-500, bg-indigo-500,
bg-violet-500, bg-purple-500, bg-fuchsia-500, bg-pink-500, bg-rose-500
\`\`\`

#### 背景カラー (22色)
\`\`\`
bg-slate-50, bg-gray-50, bg-zinc-50, bg-neutral-50, bg-stone-50,
bg-red-50, bg-orange-50, bg-amber-50, bg-yellow-50, bg-lime-50,
bg-green-50, bg-emerald-50, bg-teal-50, bg-cyan-50, bg-sky-50,
bg-blue-50, bg-indigo-50, bg-violet-50, bg-purple-50, bg-fuchsia-50,
bg-pink-50, bg-rose-50
\`\`\`

---

## 技術仕様

### 依存パッケージ

| パッケージ | バージョン | 用途 |
|-----------|---------|------|
| react | ^19.2.0 | UIフレームワーク |
| react-dom | ^19.2.0 | ReactのDOM操作 |
| firebase | ^12.6.0 | 認証・データベース |
| lucide-react | ^0.555.0 | アイコンライブラリ |
| typescript | ~5.9.3 | 型システム |
| vite | ^7.2.4 | ビルドツール |

### React状態管理

| State | 型 | 説明 |
|-------|------|------|
| \`user\` | FirebaseUser \| null | ログインユーザー情報 |
| \`activeTab\` | 'today' \| 'calendar' \| 'stats' | 現在のタブ |
| \`currentDate\` | Date | 表示中の日付 |
| \`habits\` | Habit[] | 習慣リスト |
| \`records\` | RecordMap | 記録データ |
| \`isLoaded\` | boolean | データ読み込み完了フラグ |
| \`isEditing\` | boolean | 編集モードフラグ |
| \`newHabitName\` | string | 新規習慣名入力値 |
| \`deletingId\` | string \| null | 削除確認中の習慣ID |
| \`showSettings\` | boolean | 設定パネル表示フラグ |
| \`backgroundColor\` | string | 背景色クラス |
| \`backgroundImage\` | string | 背景画像URL |
| \`hiddenAnalysisIds\` | string[] | 非表示習慣IDリスト |
| \`showStreaks\` | boolean | ストリーク表示フラグ |
| \`isEditingAnalysis\` | boolean | 分析画面編集モード |
| \`aiAnalysis\` | string \| null | AI分析結果 |
| \`isAiLoading\` | boolean | AI処理中フラグ |
| \`aiError\` | string \| null | AIエラーメッセージ |

### 主要関数

| 関数名 | 説明 |
|--------|------|
| \`formatDate(date)\` | Date → "YYYY-MM-DD"形式の文字列変換 |
| \`getDaysInMonth(year, month)\` | 指定月の日数を取得 |
| \`getPast7Days(baseDate)\` | 基準日から過去7日間のDateリストを取得 |
| \`handleLogin()\` | Googleログイン処理 |
| \`handleLogout()\` | ログアウト処理 |
| \`toggleHabit(dateStr, habitId)\` | 習慣の完了/未完了を切り替え |
| \`changeDate(days)\` | 日付を移動 |
| \`addHabit()\` | 新規習慣を追加 |
| \`confirmDeleteHabit(id)\` | 習慣を削除 |
| \`moveHabit(index, direction)\` | 習慣の並び順を変更 |
| \`getLastDoneDate(habitId)\` | 最終実施日を取得 |
| \`getStreak(habitId)\` | 連続達成日数を計算 |
| \`generateAIReview()\` | Gemini APIでAI分析を実行 |

---

## 画面構成

### ナビゲーション

\`\`\`
┌────────────────────────────────────────────┐
│  [Logo] My Habit Tracker    [設定] [編集]  │  ← ヘッダー
├────────────────────────────────────────────┤
│                                            │
│              メインコンテンツ               │
│                                            │
├────────────────────────────────────────────┤
│    [記録]      [カレンダー]      [分析]     │  ← ボトムナビ
└────────────────────────────────────────────┘
\`\`\`

### 1. 記録タブ (\`today\`)
- 日付ナビゲーター
- 編集モードバナー（編集中のみ）
- 習慣グリッド（通常モード: レスポンシブ1-4列）
- 習慣リスト（編集モード: 1列）
- 新規習慣追加フォーム（編集モードのみ）

### 2. カレンダータブ (\`calendar\`)
- 月移動ナビゲーター
- 7×6グリッドカレンダー
- ヒートマップ凡例

### 3. 分析タブ (\`stats\`)
- AI習慣コーチカード
- 最終実施日リスト
- 週間推移グラフ

### 4. 設定パネル（オーバーレイ）
- アカウント設定セクション
  - ログイン/ログアウト
  - 強制アップロードボタン
- 背景画像設定
- 背景カラー設定

---

## 外部サービス連携

### 1. Firebase Authentication
- **認証プロバイダー**: Google
- **Project ID**: habit-tracker-b9b45
- **使用機能**: \`signInWithPopup\`, \`signOut\`, \`onAuthStateChanged\`

### 2. Cloud Firestore
- **データベースルール**: ユーザーごとにドキュメント分離
- **コレクション**: \`/users/{userId}\`
- **使用機能**: \`doc\`, \`setDoc\`, \`onSnapshot\`

### 3. Gemini API
- **モデル**: gemini-2.5-flash-preview-09-2025
- **エンドポイント**: \`https://generativelanguage.googleapis.com/v1beta/models/...\`
- **用途**: 週間習慣レビューの生成
- **プロンプト構成**:
  1. 習慣リスト
  2. 過去7日間の実績データ
  3. 出力フォーマット指定（3セクション構成）

---

## 今後の開発検討事項

### 機能拡張候補
1. [ ] 習慣のアイコン編集機能
2. [ ] 習慣のカラー編集機能
3. [ ] 月間/年間統計表示
4. [ ] 目標設定機能（週N回達成など）
5. [ ] リマインダー通知機能
6. [ ] データエクスポート機能
7. [ ] 習慣カテゴリ機能
8. [ ] ダークモード対応

### 技術改善候補
1. [ ] コンポーネント分割（App.tsxが1100行超え）
2. [ ] 状態管理ライブラリ導入（Zustand等）
3. [ ] テストコード追加
4. [ ] PWA対応
5. [ ] オフライン対応
6. [ ] パフォーマンス最適化（メモ化等）

---

*このドキュメントは現在のコードベースに基づいて自動生成されました。*
