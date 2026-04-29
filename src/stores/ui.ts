import { defineStore } from 'pinia';
import { ref } from 'vue';

export type SnackVariant = 'default' | 'error';

export const useUiStore = defineStore('ui', () => {
  const snackOpen = ref(false);
  const snackText = ref('');
  const snackTimeout = ref(5000);
  const snackVariant = ref<SnackVariant>('default');

  let timer: ReturnType<typeof setTimeout> | null = null;

  function showSnack(text: string, duration = 5000, variant: SnackVariant = 'default'): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    snackText.value = text;
    snackTimeout.value = duration;
    snackVariant.value = variant;
    snackOpen.value = true;
    timer = setTimeout(() => {
      snackOpen.value = false;
      timer = null;
    }, duration);
  }

  function closeSnack(): void {
    snackOpen.value = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { snackOpen, snackText, snackTimeout, snackVariant, showSnack, closeSnack };
});
