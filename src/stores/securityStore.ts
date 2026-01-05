import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SecurityState {
  isLocked: boolean;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  lastActivity: number;
  deviceFingerprint: string | null;
  autoLockTimeout: number; // minutes
  isPWA: boolean;
  
  // Actions
  lockApp: () => void;
  unlockApp: () => void;
  updateActivity: () => void;
  setPinEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setDeviceFingerprint: (fingerprint: string) => void;
  setAutoLockTimeout: (minutes: number) => void;
  setIsPWA: (isPWA: boolean) => void;
  shouldAutoLock: () => boolean;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      isLocked: false,
      pinEnabled: false,
      biometricEnabled: false,
      lastActivity: Date.now(),
      deviceFingerprint: null,
      autoLockTimeout: 20, // 20 minutes default
      isPWA: false,

      lockApp: () => {
        console.log('🔒 Locking app');
        set({ isLocked: true });
      },

      unlockApp: () => {
        console.log('🔓 Unlocking app');
        set({ 
          isLocked: false,
          lastActivity: Date.now()
        });
      },

      updateActivity: () => {
        const now = Date.now();
        set({ lastActivity: now });
      },

      setPinEnabled: (enabled) => {
        console.log(`PIN ${enabled ? 'enabled' : 'disabled'}`);
        set({ pinEnabled: enabled });
      },

      setBiometricEnabled: (enabled) => {
        console.log(`Biometric ${enabled ? 'enabled' : 'disabled'}`);
        set({ biometricEnabled: enabled });
      },

      setDeviceFingerprint: (fingerprint) => {
        set({ deviceFingerprint: fingerprint });
      },

      setAutoLockTimeout: (minutes) => {
        set({ autoLockTimeout: minutes });
      },

      setIsPWA: (isPWA) => {
        set({ isPWA });
      },

      shouldAutoLock: () => {
        const state = get();
        if (!state.isPWA || !state.pinEnabled) {
          return false;
        }
        
        const now = Date.now();
        const timeSinceLastActivity = now - state.lastActivity;
        const timeoutMs = state.autoLockTimeout * 60 * 1000;
        
        return timeSinceLastActivity > timeoutMs;
      },
    }),
    {
      name: 'soul-script-security',
      partialize: (state) => ({
        pinEnabled: state.pinEnabled,
        biometricEnabled: state.biometricEnabled,
        deviceFingerprint: state.deviceFingerprint,
        autoLockTimeout: state.autoLockTimeout,
        // Don't persist isLocked or lastActivity
      }),
    }
  )
);
