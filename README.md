# Soul Script - Emotional Journal Platform

![Soul Script Banner](https://img.shields.io/badge/Soul%20Script-Your%20Safe%20Space-e74c63?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Powered-3ecf8e?style=flat-square&logo=supabase)

**Your Safe Space to Feel Everything**

A modern, privacy-first emotional journaling platform that allows users to capture and track their emotional journey through multi-modal entries (text, photos, videos, voice notes). Built with React, TypeScript, Tailwind CSS, and Supabase, designed to scale to 100,000+ users.

## 🌟 Key Features

### Essential Features (MVP)

1. **Quick Emotional Check-in**
   - Visual emotion selector with 16 different moods
   - Intensity slider (1-10 scale)
   - Quick tags for common feelings
   - One-tap entry start based on emotion

2. **Multi-Modal Journaling**
   - Unlimited text entries
   - Photo capture/upload
   - Video recording (up to 5 min free, 10 min premium)
   - Voice notes (unlimited length)
   - Mix multiple media types in one entry
   - Automatic timestamps

3. **Privacy-First Design**
   - 100% private by default
   - Optional public sharing per entry
   - Face blur option for photos
   - Secure vault with PIN/biometric lock
   - No social pressure - no forced followers/likes

4. **Emotional Timeline**
   - Visual calendar with color-coded moods
   - Pattern recognition over time
   - Crisis vs breakthrough moment markers
   - Photo/video gallery of emotional journey

5. **Reflection & Growth Analytics** (Coming Soon)
   - Weekly emotional reports
   - Monthly journey insights
   - Mood distribution charts
   - Personal pattern insights

6. **Supportive Features**
   - Thoughtful prompts for difficult moments
   - Encouraging post-entry messages
   - Breathing exercises
   - Crisis resources
   - "On this day" memories

7. **Storage & Media Management**
   - **Free Tier**: 500 MB storage (~100 entries with media)
   - **Premium Tier** ($4.99/month): 10 GB storage, HD quality, backups

8. **Customization**
   - Multiple themes (light/dark/auto)
   - Background ambience sounds
   - Custom fonts and colors
   - Entry templates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended) or Node.js 18.19.1 (minimum)
- npm or yarn
- Supabase account (free tier works great)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   
   a. Create a new Supabase project at [supabase.com](https://supabase.com)
   
   b. Run the database schema:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL
   
   c. Create storage buckets:
   - Go to Storage in Supabase dashboard
   - Create a bucket named `journal-media` (private)
   - Create a bucket named `avatars` (public)
   
   d. Get your credentials:
   - Go to Settings > API
   - Copy your `Project URL` and `anon public` key

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Building for Production & APK

### Web Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist` folder to any static hosting service:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

### Converting to APK/Mobile App

This PWA can be converted to a native Android APK using several methods:

#### Option 1: PWA Builder (Easiest)
1. Build your production app: `npm run build`
2. Deploy to a live URL (e.g., Vercel, Netlify)
3. Go to [PWABuilder.com](https://www.pwabuilder.com/)
4. Enter your app URL
5. Click "Build My PWA"
6. Download the Android package

#### Option 2: Capacitor (Most Features)
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize Capacitor
npx cap init

# Build web assets
npm run build

# Add Android platform
npx cap add android

# Open in Android Studio
npx cap open android

# Build APK in Android Studio
```

#### Option 3: Trusted Web Activity (TWA)
Use Bubblewrap to create a TWA:
```bash
npx @bubblewrap/cli init --manifest https://your-domain.com/manifest.json
npx @bubblewrap/cli build
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18.3 + TypeScript 5.5
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite 5.4
- **PWA**: vite-plugin-pwa with Workbox

### Database Schema (Optimized for 100k+ Users)
- **users**: User profiles and settings
- **journal_entries**: Main journal entries
- **media_attachments**: Photos, videos, audio files
- **emotional_patterns**: Aggregated analytics data
- **user_settings**: User preferences

### Performance Optimizations for Scale
- Row Level Security (RLS) for data isolation
- Indexed queries on user_id and created_at
- Connection pooling via Supabase
- CDN for static assets
- Lazy loading for media
- Service Worker caching
- Optimistic UI updates

## 📁 Project Structure

```
soul-script/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── AuthPage.tsx
│   │   ├── EmotionCheckIn.tsx
│   │   ├── JournalEditor.tsx
│   │   └── EmotionalTimeline.tsx
│   ├── data/           # Static data and constants
│   │   └── emotions.ts
│   ├── lib/            # Utilities and configs
│   │   └── supabase.ts
│   ├── stores/         # Zustand state management
│   │   ├── authStore.ts
│   │   ├── journalStore.ts
│   │   └── settingsStore.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── supabase-schema.sql # Database schema
├── .env.example        # Environment template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies
```

## 🔐 Security & Privacy

- End-to-end encryption for sensitive data
- Row Level Security (RLS) in Supabase
- No data sharing without explicit consent
- GDPR compliant
- User data export/delete capabilities
- Secure authentication with JWT
- HTTPS only in production

## 🎨 Customization

### Themes
The app supports light, dark, and auto (system) themes. Modify theme colors in `tailwind.config.js`.

### Adding New Emotions
Edit `src/data/emotions.ts` to add/remove emotions:
```typescript
{ emoji: '😊', name: 'Happy', color: '#FFD93D', value: 'happy' }
```

### Custom Prompts
Add journaling prompts in `src/data/emotions.ts`:
```typescript
export const prompts = [
  "What happened today?",
  "Your custom prompt here"
];
```

## 📊 Scaling Considerations

### Database
- Supabase free tier: Up to 500 MB database, 2 GB file storage
- For 100k+ users, consider Supabase Pro ($25/month)
- Implements connection pooling automatically
- Use database indexes for fast queries

### Storage
- Free tier includes 1 GB bandwidth/month
- Premium users get more storage (managed via subscription_tier)
- Consider CDN for media files at scale
- Implement image compression before upload

### Monitoring
- Enable Supabase logs and metrics
- Use Sentry or LogRocket for error tracking
- Monitor API response times
- Track user engagement metrics

## 🚧 Roadmap

### Phase 2 (Next Features)
- [ ] Anonymous public community
- [ ] Therapist sharing/export
- [ ] Emotional pattern alerts
- [ ] Crisis hotline integration
- [ ] Friends vault (share with trusted people)

### Phase 3 (Advanced)
- [ ] AI companion for prompts
- [ ] Voice-to-text transcription
- [ ] Emotion detection from photos/voice
- [ ] Guided journaling sessions
- [ ] Group journals

## 🤝 Contributing

This is a portfolio/learning project, but suggestions are welcome!

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 👨‍💻 Author

**Agak Peter Odongo**

Built with ❤️ as a compassionate space for emotional wellness.

---

**Remember**: You are not alone. Your feelings are valid. This is your safe space. 💝
