'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DebugAnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const supabase = createClient();

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
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Analytics & Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>PostHog Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-mono text-sm">
                User ID: {user?.id || 'Not identified (anonymous)'}
              </p>
              <p className="font-mono text-sm">
                Email: {user?.email || 'N/A'}
              </p>
            </div>
            
            <Button onClick={sendTestEvent} className="w-full">
              Send Test Event
            </Button>
            
            {lastEvent && (
              <p className="text-sm text-green-500 font-medium">
                ✓ {lastEvent}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentry Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Clicking the button below will throw a client-side error to test Sentry's error reporting.
            </p>
            <Button variant="destructive" onClick={triggerError} className="w-full">
              Trigger Client Error
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rate Limit Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Repeatedly call the debug API to test Upstash rate limiting.
            </p>
            <Button 
              variant="outline" 
              onClick={async () => {
                const res = await fetch('/api/debug/rate-limit');
                const data = await res.json();
                alert(`Status: ${res.status}\nBody: ${JSON.stringify(data, null, 2)}`);
              }}
              className="w-full"
            >
              Test Rate Limit API
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
