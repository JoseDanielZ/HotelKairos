import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import type { LoginRequest, LoginResponse, LoginResponseApiResponse } from '@/models';

const TOKEN_KEY = 'booking.jwt';
const LOGIN_KEY = 'booking.login';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const loginData = ref<LoginResponse | null>(_readLoginFromStorage());

  function _readLoginFromStorage(): LoginResponse | null {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }

  function persistSession(data: LoginResponse): void {
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      token.value = data.token;
    }
    localStorage.setItem(LOGIN_KEY, JSON.stringify(data));
    loginData.value = data;
  }

  function clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOGIN_KEY);
    token.value = null;
    loginData.value = null;
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
    return token.value;
  }

  const isAuthenticated = computed(() => !!token.value);

  function getLoginSnapshot(): LoginResponse | null {
    return loginData.value;
  }

  function getRoles(): string[] {
    return loginData.value?.roles?.filter((r): r is string => !!r) ?? [];
  }

  function hasAnyRole(expected: string[]): boolean {
    if (expected.length === 0) return true;
    const have = getRoles().map((r) => r.toLowerCase());
    return expected.some((e) => have.includes(e.toLowerCase()));
  }

  const loginSnapshot = computed(() => loginData.value);

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
