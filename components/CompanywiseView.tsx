'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api-client';
import { Lock, Search, Star, ExternalLink, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanywiseView() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyProblems, setCompanyProblems] = useState<any[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  useEffect(() => {
    // Check for mock success
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mock_success') === 'true') {
        toast.success('Mock purchase successful! You are now Premium.');
        updateUser({ isPremium: true });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // We only load companies if they are premium, or we can load the list to show what they are missing out on!
    fetch('/data/companies.json')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error('Failed to load companies:', err));
  }, [updateUser]);

  const loadCompanyProblems = async (slug: string) => {
    setSelectedCompany(slug);
    setLoadingProblems(true);
    try {
      const { data, error } = await api.getCompanyProblems(slug);
      if (error) throw new Error(error);
      setCompanyProblems((data as any).problems || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load problems');
      setSelectedCompany(null);
    } finally {
      setLoadingProblems(false);
    }
  };

  if (selectedCompany) {
    const company = companies.find(c => c.slug === selectedCompany);
    return (
      <div className="p-4 max-w-5xl mx-auto w-full space-y-4">
        <button 
          onClick={() => setSelectedCompany(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </button>
        
        <div className="bg-dark-300 rounded-xl p-6 border border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{company?.name} Questions</h2>
            <p className="text-gray-400 text-sm mt-1">Based on recent interview experiences</p>
          </div>
        </div>

        {loadingProblems ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-dark-300 rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-dark-200/50">
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Problem</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase">Difficulty</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Acceptance</th>
                    <th className="p-4 text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companyProblems.map((p: any, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <button className="text-gray-500 hover:text-green-500 transition-colors">
                          <Circle className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="p-4">
                        <a 
                          href={p.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-white hover:text-purple-400 transition-colors flex items-center gap-2"
                        >
                          {p.title}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          p.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          p.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400 hidden sm:table-cell">{p.acceptance}</td>
                      <td className="p-4 text-sm text-gray-400 hidden sm:table-cell">{p.frequency}</td>
                    </tr>
                  ))}
                  {companyProblems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No problems found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-5xl mx-auto w-full space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Companywise Preparation</h2>
          <p className="text-purple-100 max-w-xl">
            Master the most frequently asked questions from top tech companies. 
            Data curated from thousands of recent interview experiences.
          </p>
        </div>
        <Star className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search for a company (e.g. Google, Amazon)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-300 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCompanies.map(company => (
          <button
            key={company.slug}
            onClick={() => loadCompanyProblems(company.slug)}
            className="bg-dark-300 border border-white/5 rounded-xl p-4 text-left hover:bg-dark-200 hover:border-purple-500/30 transition-all group"
          >
            <div className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
              {company.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">View Problems</div>
          </button>
        ))}
      </div>
    </div>
  );
}
