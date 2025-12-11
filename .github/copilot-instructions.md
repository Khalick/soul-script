# Soul Script - AI Agent Instructions

## Project Overview
Soul Script is a privacy-first emotional journaling PWA built with React 18, TypeScript, Tailwind CSS, and Supabase. Users track emotions through multi-modal entries (text, photos, videos, voice notes) with a focus on privacy and offline-first design.

## Architecture

### State Management: Zustand Stores (Persisted)
- `authStore.ts` - User authentication, subscription tier
- `journalStore.ts` - Entries, mood tracking
- `settingsStore.ts` - Theme, favoriteColor, favoriteEmoji, dearPrompt, ambience
- `offlineStore.ts` - Offline sync queue
- All stores use `persist` middleware for localStorage sync

### View-Based Routing (No React Router in App.tsx)
App uses a simple `currentView` state variable, not React Router. Views: `'home' | 'checkin' | 'editor' | 'timeline' | 'analytics' | 'community' | 'settings' | 'legacy'`

Navigation: `setCurrentView(view)` or `navigateToView(view)` (includes history.pushState)

### Supabase Integration
- Client: `src/lib/supabase.ts` - Single export `supabase`, auto-configured from env vars
- Auth: `supabase.auth.signUp/signIn/signOut` - No manual JWT handling
- Database: Row Level Security (RLS) enforced - queries auto-filter by `auth.uid()`
- Storage: Buckets `journal-media` (private), `avatars` (public)

### Styling Pattern
Components use inline styles with `getGradientBackground(favoriteColor)` from `lib/colorUtils.ts` for dynamic theming. Tailwind classes supplement. Color system based on user's `favoriteColor` stored in settings.

### Emotion System
`data/emotions.ts` exports `emotions` array (16 moods) and `getMoodEmoji(mood)` helper. Mood values: 'Happy', 'Sad', 'Anxious', 'Calm', 'Angry', 'Grateful', 'Excited', 'Lonely', 'Hopeful', 'Tired', 'Confused', 'Peaceful', 'Stressed', 'Content', 'Overwhelmed', 'Energized'

## Development Workflow

### Commands
- `npm run dev` - Vite dev server (port 5173)
- `npm run build` - TypeScript compile + Vite build (outputs to `dist/`)
- `npm run preview` - Preview production build locally

### Environment Setup
Required env vars in `.env`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### Database Schema
Run `supabase-schema.sql` in Supabase SQL Editor. Key tables:
- `users` - Extended auth.users with subscription_tier, storage_used
- `journal_entries` - mood, intensity, text_content, tags[], is_public
- `journal_media` - Links media files to entries
- `community_posts` - Public shared entries with echoes (likes)

## Project-Specific Patterns

### PWA Configuration
Uses `vite-plugin-pwa` (not custom service worker). Icons: `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`, `apple-touch-icon.png`. Install prompt via `InstallPrompt.tsx` component listening for `beforeinstallprompt` event.

### Offline Sync
`lib/offlineSync.ts` manages offline entry queue. Entries saved to localStorage, synced on reconnect via `syncOfflineEntries()`. Use `navigator.onLine` checks before Supabase calls.

### Mobile Optimizations
- Hamburger menu in `Navbar.tsx` (toggle `isMobileMenuOpen`)
- Breakpoints: 375px (small), 768px (mobile), 1024px (tablet)
- Touch targets minimum 44px
- iOS safe area: `env(safe-area-inset-*)`
- Prevent zoom: `user-scalable=no` in `index.html`

### Component Lifecycle Patterns
Dashboard/Settings components create floating particles via `setInterval` in `useEffect` - clean up with `clearInterval` in return function.

### Community Features
`Community.tsx` includes mood filtering, support messages modal, save/bookmark functionality, report feature. Uses Supabase real-time subscriptions for live post updates (currently disabled for performance).

## Critical Files
- `src/App.tsx` - Main router, view switching, auth check
- `src/components/Dashboard.tsx` - Home view, entry list, quick actions
- `src/components/JournalEditor.tsx` - Rich text editing, media upload
- `src/components/EmotionalTimeline.tsx` - Calendar view, mood visualization
- `src/lib/offlineSync.ts` - Offline queue management
- `vite.config.ts` - PWA manifest, workbox caching rules

## Common Pitfalls
1. **Don't use React Router** - App.tsx uses view state, not routes
2. **Always check Supabase RLS** - Queries fail silently if user not authed
3. **Persist stores carefully** - Zustand persist can cause hydration issues
4. **PWA install requires engagement** - Chrome won't show prompt on first visit
5. **Avoid duplicate service workers** - Use vite-plugin-pwa only, not custom `public/sw.js`

## Debugging
- PWA: Chrome DevTools → Application → Manifest/Service Workers
- Supabase: Check `.supabase` logs, RLS policies in dashboard
- State: React DevTools + Zustand middleware logging
- Build issues: Check `tsconfig.json` strict mode, Vite config

## Current Focus Areas
- PWA install prompt reliability (Chrome engagement heuristics)
- Community page spacing/layout refinement
- Browser navigation (back button) integration with view history
