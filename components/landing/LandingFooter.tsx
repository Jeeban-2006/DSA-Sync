'use client';

import { useRouter } from 'next/navigation';
import { Github, Linkedin, Mail, Sparkles, Code2, Brain, Users, TrendingUp } from 'lucide-react';

export default function LandingFooter() {
  const router = useRouter();

  return (
    <footer className="relative bg-gradient-to-b from-dark-400 to-black border-t border-white/10 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                DSA Sync
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              AI-powered collaborative DSA growth platform for competitive programmers.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/Jeeban-2006/DSA-Sync"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/jeeban-krushna-sahu-004228301/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:jeebankrushnasahu1@gmail.com"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">
                <Code2 className="w-4 h-4 text-primary-400" />
                Smart Tracking
              </li>
              <li className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                Analytics Dashboard
              </li>
              <li className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">
                <Users className="w-4 h-4 text-primary-400" />
                Friend Comparison
              </li>
              <li className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">
                <Brain className="w-4 h-4 text-primary-400" />
                AI Recommendations
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Get Started
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/about')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  About Creator
                </button>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-white font-semibold mb-4">Built With</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Next.js 14</li>
              <li>TypeScript</li>
              <li>MongoDB</li>
              <li>Groq AI</li>
              <li>Three.js</li>
              <li>GSAP</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 DSA Sync. Built with  ❤️ for competitive programmers.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
