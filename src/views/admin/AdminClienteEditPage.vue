<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clientesCreate, clientesGetByGuid, clientesUpdate } from '@/services/clientes';
import { useUiStore } from '@/stores/ui';
import { isUuidString } from '@/utils/string.util';
import type { CrearClienteRequest, ActualizarClienteRequest } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const isCreate = ref(false);
const clienteGuid = ref<string | undefined>();
const loading = ref(true);

const createForm = reactive({
  tipoIdentificacion: '',
  numeroIdentificacion: '',
  nombres: '',
  apellidos: '',
  razonSocial: '',
  correo: '',
  telefono: '',
  direccion: '',
  estado: 'ACTIVO',
});

const editForm = reactive({
  nombres: '',
  apellidos: '',
  razonSocial: '',
  correo: '',
  telefono: '',
  direccion: '',
  estado: '',
});

onMounted(async () => {
  if (route.path.endsWith('/nuevo')) {
    isCreate.value = true;
    loading.value = false;
    return;
  }
  const id = String(route.params.guid ?? '');
  if (!isUuidString(id)) {
    ui.showSnack('GUID invÃ¡lido', 4000);
    void router.push('/admin/clientes');
    return;
  }
  clienteGuid.value = id;
  try {
    const res = await clientesGetByGuid(id);
    if (res.success && res.data) {
      const c = res.data;
      editForm.nombres = c.nombres ?? '';
      editForm.apellidos = c.apellidos ?? '';
      editForm.razonSocial = c.razonSocial ?? '';
      editForm.correo = c.correo ?? '';
      editForm.telefono = c.telefono ?? '';
      editForm.direccion = c.direccion ?? '';
      editForm.estado = c.estado ?? '';
    }
  } finally {
    loading.value = false;
  }
});

async function saveCreate(): Promise<void> {
  const v = createForm;
  if (!v.tipoIdentificacion || !v.numeroIdentificacion || !v.nombres || !v.correo || !v.telefono || !v.direccion) {
    ui.showSnack('Completa obligatorios.', 4000);
    return;
  }
  const body: CrearClienteRequest = {
    tipoIdentificacion: v.tipoIdentificacion.trim(),
    numeroIdentificacion: v.numeroIdentificacion.trim(),
    nombres: v.nombres.trim(),
    apellidos: v.apellidos?.trim() || undefined,
    razonSocial: v.razonSocial?.trim() || undefined,
    correo: v.correo.trim(),
    telefono: v.telefono.trim(),
    direccion: v.direccion.trim(),
    estado: v.estado?.trim() || undefined,
  };
  const res = await clientesCreate(body);
  if (res.success) {
    ui.showSnack('Cliente creado', 3000);
    void router.push('/admin/clientes');
  }
}

async function saveEdit(): Promise<void> {
  if (!clienteGuid.value) return;
  const v = editForm;
  const body: ActualizarClienteRequest = {
    nombres: v.nombres || undefined,
    apellidos: v.apellidos || undefined,
    razonSocial: v.razonSocial || undefined,
    correo: v.correo || undefined,
    telefono: v.telefono || undefined,
    direccion: v.direccion || undefined,
    estado: v.estado || undefined,
  };
  const res = await clientesUpdate(clienteGuid.value, body);
  if (res.success) {
    ui.showSnack('Cliente actualizado', 3000);
    void router.push('/admin/clientes');
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <v-card v-else-if="isCreate">
    <v-card-title>Nuevo cliente</v-card-title>
    <v-card-text>
      <v-text-field v-model="createForm.tipoIdentificacion" label="Tipo identificaciÃ³n" variant="outlined" />
      <v-text-field v-model="createForm.numeroIdentificacion" label="NÃºmero identificaciÃ³n" variant="outlined" />
      <v-text-field v-model="createForm.nombres" label="Nombres" variant="outlined" />
      <v-text-field v-model="createForm.apellidos" label="Apellidos" variant="outlined" />
      <v-text-field v-model="createForm.razonSocial" label="RazÃ³n social" variant="outlined" />
      <v-text-field v-model="createForm.correo" label="Correo" type="email" variant="outlined" />
      <v-text-field v-model="createForm.telefono" label="TelÃ©fono" variant="outlined" />
      <v-text-field v-model="createForm.direccion" label="DirecciÃ³n" variant="outlined" />
      <v-text-field v-model="createForm.estado" label="Estado" variant="outlined" />
      <v-btn color="primary" class="mt-2" @click="saveCreate">Crear</v-btn>
      <v-btn class="mt-2 ms-2" variant="text" to="/admin/clientes">Cancelar</v-btn>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-card-title>Editar cliente</v-card-title>
    <v-card-text>
      <v-text-field v-model="editForm.nombres" label="Nombres" variant="outlined" />
      <v-text-field v-model="editForm.apellidos" label="Apellidos" variant="outlined" />
      <v-text-field v-model="editForm.razonSocial" label="RazÃ³n social" variant="outlined" />
      <v-text-field v-model="editForm.correo" label="Correo" variant="outlined" />
      <v-text-field v-model="editForm.telefono" label="TelÃ©fono" variant="outlined" />
      <v-text-field v-model="editForm.direccion" label="DirecciÃ³n" variant="outlined" />
      <v-text-field v-model="editForm.estado" label="Estado" variant="outlined" />
      <v-btn color="primary" class="mt-2" @click="saveEdit">Guardar</v-btn>
      <v-btn class="mt-2 ms-2" variant="text" to="/admin/clientes">Volver</v-btn>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
</style>
