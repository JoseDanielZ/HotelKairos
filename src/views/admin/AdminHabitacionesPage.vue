<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { habitacionesDelete, habitacionesList, habitacionesPatchEstado } from '@/services/habitaciones';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtMoney } from '@/utils/status.util';
import type { HabitacionResponse } from '@/models';

const ui = useUiStore();
const rows = ref<HabitacionResponse[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(15);
const loading = ref(false);

const estadosHab = ['DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO', 'FUERA_SERVICIO', 'INHABILITADA'];

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await habitacionesList({ PageNumber: pageIndex.value + 1, PageSize: pageSize.value });
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

async function cambiarEstado(guid: string, nuevoEstado: string): Promise<void> {
  const res = await habitacionesPatchEstado(guid, { nuevoEstado });
  if (res.success) {
    ui.showSnack(`Estado â†’ ${nuevoEstado}`, 3000);
    void load();
  }
}

async function remove(guid: string): Promise<void> {
  if (!confirm('Â¿Eliminar habitaciÃ³n?')) return;
  await habitacionesDelete(guid);
  void load();
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Habitaciones</v-card-title>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/admin/habitaciones/nuevo">Nueva</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>NÃºmero</th>
          <th>Piso</th>
          <th>Sucursal</th>
          <th>Tipo</th>
          <th>Capacidad</th>
          <th>Precio base</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.habitacionGuid">
          <td><strong>{{ r.numeroHabitacion }}</strong></td>
          <td>{{ r.piso ?? 'â€”' }}</td>
          <td>{{ r.idSucursal }}</td>
          <td>{{ r.idTipoHabitacion }}</td>
          <td>{{ r.capacidadHabitacion }}</td>
          <td>{{ fmtMoney(r.precioBase) }}</td>
          <td>
            <v-chip :color="statusColor(r.estadoHabitacion)" size="small" label>{{ r.estadoHabitacion }}</v-chip>
          </td>
          <td class="text-no-wrap">
            <v-btn size="small" variant="text" icon="mdi-pencil" :to="'/admin/habitaciones/' + r.habitacionGuid" />
            <v-menu>
              <template #activator="{ props }">
                <v-btn size="small" variant="text" icon="mdi-swap-horizontal" v-bind="props" title="Cambiar estado" />
              </template>
              <v-list density="compact">
                <v-list-item
                  v-for="e in estadosHab"
                  :key="e"
                  :title="e"
                  @click="cambiarEstado(r.habitacionGuid, e)"
                />
              </v-list>
            </v-menu>
            <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="remove(r.habitacionGuid)" />
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
</style>
