<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { clientesDelete, clientesInhabilitar, clientesList } from '@/services/clientes';
import { useUiStore } from '@/stores/ui';
import { statusColor } from '@/utils/status.util';
import type { ClienteDTO } from '@/models';

const ui = useUiStore();
const rows = ref<ClienteDTO[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(15);
const loading = ref(false);
const filtroTexto = ref('');

const inhabDialog = ref(false);
const inhabGuid = ref('');
const inhabMotivo = ref('');
const inhabBusy = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await clientesList({
      FiltroTexto: filtroTexto.value || undefined,
      PageNumber: pageIndex.value + 1,
      PageSize: pageSize.value,
    });
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

function openInhabilitar(guid: string): void {
  inhabGuid.value = guid;
  inhabMotivo.value = '';
  inhabDialog.value = true;
}

async function doInhabilitar(): Promise<void> {
  if (!inhabMotivo.value.trim()) {
    ui.showSnack('Indica el motivo', 4000, 'error');
    return;
  }
  inhabBusy.value = true;
  try {
    const res = await clientesInhabilitar(inhabGuid.value, { motivo: inhabMotivo.value });
    if (res.success) {
      ui.showSnack('Cliente inhabilitado', 3000);
      inhabDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    inhabBusy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Clientes</v-card-title>
    <v-card-actions>
      <v-text-field
        v-model="filtroTexto"
        placeholder="Buscar por nombre, correo o ID…"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="mr-2"
        style="max-width:300px"
        @keyup.enter="load"
        @click:clear="() => { filtroTexto = ''; void load(); }"
      />
      <v-btn variant="outlined" @click="load">Buscar</v-btn>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" to="/admin/clientes/nuevo">Nuevo</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Identificación</th>
          <th>Nombres</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.clienteGuid ?? String(r.idCliente)">
          <td>{{ r.idCliente }}</td>
          <td class="text-caption">{{ r.tipoIdentificacion }} {{ r.numeroIdentificacion }}</td>
          <td>{{ [r.nombres, r.apellidos].filter(Boolean).join(' ') || r.razonSocial || '—' }}</td>
          <td>{{ r.correo }}</td>
          <td>{{ r.telefono }}</td>
          <td>
            <v-chip :color="statusColor(r.estado)" size="small" label>{{ r.estado ?? '—' }}</v-chip>
          </td>
          <td class="text-no-wrap">
            <v-btn v-if="r.clienteGuid" size="small" variant="text" icon="mdi-pencil" :to="'/admin/clientes/' + r.clienteGuid" />
            <v-btn v-if="r.clienteGuid" size="small" variant="text" color="warning" icon="mdi-account-off" title="Inhabilitar" @click="openInhabilitar(r.clienteGuid)" />
            <v-btn v-if="r.clienteGuid" size="small" variant="text" color="error" icon="mdi-delete" @click="remove(r)" />
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

  <v-dialog v-model="inhabDialog" max-width="440">
    <v-card>
      <v-card-title>Inhabilitar cliente</v-card-title>
      <v-card-text>
        <v-textarea v-model="inhabMotivo" label="Motivo *" variant="outlined" rows="3" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="inhabDialog = false">Cancelar</v-btn>
        <v-btn color="warning" :loading="inhabBusy" @click="doInhabilitar">Inhabilitar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
