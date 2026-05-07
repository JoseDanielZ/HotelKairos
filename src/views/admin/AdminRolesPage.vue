<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { rolesCreate, rolesDelete, rolesList, rolesUpdate } from '@/services/roles';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtDate } from '@/utils/status.util';
import type { RolDTO, RolUpsertRequest } from '@/models';

const ui = useUiStore();
const rows = ref<RolDTO[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);
const dialog = ref(false);
const saving = ref(false);
const editGuid = ref<string | null>(null);

const form = reactive<RolUpsertRequest>({
  nombreRol: '',
  descripcionRol: '',
  estadoRol: 'ACT',
});

const estados = ['ACT', 'INA'];

function openNew(): void {
  editGuid.value = null;
  Object.assign(form, { nombreRol: '', descripcionRol: '', estadoRol: 'ACT' });
  dialog.value = true;
}

function openEdit(r: RolDTO): void {
  editGuid.value = r.rolGuid;
  Object.assign(form, { nombreRol: r.nombreRol, descripcionRol: r.descripcionRol ?? '', estadoRol: r.estadoRol });
  dialog.value = true;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await rolesList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.data ?? [];
    total.value = r.data?.totalRecords ?? 0;
  } finally {
    loading.value = false;
  }
}

async function guardar(): Promise<void> {
  if (!form.nombreRol.trim()) {
    ui.showSnack('El nombre del rol es obligatorio', 4000, 'error');
    return;
  }
  saving.value = true;
  try {
    const res = editGuid.value
      ? await rolesUpdate(editGuid.value, form)
      : await rolesCreate(form);
    if (res.success) {
      ui.showSnack(editGuid.value ? 'Rol actualizado' : 'Rol creado', 3000);
      dialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    saving.value = false;
  }
}

async function remove(r: RolDTO): Promise<void> {
  if (!confirm(`¿Eliminar el rol "${r.nombreRol}"?`)) return;
  const res = await rolesDelete(r.rolGuid);
  if (res.success) {
    ui.showSnack('Rol eliminado', 3000);
    void load();
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Roles</v-card-title>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Nuevo rol</v-btn>
    </v-card-actions>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Creado</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.rolGuid">
          <td>{{ r.idRol }}</td>
          <td><strong>{{ r.nombreRol }}</strong></td>
          <td class="text-medium-emphasis">{{ r.descripcionRol ?? '—' }}</td>
          <td><v-chip :color="statusColor(r.estadoRol)" size="small" label>{{ r.estadoRol }}</v-chip></td>
          <td class="text-no-wrap text-caption">{{ fmtDate(r.fechaRegistroUtc) }}</td>
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

  <v-dialog v-model="dialog" max-width="480">
    <v-card>
      <v-card-title>{{ editGuid ? 'Editar' : 'Nuevo' }} rol</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-text-field v-model="form.nombreRol" label="Nombre *" variant="outlined" density="comfortable" />
        <v-textarea v-model="form.descripcionRol" label="Descripción" variant="outlined" rows="3" density="comfortable" />
        <v-select v-model="form.estadoRol" :items="estados" label="Estado" variant="outlined" density="comfortable" />
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
