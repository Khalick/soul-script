import React, { useState } from 'react';
import { Lock, Fingerprint, Key, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSecurityStore } from '../stores/securityStore';
import { verifyPin, authenticateBiometric } from '../lib/pinAuth';
import { supabase } from '../lib/supabase';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { user, setUser } = useAuthStore();
  const { unlockApp, biometricEnabled } = useSecurityStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [biometricError, setBiometricError] = useState('');

  const MAX_ATTEMPTS = 5;

  // Get stored PIN hash and biometric credential
  const [storedPinHash] = useState<string | null>(
    localStorage.getItem('soul-script-pin-hash')
  );
  const [biometricCredentialId] = useState<string | null>(
    user?.biometric_credential_id || null
  );

  const handlePinInput = (digit: string) => {
    setError('');
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 6) {
        verifyPinAndUnlock(newPin);
      }
    }
  };

  const handleDelete = () => {
    setError('');
    setPin(pin.slice(0, -1));
  };

  const verifyPinAndUnlock = async (enteredPin: string) => {
    setLoading(true);
    
    try {
      if (!storedPinHash) {
        setError('PIN not set up. Please use password to login.');
        setPin('');
        return;
      }

      // Verify PIN locally first (fast)
      const isValid = await verifyPin(enteredPin, storedPinHash);
      
      if (isValid) {
        // PIN correct - unlock
        unlockApp();
        onUnlock();
        setPin('');
        setAttempts(0);
      } else {
        // Wrong PIN
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setError(`Too many attempts. Please use your password to login.`);
          setShowPasswordLogin(true);
        } else {
          setError(`Wrong PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
        setPin('');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setError('Failed to verify PIN. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricCredentialId) {
      setBiometricError('Biometric not set up');
      return;
    }

    setLoading(true);
    setBiometricError('');

    try {
      const success = await authenticateBiometric(biometricCredentialId);
      
      if (success) {
        unlockApp();
        onUnlock();
        setAttempts(0);
      } else {
        setBiometricError('Biometric authentication failed. Please use PIN.');
      }
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      setBiometricError('Failed to authenticate. Please use PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            subscription_tier: profile.subscription_tier,
            storage_used: profile.storage_used,
          });
        }

        // Reset attempts and unlock
        setAttempts(0);
        unlockApp();
        onUnlock();
      }
    } catch (error: any) {
      setError(error.message || 'Wrong password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
      {/* Blurred Background Pattern - Warm Dusk */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full filter blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-300 rounded-full filter blur-[150px]" />
      </div>

      <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
        {/* Lock Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-300/20 flex items-center justify-center mb-6 border-2 border-primary-500/30">
          <Lock className="w-10 h-10 text-primary-400" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Soul Script Locked
        </h2>
        <p className="text-gray-400 text-center mb-8">
          {showPasswordLogin ? 'Enter your password' : 'Enter your PIN to unlock'}
        </p>

        {!showPasswordLogin ? (
          <>
            {/* PIN Dots */}
            <div className="flex justify-center gap-3 mb-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    i < pin.length
                      ? 'bg-primary-400 border-primary-400 scale-125 shadow-lg shadow-primary-400/50'
                      : 'border-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Biometric Error */}
            {biometricError && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm text-center">
                {biometricError}
              </div>
            )}

            {/* PIN Pad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  disabled={loading || attempts >= MAX_ATTEMPTS}
                  className="h-16 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-primary-500/50 text-white text-2xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleDelete}
                disabled={loading || attempts >= MAX_ATTEMPTS}
                className="h-16 rounded-xl bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 text-red-400 text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                ← Delete
              </button>
              <button
                onClick={() => handlePinInput('0')}
                disabled={loading || attempts >= MAX_ATTEMPTS}
                className="h-16 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-primary-500/50 text-white text-2xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg"
              >
                0
              </button>
              {biometricEnabled && biometricCredentialId ? (
                <button
                  onClick={handleBiometricAuth}
                  disabled={loading || attempts >= MAX_ATTEMPTS}
                  className="h-16 rounded-xl bg-gradient-to-r from-accent-400/20 to-secondary-300/20 hover:from-accent-400/30 hover:to-secondary-300/30 border border-accent-400/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  <Fingerprint className="w-7 h-7 text-accent-400" />
                </button>
              ) : (
                <div className="h-16" />
              )}
            </div>

            {/* Use Password Link */}
            <button
              onClick={() => setShowPasswordLogin(true)}
              className="w-full py-3 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Use Password Instead
            </button>
          </>
        ) : (
          /* Password Login Form */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-300 hover:from-primary-600 hover:to-secondary-400 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Verifying...
                </>
              ) : (
                'Unlock with Password'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPasswordLogin(false);
                setError('');
              }}
              className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to PIN
            </button>
          </form>
        )}

        {/* App Name */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          🌙 Soul Script
        </div>
      </div>
    </div>
  );
};
