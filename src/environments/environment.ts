export const environment = {
  production: import.meta.env.PROD,
  // In dev, VITE_API_URL is undefined so apiUrl is '' — Vite proxy handles /api → localhost:5106.
  // In production builds, set VITE_API_URL in Vercel env vars to the Railway backend URL.
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '',
};
