import axios, { type AxiosError } from 'axios';
import { useUiStore } from '@/stores/ui';
import type { ProblemDetails } from '@/models';

function readToken(): string | null {
  return localStorage.getItem('booking.jwt');
}

function readProblem(err: AxiosError): string {
  const body = err.response?.data as ProblemDetails | string | undefined;
  if (body && typeof body === 'object' && 'detail' in body && body.detail) {
    return String(body.detail);
  }
  if (body && typeof body === 'object' && 'title' in body && body.title) {
    return String(body.title);
  }
  if (typeof body === 'string' && body.length) {
    return body;
  }
  return err.message;
}

const brief = (d: string | undefined) => (d && d.length > 200 ? `${d.slice(0, 200)}…` : d);

export const api = axios.create();

api.interceptors.request.use((config) => {
  const u = config.url ?? '';
  if (u.includes('/api/v1/internal/auth/login')) {
    return config;
  }
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    const cfg = err.config as { skipErrorSnack?: boolean } | undefined;
    if (cfg?.skipErrorSnack) {
      return Promise.reject(err);
    }
    const status = err.response?.status ?? 0;
    const msg = readProblem(err);
    let snackMessage: string | undefined;
    switch (status) {
      case 400:
        snackMessage = `Solicitud inválida: ${brief(msg)}`;
        break;
      case 401:
        snackMessage = 'No autenticado. Inicia sesión de nuevo.';
        break;
      case 403:
        snackMessage = 'No tienes permiso para esta acción.';
        break;
      case 404:
        snackMessage = 'Recurso no encontrado.';
        break;
      case 500:
      case 0:
        snackMessage = 'Error en el servidor o red. Intenta de nuevo.';
        break;
      default:
        if (status >= 500) {
          snackMessage = brief(msg) || 'Error del servidor.';
        }
    }
    if (snackMessage) {
      try {
        useUiStore().showSnack(snackMessage, 6000, 'error');
      } catch {
        /* pinia no lista aún */
      }
    }
    if (status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (!path.startsWith('/login')) {
        const returnUrl = encodeURIComponent(path + window.location.search);
        window.location.href = `/login?returnUrl=${returnUrl}`;
      }
    }
    return Promise.reject(err);
  },
);

export type { AxiosError };
