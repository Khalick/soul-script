import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { supabase } from '../lib/supabase';
import { getGradientBackground, adjustBrightness } from '../lib/colorUtils';
import { Calendar, Send, Clock, Mail, Crown, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface LegacyLetter {
  id: string;
  user_id: string;
  title: string;
  content: string;
  delivery_date: string;
  created_at: string;
  is_delivered: boolean;
}

const LegacyMode: React.FC = () => {
  const { user } = useAuthStore();
  const { isPremium, checkSubscriptionStatus } = useSubscriptionStore();
  const { favoriteColor, favoriteEmoji } = useSettingsStore();
  const [letters, setLetters] = useState<LegacyLetter[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isPremium) {
      fetchLetters();
    }
  }, [user, isPremium]);

  useEffect(() => {
    const interval = setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'dashboard-particle';
      particle.style.left = Math.random() * 100 + '%';
      const size = Math.random() * 5 + 2 + 'px';
      particle.style.width = size;
      particle.style.height = size;
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 20000);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const fetchLetters = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('legacy_letters')
        .select('*')
        .eq('user_id', user.id)
        .order('delivery_date', { ascending: true });

      if (error) throw error;
      setLetters(data || []);
    } catch (error: any) {
      console.error('Error fetching letters:', error);
      if (error?.code === '42P01') {
        console.error('legacy_letters table does not exist. Please run the SQL setup from LEGACY_MODE_SETUP.md');
      }
    }
  };

  const handleSendLetter = async () => {
    if (!user || !title || !content || !deliveryDate) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('legacy_letters')
        .insert({
          user_id: user.id,
          title,
          content,
          delivery_date: deliveryDate,
          is_delivered: false
        });

      if (error) throw error;

      alert('✉️ Your letter to the future has been sealed! You\'ll receive it on ' + format(new Date(deliveryDate), 'PPP'));
      setTitle('');
      setContent('');
      setDeliveryDate('');
      setShowComposer(false);
      fetchLetters();
    } catch (error: any) {
      console.error('Error sending letter:', error);
      if (error?.code === '42P01') {
        alert('⚠️ Database Setup Required!\n\nThe legacy_letters table doesn\'t exist yet. Please:\n\n1. Go to your Supabase Dashboard\n2. Open SQL Editor\n3. Run the setup script from LEGACY_MODE_SETUP.md file\n\nThis will take just 30 seconds!');
      } else {
        alert('Failed to send letter: ' + (error?.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!checkSubscriptionStatus()) {
    return (
      <div className="dashboard-page" style={{ background: getGradientBackground(favoriteColor) }}>
        <div className="dashboard-orb dashboard-orb1" style={{ background: `radial-gradient(circle, ${favoriteColor}40, transparent)` }}></div>
        <div className="dashboard-orb dashboard-orb2" style={{ background: `radial-gradient(circle, ${favoriteColor}30, transparent)` }}></div>
        <div className="dashboard-orb dashboard-orb3" style={{ background: `radial-gradient(circle, ${favoriteColor}50, transparent)` }}></div>
        
        <div className="dashboard-content-wrapper">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center" style={{ animation: 'fadeIn 1s ease-out' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                <Crown size={80} color="gold" style={{ display: 'inline-block' }} />
              </div>
              <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', textShadow: '0 0 40px rgba(255, 255, 255, 0.5)', marginBottom: '15px' }}>
                {favoriteEmoji} Legacy Mode
              </h1>
              <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '30px' }}>
                Write letters to your future self
              </p>
            </div>

            <div className="dashboard-card" style={{ animationDelay: '0.3s', textAlign: 'center', padding: '60px 40px' }}>
              <Lock size={60} color="rgba(255, 255, 255, 0.7)" style={{ margin: '0 auto 25px' }} />
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '15px' }}>
                Premium Feature
              </h2>
              <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '30px', lineHeight: '1.6' }}>
                Legacy Mode is exclusively available for premium subscribers. Write heartfelt letters to your future self and receive them exactly when you need them most.
              </p>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px', padding: '30px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>
                  ✨ Premium Benefits
                </h3>
                <ul style={{ textAlign: 'left', color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', lineHeight: '2', listStyle: 'none', padding: 0 }}>
                  <li>📝 Unlimited letters to your future self</li>
                  <li>⏰ Custom delivery dates (days, months, or years ahead)</li>
                  <li>🔔 Automatic reminders on delivery day</li>
                  <li>💎 Reflect on your growth and journey</li>
                  <li>🎯 Track your goals and aspirations over time</li>
                </ul>
              </div>
              <button
                onClick={() => alert('Premium subscription coming soon! This will integrate with your payment provider.')}
                style={{
                  padding: '18px 40px',
                  background: `linear-gradient(135deg, #FFD700, #FFA500)`,
                  border: 'none',
                  borderRadius: '15px',
                  color: '#000',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(255, 215, 0, 0.4)',
                  transition: 'all 0.3s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Crown size={22} /> Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ background: getGradientBackground(favoriteColor) }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `radial-gradient(circle, ${favoriteColor}40, transparent)` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `radial-gradient(circle, ${favoriteColor}30, transparent)` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `radial-gradient(circle, ${favoriteColor}50, transparent)` }}></div>
      
      <div className="dashboard-content-wrapper">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center" style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', textShadow: '0 0 40px rgba(255, 255, 255, 0.5)', marginBottom: '15px', animation: 'glow 3s ease-in-out infinite' }}>
              {favoriteEmoji} Legacy Mode
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Write to your future self and receive your thoughts when the time is right
            </p>
          </div>

          {!showComposer ? (
            <>
              <div className="dashboard-card" style={{ animationDelay: '0.2s' }}>
                <button
                  onClick={() => setShowComposer(true)}
                  style={{
                    width: '100%',
                    padding: '25px',
                    background: `linear-gradient(135deg, ${favoriteColor}, ${adjustBrightness(favoriteColor, 20)})`,
                    border: 'none',
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: `0 8px 30px ${favoriteColor}50`,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px'
                  }}
                >
                  <Mail size={28} /> Write a New Letter to Future Me
                </button>
              </div>

              <div className="dashboard-card" style={{ animationDelay: '0.4s' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={24} /> Your Sealed Letters
                </h2>
                
                {letters.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Mail size={60} color="rgba(255, 255, 255, 0.3)" style={{ margin: '0 auto 20px' }} />
                    <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      No letters yet. Write your first letter to your future self!
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {letters.map((letter) => {
                      const deliveryDate = new Date(letter.delivery_date);
                      const isDelivered = letter.is_delivered || new Date() >= deliveryDate;
                      
                      return (
                        <div
                          key={letter.id}
                          style={{
                            padding: '20px',
                            background: isDelivered 
                              ? 'rgba(34, 197, 94, 0.1)' 
                              : 'rgba(255, 255, 255, 0.05)',
                            border: isDelivered 
                              ? '2px solid rgba(34, 197, 94, 0.3)' 
                              : '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            transition: 'all 0.3s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                              {letter.title}
                            </h3>
                            {isDelivered && (
                              <span style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '20px', fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>
                                ✓ Delivered
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                            <Calendar size={16} />
                            <span>
                              {isDelivered ? 'Delivered on' : 'Opens on'} {format(deliveryDate, 'PPP')}
                            </span>
                          </div>
                          
                          {isDelivered ? (
                            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {letter.content}
                            </p>
                          ) : (
                            <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
                              <Lock size={40} color="rgba(255, 255, 255, 0.4)" style={{ margin: '0 auto 15px' }} />
                              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                                This letter is sealed until {format(deliveryDate, 'PPP')}
                              </p>
                            </div>
                          )}
                          
                          <div style={{ marginTop: '15px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                            Written on {format(new Date(letter.created_at), 'PPP')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="dashboard-card" style={{ animationDelay: '0.3s' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={28} /> Compose Your Letter
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>
                  Letter Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Dreams for 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>
                  When should you receive this letter?
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  min={getMinDate()}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: 'white',
                    outline: 'none',
                    colorScheme: 'dark'
                  }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '10px' }}>
                  Your Message
                </label>
                <textarea
                  placeholder="Dear Future Me,&#10;&#10;Write your thoughts, dreams, goals, or advice to your future self..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: 'white',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: '1.6'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={handleSendLetter}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '18px 30px',
                    background: loading 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : `linear-gradient(135deg, ${favoriteColor}, ${adjustBrightness(favoriteColor, 20)})`,
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : `0 8px 30px ${favoriteColor}50`,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <Send size={20} /> {loading ? 'Sealing Letter...' : 'Seal & Send to Future'}
                </button>
                
                <button
                  onClick={() => setShowComposer(false)}
                  disabled={loading}
                  style={{
                    padding: '18px 30px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegacyMode;
