'use client';

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';


if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    // Disable in development if preferred
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Identify user with PostHog when they log in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        posthog.identify(user.id, {
          email: user.email,
          name: user.user_metadata?.full_name,
          phone: user.user_metadata?.phone,
        });
      } else {
        posthog.reset();
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          posthog.identify(session.user.id, {
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            phone: session.user.user_metadata?.phone,
          });
        } else if (event === 'SIGNED_OUT') {
          posthog.reset();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <Provider client={posthog}>{children}</Provider>;
}
