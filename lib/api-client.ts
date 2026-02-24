// Use relative URLs for same-origin requests (works on any port)
const API_BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001');

class ApiClient {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const authData = localStorage.getItem('dsa-sync-auth');
      if (authData) {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          headers['Authorization'] = `Bearer ${state.token}`;
        }
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string }> {
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: this.getHeaders(options.headers ? false : true),
        // CRITICAL: Prevent service worker from caching auth requests
        cache: endpoint.includes('/api/auth') ? 'no-store' : 'default',
      });
      
      console.log(`📡 Response: ${response.status} ${response.statusText}`);

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear auth state if token is invalid
        if (typeof window !== 'undefined') {
          const authData = localStorage.getItem('dsa-sync-auth');
          if (authData) {
            try {
              const parsed = JSON.parse(authData);
              // Only clear if we actually had a token (not just logged out)
              if (parsed?.state?.token) {
                localStorage.removeItem('dsa-sync-auth');
                window.location.href = '/auth/login';
              }
            } catch (e) {
              // Invalid JSON, clear it
              localStorage.removeItem('dsa-sync-auth');
            }
          }
        }
        return { error: 'Session expired. Please login again.' };
      }

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        console.error('❌ Non-JSON response received');
        return { error: 'Invalid response format from server' };
      }

      if (!response.ok) {
        console.error('❌ Request failed:', data.error || 'Unknown error');
        return { error: data.error || 'Something went wrong' };
      }

      console.log('✅ Request successful');
      return { data };
    } catch (error: any) {
      console.error('❌ Network error:', error);
      return { error: error.message || 'Network error' };
    }
  }

  // Auth
  async register(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: this.getHeaders(false),
    });
  }

  async login(credentials: any) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: this.getHeaders(false),
    });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Problems
  async getProblems(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/problems${query ? `?${query}` : ''}`);
  }

  async addProblem(problemData: any) {
    return this.request('/api/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async updateProblem(id: string, updates: any) {
    return this.request(`/api/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProblem(id: string) {
    return this.request(`/api/problems/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics() {
    return this.request('/api/analytics');
  }

  // Revisions
  async getRevisions() {
    return this.request('/api/revisions');
  }

  async createRevision(problemId: string) {
    return this.request('/api/revisions', {
      method: 'POST',
      body: JSON.stringify({ problemId }),
    });
  }

  async deleteRevision(problemId: string) {
    return this.request(`/api/revisions?problemId=${problemId}`, {
      method: 'DELETE',
    });
  }

  async completeRevision(id: string, data: any) {
    return this.request(`/api/revisions/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Friends
  async getFriends(status = 'Accepted') {
    return this.request(`/api/friends?status=${status}`);
  }

  async sendFriendRequest(username: string) {
    return this.request('/api/friends', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async respondToFriendRequest(id: string, action: 'accept' | 'reject') {
    return this.request(`/api/friends/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async getFriendDashboard(username: string) {
    return this.request(`/api/friends/dashboard/${username}`);
  }

  async compareProblem(friendId: string, problemName: string) {
    return this.request(`/api/friends/compare?friendId=${friendId}&problemName=${encodeURIComponent(problemName)}`);
  }

  // Activity Logs
  async getActivityLogs(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/activity${query ? `?${query}` : ''}`);
  }

  async createActivityLog(type: string, metadata: any) {
    return this.request('/api/activity', {
      method: 'POST',
      body: JSON.stringify({ type, metadata }),
    });
  }

  // Push Notifications
  async subscribeToPush(subscription: any) {
    return this.request('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async unsubscribeFromPush(endpoint: string) {
    return this.request('/api/push/subscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    });
  }

  async getPushSubscriptions() {
    return this.request('/api/push/subscribe');
  }

  async sendTestNotification() {
    return this.request('/api/push/test', {
      method: 'POST',
    });
  }

  // Challenges
  async getChallenges() {
    return this.request('/api/challenges');
  }

  async createChallenge(challengeData: any) {
    return this.request('/api/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }

  // Comments
  async getComments(problemId: string) {
    return this.request(`/api/comments?problemId=${problemId}`);
  }

  async addComment(problemId: string, content: string) {
    return this.request('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ problemId, content }),
    });
  }

  // AI
  async getAIRecommendations() {
    return this.request('/api/ai/recommendations');
  }

  async analyzeSolution(problemId: string) {
    return this.request('/api/ai/analyze-solution', {
      method: 'POST',
      body: JSON.stringify({ problemId }),
    });
  }

  async getAIComparison(userProblemId: string, friendProblemId: string) {
    return this.request('/api/ai/compare', {
      method: 'POST',
      body: JSON.stringify({ userProblemId, friendProblemId }),
    });
  }

  async getPatternDetection() {
    return this.request('/api/ai/pattern-detection');
  }

  async generateWeeklyReport() {
    return this.request('/api/ai/weekly-report', {
      method: 'POST',
    });
  }

  async getWeeklyReports() {
    return this.request('/api/ai/weekly-report');
  }

  async getConfidenceScore() {
    return this.request('/api/ai/confidence');
  }

  // Import
  async downloadTemplate() {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/import/template';
    }
  }

  async importCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('dsa-sync-auth') || '{}')?.state?.token 
      : null;

    const response = await fetch('/api/import/csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'Failed to import CSV' };
    }

    return { data };
  }

  async importFromCodeforces(handle: string, isSync = false) {
    return this.request('/api/import/codeforces', {
      method: 'POST',
      body: JSON.stringify({ handle, isSync }),
    });
  }

  async importFromLeetCode(username: string, isSync = false) {
    return this.request('/api/import/leetcode', {
      method: 'POST',
      body: JSON.stringify({ username, isSync }),
    });
  }

  async importFromCodeChef(username: string, isSync = false) {
    return this.request('/api/import/codechef', {
      method: 'POST',
      body: JSON.stringify({ username, isSync }),
    });
  }

  async getImportHistory(limit = 10, skip = 0) {
    return this.request(`/api/import/history?limit=${limit}&skip=${skip}`);
  }
}

export const api = new ApiClient();
