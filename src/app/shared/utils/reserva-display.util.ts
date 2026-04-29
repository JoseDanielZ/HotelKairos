/** Extrae la línea de habitación guardada en observaciones por el flujo marketplace. */
export function habitacionDesdeObservaciones(obs: string | null | undefined): string | null {
  if (!obs) {
    return null;
  }
  const m = obs.match(/\[KAIROS\]\s*Habitación:\s*([^\n]+)/i);
  return m ? m[1].trim() : null;
}
