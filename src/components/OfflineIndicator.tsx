import React, { useState } from 'react';
import { useOfflineStore } from '../stores/offlineStore';
import { WifiOff, Cloud, CloudOff } from 'lucide-react';
import { syncOfflineEntries } from '../lib/offlineSync';
import { useAuthStore } from '../stores/authStore';
import { SyncSuccess } from './SyncSuccess';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, getUnsyncedCount, syncInProgress } = useOfflineStore();
  const { user } = useAuthStore();
  const unsyncedCount = getUnsyncedCount();
  const [showSyncSuccess, setShowSyncSuccess] = useState<number | null>(null);

  const handleManualSync = async () => {
    if (user && isOnline) {
      const result = await syncOfflineEntries(user.id);
      if (result.success) {
        setShowSyncSuccess(result.synced);
      } else {
        alert(`⚠️ Synced ${result.synced} entries, ${result.failed} failed.`);
      }
    }
  };

  if (!isOnline) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(239, 68, 68, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out',
      }}>
        <WifiOff size={20} color="white" />
        <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
          Offline Mode
        </span>
        {unsyncedCount > 0 && (
          <span style={{
            background: 'rgba(255, 255, 255, 0.3)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            color: 'white'
          }}>
            {unsyncedCount} unsynced
          </span>
        )}
      </div>
    );
  }

  if (unsyncedCount > 0) {
    return (
      <button
        onClick={handleManualSync}
        disabled={syncInProgress}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: syncInProgress 
            ? 'rgba(234, 179, 8, 0.95)' 
            : 'rgba(34, 197, 94, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '12px 20px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: syncInProgress 
            ? '0 4px 20px rgba(234, 179, 8, 0.4)' 
            : '0 4px 20px rgba(34, 197, 94, 0.4)',
          zIndex: 1000,
          border: 'none',
          cursor: syncInProgress ? 'wait' : 'pointer',
          transition: 'all 0.3s',
          animation: 'fadeIn 0.3s ease-out',
        }}
        onMouseEnter={(e) => {
          if (!syncInProgress) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {syncInProgress ? (
          <Cloud size={20} color="white" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
        ) : (
          <CloudOff size={20} color="white" />
        )}
        <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
          {syncInProgress ? 'Syncing...' : `Sync ${unsyncedCount} entries`}
        </span>
      </button>
    );
  }

  return (
    <>
      {showSyncSuccess && (
        <SyncSuccess count={showSyncSuccess} onClose={() => setShowSyncSuccess(null)} />
      )}
    </>
  );
};
