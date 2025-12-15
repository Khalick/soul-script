import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Hash, Lock, Sparkles, TrendingUp, Clock, Smile, Frown, Meh, Zap, MessageCircle, BookmarkPlus, Flag, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getMoodEmoji } from '../data/emotions';
import { getCurrentTimeTheme } from '../lib/colorUtils';
import { Constellations } from './Constellations';

interface CommunityPost {
  id: string;
  user_id: string;
  mood: string;
  intensity: number;
  text_snippet: string;
  hashtags: string[];
  visibility: 'public' | 'semi-private';
  echo_count: number;
  created_at: string;
  user_echoed?: boolean;
}

// One-word Whispers as per Soul Script specification
const WHISPER_WORDS = [
  "Hope",
  "Peace",
  "Ouch",
  "Strength",
  "Love",
  "Courage",
  "Grace",
  "Healing"
];

export function Community() {
  const user = useAuthStore((state) => state.user);
  const { favoriteColor } = useSettingsStore();
  const theme = useMemo(() => getCurrentTimeTheme(), []);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('recent');
  const [searchHashtag, setSearchHashtag] = useState('');
  const [moodFilter, setMoodFilter] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  // Create floating particles
  useEffect(() => {
    const interval = setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'dashboard-particle';
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
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchHashtag) {
        query = query.contains('hashtags', [searchHashtag]);
      }

      if (moodFilter) {
        query = query.eq('mood', moodFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && user) {
        // Check which posts user has echoed
        const postIds = data.map(p => p.id);
        const { data: echoes } = await supabase
          .from('post_echoes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const echoedIds = new Set(echoes?.map(e => e.post_id) || []);
        
        const postsWithEcho = data.map(post => ({
          ...post,
          user_echoed: echoedIds.has(post.id)
        }));

        // Sort based on filter
        if (filter === 'trending') {
          postsWithEcho.sort((a, b) => b.echo_count - a.echo_count);
        }

        setPosts(postsWithEcho);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, searchHashtag, moodFilter, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleEcho = useCallback(async (postId: string, currentlyEchoed: boolean) => {
    if (!user) return;

    try {
      if (currentlyEchoed) {
        // Remove echo
        await supabase
          .from('post_echoes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Add echo
        await supabase
          .from('post_echoes')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            echo_count: currentlyEchoed ? post.echo_count - 1 : post.echo_count + 1,
            user_echoed: !currentlyEchoed
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling echo:', error);
    }
  }, [user, posts]);

  const toggleSavePost = (postId: string) => {
    setSavedPosts(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(postId)) {
        newSaved.delete(postId);
      } else {
        newSaved.add(postId);
      }
      return newSaved;
    });
  };

  const sendSupportMessage = (_postId: string, _message: string) => {
    // Visual feedback only for now
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc);
      color: white;
      padding: 15px 25px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    notification.textContent = '💜 Support sent!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
    setShowSupportModal(null);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return posted.toLocaleDateString();
  };



  return (
    <div className="dashboard-page" style={{
      background: theme.gradient,
      minHeight: '100vh',
      paddingTop: '0px'
    }}>
      {/* Floating orbs with time-based colors */}
      <div className="dashboard-orb dashboard-orb1" style={{ background: theme.orbColors[0] }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: theme.orbColors[1] }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: theme.orbColors[2] }}></div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24" style={{ paddingTop: '0px', marginTop: '-45px' }}>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-2 animate-fadeIn" style={{ animationDelay: '0s', marginTop: '0' }}>
          <button
            onClick={() => { setFilter('recent'); setMoodFilter(null); }}
            style={{
              padding: '15px 30px',
              background: filter === 'recent' && !moodFilter
                ? theme.cardBg
                : 'rgba(255, 255, 255, 0.1)',
              border: `2px solid ${theme.accentColor}40`,
              borderRadius: '15px',
              color: theme.textColor,
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: filter === 'recent' && !moodFilter ? `0 4px 15px ${favoriteColor}66` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Clock size={18} /> Recent
          </button>
          <button
            onClick={() => { setFilter('trending'); setMoodFilter(null); }}
            style={{
              padding: '15px 30px',
              background: filter === 'trending' && !moodFilter
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: filter === 'trending' && !moodFilter ? `0 4px 15px ${favoriteColor}66` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={18} /> Trending
          </button>
        </div>

        {/* Mood Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
          animation: 'fadeIn 0.6s ease-out',
          animationDelay: '0.05s',
          animationFillMode: 'both'
        }}>
          <button
            onClick={() => setMoodFilter(moodFilter === 'Happy' ? null : 'Happy')}
            style={{
              padding: '10px 20px',
              background: moodFilter === 'Happy' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Smile size={16} /> Happy
          </button>
          <button
            onClick={() => setMoodFilter(moodFilter === 'Sad' ? null : 'Sad')}
            style={{
              padding: '10px 20px',
              background: moodFilter === 'Sad' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Frown size={16} /> Sad
          </button>
          <button
            onClick={() => setMoodFilter(moodFilter === 'Anxious' ? null : 'Anxious')}
            style={{
              padding: '10px 20px',
              background: moodFilter === 'Anxious' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={16} /> Anxious
          </button>
          <button
            onClick={() => setMoodFilter(moodFilter === 'Calm' ? null : 'Calm')}
            style={{
              padding: '10px 20px',
              background: moodFilter === 'Calm' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Meh size={16} /> Calm
          </button>
          <button
            onClick={() => setMoodFilter(moodFilter === 'Grateful' ? null : 'Grateful')}
            style={{
              padding: '10px 20px',
              background: moodFilter === 'Grateful' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={16} /> Grateful
          </button>
        </div>

        {/* Emotional Hashtag Quick Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
          animation: 'fadeIn 0.6s ease-out',
          animationDelay: '0.08s',
          animationFillMode: 'both'
        }}>
          <div style={{ 
            width: '100%', 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)', 
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            EMOTIONAL TAGS
          </div>
          {['Grief', 'Joy', 'Confused', 'Hope', 'Healing', 'Growth'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchHashtag(searchHashtag === tag ? '' : tag)}
              style={{
                padding: '8px 16px',
                background: searchHashtag === tag 
                  ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                  : 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: searchHashtag === tag ? `0 4px 15px ${favoriteColor}44` : 'none'
              }}
              onMouseEnter={(e) => {
                if (searchHashtag !== tag) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                if (searchHashtag !== tag) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Hashtag Search */}
        <div className="mb-2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div style={{ 
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Hash style={{ 
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.6)'
            }} size={20} />
            <input
              type="text"
              value={searchHashtag}
              onChange={(e) => setSearchHashtag(e.target.value.replace('#', ''))}
              placeholder="Search by hashtag (e.g., Gratitude)"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderRadius: '15px',
                padding: '15px 20px 15px 50px',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
              className="placeholder-gray-400"
            />
          </div>
          {searchHashtag && (
            <button
              onClick={() => setSearchHashtag('')}
              style={{
                marginTop: '10px',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              Clear search
            </button>
          )}
        </div>

        {/* Constellations */}
        {!loading && !searchHashtag && (
          <Constellations 
            posts={posts} 
            onConstellationClick={(hashtag) => setSearchHashtag(hashtag)}
          />
        )}

        {/* Posts Grid */}
        {loading ? (
          <div style={{ 
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: `4px solid rgba(255, 255, 255, 0.2)`,
              borderTop: `4px solid ${favoriteColor}`,
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              fontWeight: '500'
            }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Users size={64} style={{ 
              color: 'rgba(255, 255, 255, 0.3)',
              margin: '0 auto 20px'
            }} />
            <h3 style={{ 
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '10px'
            }}>No posts yet</h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px'
            }}>
              {searchHashtag 
                ? `No posts found with #${searchHashtag}` 
                : 'Be the first to share your journey with the community!'}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {posts.map((post, index) => (
              <div
                key={post.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s',
                  animation: 'fadeIn 0.6s ease-out',
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'both'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 10px 30px ${favoriteColor}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Post Header */}
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: '1',
                    minWidth: '0'
                  }}>
                    <div style={{ 
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${favoriteColor}40, ${favoriteColor}20)`,
                      border: `2px solid ${favoriteColor}60`
                    }}>
                      {getMoodEmoji(post.mood)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          fontWeight: '600',
                          color: 'white',
                          fontSize: '16px'
                        }}>Anonymous</span>
                        {post.visibility === 'semi-private' && (
                          <Lock size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        )}
                      </div>
                      <p style={{ 
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {post.mood} • {getTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '4px'
                    }}>Intensity</div>
                    <div style={{ 
                      fontSize: '20px',
                      fontWeight: '700',
                      color: favoriteColor
                    }}>
                      {post.intensity}/10
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p style={{ 
                  color: 'white',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  wordBreak: 'break-word'
                }}>
                  {post.text_snippet}
                </p>

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '20px'
                  }}>
                    {post.hashtags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => setSearchHashtag(tag.replace('#', ''))}
                        style={{
                          padding: '6px 14px',
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: favoriteColor,
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {/* Echo Button */}
                  <button
                    onClick={() => handleEcho(post.id, post.user_echoed || false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 20px',
                      background: post.user_echoed 
                        ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                        : 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: post.user_echoed ? `0 4px 15px ${favoriteColor}66` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!post.user_echoed) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      }
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!post.user_echoed) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      }
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Radio
                      size={20}
                      style={{ 
                        color: 'white',
                        strokeWidth: post.user_echoed ? 3 : 2
                      }}
                    />
                    <span>
                      {post.echo_count} {post.echo_count === 1 ? 'Echo' : 'Echoes'}
                    </span>
                  </button>

                  {/* Send Support Button */}
                  <button
                    onClick={() => setShowSupportModal(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>Whisper</span>
                  </button>

                  {/* Save/Bookmark Button */}
                  <button
                    onClick={() => toggleSavePost(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: savedPosts.has(post.id)
                        ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                        : 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: savedPosts.has(post.id) ? `0 4px 15px ${favoriteColor}66` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!savedPosts.has(post.id)) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      }
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!savedPosts.has(post.id)) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      }
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <BookmarkPlus size={18} />
                    <span>{savedPosts.has(post.id) ? 'Saved' : 'Save'}</span>
                  </button>

                  {/* Report Button */}
                  <button
                    onClick={() => {
                      if (window.confirm('Report this post for violating community guidelines?')) {
                        const notification = document.createElement('div');
                        notification.style.cssText = `
                          position: fixed;
                          top: 100px;
                          right: 20px;
                          background: rgba(239, 68, 68, 0.9);
                          color: white;
                          padding: 15px 25px;
                          border-radius: 12px;
                          font-weight: 600;
                          z-index: 10000;
                          animation: slideInRight 0.3s ease-out;
                          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                        `;
                        notification.textContent = '🚩 Post reported. Thank you.';
                        document.body.appendChild(notification);
                        setTimeout(() => notification.remove(), 2000);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '2px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Flag size={18} />
                  </button>
                </div>

                {/* Support Message Modal */}
                {showSupportModal === post.id && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.3s ease-out'
                  }}
                  onClick={() => setShowSupportModal(null)}
                  >
                    <div 
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '20px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '100%',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        animation: 'scaleIn 0.3s ease-out'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '20px',
                        textAlign: 'center'
                      }}>
                        💬 Whisper a Word
                      </h3>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '14px'
                      }}>
                        Send one word of support, anonymously:
                      </p>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px'
                      }}>
                        {WHISPER_WORDS.map((word, i) => (
                          <button
                            key={i}
                            onClick={() => sendSupportMessage(post.id, word)}
                            style={{
                              padding: '20px',
                              background: 'rgba(255, 255, 255, 0.15)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              textAlign: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`;
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowSupportModal(null)}
                        style={{
                          marginTop: '20px',
                          width: '100%',
                          padding: '15px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
