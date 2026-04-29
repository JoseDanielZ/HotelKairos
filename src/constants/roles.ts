export const AppRole = {
  Admin: 'Admin',
  Vendedor: 'Vendedor',
  Cliente: 'Cliente',
} as const;

export type AppRoleName = (typeof AppRole)[keyof typeof AppRole];
