/**
 * Escribe src/environments/environment.prod.ts antes del build.
 * Uso en Vercel: Build Command `npm run build:vercel` y variable API_PUBLIC_URL.
 */
const fs = require('fs');
const path = require('path');

const url = (process.env.API_PUBLIC_URL || '').trim().replace(/\/$/, '');
if (!url) {
  console.error(
    '\n[build:vercel] Define API_PUBLIC_URL (URL base del API en HTTPS, sin barra final).\n' +
      'Ejemplo: https://tu-api.azurewebsites.net\n' +
      'En Vercel: Project → Settings → Environment Variables.\n',
  );
  process.exit(1);
}

try {
  // eslint-disable-next-line no-new
  new URL(url);
} catch {
  console.error('[build:vercel] API_PUBLIC_URL no es una URL válida:', url);
  process.exit(1);
}

const out = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(
  out,
  `export const environment = {
  production: true,
  apiUrl: ${JSON.stringify(url)},
};
`,
);
console.log('[build:vercel] environment.prod.ts apiUrl ->', url);
