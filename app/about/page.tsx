'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import {
  ArrowLeft,
  Code2,
  Brain,
  Rocket,
  Target,
  Github,
  Linkedin,
  Mail,
  Award,
  BookOpen,
  Zap,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-hero', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2,
      });

      gsap.from('.about-section', {
        scrollTrigger: {
          trigger: '.about-section',
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.skill-card', {
        scrollTrigger: {
          trigger: '.skill-card',
          start: 'top 85%',
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-dark-400 min-h-screen overflow-hidden">
      <LandingNav />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items center justify-center overflow-hidden pt-20"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="about-hero group flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Profile Section */}
          <div className="text-center mb-16">
            <div className="about-hero w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gradient-to-br from-primary-500 to-purple-600 shadow-2xl shadow-primary-600/50 relative">
              <Image
                src="/Jeeban.jpg"
                alt="Jeeban Krushna Sahu"
                width={128}
                height={128}
                className="object-cover w-full h-full"
                priority
              />
            </div>

            <h1 className="about-hero text-4xl sm:text-6xl font-bold text-white mb-4">
              About the Creator
            </h1>

            <p className="about-hero text-xl text-gray-300 mb-6">
              B.Tech Student | DSA Enthusiast | Full-Stack Developer
            </p>

            <div className="about-hero flex items-center justify-center gap-4">
              <a
                href="https://github.com/Jeeban-2006"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 hover:border-primary-500/50"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/jeeban-krushna-sahu-004228301/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 hover:border-blue-500/50"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:jeebankrushnasahu1@gmail.com"
                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 hover:border-purple-500/50"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Story Section */}
          <div className="about-section max-w-3xl mx-auto space-y-8 mb-16">
            <div className="bg-gradient-to-br from-dark-200/50 to-dark-300/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Rocket className="w-7 h-7 text-primary-400" />
                My Journey
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                As a B.Tech student passionate about problem-solving and competitive programming, 
                I found myself struggling to track my DSA progress effectively. Existing tools were 
                either too complex or lacked essential features like friend collaboration and AI insights.
              </p>
              <p className="text-gray-300 leading-relaxed">
                That&apos;s when I decided to build <span className="text-primary-400 font-semibold">DSA Sync</span> – 
                a platform that combines smart tracking, collaborative learning, and AI-powered recommendations 
                to help developers grow consistently in their DSA journey.
              </p>
            </div>

            <div className="bg-gradient-to-br from-dark-200/50 to-dark-300/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Target className="w-7 h-7 text-purple-400" />
                Vision
              </h2>
              <p className="text-gray-300 leading-relaxed">
                My vision is to create a platform where developers can not only track their progress 
                but also learn from each other, stay motivated through gamification, and receive 
                personalized guidance powered by AI. DSA Sync is more than just a tracker – it&apos;s a 
                growth companion for every aspiring software engineer.
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="about-section mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Tech Stack & Skills</h2>
            <p className="text-gray-400 text-center mb-8">Technologies used to build DSA Sync</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'Next.js 14', icon: Zap, color: 'from-blue-500 to-cyan-500' },
                { name: 'TypeScript', icon: Code2, color: 'from-blue-600 to-blue-400' },
                { name: 'React', icon: Code2, color: 'from-cyan-500 to-blue-500' },
                { name: 'Node.js', icon: Code2, color: 'from-green-600 to-green-500' },
                { name: 'MongoDB', icon: BookOpen, color: 'from-green-600 to-green-400' },
                { name: 'Groq AI', icon: Brain, color: 'from-purple-600 to-pink-600' },
                { name: 'Three.js', icon: Award, color: 'from-purple-500 to-pink-500' },
                { name: 'GSAP', icon: Zap, color: 'from-green-500 to-emerald-500' },
                { name: 'Tailwind CSS', icon: Code2, color: 'from-cyan-400 to-blue-500' },
                { name: 'PWA', icon: Rocket, color: 'from-orange-500 to-red-500' },
                { name: 'JWT Auth', icon: Target, color: 'from-yellow-500 to-orange-500' },
                { name: 'REST API', icon: Code2, color: 'from-indigo-500 to-purple-500' },
                { name: 'Git & GitHub', icon: Github, color: 'from-gray-700 to-gray-600' },
                { name: 'Vercel', icon: Zap, color: 'from-black to-gray-800' },
                { name: 'Mongoose', icon: BookOpen, color: 'from-red-600 to-red-400' },
              ].map((skill, index) => (
                <div
                  key={index}
                  className="skill-card group relative bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-primary-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 cursor-pointer"
                  style={{
                    animation: `rollIn 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${skill.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <skill.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white font-semibold text-sm">{skill.name}</p>
                </div>
              ))}
            </div>

            <style jsx>{`
              @keyframes rollIn {
                0% {
                  opacity: 0;
                  transform: translateX(-100%) rotate(-120deg);
                }
                100% {
                  opacity: 1;
                  transform: translateX(0) rotate(0deg);
                }
              }
            `}</style>
          </div>

          {/* Timeline Section */}
          <div className="about-section mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Development Timeline</h2>

            <div className="max-w-2xl mx-auto space-y-8">
              {[
                {
                  phase: 'Phase 1',
                  title: 'Ideation & Planning',
                  description: 'Identified pain points and planned core features',
                  month: 'Month 1',
                },
                {
                  phase: 'Phase 2',
                  title: 'Core Development',
                  description: 'Built authentication, problem tracking, and analytics',
                  month: 'Month 2-3',
                },
                {
                  phase: 'Phase 3',
                  title: 'Advanced Features',
                  description: 'Implemented friend system, revision tracking, and AI integration',
                  month: 'Month 4',
                },
                {
                  phase: 'Phase 4',
                  title: 'Polish & Launch',
                  description: 'Added 3D animations, optimized performance, and launched',
                  month: 'Month 5',
                },
              ].map((milestone, index) => (
                <div key={index} className="relative flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold border-4 border-dark-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-dark-200/50 to-dark-300/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary-400 font-semibold">{milestone.phase}</span>
                      <span className="text-gray-500 text-sm">{milestone.month}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                    <p className="text-gray-300">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="about-section text-center bg-gradient-to-br from-primary-900/20 to-purple-900/20 backdrop-blur-sm border border-primary-500/20 rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-white mb-4">Let&apos;s Connect</h2>
            <p className="text-gray-300 mb-6">
              Interested in collaboration or have feedback? Feel free to reach out!
            </p>
            <a
              href="mailto:jeebankrushnasahu1@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-primary-600/50 transition-all hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
