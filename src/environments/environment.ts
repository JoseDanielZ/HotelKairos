export const environment = {
  production: false,
  /**
   * En `ng serve`, vacío: el navegador pide a `http://localhost:4200/api/...` y
   * `proxy.conf.json` reenvía la misma ruta a `http://localhost:5106` (no uses pathRewrite
   * que quite `/api`). Tras tocar el proxy, reinicia `ng serve` y mira [HPM] en consola.
   * Sin proxy, usa `http://localhost:5106` y `Cors:AllowedOrigins` en el API.
   */
  apiUrl: '',
};
