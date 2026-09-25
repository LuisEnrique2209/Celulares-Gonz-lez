import { useState } from 'react';
import { Repair } from '../types';
import { formatDate, formatCurrency } from '../store';

interface Props {
  repairs: Repair[];
  onEdit: (repair: Repair) => void;
  onDelete: (id: string) => void;
}

export default function Repairs({ repairs, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  const filteredRepairs = repairs.filter(r => {
    const matchSearch = search === '' ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone.includes(search) ||
      r.model.toLowerCase().includes(search.toLowerCase()) ||
      r.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === '' || r.status === filterStatus;
    const matchBrand = filterBrand === '' || r.brand === filterBrand;
    return matchSearch && matchStatus && matchBrand;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Proceso',
      completed: 'Completada',
      delivered: 'Entregada',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const brands = Array.from(new Set(repairs.map(r => r.brand))).sort();
  const pendingCount = repairs.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
  const totalRevenue = repairs
    .filter(r => r.status === 'delivered' && r.finalCost)
    .reduce((sum, r) => sum + (r.finalCost || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reparaciones</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Pendientes</p>
            <p className="text-lg font-bold text-orange-600">{pendingCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Ingresos</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <span className="text-sm text-gray-500">{repairs.length} reparaciones</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Buscar por cliente, marca o modelo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Completada</option>
            <option value="delivered">Entregada</option>
          </select>
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las marcas</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Repairs List */}
      {filteredRepairs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <p className="text-gray-500 text-lg">No hay reparaciones registradas</p>
          <p className="text-gray-400 text-sm mt-1">Registra tu primera reparación</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRepairs.map(repair => (
            <div key={repair.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{repair.brand} {repair.model}</h3>
                    {getStatusBadge(repair.status)}
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                    <p className="text-xs text-blue-600 mb-1">Cliente</p>
                    <p className="text-sm font-bold text-blue-900">{repair.customerName}</p>
                    <p className="text-sm text-blue-700">{repair.customerPhone}</p>
                    {repair.customerEmail && (
                      <p className="text-sm text-blue-700">{repair.customerEmail}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Problema Reportado
                        {repair.issueCategory && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {repair.issueCategory.replace('_', ' ')}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                        {repair.issue}
                      </p>
                    </div>
                    {repair.diagnosticNotes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Notas de Diagnóstico</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                          {repair.diagnosticNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-gray-500">Recibido:</span>
                        <span className="ml-2 font-semibold">{formatDate(repair.receivedDate)}</span>
                      </div>
                      {repair.estimatedCost && (
                        <div>
                          <span className="text-gray-500">Costo estimado:</span>
                          <span className="ml-2 font-semibold text-blue-600">{formatCurrency(repair.estimatedCost)}</span>
                        </div>
                      )}
                      {repair.finalCost && (
                        <div>
                          <span className="text-gray-500">Costo final:</span>
                          <span className="ml-2 font-bold text-green-600">{formatCurrency(repair.finalCost)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Garantía:</span>
                      <span className="ml-2 font-semibold">{repair.warrantyDays} días</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {/* Quick Status Change Buttons */}
                  <div className="flex gap-1">
                    {repair.status !== 'pending' && (
                      <button
                        onClick={() => {
                          const updatedRepair = { ...repair, status: 'pending' as const };
                          onEdit(updatedRepair);
                        }}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                        title="Cambiar a Pendiente"
                      >
                        ⏳
                      </button>
                    )}
                    {repair.status !== 'in_progress' && (
                      <button
                        onClick={() => {
                          const updatedRepair = { ...repair, status: 'in_progress' as const };
                          onEdit(updatedRepair);
                        }}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Cambiar a En Revisión"
                      >
                        🔧
                      </button>
                    )}
                    {repair.status !== 'completed' && (
                      <button
                        onClick={() => {
                          const updatedRepair = { 
                            ...repair, 
                            status: 'completed' as const,
                            completedDate: new Date().toISOString().split('T')[0]
                          };
                          onEdit(updatedRepair);
                        }}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        title="Cambiar a Completado"
                      >
                        ✅
                      </button>
                    )}
                  </div>
                  
                  {/* WhatsApp Button for Completed Repairs */}
                  {repair.status === 'completed' && (
                    <button
                      onClick={() => {
                        const message = `Hola ${repair.customerName}, tu reparación del ${repair.brand} ${repair.model} ya está lista. Puedes pasar a recogerla. ¡Gracias por tu preferencia!`;
                        const encodedMessage = encodeURIComponent(message);
                        const cleanPhone = repair.customerPhone.replace(/[\s\-\(\)]/g, '');
                        const phoneWithCode = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
                        window.open(`https://wa.me/${phoneWithCode}?text=${encodedMessage}`, '_blank');
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Notificar
                    </button>
                  )}
                  
                  <button
                    onClick={() => onEdit(repair)}
                    className="px-3 py-1.5 text-blue-600 hover:text-white hover:bg-blue-600 text-sm font-medium rounded-lg transition-colors border border-blue-200 hover:border-blue-600"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta reparación?')) {
                        onDelete(repair.id);
                      }
                    }}
                    className="px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200 hover:border-red-600"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
