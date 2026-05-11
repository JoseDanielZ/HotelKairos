<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clientesCreate, clientesGetByGuid, clientesUpdate, clientesGetReservas, clientesGetValoraciones } from '@/services/clientes';
import { useUiStore } from '@/stores/ui';
import { isUuidString } from '@/utils/string.util';
import { statusColor, fmtDate, fmtMoney } from '@/utils/status.util';
import type { CrearClienteRequest, ActualizarClienteRequest, ReservaResponse, ValoracionResponse } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const isCreate = ref(false);
const clienteGuid = ref<string | undefined>();
const loading = ref(true);
const tab = ref('datos');

const createForm = reactive({
  tipoIdentificacion: '',
  numeroIdentificacion: '',
  nombres: '',
  apellidos: '',
  razonSocial: '',
  correo: '',
  telefono: '',
  direccion: '',
  estado: 'ACTIVO',
});

const editForm = reactive({
  nombres: '',
  apellidos: '',
  razonSocial: '',
  correo: '',
  telefono: '',
  direccion: '',
  estado: '',
});

// ── Reservas del cliente ──────────────────────────────────────────────────────
const reservas = ref<ReservaResponse[]>([]);
const loadingReservas = ref(false);

async function loadReservas(): Promise<void> {
  if (!clienteGuid.value) return;
  loadingReservas.value = true;
  try {
    const r = await clientesGetReservas(clienteGuid.value);
    reservas.value = r.data ?? [];
  } finally {
    loadingReservas.value = false;
  }
}

// ── Valoraciones del cliente ──────────────────────────────────────────────────
const valoraciones = ref<ValoracionResponse[]>([]);
const loadingValoraciones = ref(false);

async function loadValoraciones(): Promise<void> {
  if (!clienteGuid.value) return;
  loadingValoraciones.value = true;
  try {
    const r = await clientesGetValoraciones(clienteGuid.value);
    valoraciones.value = r.data ?? [];
  } finally {
    loadingValoraciones.value = false;
  }
}

function onTabChange(t: string): void {
  if (t === 'reservas' && !reservas.value.length) void loadReservas();
  if (t === 'valoraciones' && !valoraciones.value.length) void loadValoraciones();
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (route.path.endsWith('/nuevo')) {
    isCreate.value = true;
    loading.value = false;
    return;
  }
  const id = String(route.params.guid ?? '');
  if (!isUuidString(id)) {
    ui.showSnack('GUID inválido', 4000);
    void router.push('/admin/clientes');
    return;
  }
  clienteGuid.value = id;
  try {
    const res = await clientesGetByGuid(id);
    if (res.success && res.data) {
      const c = res.data;
      editForm.nombres = c.nombres ?? '';
      editForm.apellidos = c.apellidos ?? '';
      editForm.razonSocial = c.razonSocial ?? '';
      editForm.correo = c.correo ?? '';
      editForm.telefono = c.telefono ?? '';
      editForm.direccion = c.direccion ?? '';
      editForm.estado = c.estado ?? '';
    }
  } finally {
    loading.value = false;
  }
});

async function saveCreate(): Promise<void> {
  const v = createForm;
  if (!v.tipoIdentificacion || !v.numeroIdentificacion || !v.nombres || !v.correo || !v.telefono || !v.direccion) {
    ui.showSnack('Completa los campos obligatorios.', 4000);
    return;
  }
  const body: CrearClienteRequest = {
    tipoIdentificacion: v.tipoIdentificacion.trim(),
    numeroIdentificacion: v.numeroIdentificacion.trim(),
    nombres: v.nombres.trim(),
    apellidos: v.apellidos?.trim() || undefined,
    razonSocial: v.razonSocial?.trim() || undefined,
    correo: v.correo.trim(),
    telefono: v.telefono.trim(),
    direccion: v.direccion.trim(),
    estado: v.estado?.trim() || undefined,
  };
  const res = await clientesCreate(body);
  if (res.success) {
    ui.showSnack('Cliente creado', 3000);
    void router.push('/admin/clientes');
  }
}

async function saveEdit(): Promise<void> {
  if (!clienteGuid.value) return;
  const v = editForm;
  const body: ActualizarClienteRequest = {
    nombres: v.nombres || undefined,
    apellidos: v.apellidos || undefined,
    razonSocial: v.razonSocial || undefined,
    correo: v.correo || undefined,
    telefono: v.telefono || undefined,
    direccion: v.direccion || undefined,
    estado: v.estado || undefined,
  };
  const res = await clientesUpdate(clienteGuid.value, body);
  if (res.success) {
    ui.showSnack('Cliente actualizado', 3000);
    void router.push('/admin/clientes');
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>

  <!-- ── Crear ────────────────────────────────────────────────────────────────── -->
  <v-card v-else-if="isCreate">
    <v-card-title>Nuevo cliente</v-card-title>
    <v-card-text>
      <v-text-field v-model="createForm.tipoIdentificacion" label="Tipo identificación" variant="outlined" />
      <v-text-field v-model="createForm.numeroIdentificacion" label="Número identificación" variant="outlined" />
      <v-text-field v-model="createForm.nombres" label="Nombres" variant="outlined" />
      <v-text-field v-model="createForm.apellidos" label="Apellidos" variant="outlined" />
      <v-text-field v-model="createForm.razonSocial" label="Razón social" variant="outlined" />
      <v-text-field v-model="createForm.correo" label="Correo" type="email" variant="outlined" />
      <v-text-field v-model="createForm.telefono" label="Teléfono" variant="outlined" />
      <v-text-field v-model="createForm.direccion" label="Dirección" variant="outlined" />
      <v-text-field v-model="createForm.estado" label="Estado" variant="outlined" />
      <v-btn color="primary" class="mt-2" @click="saveCreate">Crear</v-btn>
      <v-btn class="mt-2 ms-2" variant="text" to="/admin/clientes">Cancelar</v-btn>
    </v-card-text>
  </v-card>

  <!-- ── Editar con tabs ─────────────────────────────────────────────────────── -->
  <div v-else>
    <div class="d-flex align-center mb-3">
      <h1>Editar cliente</h1>
      <v-spacer />
      <v-btn variant="text" to="/admin/clientes">Volver</v-btn>
    </div>

    <v-tabs v-model="tab" bg-color="surface" @update:model-value="onTabChange">
      <v-tab value="datos">Datos</v-tab>
      <v-tab value="reservas">Reservas</v-tab>
      <v-tab value="valoraciones">Valoraciones</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-3">
      <!-- Tab Datos -->
      <v-window-item value="datos">
        <v-card>
          <v-card-text>
            <v-text-field v-model="editForm.nombres" label="Nombres" variant="outlined" />
            <v-text-field v-model="editForm.apellidos" label="Apellidos" variant="outlined" />
            <v-text-field v-model="editForm.razonSocial" label="Razón social" variant="outlined" />
            <v-text-field v-model="editForm.correo" label="Correo" variant="outlined" />
            <v-text-field v-model="editForm.telefono" label="Teléfono" variant="outlined" />
            <v-text-field v-model="editForm.direccion" label="Dirección" variant="outlined" />
            <v-text-field v-model="editForm.estado" label="Estado" variant="outlined" />
            <v-btn color="primary" class="mt-2" @click="saveEdit">Guardar</v-btn>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Tab Reservas -->
      <v-window-item value="reservas">
        <v-card>
          <v-card-title>Reservas del cliente</v-card-title>
          <v-card-text>
            <div v-if="loadingReservas" class="center"><v-progress-circular indeterminate /></div>
            <v-table v-else-if="reservas.length">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Sucursal</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reservas" :key="r.guidReserva">
                  <td><code>{{ r.codigoReserva || r.guidReserva.slice(0, 8) }}</code></td>
                  <td>{{ r.idSucursal }}</td>
                  <td class="text-no-wrap">{{ fmtDate(r.fechaInicio) }}</td>
                  <td class="text-no-wrap">{{ fmtDate(r.fechaFin) }}</td>
                  <td>{{ fmtMoney(r.totalReserva) }}</td>
                  <td><v-chip :color="statusColor(r.estadoReserva)" size="small" label>{{ r.estadoReserva }}</v-chip></td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-else type="info" variant="tonal" text="Este cliente no tiene reservas registradas." />
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Tab Valoraciones -->
      <v-window-item value="valoraciones">
        <v-card>
          <v-card-title>Valoraciones del cliente</v-card-title>
          <v-card-text>
            <div v-if="loadingValoraciones" class="center"><v-progress-circular indeterminate /></div>
            <v-table v-else-if="valoraciones.length">
              <thead>
                <tr>
                  <th>Sucursal</th>
                  <th>Puntuación</th>
                  <th>Comentario</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in valoraciones" :key="v.valoracionGuid">
                  <td>{{ v.idSucursal }}</td>
                  <td>
                    <v-rating :model-value="v.puntuacionGeneral" readonly half-increments density="compact" size="small" color="amber" />
                  </td>
                  <td class="text-truncate" style="max-width: 220px;">{{ v.comentarioPositivo || '—' }}</td>
                  <td><v-chip :color="statusColor(v.estadoValoracion)" size="small" label>{{ v.estadoValoracion }}</v-chip></td>
                  <td class="text-no-wrap text-caption">{{ fmtDate(v.fechaRegistroUtc) }}</td>
                </tr>
              </tbody>
            </v-table>
            <v-alert v-else type="info" variant="tonal" text="Este cliente no tiene valoraciones registradas." />
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<style scoped>
.center { display: flex; justify-content: center; padding: 2rem; }
</style>
