import { useState } from 'react';
import { Device, Lot } from '../types';
import { formatCurrency, formatDate, IPHONE_MODELS } from '../store';

interface Props {
  devices: Device[];
  lots: Lot[];
  onEdit: (device: Device) => void;
  onDelete: (id: string) => void;
}

export default function Inventory({ devices, lots, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLot, setFilterLot] = useState('');
  const [filterChecked, setFilterChecked] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const filteredDevices = devices.filter(d => {
    const matchSearch = search === '' || 
      d.imei.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase()) ||
      d.color.toLowerCase().includes(search.toLowerCase());
    const matchModel = filterModel === '' || d.model === filterModel;
    const matchStatus = filterStatus === '' || d.status === filterStatus;
    const matchLot = filterLot === '' || d.lotId === filterLot;
    const matchChecked = filterChecked === '' || 
      (filterChecked === 'checked' && d.checked) ||
      (filterChecked === 'unchecked' && !d.checked);
    return matchSearch && matchModel && matchStatus && matchLot && matchChecked;
  });

  const getLotName = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    return lot ? lot.name : 'Sin lote';
  };

  // Color según nivel de batería
  const getBatteryStyle = (pct: number) => {
    if (pct >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (pct >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const BatteryBadge = ({ pct }: { pct?: number }) => {
    if (typeof pct !== 'number' || pct <= 0) {
      return <span className="text-xs text-gray-400">—</span>;
    }
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${getBatteryStyle(pct)}`}>
        🔋 {pct}%
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      in_transit: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      received: 'bg-blue-100 text-blue-800 border-blue-200',
      in_stock: 'bg-green-100 text-green-800 border-green-200',
      sold: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    const labels: Record<string, string> = {
      in_transit: 'En Tránsito',
      received: 'Recibido',
      in_stock: 'En Stock',
      sold: 'Vendido',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total en sistema</p>
            <p className="text-lg font-bold text-gray-900">{devices.length} dispositivos</p>
          </div>
          {filteredDevices.length !== devices.length && (
            <span className="text-sm text-blue-600 font-medium">({filteredDevices.length} mostrados)</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Buscar por IMEI, modelo o color..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterModel}
            onChange={e => setFilterModel(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los modelos</option>
            {IPHONE_MODELS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="in_transit">En Tránsito</option>
            <option value="received">Recibido</option>
            <option value="in_stock">En Stock</option>
            <option value="sold">Vendido</option>
          </select>
          <select
            value={filterChecked}
            onChange={e => setFilterChecked(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos (revisión)</option>
            <option value="checked">✓ Revisados</option>
            <option value="unchecked">⚠ Sin revisar</option>
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

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">IMEI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Batería</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Modelo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Color</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Almacenamiento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Lote</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Precio Compra</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Costo Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Checado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDevices.map(device => {
                const totalCost = device.purchasePrice + device.importExpenses + device.shippingExpenses + device.otherExpenses;
                return (
                  <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{device.imei}</td>
                    <td className="px-4 py-3"><BatteryBadge pct={device.batteryPercentage} /></td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{device.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{device.color}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{device.storage}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getLotName(device.lotId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(device.purchasePrice)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(totalCost)}</td>
                    <td className="px-4 py-3">
                      {device.checked ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 font-medium">
                          <span>✓</span> Revisado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-medium">
                          <span>⚠</span> Sin revisar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(device.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDevice(device)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => onEdit(device)}
                          className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar este dispositivo?')) onDelete(device.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="lg:hidden space-y-3">
        {filteredDevices.map(device => {
          const totalCost = device.purchasePrice + device.importExpenses + device.shippingExpenses + device.otherExpenses;
          return (
            <div key={device.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{device.model}</h3>
                    {getStatusBadge(device.status)}
                  </div>
                  <p className="text-xs font-mono text-gray-500 truncate">{device.imei}</p>
                  <div className="mt-1">
                    <BatteryBadge pct={device.batteryPercentage} />
                  </div>
                </div>
                {device.checked ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 font-medium flex-shrink-0">
                    <span>✓</span> Revisado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-medium flex-shrink-0">
                    <span>⚠</span> Sin revisar
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Color:</span>
                  <p className="font-medium text-gray-900">{device.color}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Almacenamiento:</span>
                  <p className="font-medium text-gray-900">{device.storage}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Precio:</span>
                  <p className="font-medium text-gray-900">{formatCurrency(device.purchasePrice)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Costo Total:</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(totalCost)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedDevice(device)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(device)}
                  className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar este dispositivo?')) onDelete(device.id);
                  }}
                  className="px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          {devices.length === 0 ? (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No hay dispositivos en el inventario</p>
              <p className="text-gray-400 text-sm mt-2">Agrega tu primer dispositivo para comenzar</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No se encontraron dispositivos con los filtros actuales</p>
              <p className="text-gray-400 text-sm mt-2">
                Tienes {devices.length} dispositivos en total, pero los filtros están ocultando todos
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setFilterModel('');
                  setFilterStatus('');
                  setFilterLot('');
                  setFilterChecked('');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalle del Dispositivo</h3>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">IMEI</p>
                    <p className="text-sm font-mono font-semibold">{selectedDevice.imei}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Batería</p>
                    <p className="text-sm font-semibold"><BatteryBadge pct={selectedDevice.batteryPercentage} /></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Modelo</p>
                    <p className="text-sm font-semibold">{selectedDevice.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Color</p>
                    <p className="text-sm font-semibold">{selectedDevice.color}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Almacenamiento</p>
                    <p className="text-sm font-semibold">{selectedDevice.storage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fecha de Compra</p>
                    <p className="text-sm font-semibold">{formatDate(selectedDevice.purchaseDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fecha de Llegada</p>
                    <p className="text-sm font-semibold">{formatDate(selectedDevice.arrivalDate)}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Costos</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Precio de Compra</p>
                      <p className="text-sm font-bold">{formatCurrency(selectedDevice.purchasePrice)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Gastos de Importación</p>
                      <p className="text-sm font-bold">{formatCurrency(selectedDevice.importExpenses)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Gastos de Envío</p>
                      <p className="text-sm font-bold">{formatCurrency(selectedDevice.shippingExpenses)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Otros Gastos</p>
                      <p className="text-sm font-bold">{formatCurrency(selectedDevice.otherExpenses)}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600">Costo Total</p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(selectedDevice.purchasePrice + selectedDevice.importExpenses + selectedDevice.shippingExpenses + selectedDevice.otherExpenses)}
                    </p>
                  </div>
                </div>
                {selectedDevice.salePrice && (
                  <div className="border-t pt-4">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600">Precio de Venta</p>
                      <p className="text-lg font-bold text-green-800">{formatCurrency(selectedDevice.salePrice)}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Ganancia: {formatCurrency(selectedDevice.salePrice - (selectedDevice.purchasePrice + selectedDevice.importExpenses + selectedDevice.shippingExpenses + selectedDevice.otherExpenses))}
                      </p>
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Lote</p>
                      <p className="text-sm font-semibold">{getLotName(selectedDevice.lotId)}</p>
                    </div>
                    {getStatusBadge(selectedDevice.status)}
                  </div>
                </div>
                {selectedDevice.notes && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 uppercase">Notas</p>
                    <p className="text-sm text-gray-700">{selectedDevice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
