<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { clientesDelete, clientesList } from '@/services/clientes';
import { useUiStore } from '@/stores/ui';
import type { ClienteDTO } from '@/models';

const ui = useUiStore();
const rows = ref<ClienteDTO[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(10);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await clientesList({ PageNumber: pageIndex.value + 1, PageSize: pageSize.value });
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

async function remove(r: ClienteDTO): Promise<void> {
  const nombre = [r.nombres, r.apellidos].filter(Boolean).join(' ') || r.correo || String(r.idCliente);
  if (!confirm(`¿Eliminar al cliente "${nombre}"?`)) return;
  const res = await clientesDelete(r.clienteGuid!);
  if (res.success) {
    ui.showSnack('Cliente eliminado', 3000);
    void load();
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Clientes</v-card-title>
    <v-card-actions>
      <v-btn color="primary" to="/admin/clientes/nuevo">Nuevo</v-btn>
    </v-card-actions>
  </v-card>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Nombres</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.clienteGuid ?? String(r.idCliente)">
          <td>{{ r.idCliente }}</td>
          <td>{{ [r.nombres, r.apellidos].filter(Boolean).join(' ') || '—' }}</td>
          <td>{{ r.correo }}</td>
          <td>{{ r.telefono }}</td>
          <td>
            <v-btn v-if="r.clienteGuid" size="small" variant="text" :to="'/admin/clientes/' + r.clienteGuid">Editar</v-btn>
            <v-btn v-if="r.clienteGuid" size="small" variant="text" color="error" @click="remove(r)">Eliminar</v-btn>
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
