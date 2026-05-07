import { ref } from 'vue';
import { clientesList } from '@/services/clientes';
import { useUiStore } from '@/stores/ui';
import type { ClienteDTO } from '@/models';

export function useClientesList() {
  const ui = useUiStore();
  const rows = ref<ClienteDTO[]>([]);
  const total = ref(0);
  const pageIndex = ref(0);
  const pageSize = ref(10);
  const loading = ref(false);
  const error = ref(false);

  async function load(filters: {
    FiltroTexto?: string;
    TipoIdentificacion?: string;
    Estado?: string;
  } = {}): Promise<void> {
    loading.value = true;
    error.value = false;
    try {
      const r = await clientesList({
        ...filters,
        PageNumber: pageIndex.value + 1,
        PageSize: pageSize.value,
      });
      rows.value = r.data?.data ?? [];
      total.value = r.data?.totalRecords ?? 0;
    } catch {
      error.value = true;
      ui.showSnack('Error al cargar clientes.', 5000, 'error');
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
