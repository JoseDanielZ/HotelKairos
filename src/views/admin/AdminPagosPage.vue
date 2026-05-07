<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { pagosActualizarEstado, pagosCreate, pagosList } from '@/services/pagos';
import { facturasList } from '@/services/facturas';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtMoney, fmtDate } from '@/utils/status.util';
import type { FacturaDTO, PagoCreateRequest, PagoDTO } from '@/models';

const ui = useUiStore();
const rows = ref<PagoDTO[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);

const registrarDialog = ref(false);
const registrarBusy = ref(false);
const facturas = ref<FacturaDTO[]>([]);

const metodos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'PSE', 'NEQUI', 'DAVIPLATA', 'OTRO'];
const estadosPago = ['PEN', 'APR', 'REC', 'ANU'];

const form = reactive<PagoCreateRequest>({
  idFactura: 0,
  idReserva: 0,
  monto: 0,
  metodoPago: 'EFECTIVO',
  estadoPago: 'APR',
  moneda: 'USD',
  tipoCambio: 1,
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await pagosList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.data ?? [];
    total.value = r.data?.totalRecords ?? 0;
  } finally {
    loading.value = false;
  }
}

async function openRegistrar(): Promise<void> {
  const r = await facturasList({ PageNumber: 1, PageSize: 200 });
  facturas.value = r.data?.data ?? [];
  Object.assign(form, { idFactura: 0, idReserva: 0, monto: 0, metodoPago: 'EFECTIVO', estadoPago: 'APR', moneda: 'USD', tipoCambio: 1 });
  registrarDialog.value = true;
}

function onFacturaChange(idFactura: number): void {
  const f = facturas.value.find((x) => x.idFactura === idFactura);
  if (f) {
    form.idReserva = f.idReserva;
    form.monto = f.saldoPendiente;
  }
}

async function doRegistrar(): Promise<void> {
  if (!form.idFactura || !form.monto) {
    ui.showSnack('Factura y monto son obligatorios', 4000, 'error');
    return;
  }
  registrarBusy.value = true;
  try {
    const res = await pagosCreate(form);
    if (res.success) {
      ui.showSnack('Pago registrado', 3000);
      registrarDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    registrarBusy.value = false;
  }
}

async function confirmar(guid: string): Promise<void> {
  const res = await pagosActualizarEstado(guid, { estadoPago: 'APR' });
  if (res.success) {
    ui.showSnack('Pago aprobado', 3000);
    void load();
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Pagos</v-card-title>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openRegistrar">Registrar pago</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Factura</th>
          <th>Reserva</th>
          <th>Monto</th>
          <th>Método</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.pagoGuid">
          <td>{{ r.idPago }}</td>
          <td>{{ r.idFactura }}</td>
          <td>{{ r.idReserva }}</td>
          <td>{{ fmtMoney(r.monto, r.moneda) }}</td>
          <td>{{ r.metodoPago }}</td>
          <td class="text-no-wrap">{{ fmtDate(r.fechaPagoUtc) }}</td>
          <td><v-chip :color="statusColor(r.estadoPago)" size="small" label>{{ r.estadoPago }}</v-chip></td>
          <td>
            <v-btn
              v-if="r.estadoPago === 'PEN'"
              size="small"
              variant="text"
              color="success"
              icon="mdi-check-circle"
              title="Aprobar"
              @click="confirmar(r.pagoGuid)"
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

  <v-dialog v-model="registrarDialog" max-width="520">
    <v-card>
      <v-card-title>Registrar pago</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-select
          v-model="form.idFactura"
          :items="facturas"
          :item-title="(f) => `#${f.numeroFactura} — ${f.idCliente} (saldo: ${f.saldoPendiente})`"
          item-value="idFactura"
          label="Factura *"
          variant="outlined"
          density="comfortable"
          @update:model-value="onFacturaChange"
        />
        <v-text-field v-model.number="form.monto" label="Monto *" type="number" step="0.01" variant="outlined" density="comfortable" />
        <v-select v-model="form.metodoPago" :items="metodos" label="Método de pago" variant="outlined" density="comfortable" />
        <v-select v-model="form.estadoPago" :items="estadosPago" label="Estado inicial" variant="outlined" density="comfortable" />
        <v-text-field v-model="form.referencia" label="Referencia" variant="outlined" density="comfortable" />
        <v-text-field v-model="form.codigoAutorizacion" label="Código autorización" variant="outlined" density="comfortable" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="registrarDialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="registrarBusy" @click="doRegistrar">Registrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
