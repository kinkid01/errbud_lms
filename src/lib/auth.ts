import api, { normalize } from './api';

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  createdAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  isAccountActive?: boolean;
}

const STORAGE_KEY = 'errbud_user';
const TOKEN_KEY = 'errbud_token';

export const authService = {
  // Called on app load — restores session from localStorage
  init() {
    // This method is now handled in AuthContext useEffect to prevent hydration issues
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!(this.getCurrentUser() && this.getToken());
  },

  async signup(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ user: AuthUser; token: string }> {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = res.data;
      const normalized = normalize(user) as AuthUser;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return { token, user: normalized };
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      if (status === 409) {
        throw new Error('An account with this email already exists.');
      } else if (status === 400) {
        throw new Error(serverMessage || 'Please check your details and try again.');
      } else if (serverMessage) {
        throw new Error(serverMessage);
      }
      throw new Error('Unable to create account. Please check your connection and try again.');
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: AuthUser; token: string }> {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      const normalized = normalize(user) as AuthUser;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return { token, user: normalized };
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      if (status === 401) {
        throw new Error(serverMessage || 'Incorrect email or password. Please try again.');
      } else if (status === 404) {
        throw new Error('No account found with that email address.');
      } else if (status === 429) {
        throw new Error('Too many login attempts. Please wait a moment and try again.');
      } else if (serverMessage) {
        throw new Error(serverMessage);
      }
      throw new Error('Unable to sign in. Please check your connection and try again.');
    }
  },

  async updateProfile(updates: {
    name?: string;
    phone?: string;
  }): Promise<AuthUser> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Not authenticated.');
    const res = await api.put(`/users/${current.id}`, updates);
    const updated = normalize(res.data.data) as AuthUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      if (status === 401) {
        throw new Error('Your current password is incorrect.');
      } else if (serverMessage) {
        throw new Error(serverMessage);
      }
      throw new Error('Unable to change password. Please try again.');
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};
