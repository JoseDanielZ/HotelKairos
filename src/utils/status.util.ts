const GREEN = ['ACT', 'DIS', 'APR', 'PUB', 'EMI', 'ACTIVO', 'DISPONIBLE', 'ACTIVA'];
const AMBER = ['PEN', 'PRO', 'PENDIENTE', 'EN_PROCESO', 'PROCESANDO'];
const BLUE = ['OCU', 'OCUPADO', 'EN_USO'];
const ORANGE = ['MNT', 'INA', 'BLO', 'INACTIVO', 'MANTENIMIENTO', 'BLOQUEADO', 'INHABILITADO'];
const RED = ['CAN', 'EXP', 'ANU', 'REC', 'FDS', 'CANCELADO', 'ELIMINADO', 'ANULADO', 'RECHAZADO'];

export function statusColor(s: string | null | undefined): string {
  if (!s) return 'default';
  const v = s.toUpperCase();
  if (GREEN.includes(v)) return 'success';
  if (AMBER.includes(v)) return 'warning';
  if (BLUE.includes(v)) return 'info';
  if (ORANGE.includes(v)) return 'deep-orange';
  if (RED.includes(v)) return 'error';
  return 'default';
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

export function fmtMoney(n: number | null | undefined, currency = 'USD'): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(n);
}
