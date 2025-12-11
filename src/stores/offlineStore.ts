import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineEntry {
  id: string;
  tempId: string;
  user_id: string;
  mood: string;
  intensity: number;
  title?: string;
  text_content?: string;
  tags?: string[];
  is_public: boolean;
  created_at: string;
  isSynced: boolean;
}

interface OfflineState {
  offlineEntries: OfflineEntry[];
  isOnline: boolean;
  syncInProgress: boolean;
  addOfflineEntry: (entry: OfflineEntry) => void;
  removeOfflineEntry: (tempId: string) => void;
  markAsSynced: (tempId: string) => void;
  setOnlineStatus: (status: boolean) => void;
  setSyncInProgress: (status: boolean) => void;
  getUnsyncedCount: () => number;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      offlineEntries: [],
      isOnline: navigator.onLine,
      syncInProgress: false,

      addOfflineEntry: (entry) => {
        set((state) => ({
          offlineEntries: [...state.offlineEntries, entry],
        }));
      },

      removeOfflineEntry: (tempId) => {
        set((state) => ({
          offlineEntries: state.offlineEntries.filter((e) => e.tempId !== tempId),
        }));
      },

      markAsSynced: (tempId) => {
        set((state) => ({
          offlineEntries: state.offlineEntries.map((e) =>
            e.tempId === tempId ? { ...e, isSynced: true } : e
          ),
        }));
      },

      setOnlineStatus: (status) => {
        set({ isOnline: status });
      },

      setSyncInProgress: (status) => {
        set({ syncInProgress: status });
      },

      getUnsyncedCount: () => {
        return get().offlineEntries.filter((e) => !e.isSynced).length;
      },
    }),
    {
      name: 'soul-script-offline',
    }
  )
);
