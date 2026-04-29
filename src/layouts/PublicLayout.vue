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
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink to="/" class="site-header__brand" aria-label="KAIROS — inicio">
        <span class="site-header__mark" aria-hidden="true" />
        <span class="site-header__wordmark">
          <span class="site-header__name">KAIROS</span>
          <span class="site-header__tagline">Vista huésped — catálogo y reservas</span>
        </span>
      </RouterLink>

      <nav class="site-header__nav" aria-label="Navegación pública">
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
      </nav>

      <div class="site-header__actions">
        <v-btn v-if="auth.isAuthenticated()" variant="outlined" class="site-header__cta" @click="logout">
          <v-icon start>mdi-logout</v-icon>
          Cerrar sesión
        </v-btn>
        <v-btn v-else color="primary" to="/login" class="site-header__cta site-header__cta--primary">Entrar</v-btn>
      </div>
    </div>
  </header>

  <main class="site-main">
    <RouterView />
  </main>
</template>

<style scoped src="./public-layout.scss"></style>
