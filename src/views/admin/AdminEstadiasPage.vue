<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { estadiasCheckout, estadiasList } from '@/services/estadias';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtDate } from '@/utils/status.util';
import type { EstadiaDTO } from '@/models';

const ui = useUiStore();
const rows = ref<EstadiaDTO[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);

const checkoutDialog = ref(false);
const checkoutGuid = ref('');
const checkoutObs = ref('');
const checkoutMaint = ref(0);
const checkoutBusy = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await estadiasList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.data ?? [];
    total.value = r.data?.totalRecords ?? 0;
  } finally {
    loading.value = false;
  }
}

function openCheckout(guid: string): void {
  checkoutGuid.value = guid;
  checkoutObs.value = '';
  checkoutMaint.value = 0;
  checkoutDialog.value = true;
}

async function doCheckout(): Promise<void> {
  checkoutBusy.value = true;
  try {
    const res = await estadiasCheckout(checkoutGuid.value, {
      observaciones: checkoutObs.value || null,
      requiereMantenimiento: checkoutMaint.value,
    });
    if (res.success) {
      ui.showSnack('Check-out registrado', 3000);
      checkoutDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    checkoutBusy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Estadías</v-card-title>
    <v-card-subtitle>Check-in y check-out de huéspedes.</v-card-subtitle>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Cliente</th>
          <th>Habitación</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Estado</th>
          <th>Cargos</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.estadiaGuid">
          <td>{{ r.idEstadia }}</td>
          <td>{{ r.idCliente }}</td>
          <td>{{ r.idHabitacion }}</td>
          <td class="text-no-wrap">{{ fmtDate(r.checkinUtc) }}</td>
          <td class="text-no-wrap">{{ fmtDate(r.checkoutUtc) }}</td>
          <td><v-chip :color="statusColor(r.estadoEstadia)" size="small" label>{{ r.estadoEstadia }}</v-chip></td>
          <td>{{ r.cargos?.length ?? 0 }}</td>
          <td class="text-no-wrap">
            <v-btn
              v-if="!r.checkoutUtc"
              size="small"
              variant="text"
              color="info"
              prepend-icon="mdi-logout"
              @click="openCheckout(r.estadiaGuid)"
            >
              Check-out
            </v-btn>
          </td>
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
  </template>

  <v-dialog v-model="checkoutDialog" max-width="440">
    <v-card>
      <v-card-title>Registrar check-out</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-textarea v-model="checkoutObs" label="Observaciones de salida" variant="outlined" rows="3" />
        <v-checkbox v-model="checkoutMaint" :true-value="1" :false-value="0" label="Requiere mantenimiento" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="checkoutDialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="checkoutBusy" @click="doCheckout">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
