<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

function logout(): void {
  void auth.logout().then(() => router.push('/login'));
}
</script>

<template>
  <v-layout class="admin-shell">
    <v-navigation-drawer permanent class="admin-sidenav" width="268">
      <div class="admin-sidenav__brand">
        <span class="admin-sidenav__logo" aria-hidden="true" />
        <div>
          <span class="admin-sidenav__title">KAIROS</span>
          <span class="admin-sidenav__role">Administración</span>
        </div>
      </div>
      <v-list nav density="comfortable" class="admin-nav">
        <v-list-item to="/admin" exact title="Inicio" prepend-icon="mdi-view-dashboard" rounded="xl" />
        <v-list-item to="/admin/hoteles" title="Hoteles" prepend-icon="mdi-bed" rounded="xl" />
        <v-list-item to="/admin/alojamientos" title="Alojamientos" prepend-icon="mdi-home-city" rounded="xl" />
        <v-list-item to="/admin/habitaciones" title="Habitaciones" prepend-icon="mdi-bed-king" rounded="xl" />
        <v-list-item to="/admin/reservas" title="Reservas" prepend-icon="mdi-calendar-edit" rounded="xl" />
        <v-list-item to="/admin/clientes" title="Clientes (CRUD)" prepend-icon="mdi-account-group" rounded="xl" />
        <v-list-item to="/admin/sucursales" exact title="Sucursales" prepend-icon="mdi-domain" rounded="xl" />
        <v-list-item to="/admin/sucursales/nuevo" title="Nueva sucursal" prepend-icon="mdi-store-plus" rounded="xl" />
        <v-list-item to="/admin/tipos-habitacion" title="Tipos de habitación" prepend-icon="mdi-shape" rounded="xl" />
      </v-list>
    </v-navigation-drawer>

    <v-main class="admin-main">
      <header class="admin-topbar">
        <div class="admin-topbar__inner">
          <v-btn variant="outlined" :to="{ path: '/' }" class="admin-topbar__guest">
            <v-icon start>mdi-storefront</v-icon>
            Vista huésped
          </v-btn>
          <div class="admin-topbar__spacer" />
          <div v-if="auth.getLoginSnapshot()" class="admin-topbar__user">
            <v-icon class="text-primary" size="small">mdi-account-circle</v-icon>
            <span class="admin-topbar__name">
              {{ auth.getLoginSnapshot()?.nombreCompleto || auth.getLoginSnapshot()?.userName }}
            </span>
          </div>
          <v-btn variant="outlined" @click="logout">
            <v-icon start>mdi-logout</v-icon>
            Salir
          </v-btn>
        </div>
      </header>
      <div class="admin-content">
        <RouterView />
      </div>
    </v-main>
  </v-layout>
</template>

<style scoped src="./admin-layout.scss"></style>
