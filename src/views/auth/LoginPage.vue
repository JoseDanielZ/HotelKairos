<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useUserContextStore } from '@/stores/userContext';
import { AppRole } from '@/constants/roles';

const auth = useAuthStore();
const userCtx = useUserContextStore();
const ui = useUiStore();
const router = useRouter();
const route = useRoute();

const form = reactive({ username: '', password: '' });
const busy = ref(false);

function submit(): void {
  if (!form.username || !form.password) {
    ui.showSnack('Ingresa usuario y contraseña', 5000, 'error');
    return;
  }
  busy.value = true;
  void auth
    .login({ username: form.username, password: form.password })
    .then((res) => {
      busy.value = false;
      if (res.success) {
        const ru = route.query.returnUrl;
        const returnUrl = typeof ru === 'string' ? ru : null;
        void userCtx.refreshMe();
        if (returnUrl) {
          void router.push(returnUrl);
        } else if (auth.hasAnyRole([AppRole.Admin, AppRole.Vendedor])) {
          void router.push('/admin');
        } else {
          void router.push('/');
        }
      } else {
        ui.showSnack(res.message || 'No se pudo iniciar sesión', 6000, 'error');
      }
    })
    .catch(() => {
      busy.value = false;
    });
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-left">
      <div class="login-brand">
        <div class="k">K</div>
        <h1>Kairos</h1>
        <p>Hospitalidad europea · Desde 1924</p>
      </div>
    </div>
    <div class="login-divider" aria-hidden="true" />
    <div class="login-right">
      <h2>Bienvenido</h2>
      <p class="sub">Acceso para huéspedes y personal del hotel</p>

      <form class="login-form" @submit.prevent="submit()">
        <v-text-field
          v-model="form.username"
          class="login-form__field"
          label="Usuario"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          autocomplete="username"
          @keyup.enter="submit()"
        />
        <v-text-field
          v-model="form.password"
          class="login-form__field"
          label="Contraseña"
          type="password"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          autocomplete="current-password"
          @keyup.enter="submit()"
        />
        <v-btn class="login-form__submit" color="primary" block type="submit" :disabled="busy" :loading="busy">
          {{ busy ? 'Ingresando...' : 'Continuar' }}
        </v-btn>
        <p class="login-register-link">
          ¿No tienes cuenta?
          <router-link to="/registro">Regístrate aquí</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped src="./login-page.scss"></style>
