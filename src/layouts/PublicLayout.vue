<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { AppRole } from '@/constants/roles';

const auth = useAuthStore();
const router = useRouter();

const showAdminPanel = computed(() => auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor]));

function logout(): void {
  void auth.logout().then(() => router.push('/login'));
}
</script>

<template>
  <div class="client-wrap">
    <nav class="client-nav" aria-label="Navegación principal">
      <RouterLink to="/" class="client-logo">Kairos</RouterLink>
      <div class="client-nav-links">
        <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="{ 'is-active': isActive }" @click="navigate">Inicio</a>
        </RouterLink>
        <RouterLink to="/alojamientos" custom v-slot="{ href, navigate, isActive }">
          <a :href="href" :class="{ 'is-active': isActive }" @click="navigate">Alojamientos</a>
        </RouterLink>
        <template v-if="auth.isAuthenticated()">
          <RouterLink to="/mis-reservas" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="{ 'is-active': isActive }" @click="navigate">Mis reservas</a>
          </RouterLink>
          <RouterLink v-if="showAdminPanel" to="/admin" custom v-slot="{ href, navigate, isActive }">
            <a :href="href" :class="{ 'is-active': isActive }" @click="navigate">Administración</a>
          </RouterLink>
        </template>
      </div>
      <div class="nav-actions">
        <span v-if="auth.isAuthenticated()" class="client-nav-user">{{
          auth.getLoginSnapshot()?.userName
        }}</span>
        <v-btn v-if="auth.isAuthenticated()" variant="outlined" class="btn-outline text-none" @click="logout">
          Salir
        </v-btn>
        <v-btn v-else to="/login" class="btn-outline text-none">Entrar</v-btn>
      </div>
    </nav>

    <main class="client-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped src="./public-layout.scss"></style>
