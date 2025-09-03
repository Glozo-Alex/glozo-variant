import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Handle Google OAuth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Auth page: Checking for OAuth callback...');
      console.log('Auth page: Current URL:', window.location.href);
      console.log('Auth page: URL hash:', window.location.hash);
      console.log('Auth page: URL search:', window.location.search);
      
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      const hasCode = !!(searchParams.get('code') || hashParams.get('code'));
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
      
      console.log('Auth page: Parsed params:', { hasCode, accessToken: !!accessToken, refreshToken: !!refreshToken });

      try {
        if (hasCode) {
          console.log('Auth page: Exchanging code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          console.log('Auth page: exchangeCodeForSession result:', { data, error });
          if (error) {
            console.error('Auth page: exchangeCodeForSession error:', error);
            toast({
              title: 'Ошибка авторизации',
              description: error.message || 'Не удалось завершить вход через Google.',
              variant: 'destructive',
            });
          }
          // Clear URL parameters regardless to avoid repeated exchanges
          window.history.replaceState({}, document.title, '/auth');
        } else if (accessToken || refreshToken) {
          console.log('Auth page: OAuth tokens detected, refreshing session...');
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log('Auth page: Session refresh result:', { session, error });
        }
      } catch (error) {
        console.error('Auth page: Error handling callback:', error);
      }

      // After handling, if user is set, redirect handled by the other effect
    };

    handleAuthCallback();
  }, [navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('Auth page: User already authenticated, redirecting...');
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    console.log('Auth page: Starting Google sign in process...');
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      console.log('Auth page: Sign in result:', { error });

      if (error) {
        console.error('Auth page: Sign in error:', error);
        toast({
          title: "Ошибка авторизации",
          description: error.message || "Произошла ошибка при входе через Google.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Auth page: Unexpected error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла неожиданная ошибка.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gradient">
            Добро пожаловать
          </CardTitle>
          <CardDescription>
            Войдите в платформу поиска кандидатов через Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full btn-gradient flex items-center gap-3"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Авторизация...' : 'Войти через Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;