import { useState } from 'react';
import { QualityCheck, Lot } from '../types';
import { formatDate } from '../store';

interface Props {
  checks: QualityCheck[];
  lots: Lot[];
  onEdit: (check: QualityCheck) => void;
  onDelete: (id: string) => void;
}

export default function QualityChecks({ checks, lots, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLot, setFilterLot] = useState('');

  const getLotName = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    return lot ? lot.name : 'Sin lote';
  };

  const filteredChecks = checks.filter(c => {
    const matchSearch = search === '' ||
      c.imei.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase()) ||
      c.checkedBy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === '' || c.overallStatus === filterStatus;
    const matchLot = filterLot === '' || c.lotId === filterLot;
    return matchSearch && matchStatus && matchLot;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    const labels: Record<string, string> = {
      approved: 'Aprobado',
      rejected: 'Rechazado',
      pending: 'Pendiente',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTestIcon = (result: string) => {
    if (result === 'pass') {
      return <span className="text-green-500">✓</span>;
    }
    return <span className="text-red-500">✗</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Chequeo</h1>
        <span className="text-sm text-gray-500">{checks.length} revisiones</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Buscar por IMEI, modelo o revisor..."
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
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
            <option value="pending">Pendientes</option>
          </select>
          <select
            value={filterLot}
            onChange={e => setFilterLot(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los lotes</option>
            {lots.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      {filteredChecks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-gray-500 text-lg">No hay revisiones de calidad</p>
          <p className="text-gray-400 text-sm mt-1">Las revisiones aparecerán aquí al checar dispositivos de un lote</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredChecks.map(check => {
            const totalTests = 10;
            const passedTests = [
              check.screen, check.camera, check.battery, check.speakers,
              check.microphone, check.wifi, check.bluetooth, check.buttons,
              check.charging, check.faceId
            ].filter(t => t === 'pass').length;

            return (
              <div key={check.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{check.model}</h3>
                        {getStatusBadge(check.overallStatus)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 font-mono">IMEI: {check.imei}</p>
                      <p className="text-sm text-gray-500">
                        Lote: {getLotName(check.lotId)} • Revisado por: {check.checkedBy} • {formatDate(check.checkDate)}
                        {check.batteryPercentage > 0 && ` • 🔋 ${check.batteryPercentage}%`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(check)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta revisión?')) onDelete(check.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Pruebas aprobadas</span>
                      <span className="text-sm font-semibold text-gray-900">{passedTests}/{totalTests}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passedTests === totalTests ? 'bg-green-500' :
                          passedTests >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(passedTests / totalTests) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Test Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.screen === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.screen)}
                      <span className="text-xs font-medium text-gray-700">Pantalla</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.camera === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.camera)}
                      <span className="text-xs font-medium text-gray-700">Cámara</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.battery === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.battery)}
                      <span className="text-xs font-medium text-gray-700">
                        Batería {check.batteryPercentage > 0 && `(${check.batteryPercentage}%)`}
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.speakers === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.speakers)}
                      <span className="text-xs font-medium text-gray-700">Bocinas</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.microphone === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.microphone)}
                      <span className="text-xs font-medium text-gray-700">Micrófono</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.wifi === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.wifi)}
                      <span className="text-xs font-medium text-gray-700">WiFi</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.bluetooth === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.bluetooth)}
                      <span className="text-xs font-medium text-gray-700">Bluetooth</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.buttons === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.buttons)}
                      <span className="text-xs font-medium text-gray-700">Botones</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.charging === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.charging)}
                      <span className="text-xs font-medium text-gray-700">Carga</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${check.faceId === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {getTestIcon(check.faceId)}
                      <span className="text-xs font-medium text-gray-700">Face ID</span>
                    </div>
                  </div>

                  {check.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase mb-1">Notas</p>
                      <p className="text-sm text-gray-700">{check.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
