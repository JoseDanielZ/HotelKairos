import { ref } from 'vue';
import { reservasList } from '@/services/reservas';
import { useUiStore } from '@/stores/ui';
import type { ReservaResponse } from '@/models';

export function useReservasList() {
  const ui = useUiStore();
  const rows = ref<ReservaResponse[]>([]);
  const total = ref(0);
  const pageIndex = ref(0);
  const pageSize = ref(10);
  const loading = ref(false);
  const error = ref(false);

  async function load(filters: {
    IdCliente?: number;
    IdSucursal?: number;
    Estado?: string;
    FechaDesde?: string;
    FechaHasta?: string;
  } = {}): Promise<void> {
    loading.value = true;
    error.value = false;
    try {
      const r = await reservasList({
        ...filters,
        PageNumber: pageIndex.value + 1,
        PageSize: pageSize.value,
      });
      rows.value = r.data?.items ?? [];
      total.value = r.data?.totalResultados ?? 0;
    } catch {
      error.value = true;
      ui.showSnack('Error al cargar reservas.', 5000, 'error');
    } finally {
      loading.value = false;
    }
  }

  function onPage(p: number, reloadFn: () => void): void {
    pageIndex.value = p - 1;
    reloadFn();
  }

  return { rows, total, pageIndex, pageSize, loading, error, load, onPage };
}
