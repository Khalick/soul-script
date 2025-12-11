import { useState, useEffect } from 'react';
import { Users, Heart, Hash, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getMoodEmoji } from '../data/emotions';
import { getGradientBackground } from '../lib/colorUtils';

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

export function Community() {
  const user = useAuthStore((state) => state.user);
  const { favoriteColor, favoriteEmoji } = useSettingsStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('recent');
  const [searchHashtag, setSearchHashtag] = useState('');

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
  useEffect(() => {
    fetchPosts();
  }, [filter, searchHashtag]);

  const fetchPosts = async () => {
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
  };

  const handleEcho = async (postId: string, currentlyEchoed: boolean) => {
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
      background: getGradientBackground(favoriteColor),
      minHeight: '100vh',
      paddingTop: '100px'
    }}>
      {/* Floating orbs with dynamic color */}
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3">
            <span style={{ fontSize: '48px' }}>{favoriteEmoji}</span>
          </div>
          <h1 style={{ 
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '10px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.5px'
          }}>Community</h1>
          <p style={{ 
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '500'
          }}>
            Share your journey anonymously and support others 💜
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setFilter('recent')}
            style={{
              padding: '15px 30px',
              background: filter === 'recent'
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: filter === 'recent' ? `0 4px 15px ${favoriteColor}66` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🕒 Recent
          </button>
          <button
            onClick={() => setFilter('trending')}
            style={{
              padding: '15px 30px',
              background: filter === 'trending'
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: filter === 'trending' ? `0 4px 15px ${favoriteColor}66` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            🔥 Trending
          </button>
        </div>

        {/* Hashtag Search */}
        <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
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
                  <Heart
                    size={20}
                    fill={post.user_echoed ? 'white' : 'none'}
                    style={{ color: 'white' }}
                  />
                  <span>
                    {post.echo_count} {post.echo_count === 1 ? 'echo' : 'echoes'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
