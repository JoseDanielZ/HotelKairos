<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { accommodationsSearch } from '@/services/accommodations';
import type { SucursalPublicDto } from '@/models';

const rows = ref<SucursalPublicDto[]>([]);
const total = ref(0);
const pageSize = ref(10);
const pageIndex = ref(0);
const loading = ref(false);
const loadError = ref(false);
const destino = ref('');

const minDate = new Date();
const checkIn = ref<Date>(startDates().checkIn);
const checkOut = ref<Date>(startDates().checkOut);

const adultos = ref(2);
const ninos = ref(0);
const habitaciones = ref(1);
const adultosOptions = [1, 2, 3, 4, 5, 6, 7, 8];
const ninosOptions = [0, 1, 2, 3, 4, 5, 6];
const habitacionOptions = [1, 2, 3, 4, 5];

function startDates(): { checkIn: Date; checkOut: Date } {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  return { checkIn: hoy, checkOut: manana };
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateInput(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  const x = new Date(y, m - 1, d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function onCheckInStr(v: string): void {
  checkIn.value = parseDateInput(v);
  if (checkOut.value.getTime() <= checkIn.value.getTime()) {
    const next = new Date(checkIn.value);
    next.setDate(next.getDate() + 1);
    checkOut.value = next;
  }
}

function fechasResumen(): string {
  if (checkOut.value.getTime() <= checkIn.value.getTime()) {
    return 'Agrega fechas';
  }
  return `${formatFechaCorta(checkIn.value)} â€“ ${formatFechaCorta(checkOut.value)}`;
}

function huespedesResumen(): string {
  const n = adultos.value + ninos.value;
  const p = n === 1 ? 'huÃ©sped' : 'huÃ©spedes';
  const h = habitaciones.value === 1 ? '1 hab.' : `${habitaciones.value} hab.`;
  return `${n} ${p} Â· ${h}`;
}

function formatFechaCorta(d: Date): string {
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function estrellas(n: number | null | undefined): string {
  if (n == null || n <= 0) return '';
  return 'â˜…'.repeat(Math.min(5, Math.round(n)));
}

function resumenTexto(r: SucursalPublicDto, max = 120): string {
  const t = (r.descripcionSucursal ?? '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + 'â€¦';
}

function reservaQueryParams(): Record<string, string> {
  if (checkOut.value.getTime() <= checkIn.value.getTime()) {
    return {};
  }
  return {
    fechaInicio: toDateTimeLocal(checkIn.value, 15, 0),
    fechaFin: toDateTimeLocal(checkOut.value, 11, 0),
  };
}

function toDateTimeLocal(d: Date, hours: number, minutes: number): string {
  const x = new Date(d);
  x.setHours(hours, minutes, 0, 0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  const h = String(x.getHours()).padStart(2, '0');
  const min = String(x.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

async function load(): Promise<void> {
  loading.value = true;
  loadError.value = false;
  const d = destino.value.trim();
  try {
    const res = await accommodationsSearch({
      nombre: d || undefined,
      ciudad: d || undefined,
      pageNumber: pageIndex.value + 1,
      pageSize: pageSize.value,
    });
    rows.value = res.data?.items ?? [];
    total.value = res.data?.totalResultados ?? 0;
  } catch {
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

function buscar(): void {
  pageIndex.value = 0;
  void load();
}

function onPage(p: number): void {
  pageIndex.value = p - 1;
  void load();
}

onMounted(() => {
  void load();
});
</script>

<template>
  <div class="list-page">
    <section class="hero" aria-labelledby="accom-hero-title">
      <div class="hero__inner">
        <h1 id="accom-hero-title">Encuentra tu prÃ³xima estancia</h1>
        <p class="hero__sub">
          Explora destinos por nombre o ciudad. Los datos de fechas y huÃ©spedes acompaÃ±an tu reserva; el calendario del
          alojamiento confirma la disponibilidad.
        </p>
      </div>
    </section>

    <div class="search-sticky">
      <div class="search-pill" role="search" aria-label="BÃºsqueda de alojamientos">
        <div class="search-pill__segment search-pill__segment--where">
          <span class="search-pill__kicker">DÃ³nde</span>
          <v-text-field
            v-model="destino"
            class="search-pill__field"
            label="Destino"
            variant="outlined"
            density="compact"
            hide-details
            placeholder="Explora destinos"
            @keydown.enter.prevent="buscar()"
          />
        </div>
        <span class="search-pill__divider" aria-hidden="true" />
        <div class="search-pill__segment search-pill__segment--dates">
          <span class="search-pill__kicker">Fechas</span>
          <p class="search-pill__hint">{{ fechasResumen() }}</p>
          <div class="search-pill__date-row">
            <v-text-field
              :model-value="toDateInput(checkIn)"
              class="search-pill__field search-pill__field--date"
              label="Llegada"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              :min="toDateInput(minDate)"
              @update:model-value="(v) => v && onCheckInStr(String(v))"
            />
            <v-text-field
              :model-value="toDateInput(checkOut)"
              class="search-pill__field search-pill__field--date"
              label="Salida"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              :min="toDateInput(checkIn)"
              @update:model-value="(v) => v && (checkOut = parseDateInput(String(v)))"
            />
          </div>
        </div>
        <span class="search-pill__divider" aria-hidden="true" />
        <div class="search-pill__segment search-pill__segment--who">
          <span class="search-pill__kicker">QuiÃ©n</span>
          <p class="search-pill__hint">{{ huespedesResumen() }}</p>
          <div class="search-pill__guest-row" aria-label="OcupaciÃ³n">
            <v-select
              v-model="adultos"
              class="search-pill__field search-pill__mini"
              :items="adultosOptions"
              label="Adultos"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-select
              v-model="ninos"
              class="search-pill__field search-pill__mini"
              :items="ninosOptions"
              label="NiÃ±os"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-select
              v-model="habitaciones"
              class="search-pill__field search-pill__mini"
              :items="habitacionOptions"
              label="Habit."
              variant="outlined"
              density="compact"
              hide-details
            />
          </div>
        </div>
        <button class="search-pill__search-btn" type="button" aria-label="Buscar alojamientos" @click="buscar()">
          <v-icon icon="mdi-magnify" />
        </button>
      </div>
    </div>

    <section class="results" aria-live="polite">
      <div class="results__head">
        <h2>Resultados</h2>
        <span v-if="total > 0" class="results__count">{{ total }} alojamientos</span>
      </div>

      <div v-if="loading" class="center">
        <v-progress-circular indeterminate />
      </div>
      <v-alert v-else-if="loadError" type="error" variant="tonal" class="my-4">
        No se pudieron cargar los alojamientos. Verifica tu conexiÃ³n e intenta de nuevo.
        <template #append>
          <v-btn variant="text" @click="load">Reintentar</v-btn>
        </template>
      </v-alert>
      <v-card v-else-if="rows.length === 0" class="empty-card pa-4">
        <p>No hay alojamientos con esos criterios. Prueba con otro destino o amplÃ­a la bÃºsqueda.</p>
      </v-card>
      <template v-else>
        <div class="card-grid">
          <v-card v-for="r in rows" :key="r.sucursalGuid" class="property-card" elevation="2">
            <div
              class="property-card__media"
              role="img"
              :aria-label="'Imagen de ' + (r.nombreSucursal ?? 'alojamiento')"
            >
              <span class="property-card__media-fallback" aria-hidden="true">
                <v-icon icon="mdi-city" size="large" />
              </span>
            </div>
            <div class="property-card__body">
              <div class="property-card__title-row">
                <h3 class="property-card__name">{{ r.nombreSucursal ?? 'â€”' }}</h3>
                <span v-if="r.estrellas" class="property-card__stars" :aria-label="'Estrellas: ' + r.estrellas">
                  {{ estrellas(r.estrellas) }}
                </span>
              </div>
              <p class="property-card__location">
                <v-icon class="inline-icon" icon="mdi-map-marker" size="small" aria-hidden="true" />
                {{ r.ciudad ?? 'â€”' }}{{ r.pais ? ', ' + r.pais : '' }}
              </p>
              <p v-if="r.tipoAlojamiento" class="property-card__meta">{{ r.tipoAlojamiento }}</p>
              <p v-if="r.descripcionSucursal" class="property-card__desc">{{ resumenTexto(r) }}</p>
              <div class="property-card__actions">
                <v-btn variant="outlined" color="primary" :to="'/alojamientos/' + r.sucursalGuid">Ver detalles</v-btn>
                <v-btn
                  color="primary"
                  class="property-card__book"
                  :to="{ path: '/reservar/' + r.sucursalGuid, query: reservaQueryParams() }"
                >
                  Reservar
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>

        <v-pagination
          class="results__paginator mt-4"
          :length="Math.max(1, Math.ceil(total / pageSize))"
          :model-value="pageIndex + 1"
          :total-visible="7"
          @update:model-value="onPage"
        />
      </template>
    </section>
  </div>
</template>

<style scoped src="./accommodation-list-page.scss"></style>
