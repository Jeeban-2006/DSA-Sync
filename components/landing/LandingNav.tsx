'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Code2 } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';

export default function LandingNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const isAboutPage = pathname === '/about';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ScrollSpy logic
  useEffect(() => {
    const sections = ['hero', 'features', 'roadmap', 'collaboration', 'ai'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -60% 0px', // Adjusted to account for navbar height and better triggering
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(sectionId => {
      const el = document.getElementById(sectionId);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    if (isAboutPage) {
      router.push(`/#${id}`);
      setIsMobileMenuOpen(false);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const topPos = element.getBoundingClientRect().top + window.scrollY - 80; // Subtract nav height (80px)
      window.scrollTo({ top: topPos, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'collaboration', label: 'Collaboration' },
    { id: 'ai', label: 'AI Powered' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-300/95 backdrop-blur-xl border-b border-white/10'
          : 'bg-dark-400/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={() => scrollToSection('hero')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              DSA <span className="text-cyan-400">Sync</span>
            </span>
          </div>

          {/* Desktop Menu - Centered */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  !isAboutPage && activeSection === link.id
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => router.push('/about')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isAboutPage
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              About
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-dark-400 rounded-lg hover:shadow-xl hover:shadow-cyan-500/40 transition-all font-semibold text-sm"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-dark-400 rounded-lg hover:shadow-xl hover:shadow-cyan-500/40 transition-all font-semibold text-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-dark-300/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  !isAboutPage && activeSection === link.id
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                router.push('/about');
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isAboutPage
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              About
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="block w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-dark-400 rounded-lg font-semibold mt-2"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => router.push('/auth/login')}
                className="block w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-dark-400 rounded-lg font-semibold mt-2"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
