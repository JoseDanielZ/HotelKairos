<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { tarifasCreate, tarifasGetByGuid, tarifasUpdate } from '@/services/tarifas';
import { sucursalesGetInternalPage } from '@/services/sucursales';
import { tiposHabitacionList } from '@/services/tiposHabitacion';
import { useUiStore } from '@/stores/ui';
import type { SucursalDTO, TipoHabitacionDTO, TarifaUpsertRequest } from '@/models';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const isCreate = ref(false);
const guid = ref<string | undefined>();
const loading = ref(true);
const saving = ref(false);
const sucursales = ref<SucursalDTO[]>([]);
const tiposHab = ref<TipoHabitacionDTO[]>([]);

const form = reactive<TarifaUpsertRequest>({
  codigoTarifa: '',
  idSucursal: 0,
  idTipoHabitacion: 0,
  nombreTarifa: '',
  canalTarifa: 'TODOS',
  fechaInicio: '',
  fechaFin: '',
  precioPorNoche: 0,
  porcentajeIva: 15,
  minNoches: 1,
  maxNoches: null,
  permitePortalPublico: 1,
  prioridad: 1,
  estadoTarifa: 'ACT',
});

const canales = ['TODOS', 'WEB', 'ADMIN', 'AGENCIA'];
const estados = ['ACT', 'INA'];

async function loadCatalogos(): Promise<void> {
  const [s, t] = await Promise.all([
    sucursalesGetInternalPage({ PageNumber: 1, PageSize: 200 }),
    tiposHabitacionList({ PageNumber: 1, PageSize: 200 }),
  ]);
  sucursales.value = s.data?.data ?? [];
  tiposHab.value = t.data?.data ?? [];
}

onMounted(async () => {
  await loadCatalogos();
  if (route.path.endsWith('/nuevo')) {
    isCreate.value = true;
    loading.value = false;
    return;
  }
  guid.value = String(route.params.guid ?? '');
  try {
    const r = await tarifasGetByGuid(guid.value);
    if (r.success && r.data) {
      const d = r.data;
      form.codigoTarifa = d.codigoTarifa;
      form.idSucursal = d.idSucursal;
      form.idTipoHabitacion = d.idTipoHabitacion;
      form.nombreTarifa = d.nombreTarifa;
      form.canalTarifa = d.canalTarifa;
      form.fechaInicio = d.fechaInicio;
      form.fechaFin = d.fechaFin;
      form.precioPorNoche = d.precioPorNoche;
      form.porcentajeIva = d.porcentajeIva;
      form.minNoches = d.minNoches;
      form.maxNoches = d.maxNoches ?? null;
      form.permitePortalPublico = d.permitePortalPublico;
      form.prioridad = d.prioridad;
      form.estadoTarifa = d.estadoTarifa;
    }
  } finally {
    loading.value = false;
  }
});

async function guardar(): Promise<void> {
  if (!form.codigoTarifa || !form.nombreTarifa || !form.idSucursal || !form.idTipoHabitacion || !form.fechaInicio || !form.fechaFin) {
    ui.showSnack('Completa los campos obligatorios', 4000, 'error');
    return;
  }
  saving.value = true;
  try {
    const res = isCreate.value
      ? await tarifasCreate(form)
      : await tarifasUpdate(guid.value!, form);
    if (res.success) {
      ui.showSnack(isCreate.value ? 'Tarifa creada' : 'Tarifa actualizada', 4000);
      void router.push('/admin/tarifas');
    } else {
      ui.showSnack(res.message || 'Error al guardar', 6000, 'error');
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <div v-else>
    <h1 class="mb-3">{{ isCreate ? 'Nueva tarifa' : 'Editar tarifa' }}</h1>
    <v-card>
      <v-card-text class="d-flex flex-column gap-3">
        <div class="form-grid">
          <v-text-field v-model="form.codigoTarifa" label="Código *" variant="outlined" density="comfortable" />
          <v-text-field v-model="form.nombreTarifa" label="Nombre *" variant="outlined" density="comfortable" />
          <v-select
            v-model="form.idSucursal"
            :items="sucursales"
            :item-title="(s) => `${s.nombreSucursal} (${s.codigoSucursal})`"
            item-value="idSucursal"
            label="Sucursal *"
            variant="outlined"
            density="comfortable"
          />
          <v-select
            v-model="form.idTipoHabitacion"
            :items="tiposHab"
            :item-title="(t) => `${t.nombreTipoHabitacion} (${t.codigoTipoHabitacion})`"
            item-value="idTipoHabitacion"
            label="Tipo habitación *"
            variant="outlined"
            density="comfortable"
          />
          <v-select v-model="form.canalTarifa" :items="canales" label="Canal" variant="outlined" density="comfortable" />
          <v-text-field v-model="form.fechaInicio" label="Fecha inicio *" type="date" variant="outlined" density="comfortable" />
          <v-text-field v-model="form.fechaFin" label="Fecha fin *" type="date" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="form.precioPorNoche" label="Precio / noche *" type="number" step="0.01" min="0" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="form.porcentajeIva" label="% IVA" type="number" min="0" max="100" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="form.minNoches" label="Mín. noches" type="number" min="1" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="form.maxNoches" label="Máx. noches" type="number" min="1" variant="outlined" density="comfortable" />
          <v-text-field v-model.number="form.prioridad" label="Prioridad" type="number" min="1" variant="outlined" density="comfortable" />
          <v-select v-model="form.estadoTarifa" :items="estados" label="Estado" variant="outlined" density="comfortable" />
        </div>
        <v-checkbox v-model="form.permitePortalPublico" :true-value="1" :false-value="0" label="Permitir en portal público" />
        <div class="d-flex gap-2">
          <v-btn color="primary" :loading="saving" @click="guardar">Guardar</v-btn>
          <v-btn variant="text" to="/admin/tarifas">Cancelar</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.center { display: flex; justify-content: center; padding: 2rem; }
.mb-3 { margin-bottom: 0.75rem; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.5rem;
}
</style>
