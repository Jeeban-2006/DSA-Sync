'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, List, RotateCcw, Users, Sparkles } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: List, label: 'Problems', path: '/problems' },
  { icon: Plus, label: 'Add', path: '/problems/add' },
  { icon: RotateCcw, label: 'Revision', path: '/revision' },
  { icon: Users, label: 'Friends', path: '/friends' },
  { icon: Sparkles, label: 'AI', path: '/ai' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-300 border-t border-dark-200 bottom-nav z-50">
      <div className="flex items-center justify-around max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={isActive ? 'nav-item-active' : 'nav-item'}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary-400' : ''}`} />
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
