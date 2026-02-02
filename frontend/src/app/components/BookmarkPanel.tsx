import React from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, useBookmarks } from '../hooks/useBookmarks';
import { Trash2, Calendar, Sprout } from 'lucide-react';

interface BookmarkPanelProps {
    onSelect: (b: Bookmark) => void;
    className?: string;
}

export default function BookmarkPanel({ onSelect, className = "" }: BookmarkPanelProps) {
    const { bookmarks, removeBookmark } = useBookmarks();

    const [selectedForCompare, setSelectedForCompare] = React.useState<string[]>([]);
    const router = useRouter();

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedForCompare(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 3) return prev; // Max 3
            return [...prev, id];
        });
    };

    const handleCompare = () => {
        if (selectedForCompare.length < 2) return;
        const query = selectedForCompare.join(',');
        router.push(`/compare?ids=${query}`);
    };

    if (bookmarks.length === 0) {
        return (
            <div className={`p-4 text-slate-500 text-sm text-center italic ${className}`}>
                No saved analysis views.
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-center px-1 mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Saved Analysis ({bookmarks.length})
                </h3>
                {selectedForCompare.length >= 2 && (
                    <button
                        onClick={handleCompare}
                        className="text-[10px] bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-1 rounded font-bold animate-in fade-in"
                    >
                        Compare ({selectedForCompare.length})
                    </button>
                )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {bookmarks.map((b) => {
                    const isSelected = selectedForCompare.includes(b.id);
                    return (
                        <div
                            key={b.id}
                            className={`group border rounded-lg p-3 transition-colors relative ${isSelected
                                ? 'bg-indigo-900/20 border-indigo-500/50'
                                : 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/50'
                                }`}
                        >
                            <div
                                className="cursor-pointer"
                                onClick={() => onSelect(b)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onClick={(e) => toggleSelection(b.id, e)}
                                            className="accent-indigo-500 w-3 h-3 cursor-pointer"
                                            readOnly // handled by onClick
                                        />
                                        <h4 className="font-bold text-slate-200 text-sm">{b.district}</h4>
                                    </div>
                                    <span className="text-[10px] text-slate-500">{b.state}</span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-400 pl-5">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={10} />
                                        <span>{b.year}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Sprout size={10} />
                                        <span className="capitalize">{b.crop}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeBookmark(b.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove bookmark"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
