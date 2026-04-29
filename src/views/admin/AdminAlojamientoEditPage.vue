<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { alojamientosCreate, alojamientosGetById, alojamientosUpdate } from '@/services/alojamientos';
import { useUiStore } from '@/stores/ui';
import { isPositiveIntString } from '@/utils/string.util';
import type { CreateAlojamientoDTO, UpdateAlojamientoDTO } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const isCreate = ref(false);
const alojamientoId = ref<number | undefined>();
const loading = ref(true);

const createForm = reactive({
  tipoAlojID: null as number | null,
  adminUsuarioID: null as number | null,
  nombre: '',
  descripcion: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  pais: '',
});

const editForm = reactive({
  nombre: '',
  descripcion: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  pais: '',
  estadoAlojamiento: '',
});

onMounted(async () => {
  const id = String(route.params.id ?? '');
  if (id === 'nuevo') {
    isCreate.value = true;
    loading.value = false;
    return;
  }
  if (!isPositiveIntString(id)) {
    ui.showSnack('Id inválido', 4000);
    void router.push('/admin/alojamientos');
    return;
  }
  alojamientoId.value = Number(id);
  try {
    const res = await alojamientosGetById(alojamientoId.value);
    if (res.success && res.data) {
      const a = res.data;
      editForm.nombre = a.nombre ?? '';
      editForm.descripcion = a.descripcion ?? '';
      editForm.direccion = a.direccion ?? '';
      editForm.ciudad = a.ciudad ?? '';
      editForm.provincia = a.provincia ?? '';
      editForm.pais = a.pais ?? '';
      editForm.estadoAlojamiento = a.estadoAlojamiento ?? '';
    }
  } finally {
    loading.value = false;
  }
});

async function saveCreate(): Promise<void> {
  if (
    createForm.tipoAlojID == null ||
    createForm.adminUsuarioID == null ||
    !createForm.nombre
  ) {
    ui.showSnack('Completa tipo, admin y nombre.', 4000);
    return;
  }
  const body: CreateAlojamientoDTO = {
    tipoAlojID: createForm.tipoAlojID,
    adminUsuarioID: createForm.adminUsuarioID,
    nombre: createForm.nombre,
    descripcion: createForm.descripcion || undefined,
    direccion: createForm.direccion || undefined,
    ciudad: createForm.ciudad || undefined,
    provincia: createForm.provincia || undefined,
    pais: createForm.pais || undefined,
  };
  const res = await alojamientosCreate(body);
  if (res.success) {
    ui.showSnack('Creado', 3000);
    void router.push('/admin/alojamientos');
  }
}

async function saveEdit(): Promise<void> {
  if (!alojamientoId.value) return;
  const v = editForm;
  const body: UpdateAlojamientoDTO = {
    alojamientoID: alojamientoId.value,
    nombre: v.nombre || undefined,
    descripcion: v.descripcion || undefined,
    direccion: v.direccion || undefined,
    ciudad: v.ciudad || undefined,
    provincia: v.provincia || undefined,
    pais: v.pais || undefined,
    estadoAlojamiento: v.estadoAlojamiento || undefined,
  };
  const res = await alojamientosUpdate(alojamientoId.value, body);
  if (res.success) {
    ui.showSnack('Guardado', 3000);
    void router.push('/admin/alojamientos');
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <v-card v-else-if="isCreate">
    <v-card-title>Nuevo alojamiento</v-card-title>
    <v-card-text>
      <v-text-field v-model.number="createForm.tipoAlojID" label="tipoAlojID" type="number" variant="outlined" />
      <v-text-field v-model.number="createForm.adminUsuarioID" label="adminUsuarioID" type="number" variant="outlined" />
      <v-text-field v-model="createForm.nombre" label="Nombre" variant="outlined" />
      <v-textarea v-model="createForm.descripcion" label="Descripción" variant="outlined" />
      <v-text-field v-model="createForm.direccion" label="Dirección" variant="outlined" />
      <v-text-field v-model="createForm.ciudad" label="Ciudad" variant="outlined" />
      <v-text-field v-model="createForm.provincia" label="Provincia" variant="outlined" />
      <v-text-field v-model="createForm.pais" label="País" variant="outlined" />
      <v-btn color="primary" class="mt-2" @click="saveCreate">Crear</v-btn>
      <v-btn class="mt-2 ms-2" variant="text" to="/admin/alojamientos">Cancelar</v-btn>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-card-title>Editar alojamiento #{{ alojamientoId }}</v-card-title>
    <v-card-text>
      <v-text-field v-model="editForm.nombre" label="Nombre" variant="outlined" />
      <v-textarea v-model="editForm.descripcion" label="Descripción" variant="outlined" />
      <v-text-field v-model="editForm.direccion" label="Dirección" variant="outlined" />
      <v-text-field v-model="editForm.ciudad" label="Ciudad" variant="outlined" />
      <v-text-field v-model="editForm.provincia" label="Provincia" variant="outlined" />
      <v-text-field v-model="editForm.pais" label="País" variant="outlined" />
      <v-text-field v-model="editForm.estadoAlojamiento" label="Estado alojamiento" variant="outlined" />
      <v-btn color="primary" class="mt-2" @click="saveEdit">Guardar</v-btn>
      <v-btn class="mt-2 ms-2" variant="text" to="/admin/alojamientos">Volver</v-btn>
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
