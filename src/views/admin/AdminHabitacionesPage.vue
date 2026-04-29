<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { habitacionesDelete, habitacionesList } from '@/services/habitaciones';
import type { HabitacionDTO } from '@/models';

const rows = ref<HabitacionDTO[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(10);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await habitacionesList({ PageNumber: pageIndex.value + 1, PageSize: pageSize.value });
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

async function remove(guid: string): Promise<void> {
  if (!confirm('¿Eliminar habitación?')) return;
  await habitacionesDelete(guid);
  void load();
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Habitaciones</v-card-title>
    <v-card-actions>
      <v-btn color="primary" to="/admin/habitaciones/nuevo">Nueva</v-btn>
    </v-card-actions>
  </v-card>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Número</th>
          <th>Sucursal</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.habitacionGuid">
          <td>{{ r.numeroHabitacion }}</td>
          <td>{{ r.idSucursal }}</td>
          <td>{{ r.idTipoHabitacion }}</td>
          <td>{{ r.estadoHabitacion }}</td>
          <td>
            <v-btn size="small" variant="text" :to="'/admin/habitaciones/' + r.habitacionGuid">Editar</v-btn>
            <v-btn size="small" variant="text" color="error" @click="remove(r.habitacionGuid)">Eliminar</v-btn>
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
