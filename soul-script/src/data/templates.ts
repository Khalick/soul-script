export interface JournalTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  prompts: string[];
  structure: string;
}

export const journalTemplates: JournalTemplate[] = [
  {
    id: 'bad-day-dump',
    name: 'Bad Day Dump',
    emoji: '😤',
    description: 'Let it all out. No judgment, just release.',
    prompts: [
      'What happened today that upset me?',
      'How am I feeling right now?',
      'What do I need to let go of?',
      'What would make me feel better?',
    ],
    structure: `**What happened today that upset me?**\n\n\n**How am I feeling right now?**\n\n\n**What do I need to let go of?**\n\n\n**What would make me feel better?**\n\n`,
  },
  {
    id: 'gratitude',
    name: 'Gratitude Journal',
    emoji: '🙏',
    description: 'Count your blessings, big and small.',
    prompts: [
      'Three things I am grateful for today',
      'Someone who made me smile',
      'A simple pleasure I enjoyed',
      'What went well today?',
    ],
    structure: `**Three things I am grateful for today:**\n1. \n2. \n3. \n\n**Someone who made me smile:**\n\n\n**A simple pleasure I enjoyed:**\n\n\n**What went well today?**\n\n`,
  },
  {
    id: 'goal-setting',
    name: 'Goal Setting',
    emoji: '🎯',
    description: 'Define your dreams and plan your path.',
    prompts: [
      'What do I want to achieve?',
      'Why is this important to me?',
      'What steps can I take?',
      'What obstacles might I face?',
    ],
    structure: `**What do I want to achieve?**\n\n\n**Why is this important to me?**\n\n\n**What steps can I take?**\n- \n- \n- \n\n**What obstacles might I face and how can I overcome them?**\n\n`,
  },
  {
    id: 'self-reflection',
    name: 'Self Reflection',
    emoji: '🤔',
    description: 'Dive deep into your thoughts and feelings.',
    prompts: [
      'What patterns do I notice in my life?',
      'What am I proud of?',
      'What do I want to change?',
      'What have I learned about myself?',
    ],
    structure: `**What patterns do I notice in my life?**\n\n\n**What am I proud of?**\n\n\n**What do I want to change?**\n\n\n**What have I learned about myself?**\n\n`,
  },
  {
    id: 'dream-journal',
    name: 'Dream Journal',
    emoji: '💭',
    description: 'Capture the stories from your sleep.',
    prompts: [
      'What did I dream about?',
      'How did the dream make me feel?',
      'What symbols or themes appeared?',
      'What might this dream mean?',
    ],
    structure: `**Date:** ${new Date().toLocaleDateString()}\n\n**The Dream:**\n\n\n**How it made me feel:**\n\n\n**Symbols or themes:**\n\n\n**Possible meaning:**\n\n`,
  },
  {
    id: 'anxiety-release',
    name: 'Anxiety Release',
    emoji: '😰',
    description: 'Work through worries and find calm.',
    prompts: [
      'What am I worried about?',
      'What is the worst that could happen?',
      'What is the best that could happen?',
      'What is most likely to happen?',
      'What can I control?',
    ],
    structure: `**What am I worried about?**\n\n\n**Worst case scenario:**\n\n\n**Best case scenario:**\n\n\n**Most likely outcome:**\n\n\n**What I can control:**\n- \n- \n- \n\n**What I need to accept:**\n\n`,
  },
  {
    id: 'relationship',
    name: 'Relationship Check-in',
    emoji: '💕',
    description: 'Reflect on your connections with others.',
    prompts: [
      'How are my relationships going?',
      'Who do I want to connect with more?',
      'What boundaries do I need to set?',
      'How can I show love today?',
    ],
    structure: `**Current state of my relationships:**\n\n\n**People I want to connect with more:**\n\n\n**Boundaries I need to set:**\n\n\n**Ways I can show love today:**\n- \n- \n- \n`,
  },
  {
    id: 'morning-intention',
    name: 'Morning Intention',
    emoji: '🌅',
    description: 'Set the tone for a purposeful day.',
    prompts: [
      'How do I want to feel today?',
      'What is my main focus?',
      'What am I looking forward to?',
      'My intention for today',
    ],
    structure: `**How I want to feel today:**\n\n\n**My main focus:**\n\n\n**What I am looking forward to:**\n\n\n**My intention for today:**\n\n`,
  },
  {
    id: 'evening-reflection',
    name: 'Evening Reflection',
    emoji: '🌙',
    description: 'Wind down and review your day.',
    prompts: [
      'What went well today?',
      'What challenged me?',
      'What did I learn?',
      'What am I letting go of?',
    ],
    structure: `**What went well today:**\n- \n- \n- \n\n**What challenged me:**\n\n\n**What I learned:**\n\n\n**What I am letting go of before bed:**\n\n`,
  },
  {
    id: 'creativity-flow',
    name: 'Creativity Flow',
    emoji: '🎨',
    description: 'Explore ideas and creative thoughts.',
    prompts: [
      'What is inspiring me right now?',
      'What ideas are bubbling up?',
      'What do I want to create?',
      'What is blocking my creativity?',
    ],
    structure: `**Current inspirations:**\n\n\n**Ideas I want to explore:**\n- \n- \n- \n\n**What I want to create:**\n\n\n**Creative blocks and how to overcome them:**\n\n`,
  },
  {
    id: 'free-write',
    name: 'Free Write',
    emoji: '✍️',
    description: 'No structure, just pure expression.',
    prompts: [
      'Write whatever comes to mind...',
    ],
    structure: ``,
  },
];

export const getTemplateById = (id: string): JournalTemplate | undefined => {
  return journalTemplates.find(template => template.id === id);
};

export const getRandomTemplate = (): JournalTemplate => {
  return journalTemplates[Math.floor(Math.random() * journalTemplates.length)];
};
