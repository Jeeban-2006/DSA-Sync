'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to rehydrate from localStorage
    if (!hasHydrated) {
      return;
    }

    // Once hydrated, check authentication
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      setIsChecking(false);
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show loading while checking authentication or store is rehydrating
  if (!hasHydrated || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-500">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
