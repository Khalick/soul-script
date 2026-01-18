import React, { useState } from 'react';
import { X, Lock, ArrowRight, Check } from 'lucide-react';
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

  const currentPin = step === 'create' ? pin : confirmPin;

  const handleNumberPress = (num: string) => {
    if (loading) return;
    setError('');

    if (step === 'create') {
      if (pin.length < 6) {
        setPin(pin + num);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(confirmPin + num);
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setError('');

    if (step === 'create') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleContinue = () => {
    if (pin.length !== 6) {
      setError('Please enter 6 digits');
      return;
    }
    setStep('confirm');
  };

  const handleSetPin = async () => {
    if (confirmPin.length !== 6) {
      setError('Please enter 6 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
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
      const pinHash = await hashPin(pin);
      const saved = await savePinToServer(user.id, pinHash);

      if (!saved) {
        throw new Error('Failed to save PIN');
      }

      const fingerprint = generateDeviceFingerprint();
      await addTrustedDevice(user.id, fingerprint, getDeviceName());

      setPinEnabled(true);
      setDeviceFingerprint(fingerprint);
      localStorage.setItem('soul-script-pin-hash', pinHash);

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

  const canProceed = step === 'create' ? pin.length === 6 : confirmPin.length === 6;

  return (
    <div
      className="pin-setup-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a2e',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 600, margin: 0 }}>
          {step === 'create' ? 'Create PIN' : 'Confirm PIN'}
        </h2>
        <button
          onClick={onSkip}
          disabled={loading}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* PIN Display Area */}
      <div style={{
        flex: '0 0 auto',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(224, 122, 95, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <Lock size={40} color="#E07A5F" />
        </div>

        <p style={{
          color: '#9ca3af',
          fontSize: '16px',
          textAlign: 'center',
          marginBottom: '24px',
          margin: '0 0 24px 0'
        }}>
          {step === 'create'
            ? 'Enter a 6-digit PIN to secure your journal'
            : 'Re-enter your PIN to confirm'}
        </p>

        {/* PIN Dots */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: i < currentPin.length ? '#E07A5F' : '#4b5563',
                background: i < currentPin.length ? '#E07A5F' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '8px',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Number Pad */}
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(15, 15, 25, 0.95)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          flex: 1,
          maxHeight: '320px',
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberPress(num.toString())}
              disabled={loading}
              style={{
                background: 'rgba(60, 60, 80, 0.8)',
                border: 'none',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70px',
              }}
            >
              {num}
            </button>
          ))}

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || currentPin.length === 0}
            style={{
              background: 'rgba(60, 60, 80, 0.8)',
              border: 'none',
              borderRadius: '16px',
              color: currentPin.length > 0 ? '#f87171' : '#6b7280',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70px',
              opacity: currentPin.length === 0 ? 0.5 : 1,
            }}
          >
            Delete
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleNumberPress('0')}
            disabled={loading}
            style={{
              background: 'rgba(60, 60, 80, 0.8)',
              border: 'none',
              borderRadius: '16px',
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70px',
            }}
          >
            0
          </button>

          {/* Empty space or can be used for something else */}
          <div style={{ minHeight: '70px' }} />
        </div>

        {/* Action Button - Continue or Set PIN */}
        <button
          type="button"
          onClick={step === 'create' ? handleContinue : handleSetPin}
          disabled={!canProceed || loading}
          style={{
            marginTop: '20px',
            padding: '18px',
            background: canProceed
              ? 'linear-gradient(135deg, #E07A5F 0%, #C9624A 100%)'
              : 'rgba(60, 60, 80, 0.5)',
            border: 'none',
            borderRadius: '16px',
            color: canProceed ? '#ffffff' : '#6b7280',
            fontSize: '18px',
            fontWeight: 700,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            'Saving...'
          ) : step === 'create' ? (
            <>
              Continue
              <ArrowRight size={22} />
            </>
          ) : (
            <>
              <Check size={22} />
              Set PIN
            </>
          )}
        </button>

        {/* Skip Link */}
        <button
          type="button"
          onClick={onSkip}
          disabled={loading}
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            fontSize: '16px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};
