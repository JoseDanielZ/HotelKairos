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

async function remove(r: AlojamientoResponseDTO): Promise<void> {
  if (!confirm(`¿Eliminar el hotel "${r.nombre ?? ''}"?`)) return;
  const res = await alojamientosDelete(r.alojamientoID);
  if (res.success) {
    ui.showSnack('Hotel eliminado', 3000);
    void load();
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Hoteles</v-card-title>
    <v-card-actions>
      <v-btn color="primary" to="/admin/hoteles/nuevo">Nuevo hotel</v-btn>
    </v-card-actions>
  </v-card>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <v-table v-else>
    <thead>
      <tr>
        <th>Id</th>
        <th>Nombre</th>
        <th>Ciudad</th>
        <th>Estado</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in rows" :key="r.alojamientoID">
        <td>{{ r.alojamientoID }}</td>
        <td>{{ r.nombre }}</td>
        <td>{{ r.ciudad }}</td>
        <td>{{ r.estadoAlojamiento }}</td>
        <td>
          <v-btn size="small" variant="text" :to="'/admin/hoteles/' + r.alojamientoID">Editar</v-btn>
          <v-btn size="small" variant="text" color="error" @click="remove(r)">Eliminar</v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
  <v-pagination
    v-if="!loading && Math.ceil(total / pageSize) > 1"
    class="mt-4"
    :length="Math.max(1, Math.ceil(total / pageSize))"
    :model-value="pageIndex + 1"
    @update:model-value="onPage"
  />
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
