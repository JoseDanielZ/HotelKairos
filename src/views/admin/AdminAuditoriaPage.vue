<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { auditoriaList } from '@/services/auditoria';
import { fmtDate } from '@/utils/status.util';
import type { AuditoriaDTO } from '@/models';

const rows = ref<AuditoriaDTO[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(50);
const loading = ref(false);

const filtros = reactive({
  tabla: '',
  operacion: '',
  usuario: '',
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await auditoriaList({
      tabla: filtros.tabla || undefined,
      operacion: filtros.operacion || undefined,
      usuario: filtros.usuario || undefined,
      pageNumber: page.value,
      pageSize: pageSize.value,
    });
    rows.value = r.data?.data ?? [];
    total.value = r.data?.totalRecords ?? 0;
  } finally {
    loading.value = false;
  }
}

function buscar(): void {
  page.value = 1;
  void load();
}

const operaciones = ['INSERT', 'UPDATE', 'DELETE'];

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Auditoría</v-card-title>
    <v-card-subtitle>Registro de operaciones del sistema.</v-card-subtitle>
    <v-card-text>
      <div class="filtros-grid">
        <v-text-field v-model="filtros.tabla" label="Tabla" variant="outlined" density="compact" clearable />
        <v-select v-model="filtros.operacion" :items="operaciones" label="Operación" variant="outlined" density="compact" clearable />
        <v-text-field v-model="filtros.usuario" label="Usuario" variant="outlined" density="compact" clearable />
        <v-btn color="primary" @click="buscar">Filtrar</v-btn>
      </div>
    </v-card-text>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table density="compact">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tabla</th>
          <th>Operación</th>
          <th>Usuario</th>
          <th>IP</th>
          <th>Valor anterior</th>
          <th>Valor nuevo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="r.auditoriaGuid ?? i">
          <td class="text-no-wrap text-caption">{{ fmtDate(r.fechaEventoUtc) }}</td>
          <td><code class="text-caption">{{ r.tablaAfectada ?? '—' }}</code></td>
          <td>
            <v-chip
              :color="r.operacion === 'DELETE' ? 'error' : r.operacion === 'INSERT' ? 'success' : 'warning'"
              size="x-small"
              label
            >
              {{ r.operacion ?? '—' }}
            </v-chip>
          </td>
          <td class="text-caption">{{ r.usuarioEjecutor ?? '—' }}</td>
          <td class="text-caption">{{ r.ipOrigen ?? '—' }}</td>
          <td class="text-caption valor-cell">{{ r.valorAnterior ?? '—' }}</td>
          <td class="text-caption valor-cell">{{ r.valorNuevo ?? '—' }}</td>
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
    <p class="text-caption text-center mt-2 text-medium-emphasis">{{ total }} registros totales</p>
  </template>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
.filtros-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}
.valor-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
