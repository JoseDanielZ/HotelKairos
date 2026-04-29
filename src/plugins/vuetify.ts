import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

export const vuetify = createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: {
    defaultTheme: 'kairosDark',
    themes: {
      kairosDark: {
        dark: true,
        colors: {
          background: '#1A1A1A',
          surface: '#111111',
          primary: '#C9A96E',
          secondary: '#E8D5B0',
          error: '#C0392B',
          success: '#27AE60',
          onSurface: '#FDFCF9',
        },
      },
    },
  },
});
