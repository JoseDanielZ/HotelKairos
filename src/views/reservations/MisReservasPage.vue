<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { habitacionDesdeObservaciones } from '@/utils/reserva-display.util';
import { reservasCancelar, reservasList } from '@/services/reservas';
import { useUserContextStore } from '@/stores/userContext';
import { useUiStore } from '@/stores/ui';
import type { ReservaDTO } from '@/models';

const user = useUserContextStore();
const ui = useUiStore();

const columnLabels: Record<string, string> = {
  codigo: 'Código',
  habitacion: 'Habitación',
  sucursal: 'Sucursal',
  inicio: 'Check-in',
  fin: 'Check-out',
  total: 'Total',
  estado: 'Estado',
  acciones: '',
};
const displayedColumns = ['codigo', 'habitacion', 'sucursal', 'inicio', 'fin', 'total', 'estado', 'acciones'];

const cancelDialog = ref(false);
const cancelGuid = ref<string | null>(null);
const cancelMotivo = ref('');
const cancelBusy = ref(false);
const rows = ref<ReservaDTO[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(10);
const loading = ref(false);
const idClienteEfectivo = ref<number | null>(null);
const formCliente = ref({ idCliente: null as number | null });

function syncIdClienteYLista(): void {
  idClienteEfectivo.value = user.getIdCliente();
  if (idClienteEfectivo.value) {
    formCliente.value.idCliente = idClienteEfectivo.value;
  }
  if (idClienteEfectivo.value) {
    void load();
  } else {
    ui.showSnack(
      'No pudimos vincular tu cuenta de cliente automáticamente. Indica el identificador que te dio recepción.',
      8000,
    );
  }
}

onMounted(() => {
  void user.refreshMe().then(() => syncIdClienteYLista());
});

function guardarIdCliente(): void {
  const v = formCliente.value.idCliente;
  if (v == null || v < 1) {
    return;
  }
  user.setIdClienteOverride(v);
  idClienteEfectivo.value = v;
  void load();
}

function limpiarOverride(): void {
  user.setIdClienteOverride(null);
  void user.refreshMe().then(() => {
    idClienteEfectivo.value = user.getIdCliente();
    void load();
  });
}

async function load(): Promise<void> {
  const id = user.getIdCliente();
  if (id == null) {
    rows.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const r = await reservasList({
      IdCliente: id,
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

function habitacionEtiqueta(r: ReservaDTO): string {
  return habitacionDesdeObservaciones(r.observaciones) ?? '—';
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es');
}

const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

function abrirCancelar(guid: string | null | undefined): void {
  if (!guid) return;
  cancelGuid.value = guid;
  cancelMotivo.value = '';
  cancelDialog.value = true;
}

async function confirmarCancelacion(): Promise<void> {
  if (!cancelGuid.value || !cancelMotivo.value.trim()) {
    ui.showSnack('Indica el motivo de la cancelación.', 4000, 'error');
    return;
  }
  cancelBusy.value = true;
  try {
    const res = await reservasCancelar(cancelGuid.value, { motivo: cancelMotivo.value.trim() });
    if (res.success) {
      ui.showSnack('Reserva cancelada.', 5000);
      cancelDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'No se pudo cancelar.', 5000, 'error');
    }
  } finally {
    cancelBusy.value = false;
  }
}
</script>

<template>
  <div class="mis-reservas hl-page">
    <header class="mis-reservas__head">
      <h1>Mis reservas</h1>
      <p class="mis-reservas__lede">
        Aquí aparecen las reservas asociadas a tu perfil de cliente. Si el sistema no reconoce tu identificador, puedes
        indicar el que te entregó recepción para esta sesión.
      </p>
    </header>

    <v-card class="mis-reservas__panel mb-4">
      <v-card-title>Identificación</v-card-title>
      <v-card-subtitle>Vínculo con tu cuenta de huésped</v-card-subtitle>
      <v-card-text>
        <p v-if="idClienteEfectivo != null" class="mis-reservas__status">
          Cliente activo:
          <strong>{{ idClienteEfectivo }}</strong>
          <span v-if="user.getStoredIdClienteOverride()" class="mis-reservas__badge">Guardado en este dispositivo</span>
        </p>
        <form class="mis-reservas__form" @submit.prevent="guardarIdCliente()">
          <v-text-field
            v-model.number="formCliente.idCliente"
            class="mis-reservas__field"
            label="Id cliente"
            type="number"
            variant="outlined"
          />
          <div class="mis-reservas__form-actions">
            <v-btn color="primary" type="submit" :disabled="formCliente.idCliente == null">Aplicar</v-btn>
            <v-btn variant="text" type="button" @click="limpiarOverride()">Borrar id guardado</v-btn>
          </div>
        </form>
      </v-card-text>
    </v-card>

    <v-card v-if="user.getIdCliente() == null" class="mis-reservas__empty">
      <v-card-text><p>Indica un identificador de cliente arriba para cargar tu historial.</p></v-card-text>
    </v-card>
    <div v-else-if="loading" class="mis-reservas__center">
      <v-progress-circular indeterminate />
    </div>
    <template v-else>
      <v-table class="mis-reservas__table">
        <thead>
          <tr>
            <th v-for="c in displayedColumns" :key="c">{{ columnLabels[c] }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.guidReserva ?? String(r.codigoReserva)">
            <td>{{ r.codigoReserva }}</td>
            <td>{{ habitacionEtiqueta(r) }}</td>
            <td>{{ r.idSucursal }}</td>
            <td>{{ fmtDate(r.fechaInicio) }}</td>
            <td>{{ fmtDate(r.fechaFin) }}</td>
            <td>{{ (r.totalReserva ?? 0).toFixed(2) }}</td>
            <td>
              <v-chip
                :color="r.estadoReserva === 'CONFIRMADA' ? 'success' : r.estadoReserva === 'CANCELADA' ? 'error' : 'default'"
                size="small"
                variant="tonal"
              >
                {{ r.estadoReserva ?? '—' }}
              </v-chip>
            </td>
            <td>
              <v-btn
                v-if="r.estadoReserva !== 'CANCELADA'"
                size="small"
                variant="text"
                color="error"
                icon="mdi-cancel"
                title="Cancelar reserva"
                @click="abrirCancelar(r.guidReserva)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination v-if="pages > 1" class="mt-4" :length="pages" :model-value="pageIndex + 1" @update:model-value="onPage" />

      <v-dialog v-model="cancelDialog" max-width="440">
        <v-card>
          <v-card-title>Cancelar reserva</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="cancelMotivo"
              label="Motivo de cancelación *"
              variant="outlined"
              rows="3"
              autofocus
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="cancelDialog = false">Volver</v-btn>
            <v-btn color="error" :loading="cancelBusy" :disabled="!cancelMotivo.trim()" @click="confirmarCancelacion">
              Confirmar cancelación
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<style scoped src="./mis-reservas-page.scss"></style>
