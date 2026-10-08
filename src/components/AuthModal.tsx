'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onAuthSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'signup',
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email verification state
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase is not configured yet. Please check your credentials in .env.local.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback` 
        : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName.trim() || email.split('@')[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      // Check if user session was immediately established or email confirmation is required
      if (data.session) {
        // Confirmation was disabled in Supabase, logged in immediately
        setSuccessMsg('Account created and signed in successfully!');
        if (onAuthSuccess) onAuthSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // Email verification link sent!
        setVerificationSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase is not configured yet.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg('Your email address has not been verified yet. Please check your inbox for the confirmation link.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data.user) {
        setSuccessMsg('Welcome back! Loading your decks...');
        if (onAuthSuccess) onAuthSuccess();
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error('Supabase not available');
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback?type=recovery` 
        : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSuccessMsg('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;

    setErrorMsg(null);
    try {
      if (!supabase) throw new Error('Supabase not available');
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback` 
        : undefined;

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setSuccessMsg('A new verification email has been sent!');
      setResendCooldown(45);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not resend email.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#18202d] border border-white/10 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-amber-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Box */}
        <div className="p-6 sm:p-8">

          {/* VERIFICATION SENT VIEW */}
          {verificationSent ? (
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-lg">
                <Mail className="h-8 w-8 animate-bounce" />
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Verify Your Email
                </h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed max-w-sm mx-auto">
                  We've sent a confirmation link to:
                  <br />
                  <span className="font-semibold text-amber-200 text-sm mt-0.5 inline-block">
                    {email}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-left text-xs text-white/70 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Click the confirmation link inside your inbox to activate your account.</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>Be sure to check your <strong>Spam or Junk</strong> folder if you don't see it within a minute.</span>
                </div>
              </div>

              {successMsg && (
                <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-2.5 text-xs text-emerald-200">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-2.5 text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend verification email'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationSent(false);
                    setMode('login');
                  }}
                  className="w-full py-2 text-xs font-medium text-white/60 hover:text-white transition cursor-pointer"
                >
                  Already verified? Log in here
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* HEADER & TABS */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs border border-amber-400/20">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
                    Alwinyah Account
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {mode === 'signup' && 'Create your account'}
                  {mode === 'login' && 'Welcome back'}
                  {mode === 'forgot' && 'Reset your password'}
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  {mode === 'signup' && 'Sync your flashcard decks across all your devices for free.'}
                  {mode === 'login' && 'Log in to continue your spaced repetition study streaks.'}
                  {mode === 'forgot' && "Enter your email to receive recovery instructions."}
                </p>

                {/* Tabs */}
                {mode !== 'forgot' && (
                  <div className="mt-5 grid grid-cols-2 rounded-xl bg-black/30 p-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                        mode === 'signup'
                          ? 'bg-white text-zinc-950 shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                        mode === 'login'
                          ? 'bg-white text-zinc-950 shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Log In
                    </button>
                  </div>
                )}
              </div>

              {/* Error & Success Messages */}
              {errorMsg && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-500/20 border border-red-500/30 p-3 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">
                    <p>{errorMsg}</p>
                    {errorMsg.includes('verified') && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="mt-1 font-bold text-amber-300 underline hover:text-amber-200 cursor-pointer block"
                      >
                        Click here to resend the verification link
                      </button>
                    )}
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-3 text-xs text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* FORMS */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/70">
                      Display Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Alex Hunter"
                        className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/70">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/70">
                      Password (min 6 characters) *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-white/40 hover:text-white/80 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/70">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-white/50 leading-relaxed pt-1">
                    By creating an account, an email verification link will be sent to confirm your email.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 shadow-lg hover:bg-white/90 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" />
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {mode === 'login' && (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/70">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] font-semibold text-amber-300 hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-white/40 hover:text-white/80 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 shadow-lg hover:bg-white/90 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" />
                    ) : (
                      <>
                        <span>Log In</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/70">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 border border-white/10 focus:border-amber-400/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 shadow-lg hover:bg-white/90 transition disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-zinc-950" />
                    ) : (
                      <span>Send Recovery Link</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="w-full py-2 text-xs font-semibold text-white/60 hover:text-white text-center cursor-pointer"
                  >
                    Back to Log In
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
