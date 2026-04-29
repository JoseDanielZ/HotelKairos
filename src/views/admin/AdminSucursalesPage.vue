<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { sucursalesDelete, sucursalesGetInternalPage } from '@/services/sucursales';
import { useUiStore } from '@/stores/ui';
import type { SucursalDTO } from '@/models';

const ui = useUiStore();
const rows = ref<SucursalDTO[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(10);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await sucursalesGetInternalPage({ PageNumber: pageIndex.value + 1, PageSize: pageSize.value });
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

async function remove(s: SucursalDTO): Promise<void> {
  const nombre = s.nombreSucursal ?? s.sucursalGuid;
  if (!confirm(`¿Eliminar la sucursal "${nombre}"?`)) return;
  const res = await sucursalesDelete(s.sucursalGuid);
  if (res.success) {
    ui.showSnack('Sucursal eliminada', 3000);
    void load();
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Sucursales</v-card-title>
    <v-card-actions>
      <v-btn color="primary" to="/admin/sucursales/nuevo">Nueva</v-btn>
    </v-card-actions>
  </v-card>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
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
        <tr v-for="r in rows" :key="r.sucursalGuid">
          <td>{{ r.idSucursal }}</td>
          <td>{{ r.nombreSucursal }}</td>
          <td>{{ r.ciudad }}</td>
          <td>{{ r.estadoSucursal }}</td>
          <td>
            <v-btn size="small" variant="text" :to="'/admin/sucursales/' + r.sucursalGuid">Editar</v-btn>
            <v-btn size="small" variant="text" color="error" @click="remove(r)">Eliminar</v-btn>
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
