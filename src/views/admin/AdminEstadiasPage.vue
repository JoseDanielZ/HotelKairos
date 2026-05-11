<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { estadiasCheckout, estadiasList, estadiasMantenimiento, cargosAnular } from '@/services/estadias';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtDate, fmtMoney } from '@/utils/status.util';
import type { EstadiaResponse, CargoEstadiaResponse } from '@/models';

const ui = useUiStore();
const rows = ref<EstadiaResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);

// ── Checkout ──────────────────────────────────────────────────────────────────
const checkoutDialog = ref(false);
const checkoutGuid = ref('');
const checkoutObs = ref('');
const checkoutMaint = ref(0);
const checkoutBusy = ref(false);

// ── Cargos dialog ─────────────────────────────────────────────────────────────
const cargosDialog = ref(false);
const cargosEstadia = ref<CargoEstadiaResponse[]>([]);
const anularDialog = ref(false);
const anularCargoGuid = ref('');
const anularMotivo = ref('');
const anularBusy = ref(false);

// ── Mantenimiento ─────────────────────────────────────────────────────────────
const mantenimientoBusy = ref<Record<string, boolean>>({});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await estadiasList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
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

async function doMantenimiento(estadia: EstadiaResponse): Promise<void> {
  if (!confirm(`¿Marcar estadía #${estadia.idEstadia} como en mantenimiento?`)) return;
  mantenimientoBusy.value[estadia.estadiaGuid] = true;
  try {
    const res = await estadiasMantenimiento(estadia.estadiaGuid);
    if (res.success) {
      ui.showSnack('Estadía marcada para mantenimiento', 3000);
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    mantenimientoBusy.value[estadia.estadiaGuid] = false;
  }
}

function openCargos(estadia: EstadiaResponse): void {
  cargosEstadia.value = estadia.cargos ?? [];
  cargosDialog.value = true;
}

function openAnularCargo(cargo: CargoEstadiaResponse): void {
  anularCargoGuid.value = cargo.cargoGuid;
  anularMotivo.value = '';
  anularDialog.value = true;
}

async function doAnularCargo(): Promise<void> {
  if (!anularMotivo.value.trim()) {
    ui.showSnack('Indica el motivo', 4000, 'error');
    return;
  }
  anularBusy.value = true;
  try {
    const res = await cargosAnular(anularCargoGuid.value, { motivo: anularMotivo.value });
    if (res.success) {
      ui.showSnack('Cargo anulado', 3000);
      anularDialog.value = false;
      cargosDialog.value = false;
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
          <td>
            <v-btn
              v-if="r.cargos?.length"
              size="small"
              variant="tonal"
              prepend-icon="mdi-receipt"
              @click="openCargos(r)"
            >
              {{ r.cargos.length }}
            </v-btn>
            <span v-else class="text-medium-emphasis text-caption">0</span>
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-if="!r.checkoutUtc && r.estadoEstadia !== 'MNT'"
              size="small"
              variant="text"
              color="deep-orange"
              icon="mdi-wrench"
              title="Mantenimiento"
              :loading="mantenimientoBusy[r.estadiaGuid]"
              @click="doMantenimiento(r)"
            />
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

  <!-- ── Dialog checkout ───────────────────────────────────────────────────── -->
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

  <!-- ── Dialog cargos ─────────────────────────────────────────────────────── -->
  <v-dialog v-model="cargosDialog" max-width="680">
    <v-card>
      <v-card-title>Cargos de estadía</v-card-title>
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th class="text-right">Cant.</th>
              <th class="text-right">P. Unit.</th>
              <th class="text-right">Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in cargosEstadia" :key="c.cargoGuid">
              <td>{{ c.descripcionCargo }}</td>
              <td class="text-right">{{ c.cantidad }}</td>
              <td class="text-right">{{ fmtMoney(c.precioUnitario) }}</td>
              <td class="text-right">{{ fmtMoney(c.totalCargo) }}</td>
              <td>
                <v-chip :color="statusColor(c.estadoCargo)" size="small" label>{{ c.estadoCargo || 'ACT' }}</v-chip>
              </td>
              <td class="text-no-wrap text-caption">{{ fmtDate(c.fechaRegistroUtc) }}</td>
              <td>
                <v-btn
                  v-if="c.estadoCargo !== 'ANU'"
                  size="small"
                  variant="text"
                  color="error"
                  icon="mdi-cancel"
                  title="Anular cargo"
                  @click="openAnularCargo(c)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cargosDialog = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Dialog anular cargo ───────────────────────────────────────────────── -->
  <v-dialog v-model="anularDialog" max-width="440">
    <v-card>
      <v-card-title>Anular cargo</v-card-title>
      <v-card-text>
        <v-textarea v-model="anularMotivo" label="Motivo *" variant="outlined" rows="3" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="anularDialog = false">Cancelar</v-btn>
        <v-btn color="error" :loading="anularBusy" @click="doAnularCargo">Anular</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
