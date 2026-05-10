<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { clientesList } from '@/services/clientes';
import { reservasConfirmar, reservasCreate, reservasDelete, reservasList } from '@/services/reservas';
import { sucursalesGetInternalPage } from '@/services/sucursales';
import { useUiStore } from '@/stores/ui';
import type { ReservaResponse } from '@/models';

const ui = useUiStore();

const rows = ref<ReservaResponse[]>([]);
const total = ref(0);
const pageIndex = ref(0);
const pageSize = ref(10);
const loading = ref(false);

const catalogLoading = ref(false);
const crearEnviando = ref(false);
const deleteDialog = ref(false);
const deleteGuid = ref<string | null>(null);
const deleteBusy = ref(false);
const clientesSelect = ref<{ id: number; label: string }[]>([]);
const sucursalesSelect = ref<{ id: number; label: string }[]>([]);

const canalesOrigen = [
  { value: 'ADMIN', title: 'AdministraciÃ³n / recepciÃ³n' },
  { value: 'WEB', title: 'Web (huÃ©sped)' },
  { value: 'TELEFONO', title: 'TelÃ©fono' },
];

const crearForm = reactive({
  idCliente: null as number | null,
  idSucursal: null as number | null,
  fechaInicio: '',
  fechaFin: '',
  origenCanalReserva: 'ADMIN',
  observaciones: '',
});

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function patchFechasPorDefecto(): void {
  const fi = new Date();
  fi.setDate(fi.getDate() + 1);
  fi.setHours(15, 0, 0, 0);
  const ff = new Date(fi);
  ff.setDate(ff.getDate() + 2);
  ff.setHours(11, 0, 0, 0);
  crearForm.fechaInicio = toDatetimeLocalValue(fi);
  crearForm.fechaFin = toDatetimeLocalValue(ff);
}

function clienteLabel(c: {
  nombres?: string | null;
  apellidos?: string | null;
  correo?: string | null;
  razonSocial?: string | null;
  idCliente: number;
}): string {
  const name = [c.nombres, c.apellidos].filter(Boolean).join(' ').trim();
  if (name) return `${name} (#${c.idCliente})`;
  if (c.razonSocial) return `${c.razonSocial} (#${c.idCliente})`;
  if (c.correo) return `${c.correo} (#${c.idCliente})`;
  return `Cliente #${c.idCliente}`;
}

async function loadCatalogos(): Promise<void> {
  catalogLoading.value = true;
  try {
    const [clientes, sucursales] = await Promise.all([
      clientesList({ PageNumber: 1, PageSize: 200 }),
      sucursalesGetInternalPage({ PageNumber: 1, PageSize: 200 }),
    ]);
    const cr = clientes.data?.items ?? [];
    clientesSelect.value = cr.map((c) => ({ id: c.idCliente, label: clienteLabel(c) }));
    const sr = sucursales.data?.items ?? [];
    sucursalesSelect.value = sr.map((s) => ({
      id: s.idSucursal,
      label: [s.nombreSucursal, s.codigoSucursal ? `(${s.codigoSucursal})` : null].filter(Boolean).join(' '),
    }));
  } catch {
    ui.showSnack('No se pudieron cargar clientes o sucursales.', 6000);
  } finally {
    catalogLoading.value = false;
  }
}

async function crearReservaHuesped(): Promise<void> {
  const v = crearForm;
  if (v.idCliente == null || v.idSucursal == null || !v.fechaInicio || !v.fechaFin) {
    ui.showSnack('Completa el formulario de reserva.', 4000);
    return;
  }
  crearEnviando.value = true;
  try {
    const res = await reservasCreate({
      idCliente: v.idCliente,
      idSucursal: v.idSucursal,
      fechaInicio: new Date(v.fechaInicio).toISOString(),
      fechaFin: new Date(v.fechaFin).toISOString(),
      origenCanalReserva: v.origenCanalReserva,
      observaciones: v.observaciones?.trim() || undefined,
      esWalkin: 0,
    });
    if (res.success && res.data) {
      ui.showSnack(
        `Reserva creada (${v.idCliente}). CÃ³digo: ${res.data.codigoReserva ?? res.data.guidReserva}`,
        6000,
      );
      crearForm.observaciones = '';
      patchFechasPorDefecto();
      await load();
    } else {
      ui.showSnack(res.message || 'Respuesta sin Ã©xito', 6000);
    }
  } finally {
    crearEnviando.value = false;
  }
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await reservasList({ PageNumber: pageIndex.value + 1, PageSize: pageSize.value });
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

async function confirmar(guid: string | null | undefined): Promise<void> {
  if (!guid) return;
  await reservasConfirmar(guid);
  await load();
}

function openDelete(guid: string | null | undefined): void {
  if (!guid) return;
  deleteGuid.value = guid;
  deleteDialog.value = true;
}

async function remove(): Promise<void> {
  if (!deleteGuid.value) return;
  deleteBusy.value = true;
  try {
    await reservasDelete(deleteGuid.value);
    deleteDialog.value = false;
    await load();
  } finally {
    deleteBusy.value = false;
  }
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return 'â€”';
  return new Date(iso).toLocaleString('es');
}

onMounted(() => {
  patchFechasPorDefecto();
  void loadCatalogos();
  void load();
});
</script>

<template>
  <div class="admin-reservas-dash">
    <v-card class="mb-4">
      <v-card-title>Registrar reserva para un huÃ©sped</v-card-title>
      <v-card-subtitle>La reserva usa el mismo modelo que el sitio pÃºblico.</v-card-subtitle>
      <v-card-text>
        <div v-if="catalogLoading" class="center"><v-progress-circular indeterminate size="36" /></div>
        <template v-else>
          <div class="crear-grid">
            <v-select
              v-model="crearForm.idCliente"
              :items="clientesSelect"
              item-title="label"
              item-value="id"
              label="Cliente"
              variant="outlined"
            />
            <v-select
              v-model="crearForm.idSucursal"
              :items="sucursalesSelect"
              item-title="label"
              item-value="id"
              label="Sucursal"
              variant="outlined"
            />
            <v-text-field v-model="crearForm.fechaInicio" label="Check-in" type="datetime-local" variant="outlined" />
            <v-text-field v-model="crearForm.fechaFin" label="Check-out" type="datetime-local" variant="outlined" />
            <v-select
              v-model="crearForm.origenCanalReserva"
              :items="canalesOrigen"
              item-title="title"
              item-value="value"
              label="Origen del canal"
              variant="outlined"
            />
            <v-textarea v-model="crearForm.observaciones" class="full-width" label="Observaciones" variant="outlined" rows="2" />
          </div>
          <div class="crear-actions mt-2">
            <v-btn
              color="primary"
              :disabled="
                crearEnviando ||
                crearForm.idCliente == null ||
                crearForm.idSucursal == null ||
                clientesSelect.length === 0 ||
                sucursalesSelect.length === 0
              "
              @click="crearReservaHuesped"
            >
              {{ crearEnviando ? 'Guardandoâ€¦' : 'Guardar reserva' }}
            </v-btn>
            <v-btn class="ms-2" variant="text" @click="loadCatalogos">Recargar listas</v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </div>

  <v-card class="mb-4">
    <v-card-title>Reservas (panel)</v-card-title>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>CÃ³digo</th>
          <th>Id cliente</th>
          <th>Id sucursal</th>
          <th>Inicio</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.guidReserva ?? String(r.codigoReserva)">
          <td>{{ r.codigoReserva }}</td>
          <td>{{ r.idCliente }}</td>
          <td>{{ r.idSucursal }}</td>
          <td>{{ fmt(r.fechaInicio) }}</td>
          <td>{{ r.estadoReserva }}</td>
          <td>
            <v-btn size="small" variant="text" icon="mdi-pencil" :to="'/admin/reservas/' + r.guidReserva" />
            <v-btn size="small" variant="text" color="primary" icon="mdi-check-circle" @click="confirmar(r.guidReserva)" />
            <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="openDelete(r.guidReserva)" />
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

  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title>Eliminar reserva</v-card-title>
      <v-card-text>Â¿Confirmas que deseas eliminar esta reserva? Esta acciÃ³n no se puede deshacer.</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
        <v-btn color="error" :loading="deleteBusy" @click="remove">Eliminar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.center {
  display: flex;
  justify-content: center;
  padding: 1rem;
}
.crear-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}
.full-width {
  grid-column: 1 / -1;
}
</style>
