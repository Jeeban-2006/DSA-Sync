'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, AtSign, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { data, error } = await api.register({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      const authData = data as any;
      login(authData.token, authData.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-500 via-dark-400 to-dark-300">
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-600/50">
            <span className="text-3xl font-bold text-white">DS</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Join DSA Sync</h1>
          <p className="text-gray-400">Start your DSA journey with AI</p>
        </div>

        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">
                <AtSign className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                className="input"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                required
              />
            </div>

            <div>
              <label className="label">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                className="input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirm Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
