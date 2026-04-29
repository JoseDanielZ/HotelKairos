<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { accommodationsGetByGuid } from '@/services/accommodations';
import { alojamientosGetById } from '@/services/alojamientos';
import { isPositiveIntString, isUuidString } from '@/utils/string.util';
import type { AlojamientoResponseDTO, SucursalPublicDto } from '@/models';

const route = useRoute();
const loading = ref(true);
const error = ref<string | undefined>();
const sucursal = ref<SucursalPublicDto | undefined>();
const alojamiento = ref<AlojamientoResponseDTO | undefined>();
const reservarLink = ref('');

onMounted(async () => {
  const id = String(route.params.id ?? '');
  if (isUuidString(id)) {
    try {
      const res = await accommodationsGetByGuid(id);
      if (res.success && res.data) {
        sucursal.value = res.data;
        reservarLink.value = '/reservar/' + id;
      } else {
        error.value = res.message || 'No se pudo cargar el alojamiento.';
      }
    } finally {
      loading.value = false;
    }
    return;
  }
  if (isPositiveIntString(id)) {
    try {
      const res = await alojamientosGetById(Number(id));
      if (res.success && res.data) {
        alojamiento.value = res.data;
      } else {
        error.value = res.message || 'No se pudo cargar el alojamiento.';
      }
    } finally {
      loading.value = false;
    }
    return;
  }
  error.value = 'Formato de id no reconocido: use un UUID de sucursal o un id numérico de Alojamiento.';
  loading.value = false;
});
</script>

<template>
  <div v-if="loading" class="detail-state detail-state--center">
    <v-progress-circular indeterminate />
  </div>
  <div v-else-if="error" class="detail-page hl-page">
    <v-card class="detail-card detail-card--error pa-6">
      <v-icon class="detail-card__icon" icon="mdi-alert-circle-outline" />
      <h2 class="detail-card__title">No pudimos cargar el alojamiento</h2>
      <p class="detail-card__text">{{ error }}</p>
      <v-btn variant="outlined" color="primary" to="/alojamientos">Volver al listado</v-btn>
    </v-card>
  </div>
  <article v-else-if="sucursal" class="detail-page hl-page">
    <header class="detail-header">
      <nav class="detail-breadcrumb">
        <RouterLink to="/alojamientos" class="detail-breadcrumb__link">
          <v-icon icon="mdi-arrow-left" size="small" />
          Alojamientos
        </RouterLink>
      </nav>
      <h1 class="detail-header__title">{{ sucursal.nombreSucursal }}</h1>
      <p class="detail-header__meta">{{ sucursal.ciudad }} · {{ sucursal.provincia }} · {{ sucursal.pais }}</p>
    </header>
    <div class="detail-grid">
      <div
        class="detail-media"
        role="img"
        :aria-label="'Imagen principal de ' + (sucursal.nombreSucursal ?? 'alojamiento')"
      >
        <v-icon class="detail-media__icon" icon="mdi-city" size="64" />
      </div>
      <div class="detail-body">
        <section class="detail-section">
          <h2>Sobre este alojamiento</h2>
          <p class="detail-copy">{{ sucursal.descripcionSucursal }}</p>
        </section>
        <section class="detail-section detail-section--horarios">
          <h2>Horarios</h2>
          <dl class="detail-dl">
            <div>
              <dt>Check-in</dt>
              <dd>{{ sucursal.horaCheckin }}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd>{{ sucursal.horaCheckout }}</dd>
            </div>
          </dl>
        </section>
        <div class="detail-actions">
          <v-btn color="primary" :to="reservarLink" class="detail-actions__primary">
            Reservar
            <v-icon end icon="mdi-calendar-month" />
          </v-btn>
          <v-btn variant="text" to="/alojamientos">Seguir explorando</v-btn>
        </div>
      </div>
    </div>
  </article>
  <article v-else-if="alojamiento" class="detail-page hl-page">
    <header class="detail-header">
      <nav class="detail-breadcrumb">
        <RouterLink to="/alojamientos" class="detail-breadcrumb__link">
          <v-icon icon="mdi-arrow-left" size="small" />
          Alojamientos
        </RouterLink>
      </nav>
      <h1 class="detail-header__title">{{ alojamiento.nombre }}</h1>
      <p class="detail-header__meta">{{ alojamiento.ciudad }} · Estado: {{ alojamiento.estadoAlojamiento }}</p>
    </header>
    <div class="detail-grid detail-grid--single">
      <div class="detail-body detail-body--wide">
        <p class="detail-copy">{{ alojamiento.descripcion }}</p>
        <p class="detail-note">
          La reserva en línea está disponible para sucursales (detalle con identificador público tipo UUID). Este
          registro corresponde a un alojamiento administrativo; vuelve al listado para elegir una sucursal reservable.
        </p>
        <v-btn variant="outlined" color="primary" to="/alojamientos">Ir al listado</v-btn>
      </div>
    </div>
  </article>
</template>

