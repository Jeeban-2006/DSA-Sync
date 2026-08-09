'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Something went wrong');
      }

      setSubmitted(true);
      toast.success('Reset link sent!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="w-20 h-20 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-400">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="card animate-slide-up">
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="text-green-400 text-5xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-white">Check Your Email</h2>
              <p className="text-gray-400">
                If an account exists for <span className="text-white font-medium">{email}</span>, we have sent a password reset link.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-cyan-400 hover:text-cyan-300 text-sm mt-4 block mx-auto"
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
