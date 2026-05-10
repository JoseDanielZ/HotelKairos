<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { tarifasDelete, tarifasList } from '@/services/tarifas';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtMoney, fmtDate } from '@/utils/status.util';
import type { TarifaResponse } from '@/models';

const ui = useUiStore();
const rows = ref<TarifaResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);
const dialog = ref(false);
const editItem = ref<TarifaResponse | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await tarifasList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
  } finally {
    loading.value = false;
  }
}

function openNew(): void {
  editItem.value = null;
  dialog.value = true;
}

function openEdit(r: TarifaResponse): void {
  editItem.value = { ...r };
  dialog.value = true;
}

async function remove(r: TarifaResponse): Promise<void> {
  if (!confirm(`Â¿Eliminar la tarifa "${r.nombreTarifa}"?`)) return;
  const res = await tarifasDelete(r.tarifaGuid);
  if (res.success) {
    ui.showSnack('Tarifa eliminada', 3000);
    void load();
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Tarifas</v-card-title>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/admin/tarifas/nuevo">Nueva tarifa</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>CÃ³digo</th>
          <th>Nombre</th>
          <th>Sucursal</th>
          <th>Tipo hab.</th>
          <th>Precio / noche</th>
          <th>Vigencia</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.tarifaGuid">
          <td><code>{{ r.codigoTarifa }}</code></td>
          <td>{{ r.nombreTarifa }}</td>
          <td>{{ r.idSucursal }}</td>
          <td>{{ r.idTipoHabitacion }}</td>
          <td>{{ fmtMoney(r.precioPorNoche) }}</td>
          <td class="text-no-wrap">{{ r.fechaInicio }} â†’ {{ r.fechaFin }}</td>
          <td>
            <v-chip :color="statusColor(r.estadoTarifa)" size="small" label>{{ r.estadoTarifa }}</v-chip>
          </td>
          <td class="text-no-wrap">
            <v-btn size="small" variant="text" icon="mdi-pencil" :to="'/admin/tarifas/' + r.tarifaGuid" />
            <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="remove(r)" />
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-pagination
      v-if="Math.ceil(total / pageSize) > 1"
      class="mt-4"
      :length="Math.max(1, Math.ceil(total / pageSize))"
      :model-value="page"
      @update:model-value="(p) => { page = p; void load(); }"
    />
  </template>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
