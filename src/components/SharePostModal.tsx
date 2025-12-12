import { useState } from 'react';
import { Globe, Lock, Hash, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';

interface SharePostModalProps {
  entryId: string;
  mood: string;
  intensity: number;
  textContent: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SharePostModal({ 
  entryId, 
  mood, 
  intensity, 
  textContent, 
  onClose, 
  onSuccess 
}: SharePostModalProps) {
  const user = useAuthStore((state) => state.user);
  const { favoriteColor } = useSettingsStore();
  const [visibility, setVisibility] = useState<'public' | 'semi-private'>('semi-private');
  const [snippet, setSnippet] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');
  const [sharing, setSharing] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    const matches = text.match(hashtagRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  const handleShare = async () => {
    if (!user || !snippet.trim()) return;

    setSharing(true);
    try {
      // Extract hashtags from snippet and custom input
      const snippetTags = extractHashtags(snippet);
      const customTags = customHashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      const allHashtags = [...new Set([...snippetTags, ...customTags])];

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          entry_id: entryId,
          mood,
          intensity,
          text_snippet: snippet,
          hashtags: allHashtags,
          visibility
        });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to share post. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const suggestSnippet = () => {
    // Get first 280 characters
    const firstPart = textContent.substring(0, 280);
    const lastSpace = firstPart.lastIndexOf(' ');
    const suggested = lastSpace > 0 ? firstPart.substring(0, lastSpace) : firstPart;
    setSnippet(suggested + (textContent.length > 280 ? '...' : ''));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Release into The Quiet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Visibility Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-gray-300">
            How far should this drift?
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setVisibility('public')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                visibility === 'public'
                  ? 'text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              style={visibility === 'public' ? { backgroundColor: favoriteColor } : {}}
            >
              <Globe size={20} />
              Let It Drift
            </button>
            <button
              onClick={() => setVisibility('semi-private')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                visibility === 'semi-private'
                  ? 'text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              style={visibility === 'semi-private' ? { backgroundColor: favoriteColor } : {}}
            >
              <Lock size={20} />
              Onlookers Only
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {visibility === 'public' 
              ? '✨ Anyone can witness this moment' 
              : '🔒 Only those who join The Quiet can see this'}
          </p>
        </div>

        {/* Snippet Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-300">
              What would you like to share?
            </label>
            <button
              onClick={suggestSnippet}
              className="text-sm px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              style={{ color: favoriteColor }}
            >
              Auto-fill from entry
            </button>
          </div>
          <textarea
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            placeholder="Share a meaningful excerpt from your entry..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-all resize-none"
            rows={6}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              💡 Tip: You can include hashtags like #Gratitude or #Anxiety
            </p>
            <span className={`text-sm ${snippet.length > 450 ? 'text-orange-400' : 'text-gray-400'}`}>
              {snippet.length}/500
            </span>
          </div>
        </div>

        {/* Custom Hashtags */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-gray-300">
            <Hash size={16} className="inline mr-1" />
            Add custom hashtags (optional)
          </label>
          <input
            type="text"
            value={customHashtags}
            onChange={(e) => setCustomHashtags(e.target.value)}
            placeholder="Gratitude, Hope, Healing (comma-separated)"
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-all"
          />
          <p className="text-xs text-gray-400 mt-2">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Preview */}
        {snippet && (
          <div className="mb-6 p-4 bg-white/5 rounded-2xl border-2 border-white/10">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <p className="text-white">{snippet}</p>
            {(extractHashtags(snippet).length > 0 || customHashtags) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  ...extractHashtags(snippet),
                  ...customHashtags.split(',').map(tag => {
                    const trimmed = tag.trim();
                    return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
                  }).filter(tag => tag !== '#')
                ].map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-white/10 rounded-full text-sm"
                    style={{ color: favoriteColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!snippet.trim() || sharing}
            className="flex-1 px-6 py-3 rounded-2xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: favoriteColor }}
          >
            {sharing ? 'Releasing...' : '✨ Release'}
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Your identity remains anonymous. Only your mood and shared text will be visible.
        </p>
      </div>
    </div>
  );
}
