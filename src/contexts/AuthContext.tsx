import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    console.log('Auth Debug - Setting up auth listener, current origin:', window.location.origin);
    
    let hasInitialized = false;
    let hasValidSession = false;
    
    // First, check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Auth Debug - Initial session check:', session?.user?.email);
      console.log('Auth Debug - Initial session error:', error);
      console.log('Auth Debug - Initial session tokens:', session?.access_token ? 'Present' : 'Missing');
      
      hasInitialized = true;
      hasValidSession = !!session?.access_token;
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Then set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth Debug - Auth state change:', event, session?.user?.email);
        console.log('Auth Debug - Session object:', session);
        console.log('Auth Debug - Access token:', session?.access_token ? 'Present' : 'Missing');
        console.log('Auth Debug - Refresh token:', session?.refresh_token ? 'Present' : 'Missing');
        console.log('Auth Debug - Has initialized:', hasInitialized, 'Has valid session:', hasValidSession);
        
        // Ignore INITIAL_SESSION events that come after we already have a valid session
        if (event === 'INITIAL_SESSION' && hasValidSession && hasInitialized) {
          console.log('Auth Debug - Ignoring INITIAL_SESSION after valid session');
          return;
        }
        
        // Don't clear a valid session with an invalid one unless it's a SIGNED_OUT event
        if (hasValidSession && !session?.access_token && event !== 'SIGNED_OUT') {
          console.log('Auth Debug - Protecting valid session from being cleared');
          return;
        }
        
        // Update session state
        const isValidSession = !!session?.access_token;
        hasValidSession = isValidSession;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false if we've initialized
        if (hasInitialized) {
          setLoading(false);
        }
      }
    );

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
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};