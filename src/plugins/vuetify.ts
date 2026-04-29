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
          background: '#030712',
          surface: '#0f172a',
          primary: '#22d3ee',
          secondary: '#a78bfa',
          error: '#f472b6',
          onSurface: '#f8fafc',
        },
      },
    },
  },
});
