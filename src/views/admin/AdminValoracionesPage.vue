<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { valoracionesList, valoracionesModerar, valoracionesResponder } from '@/services/valoraciones';
import { useUiStore } from '@/stores/ui';
import { statusColor, fmtDate } from '@/utils/status.util';
import type { ValoracionResponse } from '@/models';

const ui = useUiStore();
const rows = ref<ValoracionResponse[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);
const loading = ref(false);

// ── Moderar ───────────────────────────────────────────────────────────────────
const moderarDialog = ref(false);
const moderarGuid = ref('');
const moderarEstado = ref('APR');
const moderarPublicar = ref(1);
const moderarMotivo = ref('');
const moderarBusy = ref(false);

const estadosModerar = [
  { title: 'Aprobar', value: 'APR' },
  { title: 'Rechazar', value: 'REC' },
  { title: 'Publicar en portal', value: 'PUB' },
];

// ── Responder ─────────────────────────────────────────────────────────────────
const responderDialog = ref(false);
const responderGuid = ref('');
const responderTexto = ref('');
const responderBusy = ref(false);
const responderRow = ref<ValoracionResponse | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await valoracionesList({ PageNumber: page.value, PageSize: pageSize.value });
    rows.value = r.data?.items ?? [];
    total.value = r.data?.totalResultados ?? 0;
  } finally {
    loading.value = false;
  }
}

function openModerar(r: ValoracionResponse): void {
  moderarGuid.value = r.valoracionGuid;
  moderarEstado.value = 'APR';
  moderarPublicar.value = 1;
  moderarMotivo.value = '';
  moderarDialog.value = true;
}

async function doModerar(): Promise<void> {
  moderarBusy.value = true;
  try {
    const res = await valoracionesModerar(moderarGuid.value, {
      estadoValoracion: moderarEstado.value,
      publicadaEnPortal: moderarPublicar.value,
      motivoModeracion: moderarMotivo.value || null,
    });
    if (res.success) {
      ui.showSnack('Valoración moderada', 3000);
      moderarDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    moderarBusy.value = false;
  }
}

function openResponder(r: ValoracionResponse): void {
  responderRow.value = r;
  responderGuid.value = r.valoracionGuid;
  responderTexto.value = '';
  responderDialog.value = true;
}

async function doResponder(): Promise<void> {
  if (!responderTexto.value.trim()) {
    ui.showSnack('Escribe una respuesta', 4000, 'error');
    return;
  }
  responderBusy.value = true;
  try {
    const res = await valoracionesResponder(responderGuid.value, {
      respuestaHotel: responderTexto.value,
    });
    if (res.success) {
      ui.showSnack('Respuesta publicada', 3000);
      responderDialog.value = false;
      void load();
    } else {
      ui.showSnack(res.message || 'Error', 6000, 'error');
    }
  } finally {
    responderBusy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Valoraciones</v-card-title>
    <v-card-subtitle>Moderación y respuesta a reseñas de huéspedes.</v-card-subtitle>
  </v-card>

  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <template v-else>
    <v-table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Cliente</th>
          <th>Sucursal</th>
          <th>Puntuación</th>
          <th>Tipo viaje</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Portal</th>
          <th>Respuesta</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.valoracionGuid">
          <td>{{ r.idValoracion }}</td>
          <td>{{ r.idCliente }}</td>
          <td>{{ r.idSucursal }}</td>
          <td>
            <v-rating :model-value="r.puntuacionGeneral" density="compact" readonly half-increments size="small" color="amber" />
            <span class="text-caption ml-1">{{ r.puntuacionGeneral }}</span>
          </td>
          <td>{{ r.tipoViaje ?? '—' }}</td>
          <td class="text-no-wrap">{{ fmtDate(r.fechaRegistroUtc) }}</td>
          <td><v-chip :color="statusColor(r.estadoValoracion)" size="small" label>{{ r.estadoValoracion }}</v-chip></td>
          <td>
            <v-chip :color="r.publicadaEnPortal ? 'success' : 'default'" size="x-small" label>
              {{ r.publicadaEnPortal ? 'Sí' : 'No' }}
            </v-chip>
          </td>
          <td>
            <v-icon v-if="r.respuestaHotel" color="success" size="small" title="Ya respondida">mdi-check-circle</v-icon>
            <span v-else class="text-caption text-medium-emphasis">—</span>
          </td>
          <td class="text-no-wrap">
            <v-btn size="small" variant="text" icon="mdi-gavel" title="Moderar" @click="openModerar(r)" />
            <v-btn size="small" variant="text" color="primary" icon="mdi-reply" title="Responder" @click="openResponder(r)" />
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

  <!-- ── Dialog moderar ────────────────────────────────────────────────────── -->
  <v-dialog v-model="moderarDialog" max-width="460">
    <v-card>
      <v-card-title>Moderar valoración</v-card-title>
      <v-card-text class="d-flex flex-column gap-3">
        <v-select v-model="moderarEstado" :items="estadosModerar" item-title="title" item-value="value" label="Nuevo estado" variant="outlined" density="comfortable" />
        <v-checkbox v-model="moderarPublicar" :true-value="1" :false-value="0" label="Publicar en portal" />
        <v-textarea v-model="moderarMotivo" label="Motivo / nota" variant="outlined" rows="3" density="comfortable" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="moderarDialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="moderarBusy" @click="doModerar">Aplicar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Dialog responder ──────────────────────────────────────────────────── -->
  <v-dialog v-model="responderDialog" max-width="520">
    <v-card>
      <v-card-title>Responder valoración</v-card-title>
      <v-card-text>
        <div v-if="responderRow?.comentarioPositivo" class="mb-3 pa-3 bg-surface-variant rounded text-caption">
          <strong>Comentario del huésped:</strong><br />{{ responderRow.comentarioPositivo }}
        </div>
        <v-textarea
          v-model="responderTexto"
          label="Respuesta del hotel *"
          variant="outlined"
          rows="5"
          placeholder="Escribe la respuesta oficial del hotel..."
          counter
          maxlength="1000"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="responderDialog = false">Cancelar</v-btn>
        <v-btn color="primary" :loading="responderBusy" :disabled="!responderTexto.trim()" @click="doResponder">Publicar respuesta</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.center { display: flex; justify-content: center; padding: 1.5rem; }
</style>
