import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsTestUser: () => void;
  signOut: () => Promise<void>;
  isInIframe: boolean;
  isDevelopment: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if running in iframe and development mode
  const isInIframe = window.self !== window.top;
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable.app');

  useEffect(() => {
    console.log('Auth Debug - Setting up auth listener, current origin:', window.location.origin);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth Debug - Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Determine redirect URL to current origin (must be allowlisted in Supabase Auth settings)
      const redirectUrl = window.location.origin;
      console.log('Auth Debug - Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectUrl}/`
        }
      });

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
    }
  };

  const signInAsTestUser = () => {
    // Create a mock user for development/iframe testing
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString(),
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      user_metadata: {
        name: 'Test User',
        picture: 'https://via.placeholder.com/150',
      },
    } as User;

    const mockSession = {
      user: mockUser,
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
    } as Session;

    setUser(mockUser);
    setSession(mockSession);
    setLoading(false);
    
    toast({
      title: "Test User Signed In",
      description: "You are now signed in as a test user for development.",
    });
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInAsTestUser,
    signOut,
    isInIframe,
    isDevelopment,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};