import { supabase } from '../lib/supabase';
import { useOfflineStore } from '../stores/offlineStore';
import { useJournalStore } from '../stores/journalStore';

export const syncOfflineEntries = async (userId: string) => {
  const { offlineEntries, removeOfflineEntry, setSyncInProgress } = useOfflineStore.getState();
  const { addEntry } = useJournalStore.getState();

  const unsyncedEntries = offlineEntries.filter(e => !e.isSynced && e.user_id === userId);

  if (unsyncedEntries.length === 0) {
    return { success: true, synced: 0 };
  }

  console.log(`🔄 Syncing ${unsyncedEntries.length} offline entries...`);
  setSyncInProgress(true);

  let syncedCount = 0;
  const errors: string[] = [];

  for (const entry of unsyncedEntries) {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: entry.user_id,
          mood: entry.mood,
          intensity: entry.intensity,
          title: entry.title,
          text_content: entry.text_content,
          tags: entry.tags || [],
          is_public: entry.is_public,
          created_at: entry.created_at,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to journal store
      addEntry(data);
      
      // Remove from offline store
      removeOfflineEntry(entry.tempId);
      
      syncedCount++;
      console.log(`✅ Synced entry: ${entry.tempId}`);
    } catch (error: any) {
      console.error('Failed to sync entry:', entry.tempId, error);
      errors.push(entry.tempId);
    }
  }

  setSyncInProgress(false);

  console.log(`✅ Sync complete: ${syncedCount} synced, ${errors.length} failed`);

  return {
    success: errors.length === 0,
    synced: syncedCount,
    failed: errors.length,
    errors,
  };
};

export const setupOnlineListener = () => {
  const { setOnlineStatus } = useOfflineStore.getState();

  const updateOnlineStatus = () => {
    const online = navigator.onLine;
    setOnlineStatus(online);
    
    if (online) {
      console.log('🌐 Connection restored - starting auto-sync...');
      // Auto-sync when coming back online
      const userId = localStorage.getItem('supabase.auth.user')?.split('"id":"')[1]?.split('"')[0];
      if (userId) {
        setTimeout(() => syncOfflineEntries(userId), 1000); // Wait 1s for connection to stabilize
      }
    }
  };

  // Set initial status
  updateOnlineStatus();

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  return () => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  };
};
