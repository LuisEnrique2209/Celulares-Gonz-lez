import { useState } from 'react';
import { ADMIN_EMAIL, checkAdminCredentials } from '../admin';

interface Props {
  onBack: () => void;
}

/**
 * Sección de Administración.
 * Pide las credenciales del administrador (luissenriqueg2@gmail.com)
 * y muestra la configuración para desplegar en Vercel.
 */
export default function Admin({ onBack }: Props) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminCredentials(user, password)) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('❌ Usuario o contraseña incorrectos');
      setAuthenticated(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h2 className="text-xl font-bold text-gray-900">Acceso de Administrador</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa con tu cuenta de Gmail para ver la configuración de Vercel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder={ADMIN_EMAIL}
                autoComplete="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
            >
              ← Volver
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">⚙️ Administración</h2>
        <p className="text-blue-100 text-sm">
          Sesión iniciada como <span className="font-semibold">{ADMIN_EMAIL}</span> ✅
        </p>
      </div>

      {/* Credenciales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">👤 Cuenta de administrador</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Correo (Gmail)</p>
            <p className="font-mono text-sm text-gray-900 break-all">{ADMIN_EMAIL}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Contraseña</p>
            <p className="font-mono text-sm text-gray-900">••••••••••••</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 Por seguridad, la contraseña no se muestra en pantalla. Está definida en
          <code className="bg-gray-100 px-1 rounded"> src/admin.ts</code> y puede
          cambiarse mediante variables de entorno en Vercel.
        </p>
      </div>

      {/* Configuración en Vercel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">🚀 Configuración para Vercel</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
          <li>Ve a tu proyecto en <span className="font-medium">vercel.com</span></li>
          <li>Abre <span className="font-medium">Settings → Environment Variables</span></li>
          <li>Agrega las siguientes variables (ambientes: Production y Preview):</li>
        </ol>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre>{`VITE_ADMIN_EMAIL=luissenriqueg2@gmail.com\nVITE_ADMIN_PASSWORD=LuisEnrique2209`}</pre>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ⚠️ Después de agregar las variables debes hacer <b>Redeploy</b> para que
          se apliquen en el sitio publicado. Si no las defines, la app usa los
          valores por defecto del código.
        </p>
        <button
          onClick={() => navigator.clipboard?.writeText('VITE_ADMIN_EMAIL=luissenriqueg2@gmail.com\nVITE_ADMIN_PASSWORD=LuisEnrique2209')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          📋 Copiar variables
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => { setAuthenticated(false); setUser(''); setPassword(''); }}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          🔒 Cerrar sesión de administrador
        </button>
      </div>
    </div>
  );
}
