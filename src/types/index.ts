export type Habit = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

export type RecordMap = {
    [date: string]: string[]; // date string (YYYY-MM-DD) -> array of habit IDs
};

export type BookGenre = 'novel' | 'practical' | 'manga';
export type BookStatus = 'reading' | 'finished';

export type ReadingLog = {
    id: string;
    habitId: string;
    date: string;
    genre: BookGenre;
    status: BookStatus;
    title: string;
};
