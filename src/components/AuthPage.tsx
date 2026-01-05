import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { PINSetup } from './PINSetup';
import { BiometricSetup } from './BiometricSetup';

interface AuthPageProps {
  onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const { setUser } = useAuthStore();

  // Create floating particles
  useEffect(() => {
    const interval = setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'auth-particle';
      particle.style.left = Math.random() * 100 + '%';
      const size = Math.random() * 5 + 2 + 'px';
      particle.style.width = size;
      particle.style.height = size;
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 20000);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Create sparkles on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.9) {
        const sparkle = document.createElement('div');
        sparkle.className = 'auth-sparkle';
        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setError('✉️ Please check your email to confirm your account. Check spam folder if needed.');
          setLoading(false);
          return;
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            subscription_tier: 'free',
            storage_used: 0,
          });
          // Show PIN setup for new users
          setShowPinSetup(true);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          setUser({
            id: data.user.id,
            email: data.user.email!,
            full_name: profile?.full_name,
            avatar_url: profile?.avatar_url,
            subscription_tier: profile?.subscription_tier || 'free',
            storage_used: profile?.storage_used || 0,
          });
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #9b87f5 0%, #7c63d4 50%, #6b4fc4 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Floating particles background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div style={{
        width: '100%',
        maxWidth: '550px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Feather Icon */}
        <div style={{
          animation: 'fadeIn 0.8s ease-out, float 6s infinite ease-in-out',
        }}>
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 4px 20px rgba(255, 255, 255, 0.3))',
            }}
          >
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
        </div>

        {/* Title */}
        <div style={{ 
          textAlign: 'center',
          animation: 'fadeIn 1s ease-out 0.2s backwards',
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '400',
            color: 'white',
            margin: 0,
            marginBottom: '20px',
            letterSpacing: '-0.5px',
            lineHeight: '1.2',
          }}>
            Write what your<br />heart whispers.
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}>
            <span style={{ opacity: 0.6 }}>✦</span>
            <span>Welcome</span>
            <span style={{ opacity: 0.6 }}>✦</span>
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          animation: 'fadeIn 1s ease-out 0.4s backwards',
        }}>
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            style={{
              padding: '18px 50px',
              fontSize: '20px',
              fontWeight: '600',
              color: 'white',
              background: isSignUp ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
              minWidth: '140px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSignUp ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)';
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            style={{
              padding: '18px 50px',
              fontSize: '20px',
              fontWeight: '600',
              color: 'white',
              background: isSignUp ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
              minWidth: '140px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSignUp ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)';
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleAuth}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            animation: 'fadeIn 1s ease-out 0.6s backwards',
          }}
        >
          {/* Full Name - Sign Up Only */}
          {isSignUp && (
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.5)" 
                  strokeWidth="1.5"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
                style={{
                  width: '100%',
                  padding: '22px 24px 22px 60px',
                  fontSize: '18px',
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '16px',
                  outline: 'none',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.5)" 
                strokeWidth="1.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
                <line x1="17.5" y1="15" x2="9" y2="15" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '22px 24px 22px 60px',
                fontSize: '18px',
                color: 'white',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '16px',
                outline: 'none',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.5)" 
                strokeWidth="1.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
                <line x1="17.5" y1="15" x2="9" y2="15" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '22px 24px 22px 60px',
                fontSize: '18px',
                color: 'white',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '16px',
                outline: 'none',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '22px',
              fontSize: '20px',
              fontWeight: '700',
              color: 'white',
              background: 'rgba(255, 255, 255, 0.25)',
              border: 'none',
              borderRadius: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? (
              'Please wait...'
            ) : isSignUp ? (
              <>
                <span style={{ fontSize: '20px' }}>✦</span>
                Create Account
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-15px) translateX(5px); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <PINSetup
          onComplete={() => {
            setShowPinSetup(false);
            setShowBiometricSetup(true);
          }}
          onSkip={() => {
            setShowPinSetup(false);
            onSuccess();
          }}
        />
      )}

      {/* Biometric Setup Modal */}
      {showBiometricSetup && (
        <BiometricSetup
          onComplete={() => {
            setShowBiometricSetup(false);
            onSuccess();
          }}
          onSkip={() => {
            setShowBiometricSetup(false);
            onSuccess();
          }}
        />
      )}
    </div>
  );
};

export default AuthPage;
