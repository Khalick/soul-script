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
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === 6) {
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

  // Button press handler with touch support
  const handleButtonPress = (digit: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handlePinInput(digit);
  };

  const handleDeletePress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelete();
  };

  const handleSkipPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSkip();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(26, 26, 46, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header Section - Top 35% */}
      <div
        className="flex flex-col items-center justify-center px-6"
        style={{ height: '35%' }}
      >
        <button
          onClick={handleSkipPress}
          onTouchEnd={handleSkipPress}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
          disabled={loading}
          style={{ touchAction: 'manipulation' }}
        >
          <X className="w-8 h-8" />
        </button>

        <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary-400" />
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Secure Your Journal
        </h2>
        <p className="text-gray-400 text-lg text-center">
          {step === 'create' ? 'Create a 6-digit PIN' : 'Confirm your PIN'}
        </p>

        {/* PIN Display Dots */}
        <div className="flex justify-center gap-4 mt-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${i < currentPin.length
                  ? 'bg-primary-400 border-primary-400 scale-110'
                  : 'border-gray-600'
                }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-4 px-4 py-2 bg-primary-500/20 border border-primary-500/50 rounded-lg text-primary-400 text-sm text-center flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-400 border-t-transparent" />
            Setting up your PIN...
          </div>
        )}
      </div>

      {/* PIN Pad Section - Bottom 65% - Full Width */}
      <div
        className="flex-1 w-full px-4 pb-8"
        style={{
          background: 'rgba(20, 20, 35, 0.95)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* PIN Pad Grid - Full Width */}
        <div
          className="grid grid-cols-3 gap-3 pt-6 h-full"
          style={{ maxHeight: 'calc(100% - 60px)' }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={handleButtonPress(num.toString())}
              onTouchEnd={handleButtonPress(num.toString())}
              disabled={loading}
              className="rounded-2xl bg-gray-800/80 hover:bg-gray-700 active:bg-primary-500/30 text-white text-3xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
              style={{
                minHeight: '70px',
                height: '100%',
                maxHeight: '90px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDeletePress}
            onTouchEnd={handleDeletePress}
            disabled={loading}
            className="rounded-2xl bg-gray-800/80 hover:bg-red-500/20 active:bg-red-500/40 text-red-400 text-lg font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
            style={{
              minHeight: '70px',
              height: '100%',
              maxHeight: '90px',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
            ← Delete
          </button>
          <button
            onClick={handleButtonPress('0')}
            onTouchEnd={handleButtonPress('0')}
            disabled={loading}
            className="rounded-2xl bg-gray-800/80 hover:bg-gray-700 active:bg-primary-500/30 text-white text-3xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
            style={{
              minHeight: '70px',
              height: '100%',
              maxHeight: '90px',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
            0
          </button>
          <button
            onClick={handleSkipPress}
            onTouchEnd={handleSkipPress}
            disabled={loading}
            className="rounded-2xl bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 text-gray-400 text-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
            style={{
              minHeight: '70px',
              height: '100%',
              maxHeight: '90px',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
            Skip
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-gray-500 text-sm mt-4">
          <p>🔒 Your PIN is encrypted and stored securely</p>
        </div>
      </div>
    </div>
  );
};
