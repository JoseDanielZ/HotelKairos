<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { alojamientosBuscar, alojamientosDelete } from '@/services/alojamientos';
import { useUiStore } from '@/stores/ui';
import type { AlojamientoResponseDTO } from '@/models';

const ui = useUiStore();
const rows = ref<AlojamientoResponseDTO[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(10);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await alojamientosBuscar({ pageNumber: pageIndex.value + 1, pageSize: pageSize.value });
    rows.value = r.data?.data ?? [];
    total.value = r.data?.totalRecords ?? 0;
  } finally {
    loading.value = false;
  }
}

function onPage(p: number): void {
  pageIndex.value = p - 1;
  void load();
}

async function remove(id: number): Promise<void> {
  if (!confirm('¿Eliminar alojamiento?')) return;
  await alojamientosDelete(id);
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Alojamientos (admin)</v-card-title>
    <v-card-subtitle>Búsqueda, alta y mantenimiento del catálogo interno de propiedades.</v-card-subtitle>
    <v-card-actions>
      <v-btn color="primary" to="/admin/alojamientos/nuevo">Nuevo</v-btn>
    </v-card-actions>
  </v-card>
  <div v-if="loading" class="center">
    <v-progress-circular indeterminate />
  </div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Nombre</th>
          <th>Ciudad</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.alojamientoID">
          <td>{{ r.alojamientoID }}</td>
          <td>{{ r.nombre }}</td>
          <td>{{ r.ciudad }}</td>
          <td>
            <v-btn size="small" variant="text" :to="'/admin/alojamientos/' + r.alojamientoID">Editar</v-btn>
            <v-btn size="small" variant="text" color="error" @click="remove(r.alojamientoID)">Eliminar</v-btn>
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
.mb-4 {
  margin-bottom: 1rem;
}
.center {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}
</style>
