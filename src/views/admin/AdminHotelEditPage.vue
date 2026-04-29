<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { alojamientosCreate, alojamientosGetById, alojamientosUpdate } from '@/services/alojamientos';
import { useUiStore } from '@/stores/ui';
import { isPositiveIntString } from '@/utils/string.util';
import type { CreateAlojamientoDTO, UpdateAlojamientoDTO } from '@/models';

const ESTADOS = ['Activo', 'Inactivo', 'Suspendido', 'EnRevision'] as const;

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const estados: string[] = [...ESTADOS];
const isCreate = ref(false);
const hotelId = ref<number | undefined>();
const loading = ref(true);
const guardando = ref(false);

const form = reactive({
  tipoAlojID: null as number | null,
  adminUsuarioID: null as number | null,
  nombre: '',
  slug: '',
  ruc: '',
  numRegistroTurismo: '',
  categoria: null as number | null,
  descripcion: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  pais: '',
  latitud: null as number | null,
  longitud: null as number | null,
  telefono: '',
  email: '',
  sitioWeb: '',
  horaCheckIn: '',
  horaCheckOut: '',
  politicaCancelacion: '',
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
    void router.push('/admin/hoteles');
    return;
  }
  hotelId.value = Number(id);
  try {
    const res = await alojamientosGetById(hotelId.value);
    if (res.success && res.data) {
      const h = res.data;
      form.nombre = h.nombre ?? '';
      form.slug = h.slug ?? '';
      form.ruc = h.ruc ?? '';
      form.numRegistroTurismo = h.numRegistroTurismo ?? '';
      form.categoria = h.categoria ?? null;
      form.descripcion = h.descripcion ?? '';
      form.direccion = h.direccion ?? '';
      form.ciudad = h.ciudad ?? '';
      form.provincia = h.provincia ?? '';
      form.pais = h.pais ?? '';
      form.latitud = h.latitud ?? null;
      form.longitud = h.longitud ?? null;
      form.telefono = h.telefono ?? '';
      form.email = h.email ?? '';
      form.sitioWeb = h.sitioWeb ?? '';
      form.horaCheckIn = h.horaCheckIn ?? '';
      form.horaCheckOut = h.horaCheckOut ?? '';
      form.politicaCancelacion = h.politicaCancelacion ?? '';
      form.estadoAlojamiento = h.estadoAlojamiento ?? '';
    }
  } finally {
    loading.value = false;
  }
});

async function save(): Promise<void> {
  if (!form.nombre) {
    ui.showSnack('El nombre es obligatorio.', 4000);
    return;
  }
  if (isCreate.value && (form.tipoAlojID == null || form.adminUsuarioID == null)) {
    ui.showSnack('tipoAlojID y adminUsuarioID son obligatorios al crear.', 4000);
    return;
  }
  guardando.value = true;
  try {
    if (isCreate.value) {
      const v = form;
      const body: CreateAlojamientoDTO = {
        tipoAlojID: v.tipoAlojID ?? undefined,
        adminUsuarioID: v.adminUsuarioID ?? undefined,
        nombre: v.nombre || undefined,
        slug: v.slug || undefined,
        ruc: v.ruc || undefined,
        numRegistroTurismo: v.numRegistroTurismo || undefined,
        categoria: v.categoria ?? undefined,
        descripcion: v.descripcion || undefined,
        direccion: v.direccion || undefined,
        ciudad: v.ciudad || undefined,
        provincia: v.provincia || undefined,
        pais: v.pais || undefined,
        latitud: v.latitud ?? undefined,
        longitud: v.longitud ?? undefined,
        telefono: v.telefono || undefined,
        email: v.email || undefined,
        sitioWeb: v.sitioWeb || undefined,
        horaCheckIn: v.horaCheckIn || undefined,
        horaCheckOut: v.horaCheckOut || undefined,
        politicaCancelacion: v.politicaCancelacion || undefined,
      };
      const res = await alojamientosCreate(body);
      if (res.success) {
        ui.showSnack('Hotel creado correctamente', 3000);
        void router.push('/admin/hoteles');
      }
    } else if (hotelId.value != null) {
      const v = form;
      const body: UpdateAlojamientoDTO = {
        alojamientoID: hotelId.value,
        nombre: v.nombre || undefined,
        descripcion: v.descripcion || undefined,
        direccion: v.direccion || undefined,
        ciudad: v.ciudad || undefined,
        provincia: v.provincia || undefined,
        pais: v.pais || undefined,
        latitud: v.latitud ?? undefined,
        longitud: v.longitud ?? undefined,
        telefono: v.telefono || undefined,
        email: v.email || undefined,
        sitioWeb: v.sitioWeb || undefined,
        horaCheckIn: v.horaCheckIn || undefined,
        horaCheckOut: v.horaCheckOut || undefined,
        politicaCancelacion: v.politicaCancelacion || undefined,
        estadoAlojamiento: v.estadoAlojamiento || undefined,
      };
      const res = await alojamientosUpdate(hotelId.value, body);
      if (res.success) {
        ui.showSnack('Hotel actualizado correctamente', 3000);
        void router.push('/admin/hoteles');
      }
    }
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <div v-else>
    <h2 class="mb-4">{{ isCreate ? 'Nuevo hotel' : 'Editar hotel #' + hotelId }}</h2>
    <v-card>
      <v-card-text class="d-flex flex-column gap-2">
        <template v-if="isCreate">
          <v-text-field v-model.number="form.tipoAlojID" label="tipoAlojID" type="number" variant="outlined" />
          <v-text-field v-model.number="form.adminUsuarioID" label="adminUsuarioID" type="number" variant="outlined" />
        </template>
        <v-text-field v-model="form.nombre" label="Nombre" variant="outlined" />
        <v-text-field v-model="form.slug" label="Slug" variant="outlined" />
        <v-select
          v-model="form.categoria"
          :items="[null, 1, 2, 3, 4, 5]"
          label="Categoría (estrellas)"
          variant="outlined"
          clearable
        />
        <v-text-field v-model="form.ruc" label="RUC" variant="outlined" />
        <v-text-field v-model="form.numRegistroTurismo" label="Registro turismo" variant="outlined" />
        <v-textarea v-model="form.descripcion" label="Descripción" variant="outlined" />
        <v-text-field v-model="form.direccion" label="Dirección" variant="outlined" />
        <v-text-field v-model="form.ciudad" label="Ciudad" variant="outlined" />
        <v-text-field v-model="form.provincia" label="Provincia" variant="outlined" />
        <v-text-field v-model="form.pais" label="País" variant="outlined" />
        <v-text-field v-model.number="form.latitud" label="Latitud" type="number" step="any" variant="outlined" />
        <v-text-field v-model.number="form.longitud" label="Longitud" type="number" step="any" variant="outlined" />
        <v-text-field v-model="form.telefono" label="Teléfono" variant="outlined" />
        <v-text-field v-model="form.email" label="Email" type="email" variant="outlined" />
        <v-text-field v-model="form.sitioWeb" label="Sitio web" variant="outlined" />
        <v-text-field v-model="form.horaCheckIn" label="Check-in" variant="outlined" />
        <v-text-field v-model="form.horaCheckOut" label="Check-out" variant="outlined" />
        <v-textarea v-model="form.politicaCancelacion" label="Política cancelación" variant="outlined" />
        <v-select
          v-if="!isCreate"
          v-model="form.estadoAlojamiento"
          :items="estados"
          label="Estado"
          variant="outlined"
          clearable
        />
        <v-btn color="primary" :loading="guardando" @click="save">{{ isCreate ? 'Crear hotel' : 'Guardar' }}</v-btn>
        <v-btn variant="text" to="/admin/hoteles">Volver</v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
</style>
