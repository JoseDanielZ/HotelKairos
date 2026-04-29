/** Role names as used in the app (align with `LoginResponse.roles` from the API). */
export const AppRole = {
  Admin: 'Admin',
  Vendedor: 'Vendedor',
  Cliente: 'Cliente',
} as const;

export type AppRoleName = (typeof AppRole)[keyof typeof AppRole];
