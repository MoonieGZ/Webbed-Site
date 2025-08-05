'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Moon, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MagicLinkPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('invalid');
      setMessage('No token provided');
      return;
    }

    validateToken(token);
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/login/magic/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        if (data.shouldCreateUser) {
          setMessage('Account created successfully! Redirecting...');

          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setMessage('Login successful! Redirecting...');

          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Invalid or expired token');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while validating the token');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
      case 'invalid':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
      case 'invalid':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Moon className="size-4" />
            </div>
            mnsy.dev
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
              {status === 'loading' && 'Validating...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Error'}
              {status === 'invalid' && 'Invalid Token'}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {message}
            </p>
            {(status === 'error' || status === 'invalid') && (
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login/bg.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-50"
        />
      </div>
    </div>
  );
} 