<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { reservasGetByGuid, reservasUpdate, reservasGetHabitaciones, reservasAgregarHabitacion, reservasEliminarHabitacion } from '@/services/reservas';
import { habitacionesList } from '@/services/habitaciones';
import { useUiStore } from '@/stores/ui';
import { isUuidString } from '@/utils/string.util';
import { fmtDate, fmtMoney, statusColor } from '@/utils/status.util';
import type { ReservaHabitacionResponse, ReservaHabitacionRequest, HabitacionResponse } from '@/models';

const ESTADOS = ['Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada', 'NoShow'];

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const estados = ESTADOS;
const guid = ref('');
const codigoReserva = ref('');
const loading = ref(true);
const guardando = ref(false);

const form = reactive({
  fechaInicio: '',
  fechaFin: '',
  estadoReserva: '',
  observaciones: '',
});

function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Habitaciones sub-recurso ─────────────────────────────────────────────────
const habitaciones = ref<ReservaHabitacionResponse[]>([]);
const loadingHabitaciones = ref(false);
const habitacionesAll = ref<HabitacionResponse[]>([]);
const agregarDialog = ref(false);
const agregarForm = reactive<ReservaHabitacionRequest>({
  idHabitacion: 0,
  fechaInicio: '',
  fechaFin: '',
  numAdultos: 1,
  numNinos: 0,
  precioNocheAplicado: 0,
  idTarifa: null,
});
const savingHabitacion = ref(false);

async function loadHabitaciones(): Promise<void> {
  loadingHabitaciones.value = true;
  try {
    const r = await reservasGetHabitaciones(guid.value);
    habitaciones.value = r.data ?? [];
  } finally {
    loadingHabitaciones.value = false;
  }
}

async function openAgregarDialog(): Promise<void> {
  if (!habitacionesAll.value.length) {
    const r = await habitacionesList({ PageSize: 200 });
    habitacionesAll.value = r.data?.items ?? [];
  }
  Object.assign(agregarForm, {
    idHabitacion: 0,
    fechaInicio: form.fechaInicio,
    fechaFin: form.fechaFin,
    numAdultos: 1,
    numNinos: 0,
    precioNocheAplicado: 0,
    idTarifa: null,
  });
  agregarDialog.value = true;
}

async function doAgregar(): Promise<void> {
  if (!agregarForm.idHabitacion || !agregarForm.fechaInicio || !agregarForm.fechaFin) {
    ui.showSnack('Habitación y fechas son obligatorias', 4000, 'error');
    return;
  }
  savingHabitacion.value = true;
  try {
    const body: ReservaHabitacionRequest = {
      idHabitacion: agregarForm.idHabitacion,
      fechaInicio: new Date(agregarForm.fechaInicio).toISOString(),
      fechaFin: new Date(agregarForm.fechaFin).toISOString(),
      numAdultos: agregarForm.numAdultos,
      numNinos: agregarForm.numNinos,
      precioNocheAplicado: agregarForm.precioNocheAplicado,
      idTarifa: agregarForm.idTarifa || null,
    };
    const res = await reservasAgregarHabitacion(guid.value, body);
    if (res.success) {
      ui.showSnack('Habitación agregada', 3000);
      agregarDialog.value = false;
      await loadHabitaciones();
    } else {
      ui.showSnack(res.message || 'Error', 5000, 'error');
    }
  } finally {
    savingHabitacion.value = false;
  }
}

async function quitarHabitacion(id: number): Promise<void> {
  if (!confirm('¿Quitar esta habitación de la reserva?')) return;
  const res = await reservasEliminarHabitacion(guid.value, id);
  if (res.success) {
    ui.showSnack('Habitación quitada', 3000);
    await loadHabitaciones();
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  const id = String(route.params.guid ?? '');
  if (!isUuidString(id)) {
    ui.showSnack('GUID de reserva inválido', 4000);
    void router.push('/admin/reservas');
    return;
  }
  guid.value = id;
  try {
    const res = await reservasGetByGuid(id);
    if (res.success && res.data) {
      const r = res.data;
      codigoReserva.value = r.codigoReserva ?? r.guidReserva ?? '';
      form.fechaInicio = toDatetimeLocal(r.fechaInicio ?? '');
      form.fechaFin = toDatetimeLocal(r.fechaFin ?? '');
      form.estadoReserva = r.estadoReserva ?? '';
      form.observaciones = r.observaciones ?? '';
    }
    await loadHabitaciones();
  } finally {
    loading.value = false;
  }
});

async function save(): Promise<void> {
  if (!form.fechaInicio || !form.fechaFin) {
    ui.showSnack('Fechas obligatorias', 4000);
    return;
  }
  guardando.value = true;
  try {
    const res = await reservasUpdate(guid.value, {
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      fechaFin: new Date(form.fechaFin).toISOString(),
      estadoReserva: form.estadoReserva || undefined,
      observaciones: form.observaciones || undefined,
    });
    if (res.success) {
      ui.showSnack('Reserva actualizada', 3000);
      void router.push('/admin/reservas');
    }
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <div v-else>
    <div class="d-flex align-center mb-3">
      <h1>Reserva <code>{{ codigoReserva }}</code></h1>
      <v-spacer />
      <v-btn variant="text" to="/admin/reservas">Volver</v-btn>
    </div>

    <!-- ── Datos principales ────────────────────────────────────────────────── -->
    <v-card class="mb-4">
      <v-card-title>Datos de la reserva</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.fechaInicio" label="Inicio" type="datetime-local" variant="outlined" />
        <v-text-field v-model="form.fechaFin" label="Fin" type="datetime-local" variant="outlined" />
        <v-select v-model="form.estadoReserva" :items="estados" label="Estado" variant="outlined" clearable />
        <v-textarea v-model="form.observaciones" label="Observaciones" variant="outlined" />
        <v-btn color="primary" :loading="guardando" @click="save">Guardar cambios</v-btn>
      </v-card-text>
    </v-card>

    <!-- ── Habitaciones ─────────────────────────────────────────────────────── -->
    <v-card>
      <v-card-title class="d-flex align-center">
        Habitaciones asignadas
        <v-spacer />
        <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="openAgregarDialog">Agregar habitación</v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="loadingHabitaciones" class="center"><v-progress-circular indeterminate /></div>
        <v-table v-else-if="habitaciones.length">
          <thead>
            <tr>
              <th>Id hab.</th>
              <th>Tarifa</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Adultos</th>
              <th>Niños</th>
              <th>Precio/noche</th>
              <th>Total</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in habitaciones" :key="h.idReservaHabitacion">
              <td>{{ h.idHabitacion }}</td>
              <td>{{ h.idTarifa ?? '—' }}</td>
              <td class="text-no-wrap">{{ fmtDate(h.fechaInicio) }}</td>
              <td class="text-no-wrap">{{ fmtDate(h.fechaFin) }}</td>
              <td>{{ h.numAdultos }}</td>
              <td>{{ h.numNinos }}</td>
              <td>{{ fmtMoney(h.precioNocheAplicado) }}</td>
              <td>{{ fmtMoney(h.totalLinea) }}</td>
              <td><v-chip :color="statusColor(h.estadoDetalle)" size="small" label>{{ h.estadoDetalle }}</v-chip></td>
              <td>
                <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="quitarHabitacion(h.idReservaHabitacion)" />
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-alert v-else type="info" variant="tonal" text="Sin habitaciones asignadas a esta reserva." />
      </v-card-text>
    </v-card>
  </div>

  <!-- ── Dialog agregar habitación ────────────────────────────────────────── -->
  <v-dialog v-model="agregarDialog" max-width="540">
    <v-card>
      <v-card-title>Agregar habitación</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-select
          v-model="agregarForm.idHabitacion"
          :items="habitacionesAll"
          :item-title="(h) => `#${h.idHabitacion} — ${h.numeroHabitacion ?? h.habitacionGuid.slice(0,8)}`"
          item-value="idHabitacion"
          label="Habitación *"
          variant="outlined"
          density="comfortable"
        />
        <div class="d-flex gap-2">
          <v-text-field v-model="agregarForm.fechaInicio" label="Inicio *" type="datetime-local" variant="outlined" density="comfortable" class="flex-1" />
          <v-text-field v-model="agregarForm.fechaFin" label="Fin *" type="datetime-local" variant="outlined" density="comfortable" class="flex-1" />
        </div>
        <div class="d-flex gap-2">
          <v-text-field v-model.number="agregarForm.numAdultos" label="Adultos" type="number" min="1" variant="outlined" density="comfortable" class="flex-1" />
          <v-text-field v-model.number="agregarForm.numNinos" label="Niños" type="number" min="0" variant="outlined" density="comfortable" class="flex-1" />
        </div>
        <v-text-field v-model.number="agregarForm.precioNocheAplicado" label="Precio/noche" type="number" min="0" step="0.01" variant="outlined" density="comfortable" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="agregarDialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="savingHabitacion" @click="doAgregar">Agregar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.center { display: flex; justify-content: center; padding: 2rem; }
.flex-1 { flex: 1; }
.mb-4 { margin-bottom: 1rem; }
</style>
