import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  mood: string;
  intensity: number;
  title?: string;
  text_content?: string;
  tags: string[];
  is_public: boolean;
  is_crisis_moment: boolean;
  is_breakthrough: boolean;
  media?: MediaAttachment[];
}

export interface MediaAttachment {
  id: string;
  entry_id: string;
  type: 'photo' | 'video' | 'audio';
  url: string;
  thumbnail_url?: string;
  duration?: number;
  size_bytes: number;
  blur_faces: boolean;
}

interface JournalState {
  entries: JournalEntry[];
  currentEntry: Partial<JournalEntry> | null;
  isLoading: boolean;
  setEntries: (entries: JournalEntry[]) => void;
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  setCurrentEntry: (entry: Partial<JournalEntry> | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      currentEntry: null,
      isLoading: false,
      setEntries: (entries) => set({ entries }),
      addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      setCurrentEntry: (entry) => set({ currentEntry: entry }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'soul-script-journal',
    }
  )
);
