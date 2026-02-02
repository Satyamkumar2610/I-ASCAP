import { useState, useEffect } from 'react';

export interface Bookmark {
    id: string;
    district: string;
    state: string;
    year: number;
    crop: string;
    timestamp: number;
}

const STORAGE_KEY = 'i-ascap-bookmarks';

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setBookmarks(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse bookmarks", e);
            }
        }
    }, []);

    // Save to LocalStorage whenever bookmarks change
    useEffect(() => {
        if (bookmarks.length > 0) { // Avoid clearing on initial load
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        } else if (localStorage.getItem(STORAGE_KEY)) {
            // If array is empty but key exists, it means user deleted all
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
    }, [bookmarks]);

    const addBookmark = (district: string, state: string, year: number, crop: string) => {
        const newBookmark: Bookmark = {
            id: `${district}-${year}-${crop}`,
            district,
            state,
            year,
            crop,
            timestamp: Date.now(),
        };

        setBookmarks(prev => {
            if (prev.some(b => b.id === newBookmark.id)) return prev; // Dedup
            return [newBookmark, ...prev];
        });
    };

    const removeBookmark = (id: string) => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const isBookmarked = (district: string, year: number, crop: string) => {
        const id = `${district}-${year}-${crop}`;
        return bookmarks.some(b => b.id === id);
    };

    return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
