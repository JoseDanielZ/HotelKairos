<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const { snackOpen, snackText, snackTimeout } = storeToRefs(ui);
</script>

<template>
  <v-app>
    <router-view />
    <v-snackbar v-model="snackOpen" :timeout="snackTimeout" color="surface" location="bottom">
      {{ snackText }}
      <template #actions>
        <v-btn variant="text" @click="ui.closeSnack()">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
