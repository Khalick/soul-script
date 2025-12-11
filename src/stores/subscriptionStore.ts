import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SubscriptionState {
  isPremium: boolean;
  subscriptionEndDate: string | null;
  setSubscription: (isPremium: boolean, endDate?: string) => void;
  checkSubscriptionStatus: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      subscriptionEndDate: null,
      
      setSubscription: (isPremium: boolean, endDate?: string) => {
        set({ 
          isPremium, 
          subscriptionEndDate: endDate || null 
        });
      },
      
      checkSubscriptionStatus: () => {
        const { isPremium, subscriptionEndDate } = get();
        if (!isPremium) return false;
        
        if (subscriptionEndDate) {
          const endDate = new Date(subscriptionEndDate);
          const now = new Date();
          if (now > endDate) {
            set({ isPremium: false, subscriptionEndDate: null });
            return false;
          }
        }
        
        return true;
      },
    }),
    {
      name: 'soul-script-subscription',
    }
  )
);
