'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Something went wrong');
      }

      setSuccess(true);
      toast.success('Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="card text-center py-10 animate-fade-in">
        <h2 className="text-xl font-bold text-red-400 mb-4">Invalid Reset Link</h2>
        <p className="text-gray-400 mb-6">This password reset link is missing or invalid.</p>
        <Link href="/auth/forgot-password" className="btn-primary inline-block">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card text-center py-10 animate-slide-up">
        <div className="text-green-400 text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
        <p className="text-gray-400 mb-6">Your password has been successfully updated.</p>
        <p className="text-sm text-gray-500 mb-4">Redirecting to login...</p>
        <Link href="/auth/login" className="btn-primary inline-block w-full">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="card animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">
            <Lock className="w-4 h-4 inline mr-2" />
            New Password
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="label">
            <Lock className="w-4 h-4 inline mr-2" />
            Confirm New Password
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-500 via-dark-400 to-dark-300">
      <Link
        href="/auth/login"
        className="fixed top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Login</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Set New Password
          </h1>
          <p className="text-gray-400">
            Enter your new secure password below
          </p>
        </div>

        <Suspense fallback={<div className="card flex justify-center py-10"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
