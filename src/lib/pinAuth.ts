import bcrypt from 'bcryptjs';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';
import { supabase } from './supabase';

const SALT_ROUNDS = 10;

// PIN Hashing Functions
export const hashPin = async (pin: string): Promise<string> => {
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be exactly 6 digits');
  }
  return await bcrypt.hash(pin, SALT_ROUNDS);
};

export const verifyPin = async (pin: string, hash: string): Promise<boolean> => {
  if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return false;
  }
  return await bcrypt.compare(pin, hash);
};

// Session Token Encryption (using PIN as key)
export const encryptSessionToken = (token: string, pin: string): string => {
  // Simple XOR encryption (for demo - consider using crypto.subtle in production)
  const key = Array.from(pin).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const encrypted = token.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ key)
  ).join('');
  return btoa(encrypted);
};

export const decryptSessionToken = (encrypted: string, pin: string): string => {
  try {
    const key = Array.from(pin).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const decoded = atob(encrypted);
    const decrypted = decoded.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) ^ key)
    ).join('');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt session token:', error);
    return '';
  }
};

// Device Fingerprinting
export const generateDeviceFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ];
  
  const fingerprint = components.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

// Biometric Authentication (WebAuthn)
export const isBiometricAvailable = async (): Promise<boolean> => {
  if (!window.PublicKeyCredential) {
    return false;
  }
  
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Biometric check failed:', error);
    return false;
  }
};

export const enrollBiometric = async (userId: string, userEmail: string): Promise<string | null> => {
  try {
    const available = await isBiometricAvailable();
    if (!available) {
      throw new Error('Biometric authentication not available on this device');
    }

    // Create registration options
    const options: PublicKeyCredentialCreationOptionsJSON = {
      challenge: btoa(crypto.getRandomValues(new Uint8Array(32)).toString()),
      rp: {
        name: 'Soul Script',
        id: window.location.hostname,
      },
      user: {
        id: btoa(userId),
        name: userEmail,
        displayName: userEmail,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = await startRegistration({ optionsJSON: options });
    
    // Store credential ID in database
    const { error } = await supabase
      .from('users')
      .update({
        biometric_credential_id: credential.id,
        biometric_enabled: true,
      })
      .eq('id', userId);

    if (error) throw error;

    return credential.id;
  } catch (error: any) {
    console.error('Biometric enrollment failed:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error('Biometric enrollment was cancelled');
    }
    throw new Error('Failed to enroll biometric: ' + error.message);
  }
};

export const authenticateBiometric = async (credentialId: string): Promise<boolean> => {
  try {
    const options: PublicKeyCredentialRequestOptionsJSON = {
      challenge: btoa(crypto.getRandomValues(new Uint8Array(32)).toString()),
      allowCredentials: [{
        id: credentialId,
        type: 'public-key',
        transports: ['internal'],
      }],
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname,
    };

    await startAuthentication({ optionsJSON: options });
    
    // If we got here, authentication succeeded
    return true;
  } catch (error: any) {
    console.error('Biometric authentication failed:', error);
    if (error.name === 'NotAllowedError') {
      console.log('User cancelled biometric auth');
    }
    return false;
  }
};

// PIN Management with Supabase
export const savePinToServer = async (userId: string, pinHash: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        pin_hash: pinHash,
        pin_enabled: true,
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to save PIN to server:', error);
    return false;
  }
};

export const verifyPinWithServer = async (userId: string, pin: string): Promise<boolean> => {
  try {
    // Hash the PIN first
    const pinHash = await hashPin(pin);
    
    // Call Supabase function to verify
    const { data, error } = await supabase.rpc('verify_user_pin', {
      user_id_input: userId,
      pin_hash_input: pinHash,
    });

    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Failed to verify PIN with server:', error);
    return false;
  }
};

export const disablePin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        pin_hash: null,
        pin_enabled: false,
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to disable PIN:', error);
    return false;
  }
};

export const disableBiometric = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        biometric_credential_id: null,
        biometric_enabled: false,
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to disable biometric:', error);
    return false;
  }
};

// Device Management
export const addTrustedDevice = async (userId: string, fingerprint: string, name: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('add_trusted_device', {
      user_id_input: userId,
      device_fingerprint: fingerprint,
      device_name: name,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to add trusted device:', error);
    return false;
  }
};

export const removeTrustedDevice = async (userId: string, fingerprint: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('remove_trusted_device', {
      user_id_input: userId,
      device_fingerprint: fingerprint,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to remove trusted device:', error);
    return false;
  }
};

export const updateLastActivity = async (userId: string): Promise<void> => {
  try {
    await supabase.rpc('update_last_activity', {
      user_id_input: userId,
    });
  } catch (error) {
    console.error('Failed to update last activity:', error);
  }
};
