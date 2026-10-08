'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email and activating your account...');

  useEffect(() => {
    async function handleAuth() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus('error');
        setMessage('Supabase client is not configured.');
        return;
      }

      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Verification link expired or invalid.');
          return;
        }

        // If code is present (PKCE flow)
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('exchangeCodeForSession error:', exchangeError.message);
          }
        }

        // Check if session is now active
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          setStatus('success');
          setMessage('Email confirmed! Welcome to Alwinyah. Redirecting to your dashboard...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          const client = supabase;
          if (client) {
            const { data: authListener } = client.auth.onAuthStateChange((event, s) => {
              if (event === 'SIGNED_IN' || s) {
                setStatus('success');
                setMessage('Email confirmed! Redirecting to your dashboard...');
                setTimeout(() => {
                  router.push('/');
                }, 1200);
              }
            });

            // Fallback timeout in case already signed in
            setTimeout(async () => {
              const { data } = await client.auth.getUser();
              if (data?.user) {
                setStatus('success');
                setMessage('Your account is ready! Redirecting...');
                router.push('/');
              } else {
                setStatus('success');
                setMessage('Your email has been confirmed. You can now log in.');
                setTimeout(() => {
                  router.push('/');
                }, 1500);
              }
            }, 2000);
          }
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to verify email.');
      }
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#18202d] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl bg-[#222c3d]/90 p-8 text-center border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/10 shadow-sm mb-5">
          <BookOpen className="h-7 w-7 text-white/90" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          {status === 'verifying' && 'Confirming Email...'}
          {status === 'success' && 'Account Activated!'}
          {status === 'error' && 'Verification Issue'}
        </h2>

        <p className="text-xs text-white/70 mb-6 leading-relaxed">
          {message}
        </p>

        {status === 'verifying' && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-8 w-8 animate-spin text-amber-300" />
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center justify-center py-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-in zoom-in duration-300" />
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-2">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-xl bg-white py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-white/90 cursor-pointer"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#18202d] text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-300" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
