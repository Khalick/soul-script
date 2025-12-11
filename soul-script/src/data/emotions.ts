export const emotions = [
  { emoji: '😊', name: 'Happy', color: '#FFD93D', value: 'happy' },
  { emoji: '😢', name: 'Sad', color: '#6C9BCF', value: 'sad' },
  { emoji: '😔', name: 'Down', color: '#8B9DC3', value: 'down' },
  { emoji: '😐', name: 'Neutral', color: '#95A5A6', value: 'neutral' },
  { emoji: '🙂', name: 'Content', color: '#A8E6CF', value: 'content' },
  { emoji: '😭', name: 'Crying', color: '#4A69BD', value: 'crying' },
  { emoji: '😤', name: 'Frustrated', color: '#E74C3C', value: 'frustrated' },
  { emoji: '😰', name: 'Anxious', color: '#F39C12', value: 'anxious' },
  { emoji: '😌', name: 'Peaceful', color: '#A8DADC', value: 'peaceful' },
  { emoji: '😡', name: 'Angry', color: '#C0392B', value: 'angry' },
  { emoji: '🥺', name: 'Vulnerable', color: '#DDA0DD', value: 'vulnerable' },
  { emoji: '😴', name: 'Tired', color: '#BDC3C7', value: 'tired' },
  { emoji: '🤗', name: 'Grateful', color: '#F8B500', value: 'grateful' },
  { emoji: '😱', name: 'Overwhelmed', color: '#8E44AD', value: 'overwhelmed' },
  { emoji: '🌟', name: 'Inspired', color: '#FFD700', value: 'inspired' },
  { emoji: '💔', name: 'Heartbroken', color: '#E91E63', value: 'heartbroken' },
];

export const quickTags = [
  'bad day',
  'crying',
  'overwhelmed',
  'anxious',
  'happy moment',
  'breakthrough',
  'grateful',
  'frustrated',
  'hopeful',
  'lonely',
  'proud',
  'confused',
  'angry',
  'peaceful',
  'worried',
  'excited',
];

export const prompts = [
  "What happened today?",
  "What does this feeling look like?",
  "If your emotion had a color, what would it be?",
  "What would you tell your best friend feeling this way?",
  "What do you need right now?",
  "What are you grateful for in this moment?",
  "What's weighing on your heart?",
  "Describe this feeling in one word",
  "What would make this moment easier?",
  "What are you learning about yourself?",
];

export const supportiveMessages = [
  "Thank you for being honest with yourself",
  "It's okay to not be okay",
  "You're doing the brave thing by showing up",
  "Your feelings are valid",
  "This too shall pass",
  "You are not alone in this",
  "Be gentle with yourself today",
  "You're stronger than you know",
];

export const entryTemplates = [
  { name: 'Bad Day Dump', description: 'Let it all out', icon: '💭' },
  { name: 'Gratitude Check', description: 'What went well', icon: '🙏' },
  { name: 'Anxiety Release', description: 'Process your worries', icon: '😰' },
  { name: 'Happy Moment Capture', description: 'Save the good times', icon: '✨' },
  { name: 'Therapy Prep Notes', description: 'Prepare for session', icon: '📝' },
  { name: 'Blank/Freestyle', description: 'Start from scratch', icon: '📄' },
];

export const ambienceSounds = [
  { name: 'None', value: 'none' },
  { name: 'White Noise', value: 'white-noise' },
  { name: 'Rain on Roof', value: 'rain' },
  { name: 'Crackling Fire', value: 'fire' },
  { name: 'Ocean Waves', value: 'ocean' },
  { name: 'Forest Sounds', value: 'forest' },
  { name: 'Binaural Beats', value: 'binaural' },
];

export const getMoodColor = (mood: string): string => {
  const emotion = emotions.find(e => e.value === mood);
  return emotion?.color || '#95A5A6';
};

export const getMoodEmoji = (mood: string): string => {
  const emotion = emotions.find(e => e.value === mood);
  return emotion?.emoji || '😐';
};

export const getRandomPrompt = (): string => {
  return prompts[Math.floor(Math.random() * prompts.length)];
};

export const getRandomSupportiveMessage = (): string => {
  return supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)];
};
