<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { habitacionesList } from '@/services/habitaciones';
import { pagosList } from '@/services/pagos';
import { reservasList } from '@/services/reservas';
import { estadiasList } from '@/services/estadias';
import { statusColor, fmtDate, fmtMoney } from '@/utils/status.util';
import type { ReservaDTO } from '@/models';

const loading = ref(true);

const kpis = ref({
  reservasPendientes: 0,
  reservasConfirmadas: 0,
  habitacionesDisponibles: 0,
  habitacionesOcupadas: 0,
  estadiasTotal: 0,
  pagosPendientes: 0,
});

const recentReservas = ref<ReservaDTO[]>([]);

const hoy = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [resPend, resConf, habDisp, habOcup, estAll, pagPend, recents] = await Promise.allSettled([
      reservasList({ Estado: 'PENDIENTE', PageSize: 1 }),
      reservasList({ Estado: 'CONFIRMADA', PageSize: 1 }),
      habitacionesList({ Estado: 'DISPONIBLE', PageSize: 1 }),
      habitacionesList({ Estado: 'OCUPADA', PageSize: 1 }),
      estadiasList({ PageSize: 1 }),
      pagosList({ Estado: 'PENDIENTE', PageSize: 1 }),
      reservasList({ PageSize: 8 }),
    ]);

    if (resPend.status === 'fulfilled') kpis.value.reservasPendientes = resPend.value.data?.totalRecords ?? 0;
    if (resConf.status === 'fulfilled') kpis.value.reservasConfirmadas = resConf.value.data?.totalRecords ?? 0;
    if (habDisp.status === 'fulfilled') kpis.value.habitacionesDisponibles = habDisp.value.data?.totalRecords ?? 0;
    if (habOcup.status === 'fulfilled') kpis.value.habitacionesOcupadas = habOcup.value.data?.totalRecords ?? 0;
    if (estAll.status === 'fulfilled') kpis.value.estadiasTotal = estAll.value.data?.totalRecords ?? 0;
    if (pagPend.status === 'fulfilled') kpis.value.pagosPendientes = pagPend.value.data?.totalRecords ?? 0;
    if (recents.status === 'fulfilled') recentReservas.value = recents.value.data?.data ?? [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <!-- Header -->
  <div class="dash-header">
    <div>
      <h1 class="dash-title">Panel de operaciones</h1>
      <p class="dash-date">{{ hoy }}</p>
    </div>
    <div class="dash-header-actions">
      <v-btn variant="outlined" prepend-icon="mdi-refresh" :loading="loading" @click="load">Actualizar</v-btn>
      <v-btn color="primary" prepend-icon="mdi-calendar-plus" to="/admin/reservas">Nueva reserva</v-btn>
    </div>
  </div>

  <!-- KPI cards -->
  <div v-if="loading" class="dash-loading">
    <v-progress-circular indeterminate size="48" />
  </div>

  <template v-else>
    <div class="kpi-grid">
      <v-card class="kpi-card kpi-warning">
        <v-card-text>
          <div class="kpi-label">Reservas pendientes</div>
          <div class="kpi-value">{{ kpis.reservasPendientes }}</div>
          <div class="kpi-sub">Esperando confirmación</div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" size="small" to="/admin/reservas">Ver todas</v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="kpi-card kpi-success">
        <v-card-text>
          <div class="kpi-label">Reservas confirmadas</div>
          <div class="kpi-value">{{ kpis.reservasConfirmadas }}</div>
          <div class="kpi-sub">Listas para check-in</div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" size="small" to="/admin/reservas">Ver todas</v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="kpi-card kpi-info">
        <v-card-text>
          <div class="kpi-label">Habitaciones disponibles</div>
          <div class="kpi-value">{{ kpis.habitacionesDisponibles }}</div>
          <div class="kpi-sub">Listas para asignar</div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" size="small" to="/admin/habitaciones">Ver inventario</v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="kpi-card kpi-occupied">
        <v-card-text>
          <div class="kpi-label">Habitaciones ocupadas</div>
          <div class="kpi-value">{{ kpis.habitacionesOcupadas }}</div>
          <div class="kpi-sub">Con huésped activo</div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" size="small" to="/admin/estadias">Ver estadías</v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="kpi-card kpi-neutral">
        <v-card-text>
          <div class="kpi-label">Estadías registradas</div>
          <div class="kpi-value">{{ kpis.estadiasTotal }}</div>
          <div class="kpi-sub">Check-ins realizados</div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" size="small" to="/admin/estadias">Gestionar</v-btn>
        </v-card-actions>
      </v-card>

      <v-card class="kpi-card kpi-error">
        <v-card-text>
          <div class="kpi-label">Pagos pendientes</div>
          <div class="kpi-value">{{ kpis.pagosPendientes }}</div>
          <div class="kpi-sub">Por procesar</div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" size="small" to="/admin/pagos">Ver pagos</v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Últimas reservas -->
    <v-card class="mt-section">
      <v-card-item>
        <v-card-title>Últimas reservas</v-card-title>
        <template #append>
          <v-btn variant="outlined" size="small" to="/admin/reservas">Ver todas</v-btn>
        </template>
      </v-card-item>
      <v-table v-if="recentReservas.length">
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Sucursal</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total</th>
            <th>Canal</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in recentReservas" :key="r.guidReserva ?? r.codigoReserva">
            <td><code class="text-caption">{{ r.codigoReserva ?? '—' }}</code></td>
            <td>{{ r.idCliente }}</td>
            <td>{{ r.idSucursal }}</td>
            <td class="text-no-wrap text-caption">{{ fmtDate(r.fechaInicio) }}</td>
            <td class="text-no-wrap text-caption">{{ fmtDate(r.fechaFin) }}</td>
            <td class="text-no-wrap">{{ fmtMoney(r.totalReserva) }}</td>
            <td><code class="text-caption">{{ r.origenCanalReserva ?? '—' }}</code></td>
            <td>
              <v-chip :color="statusColor(r.estadoReserva)" size="x-small" label>{{ r.estadoReserva }}</v-chip>
            </td>
            <td>
              <v-btn size="small" variant="text" icon="mdi-pencil" :to="'/admin/reservas/' + r.guidReserva" />
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-card-text v-else class="text-center text-medium-emphasis">
        No hay reservas registradas aún.
      </v-card-text>
    </v-card>

    <!-- Acceso rápido -->
    <p class="section-label mt-section">Acceso rápido</p>
    <div class="admin-dash__grid">
      <v-card class="admin-dash__card" to="/admin/habitaciones">
        <v-card-item>
          <template #prepend><v-avatar color="teal" icon="mdi-bed-king" /></template>
          <v-card-title>Habitaciones</v-card-title>
          <v-card-subtitle>Inventario y estados</v-card-subtitle>
        </v-card-item>
      </v-card>

      <v-card class="admin-dash__card" to="/admin/sucursales">
        <v-card-item>
          <template #prepend><v-avatar color="indigo" icon="mdi-domain" /></template>
          <v-card-title>Sucursales</v-card-title>
          <v-card-subtitle>Sedes y publicación</v-card-subtitle>
        </v-card-item>
      </v-card>

      <v-card class="admin-dash__card" to="/admin/clientes">
        <v-card-item>
          <template #prepend><v-avatar color="purple" icon="mdi-account-group" /></template>
          <v-card-title>Clientes</v-card-title>
          <v-card-subtitle>Alta y gestión de huéspedes</v-card-subtitle>
        </v-card-item>
      </v-card>

      <v-card class="admin-dash__card" to="/admin/estadias">
        <v-card-item>
          <template #prepend><v-avatar color="green-darken-1" icon="mdi-key-chain" /></template>
          <v-card-title>Estadías</v-card-title>
          <v-card-subtitle>Check-in / check-out</v-card-subtitle>
        </v-card-item>
      </v-card>

      <v-card class="admin-dash__card" to="/admin/facturas">
        <v-card-item>
          <template #prepend><v-avatar color="blue-grey" icon="mdi-file-document-outline" /></template>
          <v-card-title>Facturas</v-card-title>
          <v-card-subtitle>Facturación y anulaciones</v-card-subtitle>
        </v-card-item>
      </v-card>

      <v-card class="admin-dash__card" to="/admin/valoraciones">
        <v-card-item>
          <template #prepend><v-avatar color="amber" icon="mdi-star-half-full" /></template>
          <v-card-title>Valoraciones</v-card-title>
          <v-card-subtitle>Moderación de reseñas</v-card-subtitle>
        </v-card-item>
      </v-card>
    </div>
  </template>
</template>

<style scoped src="./admin-home-page.scss"></style>
<style scoped>
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.dash-title {
  margin: 0 0 0.25rem;
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  font-weight: 700;
  background: var(--hl-grad-hero);
  background-size: 120% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dash-date {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.55;
  text-transform: capitalize;
}
.dash-header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.dash-loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.kpi-card {
  border-radius: 12px !important;
  border-left: 4px solid transparent !important;
}
.kpi-card .v-card-text {
  padding-bottom: 0;
}
.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.65;
  margin-bottom: 0.4rem;
}
.kpi-value {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.3rem;
}
.kpi-sub {
  font-size: 0.75rem;
  opacity: 0.5;
}
.kpi-warning { border-left-color: rgb(var(--v-theme-warning)) !important; }
.kpi-success { border-left-color: rgb(var(--v-theme-success)) !important; }
.kpi-info { border-left-color: rgb(var(--v-theme-info)) !important; }
.kpi-occupied { border-left-color: #fb8c00 !important; }
.kpi-neutral { border-left-color: #546e7a !important; }
.kpi-error { border-left-color: rgb(var(--v-theme-error)) !important; }

.kpi-warning .kpi-value { color: rgb(var(--v-theme-warning)); }
.kpi-success .kpi-value { color: rgb(var(--v-theme-success)); }
.kpi-info .kpi-value { color: rgb(var(--v-theme-info)); }
.kpi-occupied .kpi-value { color: #fb8c00; }
.kpi-neutral .kpi-value { color: #546e7a; }
.kpi-error .kpi-value { color: rgb(var(--v-theme-error)); }

.mt-section { margin-top: 1.75rem; }
.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 0.75rem;
}
</style>
