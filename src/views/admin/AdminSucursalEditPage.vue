<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  sucursalesCreate,
  sucursalesGetInternalByGuid,
  sucursalesUpdate,
  sucursalesGetImagenes,
  sucursalesAddImagen,
  sucursalesDeleteImagen,
  sucursalesGetResumenRating,
} from '@/services/sucursales';
import { imagesUpload } from '@/services/images';
import { useUiStore } from '@/stores/ui';
import { isUuidString } from '@/utils/string.util';
import type { SucursalResponse, CrearSucursalRequest, SucursalImagenResponse, CrearSucursalImagenRequest, ResumenRatingResponse } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const isCreate = ref(false);
const sucursalGuid = ref<string | undefined>();
const loading = ref(true);
const guardando = ref(false);
const tab = ref('datos');

// ── Form datos ────────────────────────────────────────────────────────────────
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
    ui.showSnack('Obligatorios: código, nombre, país, ciudad, dirección, teléfono y correo.', 6000);
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

// ── Imágenes ──────────────────────────────────────────────────────────────────
const imagenes = ref<SucursalImagenResponse[]>([]);
const loadingImagenes = ref(false);
const imagenDialog = ref(false);
const imagenForm = reactive<CrearSucursalImagenRequest>({
  urlImagen: '',
  descripcionImagen: '',
  ordenVisualizacion: 1,
  esPrincipal: 0,
});
const savingImagen = ref(false);
const uploadingImagen = ref(false);

async function loadImagenes(): Promise<void> {
  if (!sucursalGuid.value) return;
  loadingImagenes.value = true;
  try {
    const r = await sucursalesGetImagenes(sucursalGuid.value);
    imagenes.value = r.data ?? [];
  } finally {
    loadingImagenes.value = false;
  }
}

function openImagenDialog(): void {
  Object.assign(imagenForm, { urlImagen: '', descripcionImagen: '', ordenVisualizacion: 1, esPrincipal: 0 });
  imagenDialog.value = true;
}

async function uploadFile(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploadingImagen.value = true;
  try {
    const res = await imagesUpload(file);
    if (res.success && res.data) {
      imagenForm.urlImagen = res.data.url;
      ui.showSnack('Imagen subida', 3000);
    }
  } finally {
    uploadingImagen.value = false;
  }
}

async function agregarImagen(): Promise<void> {
  if (!sucursalGuid.value || !imagenForm.urlImagen.trim()) {
    ui.showSnack('URL de imagen obligatoria', 4000, 'error');
    return;
  }
  savingImagen.value = true;
  try {
    const res = await sucursalesAddImagen(sucursalGuid.value, { ...imagenForm });
    if (res.success) {
      ui.showSnack('Imagen agregada', 3000);
      imagenDialog.value = false;
      await loadImagenes();
    } else {
      ui.showSnack(res.message || 'Error', 5000, 'error');
    }
  } finally {
    savingImagen.value = false;
  }
}

async function eliminarImagen(id: number): Promise<void> {
  if (!sucursalGuid.value || !confirm('¿Eliminar esta imagen?')) return;
  const res = await sucursalesDeleteImagen(sucursalGuid.value, id);
  if (res.success) {
    ui.showSnack('Imagen eliminada', 3000);
    await loadImagenes();
  }
}

// ── Resumen rating ────────────────────────────────────────────────────────────
const rating = ref<ResumenRatingResponse | null>(null);
const loadingRating = ref(false);

async function loadRating(): Promise<void> {
  if (!sucursalGuid.value) return;
  loadingRating.value = true;
  try {
    const r = await sucursalesGetResumenRating(sucursalGuid.value);
    rating.value = r.data ?? null;
  } finally {
    loadingRating.value = false;
  }
}

function onTabChange(t: string): void {
  if (t === 'imagenes' && !imagenes.value.length) void loadImagenes();
  if (t === 'rating' && !rating.value) void loadRating();
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (route.path.endsWith('/nuevo')) {
    isCreate.value = true;
    loading.value = false;
    return;
  }
  const id = String(route.params.guid ?? '');
  if (!isUuidString(id)) {
    ui.showSnack('GUID de sucursal inválido', 4000);
    void router.push('/admin/sucursales');
    return;
  }
  sucursalGuid.value = id;
  try {
    const res = await sucursalesGetInternalByGuid(id);
    if (res.success && res.data) patchFormFromDto(res.data);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <div v-else>
    <div class="d-flex align-center mb-3">
      <h1>{{ isCreate ? 'Nueva sucursal' : 'Editar sucursal' }}</h1>
      <v-spacer />
      <v-btn variant="text" to="/admin/sucursales">Volver</v-btn>
    </div>

    <v-tabs v-model="tab" bg-color="surface" @update:model-value="onTabChange">
      <v-tab value="datos">Datos</v-tab>
      <v-tab value="imagenes" :disabled="isCreate">Imágenes</v-tab>
      <v-tab value="rating" :disabled="isCreate">Rating</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-3">
      <!-- ── Tab Datos ─────────────────────────────────────────────────────── -->
      <v-window-item value="datos">
        <v-card>
          <v-card-text class="d-flex flex-column gap-2">
            <p class="text-medium-emphasis mb-2">Obligatorios: código, nombre, país, ciudad, dirección, teléfono y correo.</p>
            <v-text-field v-model="form.codigoSucursal" label="Código sucursal" variant="outlined" />
            <v-text-field v-model="form.nombreSucursal" label="Nombre" variant="outlined" />
            <v-textarea v-model="form.descripcionSucursal" label="Descripción" variant="outlined" />
            <v-text-field v-model="form.descripcionCorta" label="Descripción corta" variant="outlined" />
            <v-text-field v-model="form.tipoAlojamiento" label="Tipo alojamiento" variant="outlined" />
            <v-text-field v-model.number="form.estrellas" label="Estrellas" type="number" variant="outlined" />
            <v-text-field v-model="form.categoriaViaje" label="Categoría viaje" variant="outlined" />
            <v-divider class="my-2" />
            <v-text-field v-model="form.pais" label="País" variant="outlined" />
            <v-text-field v-model="form.provincia" label="Provincia" variant="outlined" />
            <v-text-field v-model="form.ciudad" label="Ciudad" variant="outlined" />
            <div class="d-flex gap-2 align-center flex-wrap">
              <v-text-field v-model="form.ubicacion" label="Ubicación (texto)" variant="outlined" class="flex-grow-1" />
              <v-btn variant="outlined" @click="copiarCiudadAUbicacion">Igual que ciudad</v-btn>
            </div>
            <v-text-field v-model="form.direccion" label="Dirección" variant="outlined" />
            <v-text-field v-model="form.codigoPostal" label="Código postal" variant="outlined" />
            <v-text-field v-model.number="form.latitud" label="Latitud" type="number" step="any" variant="outlined" />
            <v-text-field v-model.number="form.longitud" label="Longitud" type="number" step="any" variant="outlined" />
            <v-text-field v-model="form.telefono" label="Teléfono" variant="outlined" />
            <v-text-field v-model="form.correo" label="Correo" type="email" variant="outlined" />
            <v-text-field v-model="form.horaCheckin" label="Hora check-in" variant="outlined" />
            <v-text-field v-model="form.horaCheckout" label="Hora check-out" variant="outlined" />
            <v-text-field v-model.number="form.checkinAnticipado" label="Check-in anticipado" type="number" variant="outlined" />
            <v-text-field v-model.number="form.checkoutTardio" label="Check-out tardío" type="number" variant="outlined" />
            <v-text-field v-model.number="form.edadMinimaHuesped" label="Edad mínima huésped" type="number" variant="outlined" />
            <v-text-field v-model="form.estadoSucursal" label="Estado operativo" variant="outlined" />
            <v-checkbox v-model="form.aceptaNinos" label="Acepta niños" />
            <v-checkbox v-model="form.permiteMascotas" label="Permite mascotas" />
            <v-checkbox v-model="form.sePermiteFumar" label="Se permite fumar" />
            <v-btn color="primary" :loading="guardando" @click="guardar">Guardar</v-btn>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ── Tab Imágenes ───────────────────────────────────────────────────── -->
      <v-window-item value="imagenes">
        <v-card>
          <v-card-title class="d-flex align-center">
            Galería de imágenes
            <v-spacer />
            <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="openImagenDialog">Agregar imagen</v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="loadingImagenes" class="center"><v-progress-circular indeterminate /></div>
            <div v-else-if="imagenes.length" class="images-grid">
              <v-card
                v-for="img in imagenes"
                :key="img.idSucursalImagen"
                variant="outlined"
                class="image-card"
              >
                <v-img :src="img.urlImagen" height="160" cover />
                <v-card-text class="pa-2">
                  <div class="text-caption text-truncate">{{ img.descripcionImagen || '—' }}</div>
                  <div class="d-flex align-center mt-1">
                    <v-chip v-if="img.esPrincipal" size="x-small" color="primary" label>Principal</v-chip>
                    <span class="text-caption ml-auto">#{{ img.ordenVisualizacion }}</span>
                    <v-btn size="x-small" variant="text" color="error" icon="mdi-delete" class="ml-1" @click="eliminarImagen(img.idSucursalImagen)" />
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <v-alert v-else type="info" variant="tonal" text="Sin imágenes registradas. Agrega la primera imagen de la sucursal." />
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ── Tab Rating ─────────────────────────────────────────────────────── -->
      <v-window-item value="rating">
        <v-card>
          <v-card-title>Resumen de valoraciones</v-card-title>
          <v-card-text>
            <div v-if="loadingRating" class="center"><v-progress-circular indeterminate /></div>
            <div v-else-if="rating">
              <v-row>
                <v-col cols="12" sm="4">
                  <v-card variant="tonal" color="primary" class="text-center pa-4">
                    <div class="text-h3 font-weight-bold">{{ rating.promedioGeneral?.toFixed(1) ?? '—' }}</div>
                    <v-rating
                      v-if="rating.promedioGeneral"
                      :model-value="rating.promedioGeneral"
                      readonly
                      half-increments
                      density="compact"
                      color="amber"
                      class="mt-1"
                    />
                    <div class="text-caption mt-1">{{ rating.totalValoraciones }} valoraciones</div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-list density="compact">
                    <v-list-item v-if="rating.promedioLimpieza != null">
                      <template #prepend><span class="text-caption w-28">Limpieza</span></template>
                      <v-progress-linear :model-value="(rating.promedioLimpieza / 5) * 100" color="primary" rounded height="8" />
                      <template #append><span class="text-caption ml-2">{{ rating.promedioLimpieza?.toFixed(1) }}</span></template>
                    </v-list-item>
                    <v-list-item v-if="rating.promedioConfort != null">
                      <template #prepend><span class="text-caption w-28">Confort</span></template>
                      <v-progress-linear :model-value="(rating.promedioConfort / 5) * 100" color="primary" rounded height="8" />
                      <template #append><span class="text-caption ml-2">{{ rating.promedioConfort?.toFixed(1) }}</span></template>
                    </v-list-item>
                    <v-list-item v-if="rating.promedioUbicacion != null">
                      <template #prepend><span class="text-caption w-28">Ubicación</span></template>
                      <v-progress-linear :model-value="(rating.promedioUbicacion / 5) * 100" color="primary" rounded height="8" />
                      <template #append><span class="text-caption ml-2">{{ rating.promedioUbicacion?.toFixed(1) }}</span></template>
                    </v-list-item>
                    <v-list-item v-if="rating.promedioInstalaciones != null">
                      <template #prepend><span class="text-caption w-28">Instalaciones</span></template>
                      <v-progress-linear :model-value="(rating.promedioInstalaciones / 5) * 100" color="primary" rounded height="8" />
                      <template #append><span class="text-caption ml-2">{{ rating.promedioInstalaciones?.toFixed(1) }}</span></template>
                    </v-list-item>
                    <v-list-item v-if="rating.promedioPersonal != null">
                      <template #prepend><span class="text-caption w-28">Personal</span></template>
                      <v-progress-linear :model-value="(rating.promedioPersonal / 5) * 100" color="primary" rounded height="8" />
                      <template #append><span class="text-caption ml-2">{{ rating.promedioPersonal?.toFixed(1) }}</span></template>
                    </v-list-item>
                    <v-list-item v-if="rating.promedioCalidadPrecio != null">
                      <template #prepend><span class="text-caption w-28">Calidad/precio</span></template>
                      <v-progress-linear :model-value="(rating.promedioCalidadPrecio / 5) * 100" color="primary" rounded height="8" />
                      <template #append><span class="text-caption ml-2">{{ rating.promedioCalidadPrecio?.toFixed(1) }}</span></template>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </div>
            <v-alert v-else type="info" variant="tonal" text="Sin valoraciones registradas para esta sucursal." />
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>

  <!-- ── Dialog imagen ─────────────────────────────────────────────────────── -->
  <v-dialog v-model="imagenDialog" max-width="520">
    <v-card>
      <v-card-title>Agregar imagen</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <div class="d-flex gap-2 align-center">
          <v-text-field v-model="imagenForm.urlImagen" label="URL imagen *" variant="outlined" density="comfortable" class="flex-1" />
          <v-btn
            variant="outlined"
            size="small"
            :loading="uploadingImagen"
            prepend-icon="mdi-upload"
            @click="($refs.fileInputSuc as HTMLInputElement).click()"
          >
            Subir
          </v-btn>
          <input ref="fileInputSuc" type="file" accept="image/*" class="d-none" @change="uploadFile" />
        </div>
        <v-text-field v-model="imagenForm.descripcionImagen" label="Descripción" variant="outlined" density="comfortable" />
        <div class="d-flex gap-3">
          <v-text-field v-model.number="imagenForm.ordenVisualizacion" label="Orden" type="number" min="1" variant="outlined" density="comfortable" class="flex-1" />
          <v-checkbox v-model="imagenForm.esPrincipal" :true-value="1" :false-value="0" label="Principal" class="flex-1" />
        </div>
        <v-img v-if="imagenForm.urlImagen" :src="imagenForm.urlImagen" height="140" cover class="rounded" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="imagenDialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="savingImagen" :disabled="!imagenForm.urlImagen" @click="agregarImagen">Agregar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.center { display: flex; justify-content: center; padding: 2rem; }
.images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.image-card { overflow: hidden; }
.w-28 { display: inline-block; width: 7rem; }
</style>
