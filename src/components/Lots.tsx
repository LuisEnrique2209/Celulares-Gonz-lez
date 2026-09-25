import { Lot, Device, CheckSlot } from '../types';
import { formatCurrency, formatDate, getLotTotalQuantity } from '../store';

interface Props {
  lots: Lot[];
  devices: Device[];
  slots: CheckSlot[];
  onEdit: (lot: Lot) => void;
  onDelete: (id: string) => void;
  onCheckLot: (lotId: string) => void;
}

export default function Lots({ lots, devices, slots, onEdit, onDelete, onCheckLot }: Props) {
  const getDevicesInLot = (lotId: string) => devices.filter(d => d.lotId === lotId);
  
  const getLotSlots = (lotId: string) => slots.filter(s => s.lotId === lotId);
  const getCheckedSlots = (lotId: string) => slots.filter(s => s.lotId === lotId && s.checked);
  const getPendingSlots = (lotId: string) => slots.filter(s => s.lotId === lotId && !s.checked);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800 border-orange-200',
      in_transit: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      received: 'bg-green-100 text-green-800 border-green-200',
      partial: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_transit: 'En Tránsito',
      received: 'Recibido',
      partial: 'Parcial',
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
        <h1 className="text-3xl font-bold text-gray-900">Lotes de Importación</h1>
        <span className="text-sm text-gray-500">{lots.length} lotes registrados</span>
      </div>

      {lots.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 text-lg">No hay lotes registrados</p>
          <p className="text-gray-400 text-sm mt-1">Agrega tu primer lote para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {lots.map(lot => {
            const totalQuantity = getLotTotalQuantity(lot);
            const lotDevices = getDevicesInLot(lot.id);
            const lotSlots = getLotSlots(lot.id);
            const checkedSlots = getCheckedSlots(lot.id);
            const pendingSlots = getPendingSlots(lot.id);
            const subtotalUSD = (lot.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
            const rate = lot.exchangeRate || 0;
            const subtotalMXN = subtotalUSD * rate;
            const totalCost = subtotalMXN + lot.importExpenses + lot.shippingExpenses + lot.otherExpenses;
            const costPerUnit = totalQuantity > 0 ? totalCost / totalQuantity : 0;

            return (
              <div key={lot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{lot.name}</h3>
                        {getStatusBadge(lot.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Proveedor: {lot.supplier} • {totalQuantity} unidades totales
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pendingSlots.length > 0 && (
                        <button
                          onClick={() => onCheckLot(lot.id)}
                          className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-100 transition-colors border border-teal-200"
                        >
                          🔍 Checar ({pendingSlots.length} pendientes)
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(lot);
                        }}
                        className="px-3 py-1.5 text-blue-600 hover:text-white hover:bg-blue-600 text-sm font-medium rounded-lg transition-colors border border-blue-200 hover:border-blue-600"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar el lote "${lot.name}"?`)) {
                            onDelete(lot.id);
                          }
                        }}
                        className="px-4 py-2 bg-red-50 text-red-700 hover:text-white hover:bg-red-600 text-sm font-bold rounded-lg transition-all border-2 border-red-300 hover:border-red-600 shadow-sm hover:shadow-md"
                      >
                        🗑️ Eliminar Lote
                      </button>
                    </div>
                  </div>

                  {/* Items breakdown */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Modelos en este lote:</p>
                    <div className="flex flex-wrap gap-2">
                      {(lot.items || []).map((item, idx) => {
                        const itemTotalUSD = (item.quantity || 0) * (item.unitPrice || 0);
                        const itemTotalMXN = itemTotalUSD * rate;
                        return (
                          <span key={idx} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
                            {item.quantity}x {item.model} @ ${item.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD c/u
                            {rate > 0 && ` = $${itemTotalMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`}
                          </span>
                        );
                      })}
                    </div>
                    {rate > 0 && (
                      <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                        💱 Tipo de cambio: $1 USD = ${rate.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </p>
                    )}
                  </div>

                  {/* Check progress */}
                  {lotSlots.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progreso de chequeo</span>
                        <span className="text-xs font-semibold text-gray-700">{checkedSlots.length}/{totalQuantity} checados</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            checkedSlots.length === totalQuantity ? 'bg-green-500' :
                            checkedSlots.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${(checkedSlots.length / totalQuantity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Fecha de Compra</p>
                      <p className="text-sm font-semibold">{formatDate(lot.purchaseDate)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Fecha de Llegada</p>
                      <p className="text-sm font-semibold">{formatDate(lot.arrivalDate)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Subtotal Dispositivos</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(subtotalMXN)}</p>
                      {rate > 0 && (
                        <p className="text-xs text-gray-500">(${subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)</p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Costo por Unidad</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(costPerUnit)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600">Importación</p>
                      <p className="text-sm font-bold text-blue-800">{formatCurrency(lot.importExpenses)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600">Envío</p>
                      <p className="text-sm font-bold text-purple-800">{formatCurrency(lot.shippingExpenses)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600">Otros Gastos</p>
                      <p className="text-sm font-bold text-orange-800">{formatCurrency(lot.otherExpenses)}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600">Inversión Total del Lote</p>
                        <p className="text-lg font-bold text-green-800">{formatCurrency(totalCost)} MXN</p>
                        {rate > 0 && (
                          <p className="text-xs text-green-600">Dispositivos: ${subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD + Gastos: ${formatCurrency(lot.importExpenses + lot.shippingExpenses + lot.otherExpenses)}</p>
                        )}
                      </div>
                      {lot.trackingNumber && (
                        <div className="text-right">
                          <p className="text-xs text-green-600">Número de Rastreo</p>
                          <p className="text-sm font-mono font-semibold text-green-800">{lot.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {lot.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase mb-1">Notas</p>
                      <p className="text-sm text-gray-700">{lot.notes}</p>
                    </div>
                  )}

                  {/* Devices in this lot */}
                  {lotDevices.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Dispositivos registrados ({lotDevices.length}/{totalQuantity}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lotDevices.map(d => (
                          <span
                            key={d.id}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              d.status === 'sold' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              d.status === 'in_stock' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {d.imei.slice(-6)} • {d.model} • {d.color}
                          </span>
                        ))}
                      </div>
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
