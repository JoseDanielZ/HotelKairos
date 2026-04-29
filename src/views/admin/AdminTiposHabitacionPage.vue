<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { tiposHabitacionList } from '@/services/tiposHabitacion';
import type { TipoHabitacionDTO } from '@/models';

const rows = ref<TipoHabitacionDTO[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(15);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await tiposHabitacionList({ PageNumber: pageIndex.value + 1, PageSize: pageSize.value });
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

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Tipos de habitación</v-card-title>
    <v-card-subtitle>Catálogo maestro (solo lectura en esta vista).</v-card-subtitle>
  </v-card>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Código</th>
          <th>Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.tipoHabitacionGuid">
          <td>{{ r.idTipoHabitacion }}</td>
          <td>{{ r.codigoTipoHabitacion }}</td>
          <td>{{ r.nombreTipoHabitacion }}</td>
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
