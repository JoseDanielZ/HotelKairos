<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { tiposHabitacionList } from '@/services/tiposHabitacion';
import { useUiStore } from '@/stores/ui';
import { statusColor } from '@/utils/status.util';
import type { TipoHabitacionResponse } from '@/models';

const router = useRouter();
const ui = useUiStore();
const rows = ref<TipoHabitacionResponse[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(15);
const loading = ref(false);
const filtroTexto = ref('');

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await tiposHabitacionList({
      PageNumber: pageIndex.value + 1,
      PageSize: pageSize.value,
      FiltroTexto: filtroTexto.value || undefined,
    });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
  } finally {
    loading.value = false;
  }
}

function onPage(p: number): void {
  pageIndex.value = p - 1;
  void load();
}

function buscar(): void {
  pageIndex.value = 0;
  void load();
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      Tipos de habitación
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" to="/admin/tipos-habitacion/nuevo">Nuevo tipo</v-btn>
    </v-card-title>
    <v-card-text>
      <div class="d-flex gap-2">
        <v-text-field
          v-model="filtroTexto"
          label="Buscar..."
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="flex-1"
          @keyup.enter="buscar"
        />
        <v-btn variant="tonal" icon="mdi-magnify" @click="buscar" />
      </div>
    </v-card-text>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Código</th>
          <th>Nombre</th>
          <th>Adultos</th>
          <th>Niños</th>
          <th>Cama</th>
          <th>m²</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.tipoHabitacionGuid">
          <td>{{ r.idTipoHabitacion }}</td>
          <td><code>{{ r.codigoTipoHabitacion }}</code></td>
          <td><strong>{{ r.nombreTipoHabitacion }}</strong></td>
          <td>{{ r.capacidadAdultos ?? '—' }}</td>
          <td>{{ r.capacidadNinos ?? '—' }}</td>
          <td>{{ r.tipoCama ?? '—' }}</td>
          <td>{{ r.areaM2 != null ? `${r.areaM2} m²` : '—' }}</td>
          <td>
            <v-chip :color="statusColor(r.estadoTipoHabitacion)" size="small" label>
              {{ r.estadoTipoHabitacion }}
            </v-chip>
          </td>
          <td>
            <v-btn
              size="small"
              variant="text"
              icon="mdi-pencil"
              title="Editar"
              @click="router.push(`/admin/tipos-habitacion/${r.tipoHabitacionGuid}`)"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-pagination
      v-if="Math.ceil(total / pageSize) > 1"
      class="mt-4"
      :length="Math.max(1, Math.ceil(total / pageSize))"
      :model-value="pageIndex + 1"
      @update:model-value="onPage"
    />
  </template>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
.flex-1 { flex: 1; }
</style>
