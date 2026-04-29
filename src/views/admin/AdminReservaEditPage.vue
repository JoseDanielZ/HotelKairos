<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { reservasGetByGuid, reservasUpdate } from '@/services/reservas';
import { useUiStore } from '@/stores/ui';
import { isUuidString } from '@/utils/string.util';

const ESTADOS = ['Pendiente', 'Confirmada', 'CheckIn', 'CheckOut', 'Cancelada', 'NoShow'] as const;

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const estados: string[] = [...ESTADOS];
const guid = ref('');
const codigoReserva = ref('');
const loading = ref(true);
const guardando = ref(false);

const form = reactive({
  fechaInicio: '',
  fechaFin: '',
  estadoReserva: '',
  observaciones: '',
});

function toDatetimeLocal(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(async () => {
  const id = String(route.params.guid ?? '');
  if (!isUuidString(id)) {
    ui.showSnack('GUID de reserva inválido', 4000);
    void router.push('/admin/reservas');
    return;
  }
  guid.value = id;
  try {
    const res = await reservasGetByGuid(id);
    if (res.success && res.data) {
      const r = res.data;
      codigoReserva.value = r.codigoReserva ?? r.guidReserva ?? '';
      form.fechaInicio = toDatetimeLocal(r.fechaInicio ?? '');
      form.fechaFin = toDatetimeLocal(r.fechaFin ?? '');
      form.estadoReserva = r.estadoReserva ?? '';
      form.observaciones = r.observaciones ?? '';
    }
  } finally {
    loading.value = false;
  }
});

async function save(): Promise<void> {
  if (!form.fechaInicio || !form.fechaFin) {
    ui.showSnack('Fechas obligatorias', 4000);
    return;
  }
  guardando.value = true;
  try {
    const res = await reservasUpdate(guid.value, {
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      fechaFin: new Date(form.fechaFin).toISOString(),
      estadoReserva: form.estadoReserva || undefined,
      observaciones: form.observaciones || undefined,
    });
    if (res.success) {
      ui.showSnack('Reserva actualizada', 3000);
      void router.push('/admin/reservas');
    }
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <div v-if="loading" class="center"><v-progress-circular indeterminate /></div>
  <v-card v-else>
    <v-card-title>Editar reserva {{ codigoReserva }}</v-card-title>
    <v-card-text>
      <v-text-field v-model="form.fechaInicio" label="Inicio" type="datetime-local" variant="outlined" />
      <v-text-field v-model="form.fechaFin" label="Fin" type="datetime-local" variant="outlined" />
      <v-select v-model="form.estadoReserva" :items="estados" label="Estado" variant="outlined" clearable />
      <v-textarea v-model="form.observaciones" label="Observaciones" variant="outlined" />
      <v-btn color="primary" :loading="guardando" @click="save">Guardar</v-btn>
      <v-btn class="ms-2" variant="text" to="/admin/reservas">Volver</v-btn>
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
