import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface AuthPageProps {
  onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            subscription_tier: 'free',
            storage_used: 0,
          });
          onSuccess();
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
    <div className="auth-page">
      {/* Floating orbs */}
      <div className="auth-orb auth-orb1"></div>
      <div className="auth-orb auth-orb2"></div>
      <div className="auth-orb auth-orb3"></div>

      <div className="auth-container">
        <div className="auth-heart-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        
        <h1 className="auth-title">Your Safe Space to Feel Everything</h1>
        <p className="auth-subtitle">✧･ﾟ: *✧･ﾟ:* Welcome *:･ﾟ✧*:･ﾟ✧</p>

        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className={`auth-form ${!isSignUp ? 'active' : ''}`}>
          <div className="auth-form-group" style={{ animationDelay: '0.9s' }}>
            <label>Email</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="auth-form-group" style={{ animationDelay: '1.0s' }}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          <button type="submit" className="auth-create-btn" disabled={loading}>
            <span>{loading ? 'Please wait...' : 'Sign In'}</span>
          </button>
        </form>

        <form onSubmit={handleAuth} className={`auth-form ${isSignUp ? 'active' : ''}`}>
          <div className="auth-form-group" style={{ animationDelay: '0.9s' }}>
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Your name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>
          <div className="auth-form-group" style={{ animationDelay: '1.0s' }}>
            <label>Email</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="auth-form-group" style={{ animationDelay: '1.1s' }}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          <button type="submit" className="auth-create-btn" disabled={loading}>
            <span>{loading ? 'Please wait...' : '✨ Create Account'}</span>
          </button>
        </form>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon">🔒</div>
            Private
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">🔐</div>
            Encrypted
          </div>
          <div className="auth-feature">
            <div className="auth-feature-icon">💜</div>
            Safe Space
          </div>
        </div>

        <p className="auth-tagline">Your emotions belong to you. Always.</p>

        <div className="auth-legal">
          By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.<br />
          All data is encrypted end-to-end and belongs only to you.
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
