'use client';

import { useRouter } from 'next/navigation';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="relative bg-dark-400 min-h-screen">
      <LandingNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-400">Last updated: April 1, 2026</p>
          </div>
        </div>

        <div className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance</h2>
            <p className="text-gray-400 leading-relaxed">
              By using DSA Sync, you agree to these terms. If you don&apos;t agree, please don&apos;t use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. User Accounts</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
              <li>Provide accurate information</li>
              <li>Keep your account secure</li>
              <li>Be at least 13 years old</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Acceptable Use</h2>
            <p className="text-gray-400 leading-relaxed">
              Don&apos;t use the service illegally, harm other users, or try to breach security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Contact</h2>
            <p className="text-gray-400 leading-relaxed">
              Questions? Email us at{' '}
              <a href="mailto:jeebankrushnasahu1@gmail.com" className="text-primary-400 hover:text-primary-300">
                jeebankrushnasahu1@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
