import { useState, useEffect } from 'react';
import { migrateToFirebase, clearLocalStorage } from '../migrateToFirebase';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FirebaseConfig() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [collections, setCollections] = useState<Record<string, number>>({});
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Intentar leer una colección para verificar conexión
      const snapshot = await getDocs(collection(db, 'devices'));
      const counts: Record<string, number> = {
        devices: snapshot.size
      };

      // Contar documentos en otras colecciones
      const collectionsToCheck = [
        'lots', 'sales', 'qualityChecks', 'checkSlots',
        'customers', 'repairs', 'monthlyExpenses', 'monthlyGoals'
      ];

      for (const coll of collectionsToCheck) {
        const snap = await getDocs(collection(db, coll));
        counts[coll] = snap.size;
      }

      setCollections(counts);
      setStatus('connected');
    } catch (error) {
      console.error('Error de conexión:', error);
      setStatus('error');
    }
  };

  const handleMigrate = async () => {
    if (!confirm('¿Estás seguro de migrar todos los datos locales a Firebase?')) {
      return;
    }

    setMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateToFirebase();
      setMigrationResult(result);
      
      if (result.success) {
        if (confirm('✅ Migración exitosa. ¿Deseas limpiar los datos locales ahora?')) {
          clearLocalStorage();
          alert('🗑️ Datos locales eliminados. Recarga la página para usar Firebase.');
        }
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: 'Error durante la migración',
        error: error
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleClearLocal = () => {
    if (confirm('⚠️ ¿Eliminar todos los datos locales? Esta acción no se puede deshacer.')) {
      clearLocalStorage();
      alert('✅ Datos locales eliminados. Recarga la página.');
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando conexión con Firebase...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-800 mb-4">❌ Error de Conexión</h2>
            <p className="text-red-700 mb-4">
              No se pudo conectar con Firebase. Por favor verifica:
            </p>
            <ul className="list-disc list-inside space-y-2 text-red-600 mb-6">
              <li>Las credenciales en <code className="bg-red-100 px-2 py-1 rounded">src/firebase.ts</code></li>
              <li>Que Firestore Database esté habilitado</li>
              <li>Las reglas de seguridad permitan acceso</li>
            </ul>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h3 className="font-semibold text-gray-800 mb-2">📋 Pasos para configurar:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Ve a <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 underline">Firebase Console</a></li>
                <li>Crea un proyecto nuevo o selecciona uno existente</li>
                <li>Ve a "Firestore Database" y créala</li>
                <li>Copia las credenciales de tu app web</li>
                <li>Pégalas en <code className="bg-gray-100 px-2 py-1 rounded">src/firebase.ts</code></li>
                <li>Recarga esta página</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Reintentar Conexión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">🔥 Configuración de Firebase</h1>
          <p className="text-blue-100">Gestiona tu base de datos en la nube</p>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold text-green-800">✅ Conectado a Firebase</h2>
          </div>
          <p className="text-green-700 mt-2">
            Tu base de datos está sincronizada en la nube
          </p>
        </div>

        {/* Collections Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Datos en Firebase</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(collections).map(([key, count]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600 capitalize mt-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Migration Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">🔄 Migrar Datos Locales</h2>
          <p className="text-yellow-700 mb-4">
            Si tienes datos guardados localmente en este navegador, puedes migrarlos a Firebase
          </p>
          
          {migrationResult && (
            <div className={`mb-4 p-4 rounded-lg ${
              migrationResult.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
            }`}>
              <p className={`font-semibold ${
                migrationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {migrationResult.success ? '✅' : '❌'} {migrationResult.message}
              </p>
              {migrationResult.success && migrationResult.stats && (
                <div className="mt-2 text-sm text-green-700">
                  <p>Datos migrados:</p>
                  <ul className="list-disc list-inside ml-2">
                    {Object.entries(migrationResult.stats).map(([key, value]) => (
                      (value as number) > 0 && <li key={key}>{value as number} {key}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {migrating ? '⏳ Migrando...' : '🚀 Migrar Datos a Firebase'}
            </button>
            <button
              onClick={handleClearLocal}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Limpiar Datos Locales
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">ℹ️ Información</h2>
          <ul className="space-y-2 text-blue-700">
            <li>✅ Tus datos se sincronizan en tiempo real</li>
            <li>✅ Accede desde cualquier dispositivo</li>
            <li>✅ Copias de seguridad automáticas</li>
            <li>✅ Plan gratuito de Firebase: 1GB de almacenamiento</li>
            <li>✅ Hasta 50,000 lecturas y 20,000 escrituras diarias</li>
          </ul>
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>💡 Consejo:</strong> Después de migrar, puedes acceder a tu aplicación desde
              cualquier dispositivo usando la URL de Vercel. Todos los datos estarán sincronizados.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🏠 Ir a la Aplicación
          </button>
          <button
            onClick={checkConnection}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Actualizar Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
}
