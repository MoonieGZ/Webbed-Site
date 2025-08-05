'use client';

import { useEffect, useState } from 'react';
import { Moon, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
        setAuthenticated(true);
      } else {
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      window.location.href = '/login';
      return;
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Moon className="size-4" />
            </div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
          <p className="text-muted-foreground mb-6">
            You have successfully logged in using magic link authentication.
            Your session will automatically extend as long as you visit the site within 30 days.
          </p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">User Info</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {user?.id}<br/>
                  Email: {user?.email}<br/>
                  Name: {user?.name || 'Not set'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Session Status</h3>
                <p className="text-sm text-muted-foreground">
                  ✅ Authenticated<br/>
                  🔄 Auto-extending<br/>
                  📅 30-day sessions
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Access your tools and settings
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 