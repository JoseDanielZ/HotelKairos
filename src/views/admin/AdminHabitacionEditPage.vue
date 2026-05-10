<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { habitacionesCreate, habitacionesGetByGuid, habitacionesUpdate } from '@/services/habitaciones';
import { tiposHabitacionList } from '@/services/tiposHabitacion';
import { useUiStore } from '@/stores/ui';
import { isUuidString } from '@/utils/string.util';
import type { CrearHabitacionRequest, ActualizarHabitacionRequest, TipoHabitacionResponse } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const isCreate = ref(false);
const guid = ref<string | undefined>();
const loading = ref(true);
const tiposRows = ref<TipoHabitacionResponse[]>([]);

const createForm = reactive({
  idSucursal: null as number | null,
  idTipoHabitacion: null as number | null,
  numeroHabitacion: '',
  piso: null as number | null,
  capacidadHabitacion: 1,
  precioBase: 0.01,
  descripcionHabitacion: '',
  estadoHabitacion: '',
});

const editForm = reactive({
  numeroHabitacion: '',
  piso: null as number | null,
  capacidadHabitacion: null as number | null,
  precioBase: null as number | null,
  descripcionHabitacion: '',
  estadoHabitacion: '',
});

onMounted(async () => {
  const t = await tiposHabitacionList({ PageNumber: 1, PageSize: 200 });
  tiposRows.value = t.data?.items ?? [];

  const p = String(route.params.guid ?? '');
  if (p === 'nuevo') {
    isCreate.value = true;
    loading.value = false;
    return;
  }
  if (!isUuidString(p)) {
    ui.showSnack('Guid invÃ¡lido', 4000);
    void router.push('/admin/habitaciones');
    return;
  }
  guid.value = p;
  try {
    const res = await habitacionesGetByGuid(p);
    if (res.success && res.data) {
      const d = res.data;
      editForm.numeroHabitacion = d.numeroHabitacion ?? '';
      editForm.piso = d.piso ?? null;
      editForm.capacidadHabitacion = d.capacidadHabitacion;
      editForm.precioBase = d.precioBase;
      editForm.descripcionHabitacion = d.descripcionHabitacion ?? '';
      editForm.estadoHabitacion = d.estadoHabitacion ?? '';
    }
  } finally {
    loading.value = false;
  }
});

async function saveCreate(): Promise<void> {
  if (
    createForm.idSucursal == null ||
    createForm.idTipoHabitacion == null ||
    !createForm.numeroHabitacion
  ) {
    ui.showSnack('Completa sucursal, tipo y nÃºmero.', 4000);
    return;
  }
  const body: CrearHabitacionRequest = {
    idSucursal: createForm.idSucursal,
    idTipoHabitacion: createForm.idTipoHabitacion,
    numeroHabitacion: createForm.numeroHabitacion,
    piso: createForm.piso,
    capacidadHabitacion: createForm.capacidadHabitacion,
    precioBase: createForm.precioBase,
    descripcionHabitacion: createForm.descripcionHabitacion || undefined,
    estadoHabitacion: createForm.estadoHabitacion || undefined,
  };
  const res = await habitacionesCreate(body);
  if (res.success) {
    ui.showSnack('Creada', 2500);
    void router.push('/admin/habitaciones');
  }
}

async function saveEdit(): Promise<void> {
  if (!guid.value) return;
  const v = editForm;
  const body: ActualizarHabitacionRequest = {
    numeroHabitacion: v.numeroHabitacion || undefined,
    piso: v.piso,
    capacidadHabitacion: v.capacidadHabitacion ?? undefined,
    precioBase: v.precioBase ?? undefined,
    descripcionHabitacion: v.descripcionHabitacion || undefined,
    estadoHabitacion: v.estadoHabitacion || undefined,
  };
  const res = await habitacionesUpdate(guid.value, body);
  if (res.success) {
    ui.showSnack('Guardado', 2500);
    void router.push('/admin/habitaciones');
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <v-card v-else-if="isCreate">
    <v-card-title>Nueva habitaciÃ³n</v-card-title>
    <v-card-text>
      <v-text-field v-model.number="createForm.idSucursal" label="Id sucursal" type="number" variant="outlined" />
      <v-select
        v-model="createForm.idTipoHabitacion"
        :items="tiposRows"
        item-title="nombreTipoHabitacion"
        item-value="idTipoHabitacion"
        label="Tipo habitaciÃ³n"
        variant="outlined"
      />
      <v-text-field v-model="createForm.numeroHabitacion" label="NÃºmero" variant="outlined" />
      <v-text-field v-model.number="createForm.piso" label="Piso" type="number" variant="outlined" />
      <v-text-field v-model.number="createForm.capacidadHabitacion" label="Capacidad" type="number" variant="outlined" />
      <v-text-field v-model.number="createForm.precioBase" label="Precio base" type="number" variant="outlined" />
      <v-textarea v-model="createForm.descripcionHabitacion" label="DescripciÃ³n" variant="outlined" />
      <v-text-field v-model="createForm.estadoHabitacion" label="Estado" variant="outlined" />
      <v-btn color="primary" class="mt-2" @click="saveCreate">Crear</v-btn>
      <v-btn class="mt-2 ms-2" variant="text" to="/admin/habitaciones">Cancelar</v-btn>
    </v-card-text>
  </v-card>
  <v-card v-else>
    <v-card-title>Editar habitaciÃ³n</v-card-title>
    <v-card-text>
      <v-text-field v-model="editForm.numeroHabitacion" label="NÃºmero" variant="outlined" />
      <v-text-field v-model.number="editForm.piso" label="Piso" type="number" variant="outlined" />
      <v-text-field v-model.number="editForm.capacidadHabitacion" label="Capacidad" type="number" variant="outlined" />
      <v-text-field v-model.number="editForm.precioBase" label="Precio base" type="number" variant="outlined" />
      <v-textarea v-model="editForm.descripcionHabitacion" label="DescripciÃ³n" variant="outlined" />
      <v-text-field v-model="editForm.estadoHabitacion" label="Estado" variant="outlined" />
      <v-btn color="primary" class="mt-2" @click="saveEdit">Guardar</v-btn>
      <v-btn class="mt-2 ms-2" variant="text" to="/admin/habitaciones">Volver</v-btn>
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
