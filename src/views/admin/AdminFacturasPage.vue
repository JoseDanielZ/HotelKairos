<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { facturasAnular, facturasList } from '@/services/facturas';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtMoney, fmtDate } from '@/utils/status.util';
import type { FacturaResponse } from '@/models';

const ui = useUiStore();
const rows = ref<FacturaResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);

const anularDialog = ref(false);
const anularGuid = ref('');
const anularMotivo = ref('');
const anularBusy = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await facturasList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
  } finally {
    loading.value = false;
  }
}

function openAnular(guid: string): void {
  anularGuid.value = guid;
  anularMotivo.value = '';
  anularDialog.value = true;
}

async function doAnular(): Promise<void> {
  if (!anularMotivo.value.trim()) {
    ui.showSnack('Indica el motivo de anulaciÃ³n', 4000, 'error');
    return;
  }
  anularBusy.value = true;
  try {
    const res = await facturasAnular(anularGuid.value, { motivo: anularMotivo.value });
    if (res.success) {
      ui.showSnack('Factura anulada', 3000);
      anularDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    anularBusy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Facturas</v-card-title>
    <v-card-subtitle>Listado y gestiÃ³n de facturas emitidas.</v-card-subtitle>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>NÃºmero</th>
          <th>Tipo</th>
          <th>Cliente</th>
          <th>Reserva</th>
          <th>Total</th>
          <th>Saldo</th>
          <th>EmisiÃ³n</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.guidFactura">
          <td><code>{{ r.numeroFactura }}</code></td>
          <td><v-chip size="x-small" label>{{ r.tipoFactura }}</v-chip></td>
          <td>{{ r.idCliente }}</td>
          <td>{{ r.idReserva }}</td>
          <td>{{ fmtMoney(r.total, r.moneda) }}</td>
          <td>{{ fmtMoney(r.saldoPendiente, r.moneda) }}</td>
          <td class="text-no-wrap">{{ fmtDate(r.fechaEmision) }}</td>
          <td><v-chip :color="statusColor(r.estado)" size="small" label>{{ r.estado }}</v-chip></td>
          <td>
            <v-btn
              v-if="r.estado !== 'ANU'"
              size="small"
              variant="text"
              color="error"
              icon="mdi-cancel"
              title="Anular"
              @click="openAnular(r.guidFactura)"
            />
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

  <v-dialog v-model="anularDialog" max-width="440">
    <v-card>
      <v-card-title>Anular factura</v-card-title>
      <v-card-text>
        <v-textarea v-model="anularMotivo" label="Motivo de anulaciÃ³n *" variant="outlined" rows="3" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="anularDialog = false">Cancelar</v-btn>
        <v-btn color="error" :loading="anularBusy" @click="doAnular">Anular</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
