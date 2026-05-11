'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { supabase } from '@/lib/supabase';

export default function DebugAnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const sendTestEvent = () => {
    const eventName = 'debug_test_event';
    const properties = {
      timestamp: new Date().toISOString(),
      user_id: user?.id || 'anonymous',
      environment: process.env.NODE_ENV,
    };
    
    posthog.capture(eventName, properties);
    setLastEvent(`${eventName} sent at ${new Date().toLocaleTimeString()}`);
  };

  const triggerError = () => {
    throw new Error('Sentry Debug Error: ' + new Date().toISOString());
  };

  return (
    <div className="container mx-auto p-8 space-y-6 text-white">
      <h1 className="text-3xl font-bold">Debug Analytics & Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">PostHog Status</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#1F2937] rounded-lg">
                <p className="font-mono text-sm">
                  User ID: {user?.id || 'Not identified (anonymous)'}
                </p>
                <p className="font-mono text-sm">
                  Email: {user?.email || 'N/A'}
                </p>
              </div>
              
              <button 
                onClick={sendTestEvent} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Send Test Event
              </button>
              
              {lastEvent && (
                <p className="text-sm text-green-500 font-medium">
                  ✓ {lastEvent}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Sentry Test</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Clicking the button below will throw a client-side error to test Sentry's error reporting.
              </p>
              <button 
                onClick={triggerError} 
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Trigger Client Error
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden md:col-span-2">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Rate Limit Test</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Repeatedly call the debug API to test Upstash rate limiting.
              </p>
              <button 
                onClick={async () => {
                  const res = await fetch('/api/debug/rate-limit');
                  const data = await res.json();
                  alert(`Status: ${res.status}\nBody: ${JSON.stringify(data, null, 2)}`);
                }}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-gray-700"
              >
                Test Rate Limit API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
