import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import { useJournalStore } from './stores/journalStore';
import { setupOnlineListener, syncOfflineEntries } from './lib/offlineSync';
import AuthPage from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import EmotionCheckIn from './components/EmotionCheckIn';
import JournalEditor from './components/JournalEditor';
import EmotionalTimeline from './components/EmotionalTimeline';
import { Settings } from './components/Settings';
import LegacyMode from './components/LegacyMode';
import { Analytics } from './components/Analytics';
import { Community } from './components/Community';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import InstallPrompt from './components/InstallPrompt';
import { Calendar, BarChart3, PlusCircle } from 'lucide-react';

type View = 'home' | 'checkin' | 'editor' | 'timeline' | 'analytics' | 'community' | 'settings' | 'legacy';

function App() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { entries, setEntries } = useJournalStore();
  const [currentView, setCurrentView] = useState<View>('home');
  const [viewHistory, setViewHistory] = useState<View[]>(['home']);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<any>(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    setViewHistory(['home']);
    setCurrentView('home');
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
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

  // Show beautiful dashboard for home view
  if (currentView === 'home') {
    return (
      <>
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
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingTop: '80px' }}>
      {/* Navigation */}
      <Navbar 
        currentView={currentView}
        onNavigate={navigateToView}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="pb-20">
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
        
        {currentView === 'editor' && (
          <JournalEditor
            onSave={handleEntrySaved}
            onCancel={() => setCurrentView('home')}
            editingEntry={editingEntry}
          />
        )}
        
        {currentView === 'timeline' && (
          <EmotionalTimeline onEntryClick={handleEditEntry} />
        )}
        
        {currentView === 'settings' && <Settings />}
        
        {currentView === 'legacy' && <LegacyMode />}
        
        {currentView === 'analytics' && <Analytics />}
        
        {currentView === 'community' && <Community />}
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
  );
}

export default App

