/**
 * Valor por defecto para `ng build` local. En Vercel usa:
 * Build Command: `npm run build:vercel`
 * y la variable API_PUBLIC_URL = tu API en HTTPS (ej. https://...).
 * `https://api.example.com` no existe → el navegador devuelve ERR_NAME_NOT_RESOLVED.
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
};
