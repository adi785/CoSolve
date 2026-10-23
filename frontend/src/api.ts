// API Client connecting to FastAPI backend
const API_BASE = '/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'provider' | 'solver' | 'organization' | 'admin' | 'institution';
  verification_status: string;
  reputation_score?: number;
  phone?: string;
  created_at?: string;
}

export interface Problem {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  urgency_level: string;
  status: string;
  target_community?: string;
  expected_outcomes?: string;
  constraints?: string;
  created_at: string;
  is_taken?: boolean;
  progress_percentage?: number;
  assigned_team_name?: string | null;
  assigned_solver_name?: string | null;
  last_activity_at?: string | null;
  ai_analysis_report?: {
    summary?: string;
    complexity_score?: string;
    required_skills?: string[];
    suggested_milestones?: string[];
  } | null;
}

export interface DemoUser {
  name: string;
  email: string;
  role: string;
  entity: string;
}

export class ApiClient {
  private static tokenKey = 'cosolve_token';
  private static userKey = 'cosolve_user';

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static getUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static setAuth(token: string, user: User) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  static logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth Endpoints
  static async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setAuth(data.access_token, data.user);
    return data;
  }

  static async register(payload: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    skills?: string[];
    department?: string;
    year_of_study?: number;
    institution_id?: string;
  }): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setAuth(data.access_token, data.user);
    return data;
  }

  static async getMe(): Promise<User> {
    const user = await this.request<User>('/auth/me');
    const token = this.getToken();
    if (token) this.setAuth(token, user);
    return user;
  }

  static async getDemoUsers(): Promise<DemoUser[]> {
    return this.request<DemoUser[]>('/auth/demo-users');
  }

  // Problems
  static async getProblems(category?: string): Promise<Problem[]> {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<Problem[]>(`/problems${query}`);
  }

  static async getProblem(id: string): Promise<Problem> {
    return this.request<Problem>(`/problems/${id}`);
  }

  static async createProblem(payload: {
    title: string;
    description: string;
    category: string;
    target_community: string;
    urgency_level: string;
    expected_outcomes?: string;
    constraints?: string;
  }): Promise<Problem> {
    return this.request<Problem>('/problems', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Apply to Problem (Individual or Team)
  static async applyToProblem(problemId: string, payload: {
    proposal_text: string;
    estimated_completion_weeks: number;
    relevant_experience?: string;
    portfolio_links?: string[];
    team_name?: string;
    college_name?: string;
    team_members?: { full_name: string; email: string }[];
  }) {
    return this.request(`/problems/${problemId}/apply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Projects
  static async getProjects(): Promise<any[]> {
    return this.request<any[]>('/projects');
  }

  static async getProject(id: string): Promise<any> {
    return this.request<any>(`/projects/${id}`);
  }

  // Recommendations
  static async getRecommendations(): Promise<any[]> {
    return this.request<any[]>('/solvers/recommendations');
  }

  // Organizations
  static async getOrganizations(): Promise<any[]> {
    return this.request<any[]>('/organizations');
  }
}
