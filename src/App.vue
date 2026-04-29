<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const { snackOpen, snackText, snackTimeout, snackVariant } = storeToRefs(ui);

const snackClass = computed(() =>
  snackVariant.value === 'error' ? 'kairos-snackbar kairos-snackbar--err' : 'kairos-snackbar kairos-snackbar--ok',
);
</script>

<template>
  <v-app>
    <router-view />
    <v-snackbar
      v-model="snackOpen"
      :timeout="snackTimeout"
      location="bottom end"
      variant="flat"
      :class="snackClass"
      rounded="0"
    >
      {{ snackText }}
      <template #actions>
        <v-btn variant="text" class="text-uppercase text-caption" @click="ui.closeSnack()">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
