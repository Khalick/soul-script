import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';

const INVITATION_PROMPTS = [
  // Reflective
  "What's one thing you've been avoiding thinking about?",
  "When did you last feel completely at peace?",
  "What would you tell your younger self today?",
  "What emotion are you carrying that isn't yours?",
  
  // Gratitude
  "What small moment made you smile today?",
  "Who do you wish you could thank right now?",
  "What's something you take for granted but shouldn't?",
  
  // Growth
  "What pattern in your life is ready to shift?",
  "What would courage look like for you today?",
  "What are you becoming?",
  
  // Connection
  "What memory keeps returning to you?",
  "What do you need to forgive yourself for?",
  "What truth are you ready to speak?",
  
  // Presence
  "How does your body feel right now?",
  "What color is your mood today?",
  "What are three things you can hear in this moment?",
  
  // Hope
  "What are you hoping for?",
  "What would freedom feel like?",
  "What's one step toward the life you want?",
];

const MOOD_BASED_PROMPTS: Record<string, string[]> = {
  'Anxious': [
    "What's the worst that could happen? And then what?",
    "What grounds you when everything feels uncertain?",
    "What do you need to hear right now?",
  ],
  'Sad': [
    "What does this sadness want you to know?",
    "Who or what do you miss today?",
    "What small comfort could you offer yourself?",
  ],
  'Grateful': [
    "What unexpected gift appeared in your life recently?",
    "Who made your world brighter this week?",
    "What abundance are you noticing?",
  ],
  'Angry': [
    "What boundary needs protecting?",
    "What's beneath this anger?",
    "What would expressing this fully sound like?",
  ],
  'Hopeful': [
    "What future are you imagining?",
    "What's becoming possible for you?",
    "What dreams are stirring?",
  ],
  'Lonely': [
    "When did you last feel truly seen?",
    "What connection are you craving?",
    "How can you be present for yourself?",
  ],
  'Overwhelmed': [
    "What's the smallest next step?",
    "What can wait until tomorrow?",
    "What support do you need?",
  ],
};

export function TodaysInvitation() {
  const { entries } = useJournalStore();
  const { favoriteColor } = useSettingsStore();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    generatePrompt();
  }, [entries]);

  const generatePrompt = () => {
    // Get recent moods (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEntries = entries.filter(
      entry => new Date(entry.created_at) >= sevenDaysAgo
    );

    // Count mood frequencies
    const moodCounts: Record<string, number> = {};
    recentEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    // Get dominant mood
    const dominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Select prompt based on mood or random
    let selectedPrompt: string;
    
    if (dominantMood && MOOD_BASED_PROMPTS[dominantMood]) {
      const moodPrompts = MOOD_BASED_PROMPTS[dominantMood];
      selectedPrompt = moodPrompts[Math.floor(Math.random() * moodPrompts.length)];
    } else {
      selectedPrompt = INVITATION_PROMPTS[Math.floor(Math.random() * INVITATION_PROMPTS.length)];
    }

    setPrompt(selectedPrompt);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        animation: 'fadeIn 1s ease-out',
        boxShadow: `0 8px 32px ${favoriteColor}20`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Sparkles size={24} color={favoriteColor} />
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
          A Gentle Nudge
        </h3>
      </div>
      <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6', fontStyle: 'italic' }}>
        "{prompt}"
      </p>
      <button
        onClick={generatePrompt}
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        ✨ Another Nudge
      </button>
    </div>
  );
}
