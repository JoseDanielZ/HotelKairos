import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/api/http';
import { environment } from '@/environments/environment';
import { useAuthStore } from '@/stores/auth';

const ID_CLIENTE_KEY = 'booking.idClienteOverride';

function extractIdCliente(node: unknown): number | null {
  if (node == null) {
    return null;
  }
  if (
    typeof node === 'object' &&
    'idCliente' in node &&
    typeof (node as { idCliente: unknown }).idCliente === 'number'
  ) {
    return (node as { idCliente: number }).idCliente;
  }
  if (typeof node === 'object' && 'data' in node) {
    return extractIdCliente((node as { data: unknown }).data);
  }
  return null;
}

export const useUserContextStore = defineStore('userContext', () => {
  const mePayload = ref<unknown | null>(null);
  const meUrl = `${environment.apiUrl}/api/v1/internal/auth/me`;

  async function refreshMe(): Promise<unknown | null> {
    const auth = useAuthStore();
    if (!auth.isAuthenticated()) {
      mePayload.value = null;
      return null;
    }
    try {
      const { data } = await api.get<unknown>(meUrl, { skipErrorSnack: true });
      mePayload.value = data;
      return data;
    } catch {
      return null;
    }
  }

  function getMeSnapshot(): unknown {
    return mePayload.value;
  }

  function getStoredIdClienteOverride(): number | null {
    const s = localStorage.getItem(ID_CLIENTE_KEY);
    if (s == null) return null;
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function setIdClienteOverride(id: number | null): void {
    if (id == null) {
      localStorage.removeItem(ID_CLIENTE_KEY);
    } else {
      localStorage.setItem(ID_CLIENTE_KEY, String(id));
    }
  }

  function getIdCliente(): number | null {
    const override = getStoredIdClienteOverride();
    if (override != null) {
      return override;
    }
    const fromLogin = useAuthStore().getLoginSnapshot();
    if (
      fromLogin &&
      'idCliente' in fromLogin &&
      typeof (fromLogin as { idCliente?: unknown }).idCliente === 'number'
    ) {
      return (fromLogin as { idCliente: number }).idCliente;
    }
    return extractIdCliente(mePayload.value) ?? extractIdCliente(useAuthStore().getLoginSnapshot());
  }

  return {
    mePayload,
    refreshMe,
    getMeSnapshot,
    getIdCliente,
    setIdClienteOverride,
    getStoredIdClienteOverride,
  };
});
