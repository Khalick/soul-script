import React, { useState } from 'react';
import { Fingerprint, X, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSecurityStore } from '../stores/securityStore';
import { isBiometricAvailable, enrollBiometric } from '../lib/pinAuth';

interface BiometricSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const BiometricSetup: React.FC<BiometricSetupProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuthStore();
  const { setBiometricEnabled } = useSecurityStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleEnableBiometric = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Check if biometric is available
      setChecking(true);
      const available = await isBiometricAvailable();
      setChecking(false);

      if (!available) {
        setError('Biometric authentication is not available on this device. You can use PIN instead.');
        return;
      }

      // Enroll biometric
      const credentialId = await enrollBiometric(user.id, user.email);
      
      if (credentialId) {
        setBiometricEnabled(true);
        console.log('✅ Biometric enrolled successfully');
        onComplete();
      } else {
        throw new Error('Failed to enroll biometric');
      }
    } catch (error: any) {
      console.error('Biometric setup error:', error);
      
      if (error.message.includes('cancelled')) {
        setError('Biometric setup was cancelled. You can enable it later in Settings.');
      } else {
        setError(error.message || 'Failed to set up biometric. You can try again later in Settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-purple-500/20 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <Fingerprint className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Enable Biometric Unlock
            </h2>
            <p className="text-gray-400 text-center">
              Use your fingerprint or face ID for quick and secure access
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Faster Unlock</p>
              <p className="text-gray-400 text-sm">Access your journal instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Extra Security</p>
              <p className="text-gray-400 text-sm">Your biometric data never leaves your device</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">PIN Fallback</p>
              <p className="text-gray-400 text-sm">You can always use your PIN if needed</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Checking Status */}
        {checking && (
          <div className="mb-4 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent" />
            Checking device compatibility...
          </div>
        )}

        {/* Loading Status */}
        {loading && !checking && (
          <div className="mb-4 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent" />
            Please authenticate with your device...
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-all disabled:opacity-50"
          >
            Skip for Now
          </button>
          <button
            onClick={handleEnableBiometric}
            disabled={loading || checking}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading || checking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Setting up...
              </>
            ) : (
              <>
                <Fingerprint className="w-5 h-5" />
                Enable
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-gray-400 text-xs">
          <p>You can enable or disable this anytime in Settings</p>
        </div>
      </div>
    </div>
  );
};
