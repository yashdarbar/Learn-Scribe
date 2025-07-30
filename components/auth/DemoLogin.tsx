"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface DemoLoginProps {
  onSuccess?: () => void;
  className?: string;
}

export default function DemoLogin({ onSuccess, className }: DemoLoginProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Demo account credentials
  const DEMO_CREDENTIALS = {
    email: 'yashdarbar2114@gmail.com',
    password: '111111'
  };

  const getFriendlyErrorMessage = (errorMessage: string): string => {
    if (!errorMessage) return 'An error occurred. Please try again.'

    switch (errorMessage) {
      case 'Invalid login credentials':
        return 'Demo account is not available. Please create your own account.'
      case 'Email not confirmed':
        return 'Demo account is not available. Please create your own account.'
      case 'Too many requests':
        return 'Too many attempts. Please wait a moment and try again.'
      case 'User not found':
        return 'Demo account is not available. Please create your own account.'
      default:
        return 'Demo login failed. Please create your own account to continue.'
    }
  }

  const handleDemoLogin = async () => {
    try {
      setLoading(true);

      // Clear any existing session first
      await supabase.auth.signOut();

      // Small delay to ensure signOut is processed
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
      });

      if (error) {
        const userMessage = getFriendlyErrorMessage(error.message);
        toast.error(userMessage);
        return;
      }

      if (data.user && data.session) {
        console.log('Demo login successful:', data);
        toast.success('Logged in with demo account!');

        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Use window.location for a hard redirect to ensure middleware processes the session
        window.location.href = '/dashboard';
      } else {
        toast.error('Demo login failed - please create your own account');
      }

    } catch (error: any) {
      console.error('Demo login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-200"
        variant="default"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <User className="w-4 h-4 mr-2" />
            Try Demo Account
          </>
        )}
      </Button>

      <p className="text-gray-500 text-xs mt-2 text-center">
        No registration required - explore all features
      </p>
    </div>
  );
}