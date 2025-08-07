import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'user';
  type: 'internal' | 'wholesale';
  discount?: number; // Percentage discount for wholesale users
  customPricing?: Record<string, number>; // Custom prices per SKU
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthStore extends AuthState {
  login: (email: string, password: string, type: 'internal' | 'wholesale') => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Mock authentication - replace with real Gel auth later
interface InternalUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

interface WholesaleUser {
  email: string;
  password: string;
  name: string;
  discount: number;
  customPricing: Record<string, number>;
}

const MOCK_INTERNAL_USERS: InternalUser[] = [
  { email: 'admin@goldmine.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'user@goldmine.com', password: 'user123', name: 'Regular User', role: 'user' },
];

const MOCK_WHOLESALE_USERS: WholesaleUser[] = [
  { 
    email: 'wholesale1@goldmine.com', 
    password: 'wholesale123', 
    name: 'Wholesale Customer 1', 
    discount: 15,
    customPricing: {
      'SKU001': 25.50,
      'SKU002': 18.75,
    }
  },
  { 
    email: 'wholesale2@goldmine.com', 
    password: 'wholesale456', 
    name: 'Wholesale Customer 2', 
    discount: 10,
    customPricing: {
      'SKU001': 28.00,
      'SKU003': 22.50,
    }
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, type: 'internal' | 'wholesale') => {
        set({ isLoading: true, error: null });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          let mockUser;
          
          if (type === 'internal') {
            mockUser = MOCK_INTERNAL_USERS.find(u => u.email === email && u.password === password);
          } else {
            mockUser = MOCK_WHOLESALE_USERS.find(u => u.email === email && u.password === password);
          }
          
          if (mockUser) {
            const userData = {
              id: `user_${Date.now()}`,
              email: mockUser.email,
              name: mockUser.name,
              type,
            };

            if (type === 'internal') {
              const internalUser = mockUser as InternalUser;
              set({
                user: {
                  ...userData,
                  role: internalUser.role,
                },
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              const wholesaleUser = mockUser as WholesaleUser;
              set({
                user: {
                  ...userData,
                  role: 'user',
                  discount: wholesaleUser.discount,
                  customPricing: wholesaleUser.customPricing,
                },
                isAuthenticated: true,
                isLoading: false,
              });
            }
            return true;
          }
          
          set({ isLoading: false, error: 'Invalid credentials' });
          return false;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: 'Login failed. Please try again.' 
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        // Simulate checking session
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For now, just check if we have a user in storage
        const state = get();
        if (state.user) {
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 