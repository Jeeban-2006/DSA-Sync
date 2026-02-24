'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  ArrowRight,
  Code2,
  Users,
  Brain,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  BarChart3,
  MessageSquare,
  Award,
  Rocket,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

// Dynamically import Three.js component
const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 to-transparent" />,
});

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const collaborationRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    // Smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';

    // Simple Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate classes (including variants)
    const animateElements = document.querySelectorAll(
      '.scroll-animate, .scroll-animate-scale, .scroll-animate-slide-left, .scroll-animate-slide-right'
    );
    animateElements.forEach(el => observer.observe(el));

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative bg-dark-400 overflow-hidden">
      <LandingNav />

      {/* Hero Section */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <HeroScene />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-400/50 to-dark-400" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/10 via-transparent to-purple-900/10" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="hero-badge inline-block mb-4 px-4 py-2 rounded-full bg-primary-600/20 border border-primary-500/30 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="text-primary-300 text-sm font-medium">
              ✨ AI-Powered DSA Growth Platform
            </span>
          </div>

          <h1 className="hero-title text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            Track. Compare.{' '}
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Improve
            </span>
            .
          </h1>

          <p className="hero-subtitle text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
            An intelligent platform to track your DSA journey, collaborate with friends, 
            and get AI-powered recommendations for consistent growth.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
            <button
              onClick={() => router.push('/auth/register')}
              className="hero-cta group px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary-600/50 transition-all flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hero-cta px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Explore Features
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}>
            <div>
              <p className="text-3xl font-bold text-white">5k+</p>
              <p className="text-gray-400 text-sm">Problems Tracked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1k+</p>
              <p className="text-gray-400 text-sm">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-gray-400 text-sm">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={featuresRef}
        className="parallax-section relative py-24 bg-gradient-to-b from-dark-400 to-dark-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title scroll-animate text-3xl sm:text-5xl font-bold text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to accelerate your DSA learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code2,
                title: 'Smart Problem Tracking',
                description: 'Log problems with detailed metadata. Track difficulty, topics, time taken, and your approach.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: TrendingUp,
                title: 'Advanced Analytics',
                description: 'Visualize your progress with interactive charts, heatmaps, and performance metrics.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Target,
                title: 'Revision Scheduling',
                description: 'Automated 3-7-30 day revision cycles to strengthen concepts and improve retention.',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: Users,
                title: 'Friend Comparison',
                description: 'Connect with fellow coders, compare progress, and motivate each other to stay consistent.',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Brain,
                title: 'AI Recommendations',
                description: 'Get personalized problem suggestions based on your solving patterns and weak areas.',
                color: 'from-indigo-500 to-blue-500',
              },
              {
                icon: Award,
                title: 'XP & Achievements',
                description: 'Earn XP, level up, and unlock achievements as you progress through your DSA journey.',
                color: 'from-yellow-500 to-orange-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card group relative bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-600/20 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/0 to-purple-600/0 group-hover:from-primary-600/5 group-hover:to-purple-600/5 rounded-2xl transition-all duration-500" />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section
        id="collaboration"
        ref={collaborationRef}
        className="relative py-24 bg-gradient-to-b from-dark-300 to-dark-400 overflow-hidden"
      >
        {/* Background Effect */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="collab-content scroll-animate-slide-left">
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30">
                <span className="text-green-300 text-sm font-medium">🤝 Collaboration Mode</span>
              </div>

              <h2 className="section-title scroll-animate text-3xl sm:text-5xl font-bold text-white mb-6">
                Grow Together with Friends
              </h2>

              <p className="text-gray-400 text-lg mb-8">
                Connect with fellow coders, compare progress, and push each other to new heights. 
                Competition breeds excellence.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Users, text: 'Add friends by username' },
                  { icon: BarChart3, text: 'Compare solving patterns & streaks' },
                  { icon: MessageSquare, text: 'Share approaches & discussions' },
                  { icon: Trophy, text: 'Friendly leaderboards' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-white">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative collab-image scroll-animate-slide-right">
              <div className="relative bg-gradient-to-br from-dark-200/50 to-dark-300/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="space-y-4">
                  {['Alex - 156 problems', 'Jordan - 142 problems', 'Sam - 128 problems'].map((friend, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      style={{ animation: `fadeIn 0.5s ease-out ${i * 0.2}s both` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {friend[0]}
                        </div>
                        <span className="text-white">{friend}</span>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section
        id="ai"
        ref={aiRef}
        className="relative py-24 bg-gradient-to-b from-dark-400 to-black overflow-hidden"
      >
        {/* Background Effect */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30">
              <span className="text-purple-300 text-sm font-medium">🧠 AI-Powered Intelligence</span>
            </div>

            <h2 className="section-title scroll-animate text-3xl sm:text-5xl font-bold text-white mb-4">
              Your Personal AI Coach
            </h2>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Advanced AI algorithms analyze your solving patterns and provide personalized insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                title: 'Smart Recommendations',
                description: 'AI suggests problems based on your weak topics and recent performance',
              },
              {
                icon: Target,
                title: 'Pattern Detection',
                description: 'Identifies your solving patterns and areas that need improvement',
              },
              {
                icon: Zap,
                title: 'Confidence Analysis',
                description: 'Estimates your confidence level on different topics and subtopics',
              },
              {
                icon: Rocket,
                title: 'Growth Reports',
                description: 'Weekly AI-generated reports tracking your progress and suggesting next steps',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="ai-feature scroll-animate-scale relative group bg-gradient-to-br from-purple-900/20 to-dark-200/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-600/30 cursor-pointer"
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-primary-900/20 via-purple-900/20 to-primary-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 text-primary-400 mx-auto mb-6" />

          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to Level Up Your DSA Game?
          </h2>

          <p className="text-gray-300 text-lg mb-8">
            Join thousands of developers tracking their progress and achieving their goals
          </p>

          <button
            onClick={() => router.push('/auth/register')}
            className="group px-10 py-5 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-primary-600/50 transition-all flex items-center gap-3 mx-auto"
          >
            Start Your Journey
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      <LandingFooter />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
