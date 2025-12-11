import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';

type ReadingActionDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddMore: () => void;
    onDelete: () => void;
};

export const ReadingActionDialog: React.FC<ReadingActionDialogProps> = ({
    isOpen,
    onClose,
    onAddMore,
    onDelete
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 text-center">
                    <h3 className="font-bold text-slate-800 mb-4">読書を追加しますか？</h3>
                    
                    <div className="space-y-2">
                        <button
                            onClick={onAddMore}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            追加で記録する
                        </button>
                        
                        <button
                            onClick={onDelete}
                            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition flex items-center justify-center gap-2 border border-red-200"
                        >
                            <Trash2 className="w-4 h-4" />
                            記録を削除
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
