import { useEffect, useState, createContext, useContext, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import { useJournalStore } from './stores/journalStore';
import { useSecurityStore } from './stores/securityStore';
import { setupOnlineListener, syncOfflineEntries } from './lib/offlineSync';
import { useAutoLogout } from './hooks/useAutoLogout';
import { useActivityTracker } from './hooks/useActivityTracker';
import { useAutoLock } from './hooks/useAutoLock';
import { usePlatformDetection } from './hooks/usePlatformDetection';
import AuthPage from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import EmotionCheckIn from './components/EmotionCheckIn';
import JournalEditor from './components/JournalEditor';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import InstallPrompt from './components/InstallPrompt';
import { LockScreen } from './components/LockScreen';
import { Calendar, BarChart3, PlusCircle } from 'lucide-react';

// Lazy load heavy components
const EmotionalTimeline = lazy(() => import('./components/EmotionalTimeline'));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const LegacyMode = lazy(() => import('./components/LegacyMode'));
const Analytics = lazy(() => import('./components/Analytics').then(m => ({ default: m.Analytics })));
const Community = lazy(() => import('./components/Community').then(m => ({ default: m.Community })));
const MoodboardSelector = lazy(() => import('./components/MoodboardSelector').then(m => ({ default: m.MoodboardSelector })));

type View = 'home' | 'checkin' | 'editor' | 'timeline' | 'analytics' | 'community' | 'settings' | 'legacy' | 'moodboard';

// Context for media recording state
interface MediaRecordingContextType {
  setMediaActive: (active: boolean) => void;
}

const MediaRecordingContext = createContext<MediaRecordingContextType | null>(null);

export const useMediaRecording = () => {
  const context = useContext(MediaRecordingContext);
  if (!context) {
    throw new Error('useMediaRecording must be used within MediaRecordingProvider');
  }
  return context;
};

function App() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { entries, setEntries, cleanupEphemeralEntries } = useJournalStore();
  const { isLocked, pinEnabled } = useSecurityStore();
  const [currentView, setCurrentView] = useState<View>('home');
  const [viewHistory, setViewHistory] = useState<View[]>(['home']);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  // Initialize platform detection and security hooks
  const { isPWA } = usePlatformDetection();
  useActivityTracker(); // Track user activity for auto-lock
  useAutoLock(); // Auto-lock after inactivity

  // Auto-logout after 20 minutes of inactivity (excludes media recording)
  const { setMediaActive } = useAutoLogout({
    timeout: 20 * 60 * 1000, // 20 minutes
    onLogout: async () => {
      if (isAuthenticated) {
        await supabase.auth.signOut();
        logout();
      }
    },
  });

  // Time-based theme colors
  useEffect(() => {
    const updateThemeColors = () => {
      const hour = new Date().getHours();
      const root = document.documentElement;
      
      if (hour >= 6 && hour < 12) {
        // Morning
        root.style.setProperty('--current-bg-start', 'var(--morning-bg-start)');
        root.style.setProperty('--current-bg-end', 'var(--morning-bg-end)');
        root.style.setProperty('--current-accent', 'var(--morning-accent)');
        root.style.setProperty('--current-glow', 'var(--morning-glow)');
      } else if (hour >= 12 && hour < 18) {
        // Afternoon
        root.style.setProperty('--current-bg-start', 'var(--afternoon-bg-start)');
        root.style.setProperty('--current-bg-end', 'var(--afternoon-bg-end)');
        root.style.setProperty('--current-accent', 'var(--afternoon-accent)');
        root.style.setProperty('--current-glow', 'var(--afternoon-glow)');
      } else if (hour >= 18 && hour < 22) {
        // Evening
        root.style.setProperty('--current-bg-start', 'var(--evening-bg-start)');
        root.style.setProperty('--current-bg-end', 'var(--evening-bg-end)');
        root.style.setProperty('--current-accent', 'var(--evening-accent)');
        root.style.setProperty('--current-glow', 'var(--evening-glow)');
      } else {
        // Night
        root.style.setProperty('--current-bg-start', 'var(--night-bg-start)');
        root.style.setProperty('--current-bg-end', 'var(--night-bg-end)');
        root.style.setProperty('--current-accent', 'var(--night-accent)');
        root.style.setProperty('--current-glow', 'var(--night-glow)');
      }
    };
    
    updateThemeColors();
    // Update every 30 minutes
    const interval = setInterval(updateThemeColors, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (viewHistory.length > 1) {
        const newHistory = [...viewHistory];
        newHistory.pop(); // Remove current view
        const previousView = newHistory[newHistory.length - 1];
        setViewHistory(newHistory);
        setCurrentView(previousView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Push initial state
    window.history.pushState({ view: currentView }, '');

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [viewHistory]);

  // Update history when view changes
  const navigateToView = (view: View) => {
    setViewHistory([...viewHistory, view]);
    setCurrentView(view);
    window.history.pushState({ view }, '');
  };

  // Setup online/offline listeners
  useEffect(() => {
    const cleanup = setupOnlineListener();
    return cleanup;
  }, []);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user profile
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              full_name: profile?.full_name,
              avatar_url: profile?.avatar_url,
              subscription_tier: profile?.subscription_tier || 'free',
              storage_used: profile?.storage_used || 0,
            });
          });

        // Fetch journal entries
        supabase
          .from('journal_entries')
          .select('*, media_attachments(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) {
              setEntries(data.map((entry: any) => ({
                ...entry,
                media: entry.media_attachments,
              })));
              // Clean up expired ephemeral entries locally
              cleanupEphemeralEntries();
            }
          });

        // Sync offline entries when authenticated
        if (navigator.onLine) {
          syncOfflineEntries(session.user.id);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for new entry trigger from bottom nav
  useEffect(() => {
    const handleNewEntry = () => {
      setCurrentView('checkin');
    };
    
    window.addEventListener('start-new-entry', handleNewEntry);
    return () => window.removeEventListener('start-new-entry', handleNewEntry);
  }, []);

  // Screenshot and copy protection
  useEffect(() => {
    // Add secure mode class to body
    document.body.classList.add('secure-mode');
    
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Detect screenshot attempts (keyboard shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen, Cmd+Shift+3/4/5 (Mac), Windows+Shift+S, Cmd+Ctrl+Shift+3/4 (Mac screenshot to clipboard)
      if (
        e.key === 'PrintScreen' ||
        e.key === 'Print' ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
        (e.metaKey && e.ctrlKey && e.shiftKey && ['3', '4'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.key === 'F12') || // Developer tools
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Inspect element
        (e.metaKey && e.altKey && e.key === 'I') // Mac inspect
      ) {
        e.preventDefault();
        e.stopPropagation();
        
        // Blur the screen briefly when screenshot detected
        document.body.style.filter = 'blur(20px)';
        setTimeout(() => {
          document.body.style.filter = 'none';
        }, 100);
        
        console.log('🔒 Screenshot protection active - Your privacy is protected');
        return false;
      }
    };

    // Detect screen recording on mobile
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Blur content when app goes to background (potential screenshot)
        document.body.style.filter = 'blur(20px)';
      } else {
        document.body.style.filter = 'none';
      }
    };

    // Prevent screenshots via canvas (Android)
    const preventCanvasCapture = () => {
      const canvases = document.getElementsByTagName('canvas');
      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        const context = canvas.getContext('2d');
        if (context) {
          // Disable image smoothing to prevent capture
          (context as any).imageSmoothingEnabled = false;
        }
      }
    };

    // Block developer tools
    const blockDevTools = () => {
      // Detect if dev tools are open
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        document.body.style.filter = 'blur(20px)';
        console.log('🔒 Developer tools detected - Content hidden for security');
      } else {
        document.body.style.filter = 'none';
      }
    };

    // Disable text selection and copy for sensitive content
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Only prevent copy for journal content, not input fields
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && 
          !target.classList.contains('ProseMirror')) {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag and drop of content
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('keyup', handleKeyDown, { capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);
    
    // Check for dev tools every 500ms
    const devToolsInterval = setInterval(blockDevTools, 500);
    
    // Prevent canvas capture
    preventCanvasCapture();
    const canvasInterval = setInterval(preventCanvasCapture, 1000);
    document.addEventListener('copy', handleCopy);

    // Add CSS to prevent text selection on sensitive areas
    const style = document.createElement('style');
    style.textContent = `
      .dashboard-card:not(:has(input)):not(:has(textarea)) {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.classList.remove('secure-mode');
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('keyup', handleKeyDown, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(devToolsInterval);
      clearInterval(canvasInterval);
      document.head.removeChild(style);
      document.body.style.filter = 'none';
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    setViewHistory(['home']);
    setCurrentView('home');
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    navigateToView('editor');
  };

  const handleMoodboardSelect = (moodboard: string, ambience: string) => {
    // Store moodboard selection in settingsStore or journalStore
    console.log('Selected:', moodboard, ambience);
    navigateToView('checkin');
  };

  const handleCheckInComplete = () => {
    navigateToView('editor');
  };

  const handleEntrySaved = () => {
    setEditingEntry(null);
    navigateToView('timeline');
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    navigateToView('editor');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-2xl font-display text-gray-600 dark:text-gray-400">
          Loading your safe space...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => {
      setViewHistory(['home']);
      setCurrentView('home');
    }} />;
  }

  // Show lock screen if app is locked (PWA only)
  if (isPWA && pinEnabled && isLocked) {
    return <LockScreen onUnlock={() => {
      console.log('App unlocked');
    }} />;
  }

  // Show beautiful dashboard for home view
  if (currentView === 'home') {
    return (
      <MediaRecordingContext.Provider value={{ setMediaActive }}>
        <Navbar 
          currentView="home"
          onNavigate={navigateToView}
          onLogout={handleLogout}
        />
        <Dashboard 
          onNavigate={navigateToView}
          onNewEntry={handleNewEntry}
          onLogout={handleLogout}
        />
      </MediaRecordingContext.Provider>
    );
  }

  return (
    <MediaRecordingContext.Provider value={{ setMediaActive }}>
      <div className="min-h-screen" style={{ paddingTop: '80px' }}>
        {/* Navigation */}
        <Navbar 
          currentView={currentView}
          onNavigate={navigateToView}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="pb-20">,
        {currentView === 'checkin' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.full_name || 'friend'}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                How are you holding up today?
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNewEntry}
                className="btn-primary text-xl px-10 py-5 flex items-center gap-3 shadow-xl hover:shadow-2xl"
              >
                <PlusCircle className="w-7 h-7" />
                <span>New Entry</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="card cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setCurrentView('timeline')}>
                <Calendar className="w-12 h-12 text-primary-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your Timeline
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See your emotional journey over time
                </p>
                <div className="mt-4 text-3xl font-bold text-primary-500">
                  {entries.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Entries</div>
              </div>

              <div className="card cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setCurrentView('analytics')}>
                <BarChart3 className="w-12 h-12 text-secondary-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Understand your emotional patterns
                </p>
                <div className="mt-4 text-3xl font-bold text-secondary-500">
                  📊
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">View Analytics</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'checkin' && <EmotionCheckIn onComplete={handleCheckInComplete} />}
        
        {currentView === 'moodboard' && (
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>}>
            <MoodboardSelector onSelect={handleMoodboardSelect} />
          </Suspense>
        )}
        
        {currentView === 'editor' && (
          <JournalEditor
            onSave={handleEntrySaved}
            onCancel={() => setCurrentView('home')}
            editingEntry={editingEntry}
          />
        )}
        
        {currentView === 'timeline' && (
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>}>
            <EmotionalTimeline onEntryClick={handleEditEntry} />
          </Suspense>
        )}
        
        {currentView === 'settings' && (
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>}>
            <Settings />
          </Suspense>
        )}
        
        {currentView === 'legacy' && (
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>}>
            <LegacyMode />
          </Suspense>
        )}
        
        {currentView === 'analytics' && (
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>}>
            <Analytics />
          </Suspense>
        )}
        
        {currentView === 'community' && (
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>}>
            <Community />
          </Suspense>
        )}
      </main>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Install App Prompt */}
      <InstallPrompt />

      {/* Floating Action Button */}
      <button
        onClick={handleNewEntry}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        <PlusCircle className="w-8 h-8" />
      </button>
    </div>
    </MediaRecordingContext.Provider>
  );
}

export default App

