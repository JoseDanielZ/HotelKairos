<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { AppRole } from '@/constants/roles';

const auth = useAuthStore();
const showAdminPanel = computed(() => auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor]));
</script>

<template>
  <section class="portal-fronts" aria-label="Elegir aplicación">
    <div class="portal-fronts__inner">
      <article class="portal-card portal-card--market">
        <div class="portal-card__icon" aria-hidden="true">
          <v-icon icon="mdi-shopping" size="large" />
        </div>
        <h2 class="portal-card__title">Marketplace KAIROS</h2>
        <p class="portal-card__text">
          Catálogo público, checkout con pago simulado, elección de habitación y reservas ligadas a tu perfil de cliente.
        </p>
        <v-btn color="primary" to="/alojamientos" class="portal-card__cta">Entrar al marketplace</v-btn>
      </article>
      <article v-if="showAdminPanel" class="portal-card portal-card--admin">
        <div class="portal-card__icon portal-card__icon--admin" aria-hidden="true">
          <v-icon icon="mdi-shield-account" size="large" />
        </div>
        <h2 class="portal-card__title">Consola administrativa</h2>
        <p class="portal-card__text">
          CRUD de clientes, alojamientos, sucursales, habitaciones, tipos y reservas. Requiere rol de personal autorizado.
        </p>
        <v-btn variant="outlined" to="/admin" class="portal-card__cta portal-card__cta--outline">Abrir administración</v-btn>
      </article>
    </div>
  </section>

  <section class="hero" aria-labelledby="hero-heading">
    <div class="hero__content">
      <p class="hero__eyebrow">KAIROS</p>
      <h1 id="hero-heading" class="hero__title">Reservas con carácter. Estancias memorables.</h1>
      <p class="hero__lede">
        Explora nuestras sucursales, elige fechas y ocupa tu habitación en unos pocos pasos. Si ya tienes cuenta,
        recupera tus reservas cuando quieras.
      </p>
      <div class="hero__actions">
        <v-btn color="primary" to="/alojamientos" class="hero__primary">Explorar alojamientos</v-btn>
        <v-btn v-if="auth.isAuthenticated()" variant="outlined" to="/mis-reservas" class="hero__secondary">
          Ver mis reservas
        </v-btn>
        <v-btn v-else variant="outlined" to="/login" class="hero__secondary">Iniciar sesión</v-btn>
      </div>
    </div>
    <div class="hero__visual" aria-hidden="true">
      <div class="hero__frame">
        <div class="hero__frame-inner">
          <v-icon class="hero__frame-icon" icon="mdi-bed-king" size="x-large" />
        </div>
      </div>
    </div>
  </section>

  <section class="highlights" aria-label="Servicios">
    <article class="highlights__item">
      <v-icon icon="mdi-calendar-check" aria-hidden="true" />
      <h2>Disponibilidad clara</h2>
      <p>Fechas y ocupación alineadas con la reserva para evitar sorpresas.</p>
    </article>
    <article class="highlights__item">
      <v-icon icon="mdi-shield-check" aria-hidden="true" />
      <h2>Acceso seguro</h2>
      <p>Sesión con control de roles para huéspedes y equipo interno.</p>
    </article>
    <article class="highlights__item">
      <v-icon icon="mdi-face-agent" aria-hidden="true" />
      <h2>Seguimiento</h2>
      <p>Consulta el estado de tus reservas desde un mismo panel.</p>
    </article>
  </section>
</template>

<style scoped src="./home-page.scss"></style>
