<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { catalogoCreate, catalogoDelete, catalogoList, catalogoUpdate } from '@/services/catalogo';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtMoney } from '@/utils/status.util';
import type { CatalogoResponse, CrearCatalogoRequest } from '@/models';

const ui = useUiStore();
const rows = ref<CatalogoResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);
const dialog = ref(false);
const saving = ref(false);
const editGuid = ref<string | null>(null);

const form = reactive<CrearCatalogoRequest>({
  codigoCatalogo: '',
  nombreCatalogo: '',
  tipoCatalogo: 'SRV',
  categoriaCatalogo: 'GENERAL',
  descripcionCatalogo: '',
  precioBase: 0,
  aplicaIva: 0,
  disponible24h: 0,
  estadoCatalogo: 'ACT',
});

const tiposCatalogo = ['SRV', 'AME'];
const estados = ['ACT', 'INA'];

function openNew(): void {
  editGuid.value = null;
  Object.assign(form, {
    codigoCatalogo: '',
    nombreCatalogo: '',
    tipoCatalogo: 'SRV',
    categoriaCatalogo: 'GENERAL',
    descripcionCatalogo: '',
    precioBase: 0,
    aplicaIva: 0,
    disponible24h: 0,
    estadoCatalogo: 'ACT',
  });
  dialog.value = true;
}

function openEdit(r: CatalogoResponse): void {
  editGuid.value = r.catalogoGuid;
  Object.assign(form, {
    codigoCatalogo: r.codigoCatalogo,
    nombreCatalogo: r.nombreCatalogo,
    tipoCatalogo: r.tipoCatalogo,
    categoriaCatalogo: r.categoriaCatalogo,
    descripcionCatalogo: r.descripcionCatalogo ?? '',
    precioBase: r.precioBase,
    aplicaIva: r.aplicaIva,
    disponible24h: r.disponible24h,
    estadoCatalogo: r.estadoCatalogo,
  });
  dialog.value = true;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await catalogoList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
  } finally {
    loading.value = false;
  }
}

async function guardar(): Promise<void> {
  if (!form.codigoCatalogo || !form.nombreCatalogo) {
    ui.showSnack('CÃ³digo y nombre son obligatorios', 4000, 'error');
    return;
  }
  saving.value = true;
  try {
    const res = editGuid.value
      ? await catalogoUpdate(editGuid.value, form)
      : await catalogoCreate(form);
    if (res.success) {
      ui.showSnack(editGuid.value ? 'Actualizado' : 'Creado', 3000);
      dialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error al guardar', 6000, 'error');
    }
  } finally {
    saving.value = false;
  }
}

async function remove(r: CatalogoResponse): Promise<void> {
  if (!confirm(`Â¿Eliminar "${r.nombreCatalogo}"?`)) return;
  const res = await catalogoDelete(r.catalogoGuid);
  if (res.success) {
    ui.showSnack('Eliminado', 3000);
    void load();
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>CatÃ¡logo de servicios</v-card-title>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Nuevo Ã­tem</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>CÃ³digo</th>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>CategorÃ­a</th>
          <th>Precio base</th>
          <th>Estado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.catalogoGuid">
          <td><code>{{ r.codigoCatalogo }}</code></td>
          <td>{{ r.nombreCatalogo }}</td>
          <td><v-chip size="x-small" label>{{ r.tipoCatalogo }}</v-chip></td>
          <td>{{ r.categoriaCatalogo }}</td>
          <td>{{ fmtMoney(r.precioBase) }}</td>
          <td><v-chip :color="statusColor(r.estadoCatalogo)" size="small" label>{{ r.estadoCatalogo }}</v-chip></td>
          <td class="text-no-wrap">
            <v-btn size="small" variant="text" icon="mdi-pencil" @click="openEdit(r)" />
            <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="remove(r)" />
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-pagination
      v-if="Math.ceil(total / pageSize) > 1"
      class="mt-4"
      :length="Math.max(1, Math.ceil(total / pageSize))"
      :model-value="page"
      @update:model-value="(p) => { page = p; void load(); }"
    />
  </template>

  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title>{{ editGuid ? 'Editar' : 'Nuevo' }} Ã­tem de catÃ¡logo</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-text-field v-model="form.codigoCatalogo" label="CÃ³digo *" variant="outlined" density="comfortable" />
        <v-text-field v-model="form.nombreCatalogo" label="Nombre *" variant="outlined" density="comfortable" />
        <v-select v-model="form.tipoCatalogo" :items="tiposCatalogo" label="Tipo (SRV/AME)" variant="outlined" density="comfortable" />
        <v-text-field v-model="form.categoriaCatalogo" label="CategorÃ­a" variant="outlined" density="comfortable" />
        <v-textarea v-model="form.descripcionCatalogo" label="DescripciÃ³n" variant="outlined" density="comfortable" rows="2" />
        <v-text-field v-model.number="form.precioBase" label="Precio base" type="number" step="0.01" variant="outlined" density="comfortable" />
        <v-select v-model="form.estadoCatalogo" :items="estados" label="Estado" variant="outlined" density="comfortable" />
        <div class="d-flex gap-3">
          <v-checkbox v-model="form.aplicaIva" :true-value="1" :false-value="0" label="Aplica IVA" />
          <v-checkbox v-model="form.disponible24h" :true-value="1" :false-value="0" label="Disponible 24h" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="guardar">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
