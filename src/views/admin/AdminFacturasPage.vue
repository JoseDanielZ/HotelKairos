<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  facturasAnular,
  facturasList,
  facturasGetDetalle,
  facturasGetPagos,
  facturasGenerarFinalYPago,
} from '@/services/facturas';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtMoney, fmtDate } from '@/utils/status.util';
import type { FacturaResponse, FacturaDetalleResponse } from '@/models';
import type { PagoResponse } from '@/models/pago.models';

const ui = useUiStore();
const rows = ref<FacturaResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);

// ── Anular ────────────────────────────────────────────────────────────────────
const anularDialog = ref(false);
const anularGuid = ref('');
const anularMotivo = ref('');
const anularBusy = ref(false);

// ── Detalle / pagos / cierre ──────────────────────────────────────────────────
const detalleDialog = ref(false);
const detalleTab = ref('detalle');
const detalleFactura = ref<FacturaResponse | null>(null);
const detalleItems = ref<FacturaDetalleResponse[]>([]);
const pagoItems = ref<PagoResponse[]>([]);
const loadingDetalle = ref(false);
const cierreBusy = ref(false);

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
    ui.showSnack('Indica el motivo de anulación', 4000, 'error');
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

async function openDetalle(factura: FacturaResponse): Promise<void> {
  detalleFactura.value = factura;
  detalleTab.value = 'detalle';
  detalleItems.value = [];
  pagoItems.value = [];
  detalleDialog.value = true;
  loadingDetalle.value = true;
  try {
    const [rd, rp] = await Promise.all([
      facturasGetDetalle(factura.guidFactura),
      facturasGetPagos(factura.guidFactura),
    ]);
    detalleItems.value = [...(rd.data ?? [])];
    pagoItems.value = [...(rp.data ?? [])];
  } finally {
    loadingDetalle.value = false;
  }
}

async function doCierreFinal(): Promise<void> {
  if (!detalleFactura.value) return;
  if (!confirm('¿Generar cierre final y pago simulado para la reserva de esta factura?')) return;
  cierreBusy.value = true;
  try {
    const reservaGuid = detalleFactura.value.guidReserva;
    if (!reservaGuid) {
      ui.showSnack('GUID de reserva no disponible en esta factura', 4000, 'error');
      return;
    }
    const res = await facturasGenerarFinalYPago(reservaGuid);
    if (res.success) {
      ui.showSnack('Cierre y pago simulado generados', 3000);
      detalleDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    cierreBusy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Facturas</v-card-title>
    <v-card-subtitle>Listado y gestión de facturas emitidas.</v-card-subtitle>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Número</th>
          <th>Tipo</th>
          <th>Cliente</th>
          <th>Reserva</th>
          <th>Total</th>
          <th>Saldo</th>
          <th>Emisión</th>
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
          <td class="text-no-wrap">
            <v-btn size="small" variant="text" icon="mdi-eye" title="Ver detalle" @click="openDetalle(r)" />
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

  <!-- ── Dialog anular ────────────────────────────────────────────────────── -->
  <v-dialog v-model="anularDialog" max-width="440">
    <v-card>
      <v-card-title>Anular factura</v-card-title>
      <v-card-text>
        <v-textarea v-model="anularMotivo" label="Motivo de anulación *" variant="outlined" rows="3" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="anularDialog = false">Cancelar</v-btn>
        <v-btn color="error" :loading="anularBusy" @click="doAnular">Anular</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Dialog detalle / pagos ─────────────────────────────────────────── -->
  <v-dialog v-model="detalleDialog" max-width="720">
    <v-card>
      <v-card-title class="d-flex align-center">
        Factura <code class="ml-2">{{ detalleFactura?.numeroFactura }}</code>
        <v-spacer />
        <v-btn
          v-if="detalleFactura && detalleFactura.estado !== 'ANU' && detalleFactura.estado !== 'PAG'"
          size="small"
          color="success"
          variant="tonal"
          prepend-icon="mdi-check-circle"
          :loading="cierreBusy"
          @click="doCierreFinal"
        >
          Cierre + pago simulado
        </v-btn>
      </v-card-title>

      <v-tabs v-model="detalleTab" bg-color="surface">
        <v-tab value="detalle">Detalle de líneas</v-tab>
        <v-tab value="pagos">Pagos</v-tab>
      </v-tabs>

      <v-card-text>
        <div v-if="loadingDetalle" class="center"><v-progress-circular indeterminate /></div>
        <v-window v-else v-model="detalleTab">
          <!-- Tab Detalle -->
          <v-window-item value="detalle">
            <v-table v-if="detalleItems.length">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th class="text-right">Cant.</th>
                  <th class="text-right">P. Unitario</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in detalleItems" :key="d.idDetalle">
                  <td>{{ d.descripcion }}</td>
                  <td class="text-right">{{ d.cantidad }}</td>
                  <td class="text-right">{{ fmtMoney(d.precioUnitario) }}</td>
                  <td class="text-right">{{ fmtMoney(d.subtotal) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-weight-bold">Total</td>
                  <td class="text-right font-weight-bold">{{ fmtMoney(detalleFactura?.total) }}</td>
                </tr>
              </tfoot>
            </v-table>
            <v-alert v-else type="info" variant="tonal" text="Sin líneas de detalle registradas." />
          </v-window-item>

          <!-- Tab Pagos -->
          <v-window-item value="pagos">
            <v-table v-if="pagoItems.length">
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in pagoItems" :key="p.pagoGuid">
                  <td>{{ p.metodoPago }}</td>
                  <td>{{ fmtMoney(p.monto, p.moneda) }}</td>
                  <td><v-chip :color="statusColor(p.estadoPago)" size="small" label>{{ p.estadoPago }}</v-chip></td>
                  <td class="text-caption">{{ p.referencia || p.transaccionExterna || '—' }}</td>
                  <td class="text-no-wrap">{{ fmtDate(p.fechaPagoUtc) }}</td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-else type="info" variant="tonal" text="Sin pagos registrados para esta factura." />
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="detalleDialog = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
