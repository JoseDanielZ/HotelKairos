import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { LoginRequest, LoginResponse, LoginResponseApiResponse } from '@/models';

const TOKEN_KEY = 'booking.jwt';
const LOGIN_KEY = 'booking.login';

export const useAuthStore = defineStore('auth', () => {
  function persistSession(data: LoginResponse): void {
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    localStorage.setItem(LOGIN_KEY, JSON.stringify(data));
  }

  function clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOGIN_KEY);
  }

  const base = `${environment.apiUrl}/api/v1/internal/auth`;

  async function login(body: LoginRequest): Promise<LoginResponseApiResponse> {
    const { data } = await api.post<LoginResponseApiResponse>(`${base}/login`, body);
    if (data.success && data.data?.token) {
      persistSession(data.data);
    }
    return data;
  }

  async function logout(): Promise<void> {
    try {
      await api.post(`${base}/logout`, {});
    } finally {
      clearSession();
    }
  }

  function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  function isAuthenticated(): boolean {
    return !!getToken();
  }

  function getLoginSnapshot(): LoginResponse | null {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }

  function getRoles(): string[] {
    const parsed = getLoginSnapshot();
    return parsed?.roles?.filter((r): r is string => !!r) ?? [];
  }

  function hasAnyRole(expected: string[]): boolean {
    if (expected.length === 0) return true;
    const have = getRoles().map((r) => r.toLowerCase());
    return expected.some((e) => have.includes(e.toLowerCase()));
  }

  const loginSnapshot = computed(() => getLoginSnapshot());

  return {
    login,
    logout,
    getToken,
    isAuthenticated,
    getLoginSnapshot,
    getRoles,
    hasAnyRole,
    loginSnapshot,
    clearSession,
    persistSession,
  };
});
