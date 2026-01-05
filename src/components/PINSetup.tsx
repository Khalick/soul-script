import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSecurityStore } from '../stores/securityStore';
import { hashPin, savePinToServer, generateDeviceFingerprint, addTrustedDevice } from '../lib/pinAuth';

interface PINSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const PINSetup: React.FC<PINSetupProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuthStore();
  const { setPinEnabled, setDeviceFingerprint } = useSecurityStore();
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinInput = (digit: string) => {
    setError('');
    
    if (step === 'create') {
      if (pin.length < 6) {
        setPin(pin + digit);
        if (pin.length === 5) {
          setTimeout(() => setStep('confirm'), 300);
        }
      }
    } else {
      if (confirmPin.length < 6) {
        const newConfirm = confirmPin + digit;
        setConfirmPin(newConfirm);
        
        if (newConfirm.length === 6) {
          validateAndSavePin(pin, newConfirm);
        }
      }
    }
  };

  const handleDelete = () => {
    setError('');
    if (step === 'create') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const validateAndSavePin = async (originalPin: string, confirmedPin: string) => {
    if (originalPin !== confirmedPin) {
      setError('PINs do not match. Try again.');
      setStep('create');
      setPin('');
      setConfirmPin('');
      return;
    }

    if (!user) {
      setError('User not found. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      // Hash the PIN
      const pinHash = await hashPin(originalPin);
      
      // Save to server
      const saved = await savePinToServer(user.id, pinHash);
      
      if (!saved) {
        throw new Error('Failed to save PIN');
      }

      // Generate device fingerprint and add as trusted device
      const fingerprint = generateDeviceFingerprint();
      await addTrustedDevice(user.id, fingerprint, getDeviceName());
      
      // Update local state
      setPinEnabled(true);
      setDeviceFingerprint(fingerprint);
      
      // Store PIN hash locally for quick verification
      localStorage.setItem('soul-script-pin-hash', pinHash);
      
      console.log('✅ PIN setup complete');
      onComplete();
    } catch (error: any) {
      console.error('PIN setup error:', error);
      setError('Failed to save PIN. Please try again.');
      setStep('create');
      setPin('');
      setConfirmPin('');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceName = (): string => {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Android/i.test(ua)) return 'Android Device';
    if (/Mac/i.test(ua)) return 'Mac';
    if (/Windows/i.test(ua)) return 'Windows PC';
    return 'Unknown Device';
  };

  const currentPin = step === 'create' ? pin : confirmPin;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-cyan-500/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Secure Your Journal</h2>
              <p className="text-gray-400 text-sm">
                {step === 'create' ? 'Create a 6-digit PIN' : 'Confirm your PIN'}
              </p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PIN Display Dots */}
        <div className="flex justify-center gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < currentPin.length
                  ? 'bg-cyan-400 border-cyan-400 scale-110'
                  : 'border-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mb-4 p-3 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm text-center flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent" />
            Setting up your PIN...
          </div>
        )}

        {/* PIN Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinInput(num.toString())}
              disabled={loading}
              className="h-16 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-2xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="h-16 rounded-xl bg-gray-800 hover:bg-red-500/20 text-red-400 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            ← Delete
          </button>
          <button
            onClick={() => handlePinInput('0')}
            disabled={loading}
            className="h-16 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-2xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={onSkip}
            disabled={loading}
            className="h-16 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            Skip
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-gray-400 text-sm">
          <p className="mb-2">🔒 Your PIN is encrypted and stored securely</p>
          <p>You can always enable this later in Settings</p>
        </div>
      </div>
    </div>
  );
};
