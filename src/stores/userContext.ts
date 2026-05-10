import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const ID_CLIENTE_KEY = 'booking.idClienteOverride';

/**
 * Recorre un objeto buscando un `idCliente` numérico — soporta wrappers `{ data: ... }`
 * para compatibilidad con respuestas legacy que vinieran del antiguo `/auth/me`.
 */
function extractIdCliente(node: unknown): number | null {
  if (node == null) return null;
  if (typeof node !== 'object') return null;
  const obj = node as Record<string, unknown>;
  if (typeof obj.idCliente === 'number') return obj.idCliente;
  if ('data' in obj) return extractIdCliente(obj.data);
  return null;
}

/**
 * En el contrato de referencia (`swaggerjj.json`) ya no existe `/auth/me`: toda la
 * información del usuario llega en `LoginResponse`. Este store mantiene la API pública
 * (`refreshMe`, `getIdCliente`, etc.) para no obligar a cambiar las vistas todavía,
 * pero `refreshMe` es ahora un noop que devuelve el snapshot del login.
 */
export const useUserContextStore = defineStore('userContext', () => {
  const mePayload = ref<unknown | null>(null);

  async function refreshMe(): Promise<unknown | null> {
    const auth = useAuthStore();
    if (!auth.isAuthenticated) {
      mePayload.value = null;
      return null;
    }
    const snapshot = auth.getLoginSnapshot();
    mePayload.value = snapshot;
    return snapshot;
  }

  function getMeSnapshot(): unknown {
    return mePayload.value ?? useAuthStore().getLoginSnapshot();
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
    if (override != null) return override;
    return extractIdCliente(useAuthStore().getLoginSnapshot());
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
