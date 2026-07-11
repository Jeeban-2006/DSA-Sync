import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import DonationModal from './DonationModal';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function SupportButtons() {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isStarring, setIsStarring] = useState(false);

  const handleStar = async () => {
    setIsStarring(true);
    try {
      const { data, error } = await api.starGithubRepo();
      if (error) {
        toast.error(error);
      } else {
        toast.success('Successfully starred the repository! ⭐');
      }
    } catch (err: any) {
      toast.error('Failed to star repository. Are you connected to GitHub?');
    } finally {
      setIsStarring(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleStar}
          disabled={isStarring}
          className="flex items-center gap-2 px-3 py-1.5 bg-dark-300 hover:bg-dark-200 border border-dark-100 rounded-lg text-sm font-medium transition-colors text-white disabled:opacity-50"
          title="Star on GitHub"
        >
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="hidden sm:inline">{isStarring ? 'Starring...' : 'Star Repo'}</span>
        </button>
        
        <button
          onClick={() => setIsDonationModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 rounded-lg text-sm font-medium transition-colors text-white"
          title="Support Developer"
        >
          <Heart className="w-4 h-4 text-pink-500" />
          <span className="hidden sm:inline">Support</span>
        </button>
      </div>

      <DonationModal 
        isOpen={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
    </>
  );
}
