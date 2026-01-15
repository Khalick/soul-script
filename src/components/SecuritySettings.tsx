import React, { useState, useEffect } from 'react';
import { Shield, Lock, Fingerprint, Clock, Smartphone, Trash2, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSecurityStore } from '../stores/securityStore';
import { disablePin, disableBiometric, removeTrustedDevice, isBiometricAvailable } from '../lib/pinAuth';
import { supabase } from '../lib/supabase';
import { PINSetup } from './PINSetup';
import { BiometricSetup } from './BiometricSetup';

export const SecuritySettings: React.FC = () => {
  const { user } = useAuthStore();
  const { pinEnabled, biometricEnabled, setPinEnabled, setBiometricEnabled, setAutoLockTimeout, autoLockTimeout, deviceFingerprint } = useSecurityStore();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrustedDevices();
    }
    checkBiometricAvailability();
  }, [user]);

  const checkBiometricAvailability = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);
  };

  const loadTrustedDevices = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('users')
      .select('trusted_devices')
      .eq('id', user.id)
      .single();

    if (data && data.trusted_devices) {
      setTrustedDevices(data.trusted_devices);
    }
  };

  const handleDisablePin = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to disable PIN? You will need to use your password to unlock the app.')) return;

    setLoading(true);
    try {
      const success = await disablePin(user.id);
      if (success) {
        setPinEnabled(false);
        localStorage.removeItem('soul-script-pin-hash');
        setMessage({ type: 'success', text: 'PIN disabled successfully' });
      } else {
        throw new Error('Failed to disable PIN');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disable PIN. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDisableBiometric = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to disable biometric authentication?')) return;

    setLoading(true);
    try {
      const success = await disableBiometric(user.id);
      if (success) {
        setBiometricEnabled(false);
        setMessage({ type: 'success', text: 'Biometric authentication disabled' });
      } else {
        throw new Error('Failed to disable biometric');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disable biometric. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRemoveDevice = async (fingerprint: string) => {
    if (!user) return;
    if (!confirm('Remove this device from trusted list?')) return;

    setLoading(true);
    try {
      const success = await removeTrustedDevice(user.id, fingerprint);
      if (success) {
        setMessage({ type: 'success', text: 'Device removed successfully' });
        loadTrustedDevices();
      } else {
        throw new Error('Failed to remove device');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove device. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleTimeoutChange = async (minutes: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ auto_lock_timeout: minutes })
        .eq('id', user.id);

      if (error) throw error;

      setAutoLockTimeout(minutes);
      setMessage({ type: 'success', text: `Auto-lock timeout set to ${minutes} minutes` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update timeout. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-300/20 flex items-center justify-center border-2 border-primary-500/30">
          <Shield className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Security & Privacy</h2>
          <p className="text-gray-400 text-sm">Manage your app security settings</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-500/20 border-green-500/50 text-green-400'
            : 'bg-red-500/20 border-red-500/50 text-red-400'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* PIN Protection */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-white">PIN Protection</h3>
              <p className="text-gray-400 text-sm mt-1">
                Quick unlock with a 6-digit PIN
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            pinEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
          }`}>
            {pinEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {pinEnabled ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowPinSetup(true)}
              className="w-full py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-all"
            >
              Change PIN
            </button>
            <button
              onClick={handleDisablePin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 transition-all disabled:opacity-50"
            >
              Disable PIN
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPinSetup(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-300 hover:from-primary-600 hover:to-secondary-400 text-white font-semibold transition-all"
          >
            Enable PIN Protection
          </button>
        )}
      </div>

      {/* Biometric Authentication */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Fingerprint className="w-6 h-6 text-accent-400 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-white">Biometric Unlock</h3>
              <p className="text-gray-400 text-sm mt-1">
                Use fingerprint or face ID
              </p>
              {!biometricAvailable && (
                <p className="text-yellow-400 text-xs mt-2">⚠️ Not available on this device</p>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            biometricEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
          }`}>
            {biometricEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {biometricEnabled ? (
          <button
            onClick={handleDisableBiometric}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 transition-all disabled:opacity-50"
          >
            Disable Biometric
          </button>
        ) : (
          <button
            onClick={() => setShowBiometricSetup(true)}
            disabled={!biometricAvailable || !pinEnabled}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-400 to-accent-500 hover:from-accent-500 hover:to-accent-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!pinEnabled ? 'Enable PIN First' : 'Enable Biometric'}
          </button>
        )}
      </div>

      {/* Auto-Lock Timeout */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start gap-3 mb-4">
          <Clock className="w-6 h-6 text-secondary-300 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">Auto-Lock Timeout</h3>
            <p className="text-gray-400 text-sm mt-1">
              Lock app after inactivity (PWA only)
            </p>
          </div>
        </div>

        <select
          value={autoLockTimeout}
          onChange={(e) => handleTimeoutChange(Number(e.target.value))}
          disabled={loading || !pinEnabled}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
        >
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={20}>20 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
        </select>
      </div>

      {/* Trusted Devices */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start gap-3 mb-4">
          <Smartphone className="w-6 h-6 text-secondary-300 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-white">Trusted Devices</h3>
            <p className="text-gray-400 text-sm mt-1">
              Devices where you've enabled PIN
            </p>
          </div>
        </div>

        {trustedDevices.length > 0 ? (
          <div className="space-y-2">
            {trustedDevices.map((device: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">{device.name}</p>
                    <p className="text-gray-400 text-xs">
                      Added {new Date(device.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  {device.fingerprint === deviceFingerprint && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      This Device
                    </span>
                  )}
                </div>
                {device.fingerprint !== deviceFingerprint && (
                  <button
                    onClick={() => handleRemoveDevice(device.fingerprint)}
                    disabled={loading}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No trusted devices yet</p>
        )}
      </div>

      {/* Modals */}
      {showPinSetup && (
        <PINSetup
          onComplete={() => {
            setShowPinSetup(false);
            loadTrustedDevices();
          }}
          onSkip={() => setShowPinSetup(false)}
        />
      )}

      {showBiometricSetup && (
        <BiometricSetup
          onComplete={() => setShowBiometricSetup(false)}
          onSkip={() => setShowBiometricSetup(false)}
        />
      )}
    </div>
  );
};
