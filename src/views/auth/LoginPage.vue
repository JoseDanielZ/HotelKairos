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

const form = reactive({ userName: '', password: '' });
const busy = ref(false);

function submit(): void {
  if (!form.userName || !form.password) {
    return;
  }
  busy.value = true;
  void auth
    .login({ userName: form.userName, password: form.password })
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
        ui.showSnack(res.message || 'No se pudo iniciar sesión', 6000);
      }
    })
    .catch(() => {
      busy.value = false;
    });
}
</script>

<template>
  <div class="login-shell">
    <aside class="login-hero" aria-hidden="true">
      <div class="login-hero__glow" />
      <blockquote class="login-hero__quote">
        <p>«Un buen hotel no es solo un techo: es el tono correcto, la luz y la tranquilidad.»</p>
      </blockquote>
      <p class="login-hero__credit">Hospitalidad europea · Desde 1924</p>
    </aside>

    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-panel__card">
        <p class="login-panel__eyebrow">Acceso para huéspedes y personal</p>
        <h1 id="login-title" class="login-panel__title">Bienvenido de nuevo</h1>
        <p class="login-panel__sub">Introduce tus credenciales para gestionar reservas y tu perfil.</p>

        <form class="login-form" @submit.prevent="submit()">
          <v-text-field
            v-model="form.userName"
            class="login-form__field"
            label="Usuario"
            variant="outlined"
            autocomplete="username"
            prepend-inner-icon="mdi-account"
          />
          <v-text-field
            v-model="form.password"
            class="login-form__field"
            label="Contraseña"
            type="password"
            variant="outlined"
            autocomplete="current-password"
            prepend-inner-icon="mdi-lock"
          />
          <v-btn color="primary" block class="login-form__submit" type="submit" :disabled="busy">
            {{ busy ? 'Accediendo…' : 'Continuar' }}
          </v-btn>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped src="./login-page.scss"></style>
