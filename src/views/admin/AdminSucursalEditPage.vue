<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sucursalesCreate, sucursalesGetInternalByGuid, sucursalesUpdate } from '@/services/sucursales';
import { useUiStore } from '@/stores/ui';
import { isUuidString } from '@/utils/string.util';
import type { SucursalResponse, CrearSucursalRequest } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const isCreate = ref(false);
const sucursalGuid = ref<string | undefined>();
const loading = ref(true);
const guardando = ref(false);

const form = reactive({
  codigoSucursal: '',
  nombreSucursal: '',
  descripcionSucursal: '',
  descripcionCorta: '',
  tipoAlojamiento: 'Hotel',
  estrellas: null as number | null,
  categoriaViaje: '',
  pais: '',
  provincia: '',
  ciudad: '',
  ubicacion: '',
  direccion: '',
  codigoPostal: '',
  telefono: '',
  correo: '',
  latitud: null as number | null,
  longitud: null as number | null,
  horaCheckin: '15:00',
  horaCheckout: '11:00',
  checkinAnticipado: 0,
  checkoutTardio: 0,
  aceptaNinos: true,
  edadMinimaHuesped: null as number | null,
  permiteMascotas: false,
  sePermiteFumar: false,
  estadoSucursal: 'ACTIVO',
});

function patchFormFromDto(s: SucursalResponse): void {
  form.codigoSucursal = s.codigoSucursal ?? '';
  form.nombreSucursal = s.nombreSucursal ?? '';
  form.descripcionSucursal = s.descripcionSucursal ?? '';
  form.descripcionCorta = s.descripcionCorta ?? '';
  form.tipoAlojamiento = s.tipoAlojamiento ?? 'Hotel';
  form.estrellas = s.estrellas ?? null;
  form.categoriaViaje = s.categoriaViaje ?? '';
  form.pais = s.pais ?? '';
  form.provincia = s.provincia ?? '';
  form.ciudad = s.ciudad ?? '';
  form.ubicacion = s.ubicacion ?? s.ciudad ?? '';
  form.direccion = s.direccion ?? '';
  form.codigoPostal = s.codigoPostal ?? '';
  form.telefono = s.telefono ?? '';
  form.correo = s.correo ?? '';
  form.latitud = s.latitud ?? null;
  form.longitud = s.longitud ?? null;
  form.horaCheckin = s.horaCheckin ?? '15:00';
  form.horaCheckout = s.horaCheckout ?? '11:00';
  form.checkinAnticipado = s.checkinAnticipado ?? 0;
  form.checkoutTardio = s.checkoutTardio ?? 0;
  form.aceptaNinos = (s.aceptaNinos ?? 1) === 1;
  form.edadMinimaHuesped = s.edadMinimaHuesped ?? null;
  form.permiteMascotas = (s.permiteMascotas ?? 0) === 1;
  form.sePermiteFumar = (s.sePermiteFumar ?? 0) === 1;
  form.estadoSucursal = s.estadoSucursal ?? 'ACTIVO';
}

function buildBody(): CrearSucursalRequest | null {
  const v = form;
  const codigo = v.codigoSucursal.trim();
  const nombre = v.nombreSucursal.trim();
  const pais = v.pais.trim();
  const ciudad = v.ciudad.trim();
  let ubicacion = v.ubicacion.trim();
  const direccion = v.direccion.trim();
  const telefono = v.telefono.trim();
  const correo = v.correo.trim();
  if (!codigo || !nombre || !pais || !ciudad || !direccion || !telefono || !correo) {
    ui.showSnack('Obligatorios: cÃ³digo, nombre, paÃ­s, ciudad, direcciÃ³n, telÃ©fono y correo.', 6000);
    return null;
  }
  if (!ubicacion) ubicacion = ciudad;
  return {
    codigoSucursal: codigo,
    nombreSucursal: nombre,
    descripcionSucursal: v.descripcionSucursal.trim() || null,
    descripcionCorta: v.descripcionCorta.trim() || null,
    tipoAlojamiento: v.tipoAlojamiento.trim() || null,
    estrellas: v.estrellas,
    categoriaViaje: v.categoriaViaje.trim() || null,
    pais,
    provincia: v.provincia.trim() || null,
    ciudad,
    ubicacion,
    direccion,
    codigoPostal: v.codigoPostal.trim() || null,
    telefono,
    correo,
    latitud: v.latitud,
    longitud: v.longitud,
    horaCheckin: v.horaCheckin.trim() || null,
    horaCheckout: v.horaCheckout.trim() || null,
    checkinAnticipado: Number(v.checkinAnticipado) || 0,
    checkoutTardio: Number(v.checkoutTardio) || 0,
    aceptaNinos: v.aceptaNinos ? 1 : 0,
    edadMinimaHuesped: v.edadMinimaHuesped,
    permiteMascotas: v.permiteMascotas ? 1 : 0,
    sePermiteFumar: v.sePermiteFumar ? 1 : 0,
    estadoSucursal: v.estadoSucursal.trim() || null,
  };
}

function copiarCiudadAUbicacion(): void {
  const c = form.ciudad.trim();
  if (c) form.ubicacion = c;
}

onMounted(async () => {
  if (route.path.endsWith('/nuevo')) {
    isCreate.value = true;
    loading.value = false;
    return;
  }
  const id = String(route.params.guid ?? '');
  if (!isUuidString(id)) {
    ui.showSnack('GUID de sucursal invÃ¡lido', 4000);
    void router.push('/admin/sucursales');
    return;
  }
  sucursalGuid.value = id;
  try {
    const res = await sucursalesGetInternalByGuid(id);
    if (res.success && res.data) {
      patchFormFromDto(res.data);
    }
  } finally {
    loading.value = false;
  }
});

async function guardar(): Promise<void> {
  const body = buildBody();
  if (!body) return;
  guardando.value = true;
  try {
    if (isCreate.value) {
      const res = await sucursalesCreate(body);
      if (res.success && res.data) {
        ui.showSnack(`Sucursal creada (id ${res.data.idSucursal})`, 5000);
        void router.push('/admin/sucursales');
      } else {
        ui.showSnack(res.message || 'No se pudo crear', 6000);
      }
    } else if (sucursalGuid.value) {
      const res = await sucursalesUpdate(sucursalGuid.value, body);
      if (res.success) {
        ui.showSnack('Sucursal actualizada', 4000);
        void router.push('/admin/sucursales');
      } else {
        ui.showSnack(res.message || 'No se pudo actualizar', 6000);
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
    <h1 class="mb-2">{{ isCreate ? 'Nueva sucursal' : 'Editar sucursal' }}</h1>
    <p class="text-medium-emphasis mb-4">
      Obligatorios segÃºn API: cÃ³digo, nombre, paÃ­s, ciudad, ubicaciÃ³n, direcciÃ³n, telÃ©fono y correo.
    </p>
    <v-card>
      <v-card-text class="d-flex flex-column gap-2">
        <v-text-field v-model="form.codigoSucursal" label="CÃ³digo sucursal" variant="outlined" />
        <v-text-field v-model="form.nombreSucursal" label="Nombre" variant="outlined" />
        <v-textarea v-model="form.descripcionSucursal" label="DescripciÃ³n" variant="outlined" />
        <v-text-field v-model="form.descripcionCorta" label="DescripciÃ³n corta" variant="outlined" />
        <v-text-field v-model="form.tipoAlojamiento" label="Tipo alojamiento" variant="outlined" />
      <v-text-field v-model.number="form.estrellas" label="Estrellas" type="number" variant="outlined" />
        <v-text-field v-model="form.categoriaViaje" label="CategorÃ­a viaje" variant="outlined" />
        <v-divider class="my-2" />
        <v-text-field v-model="form.pais" label="PaÃ­s" variant="outlined" />
        <v-text-field v-model="form.provincia" label="Provincia" variant="outlined" />
        <v-text-field v-model="form.ciudad" label="Ciudad" variant="outlined" />
        <div class="d-flex gap-2 align-center flex-wrap">
          <v-text-field v-model="form.ubicacion" label="UbicaciÃ³n (texto)" variant="outlined" class="flex-grow-1" />
          <v-btn variant="outlined" @click="copiarCiudadAUbicacion">Igual que ciudad</v-btn>
        </div>
        <v-text-field v-model="form.direccion" label="DirecciÃ³n" variant="outlined" />
        <v-text-field v-model="form.codigoPostal" label="CÃ³digo postal" variant="outlined" />
        <v-text-field v-model.number="form.latitud" label="Latitud" type="number" step="any" variant="outlined" />
        <v-text-field v-model.number="form.longitud" label="Longitud" type="number" step="any" variant="outlined" />
        <v-text-field v-model="form.telefono" label="TelÃ©fono" variant="outlined" />
        <v-text-field v-model="form.correo" label="Correo" type="email" variant="outlined" />
        <v-text-field v-model="form.horaCheckin" label="Hora check-in" variant="outlined" />
        <v-text-field v-model="form.horaCheckout" label="Hora check-out" variant="outlined" />
        <v-text-field v-model.number="form.checkinAnticipado" label="Check-in anticipado" type="number" variant="outlined" />
        <v-text-field v-model.number="form.checkoutTardio" label="Check-out tardÃ­o" type="number" variant="outlined" />
        <v-text-field v-model.number="form.edadMinimaHuesped" label="Edad mÃ­nima huÃ©sped" type="number" variant="outlined" />
        <v-text-field v-model="form.estadoSucursal" label="Estado operativo" variant="outlined" />
        <v-checkbox v-model="form.aceptaNinos" label="Acepta niÃ±os" />
        <v-checkbox v-model="form.permiteMascotas" label="Permite mascotas" />
        <v-checkbox v-model="form.sePermiteFumar" label="Se permite fumar" />
        <v-btn color="primary" :loading="guardando" @click="guardar">Guardar</v-btn>
        <v-btn variant="text" to="/admin/sucursales">Volver</v-btn>
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
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
</style>
