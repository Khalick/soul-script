import { useState, useEffect } from 'react';
import { Users, Heart, Hash, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getMoodEmoji } from '../data/emotions';

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
  const { favoriteColor } = useSettingsStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('recent');
  const [searchHashtag, setSearchHashtag] = useState('');

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
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Users size={40} style={{ color: favoriteColor }} />
            <h1 className="text-4xl font-bold">Community</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Share your journey anonymously and support others 💜
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setFilter('recent')}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              filter === 'recent'
                ? 'text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            style={filter === 'recent' ? { backgroundColor: favoriteColor } : {}}
          >
            🕒 Recent
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              filter === 'trending'
                ? 'text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            style={filter === 'trending' ? { backgroundColor: favoriteColor } : {}}
          >
            🔥 Trending
          </button>
        </div>

        {/* Hashtag Search */}
        <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchHashtag}
              onChange={(e) => setSearchHashtag(e.target.value.replace('#', ''))}
              placeholder="Search by hashtag (e.g., Gratitude, Anxiety)"
              className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-all"
            />
          </div>
          {searchHashtag && (
            <button
              onClick={() => setSearchHashtag('')}
              className="mt-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl">
            <Users size={64} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-2xl font-bold mb-2">No posts yet</h3>
            <p className="text-gray-400">
              {searchHashtag 
                ? `No posts found with #${searchHashtag}` 
                : 'Be the first to share your journey with the community!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/10 hover:border-white/20 transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: `${favoriteColor}20`,
                        border: `2px solid ${favoriteColor}40`
                      }}
                    >
                      {getMoodEmoji(post.mood)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Anonymous</span>
                        {post.visibility === 'semi-private' && (
                          <Lock size={14} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {post.mood} • {getTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Intensity</div>
                    <div className="text-lg font-bold" style={{ color: favoriteColor }}>
                      {post.intensity}/10
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-white text-lg mb-4 leading-relaxed">
                  {post.text_snippet}
                </p>

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.hashtags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => setSearchHashtag(tag.replace('#', ''))}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
                        style={{ color: favoriteColor }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Echo Button */}
                <button
                  onClick={() => handleEcho(post.id, post.user_echoed || false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    post.user_echoed
                      ? 'bg-white/20 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Heart
                    size={20}
                    fill={post.user_echoed ? favoriteColor : 'none'}
                    style={{ color: post.user_echoed ? favoriteColor : 'white' }}
                  />
                  <span className="font-semibold">
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
