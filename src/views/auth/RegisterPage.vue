<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { clientesCreate } from '@/services/clientes';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const ui = useUiStore();

const busy = ref(false);
const success = ref(false);

const tiposId = [
  { title: 'Cédula de ciudadanía', value: 'CC' },
  { title: 'Cédula de extranjería', value: 'CE' },
  { title: 'Pasaporte', value: 'PASAPORTE' },
  { title: 'NIT', value: 'NIT' },
  { title: 'Otro', value: 'OTRO' },
];

const form = reactive({
  tipoIdentificacion: 'CC',
  numeroIdentificacion: '',
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  direccion: '',
});

async function submit(): Promise<void> {
  if (!form.nombres || !form.correo || !form.telefono || !form.direccion || !form.numeroIdentificacion) {
    ui.showSnack('Completa todos los campos obligatorios.', 4000, 'error');
    return;
  }
  busy.value = true;
  try {
    const res = await clientesCreate({
      tipoIdentificacion: form.tipoIdentificacion,
      numeroIdentificacion: form.numeroIdentificacion,
      nombres: form.nombres,
      apellidos: form.apellidos || undefined,
      correo: form.correo,
      telefono: form.telefono,
      direccion: form.direccion,
      estado: 'ACTIVO',
    });
    if (res.success) {
      success.value = true;
    } else {
      ui.showSnack(res.message || 'No se pudo completar el registro.', 6000, 'error');
    }
  } finally {
    busy.value = false;
  }
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
    <div class="login-right register-right">
      <template v-if="success">
        <div class="register-success">
          <v-icon color="success" size="48" icon="mdi-check-circle-outline" />
          <h2>¡Registro completado!</h2>
          <p class="sub">Tu perfil de huésped fue creado. El equipo de recepción te enviará tus credenciales de acceso al correo <strong>{{ form.correo }}</strong>.</p>
          <v-btn color="primary" block class="mt-4" @click="router.push('/login')">Ir a iniciar sesión</v-btn>
        </div>
      </template>
      <template v-else>
        <h2>Crear cuenta</h2>
        <p class="sub">Regístrate para reservar y gestionar tus estancias</p>

        <form class="login-form" @submit.prevent="submit()">
          <v-select
            v-model="form.tipoIdentificacion"
            :items="tiposId"
            item-title="title"
            item-value="value"
            label="Tipo de identificación"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="login-form__field"
          />
          <v-text-field
            v-model="form.numeroIdentificacion"
            class="login-form__field"
            label="Número de identificación"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
          <v-text-field
            v-model="form.nombres"
            class="login-form__field"
            label="Nombres *"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            autocomplete="given-name"
          />
          <v-text-field
            v-model="form.apellidos"
            class="login-form__field"
            label="Apellidos"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            autocomplete="family-name"
          />
          <v-text-field
            v-model="form.correo"
            class="login-form__field"
            label="Correo electrónico *"
            type="email"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            autocomplete="email"
          />
          <v-text-field
            v-model="form.telefono"
            class="login-form__field"
            label="Teléfono *"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            autocomplete="tel"
          />
          <v-text-field
            v-model="form.direccion"
            class="login-form__field"
            label="Dirección *"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            autocomplete="street-address"
          />
          <v-btn class="login-form__submit" color="primary" block type="submit" :disabled="busy" :loading="busy">
            {{ busy ? 'Registrando...' : 'Crear cuenta' }}
          </v-btn>
          <p class="register-login-link">
            ¿Ya tienes cuenta?
            <router-link to="/login">Inicia sesión</router-link>
          </p>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped src="./login-page.scss"></style>
<style scoped>
.register-right {
  overflow-y: auto;
  padding-block: 2rem;
}
.register-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}
.register-login-link {
  text-align: center;
  font-size: 13px;
  margin-top: 0.5rem;
  opacity: 0.7;
}
</style>
