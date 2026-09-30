// ============================================
// Configuración del administrador de la aplicación
// ============================================
// Valores por defecto:
//   Email:    luissenriqueg2@gmail.com
//   Contraseña: LuisEnrique2209
//
// En PRODUCCIÓN (Vercel) puedes sobreescribirlos sin tocar el código,
// agregando estas Variables de Entorno en:
//   Vercel → Project → Settings → Environment Variables
//     ADMIN_EMAIL    = luissenriqueg2@gmail.com
//     ADMIN_PASSWORD = LuisEnrique2209
//
// Vite expone las variables con prefijo VITE_ mediante import.meta.env.
// Si no están definidas, se usan los valores por defecto de abajo.
// ============================================

const env = (import.meta as any).env || {};

export const ADMIN_EMAIL: string = env.VITE_ADMIN_EMAIL || 'luissenriqueg2@gmail.com';
export const ADMIN_PASSWORD: string = env.VITE_ADMIN_PASSWORD || 'LuisEnrique2209';

/** Verifica si un usuario/contraseña corresponde al administrador */
export function checkAdminCredentials(user: string, password: string): boolean {
  const normalizedUser = (user || '').trim().toLowerCase();
  return (
    normalizedUser === ADMIN_EMAIL.toLowerCase() &&
    (password || '') === ADMIN_PASSWORD
  );
}
