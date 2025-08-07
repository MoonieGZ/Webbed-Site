import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  rank?: string;
  avatar?: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/session');
      const data: SessionResponse = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to fetch user data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
