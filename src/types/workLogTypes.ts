/**
 * Work Log Types
 * Types for the daily work/activity logging feature
 */

/** 3-level intensity for work activities */
export type WorkAmountLevel = 1 | 2 | 3;

/** User-configurable work tag definition */
export type WorkTag = {
  id: string;        // stable key, must never change once created
  label: string;     // display label (Japanese), can be edited
  order: number;     // order for UI sorting
  isActive: boolean; // whether to show in record UI
};

/** Daily work logs - map of dates to tag levels */
export type DailyWorkLog = {
  [date: string]: {
    [tagId: string]: WorkAmountLevel;
  };
};

/** Helper to cycle through work amount levels */
export function nextWorkLevel(current?: WorkAmountLevel): WorkAmountLevel | undefined {
  if (!current) return 1;     // OFF → 1
  if (current === 1) return 2;
  if (current === 2) return 3;
  return undefined;           // 3 → OFF
}

/** Work amount level labels in Japanese */
export const WORK_LEVEL_LABELS: Record<WorkAmountLevel, string> = {
  1: '少し',
  2: '普通',
  3: 'がっつり',
};
