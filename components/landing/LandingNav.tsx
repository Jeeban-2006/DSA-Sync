'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Code2 } from 'lucide-react';

export default function LandingNav() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

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
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('collaboration')}
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Collaboration
            </button>
            <button
              onClick={() => scrollToSection('ai')}
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              AI Powered
            </button>
            <button
              onClick={() => router.push('/about')}
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              About
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => router.push('/auth/register')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-dark-400 rounded-lg hover:shadow-xl hover:shadow-cyan-500/40 transition-all font-semibold text-sm"
            >
              Get Started
            </button>
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
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('collaboration')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              Collaboration
            </button>
            <button
              onClick={() => scrollToSection('ai')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              AI Powered
            </button>
            <button
              onClick={() => router.push('/about')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              About
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="block w-full text-left px-4 py-3 text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/register')}
              className="block w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-dark-400 rounded-lg font-semibold mt-2"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
