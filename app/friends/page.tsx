'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import BottomNav from '@/components/BottomNav';
import { api } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Users, UserPlus, Check, X, Search, Trophy, Flame } from 'lucide-react';

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    const { data, error } = await api.getFriends('Accepted');

    if (error) {
      toast.error('Failed to load friends');
      setLoading(false);
      return;
    }

    const friendsData = data as any;
    setFriends(friendsData.friends || []);
    setLoading(false);
  };

  const loadPendingRequests = async () => {
    const { data, error } = await api.getFriends('Pending');

    if (error) return;

    const requestsData = data as any;
    setPendingRequests(requestsData.friends || []);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchUsername.trim()) {
      toast.error('Enter a username');
      return;
    }

    setSending(true);

    const { error } = await api.sendFriendRequest(searchUsername);

    if (error) {
      toast.error(error);
      setSending(false);
      return;
    }

    toast.success('Friend request sent!');
    setSearchUsername('');
    setSending(false);
  };

  const handleRespondRequest = async (requestId: string, action: 'accept' | 'reject') => {
    const { error } = await api.respondToFriendRequest(requestId, action);

    if (error) {
      toast.error('Failed to respond');
      return;
    }

    toast.success(action === 'accept' ? 'Friend added!' : 'Request declined');
    loadFriends();
    loadPendingRequests();
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen pb-24 page-content">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-b-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Friends</h1>
              <p className="text-green-100 text-sm">Grow together</p>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSendRequest} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white"
              placeholder="Enter username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {sending ? '...' : <UserPlus className="w-5 h-5" />}
            </button>
          </form>
        </div>

        <div className="p-4 space-y-6">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Pending Requests</h2>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.connectionId} className="card-hover">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                        {req.friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{req.friend.name}</p>
                        <p className="text-gray-400 text-sm">@{req.friend.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespondRequest(req.connectionId, 'accept')}
                          className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.connectionId, 'reject')}
                          className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          {friends.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                Your Friends ({friends.length})
              </h2>
              <div className="space-y-3">
                {friends.map((friendData) => (
                  <div 
                    key={friendData.connectionId} 
                    className="card-hover cursor-pointer"
                    onClick={() => router.push(`/friends/${friendData.friend.username}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                        {friendData.friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{friendData.friend.name}</p>
                        <p className="text-gray-400 text-sm">@{friendData.friend.username}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <span className="text-gray-400">Lvl {friendData.friend.level}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Flame className="w-3 h-3 text-orange-400" />
                            <span className="text-gray-400">{friendData.friend.currentStreak} days</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">
                          {friendData.friend.totalProblemsSolved}
                        </p>
                        <p className="text-xs text-gray-400">problems</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No friends yet</h3>
              <p className="text-gray-400">Search and add friends to start comparing progress!</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </AuthenticatedLayout>
  );
}
