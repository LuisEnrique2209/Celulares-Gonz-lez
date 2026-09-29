import { useState, useEffect } from 'react';
import { Sale, Device, Lot, Customer, Refaccion } from '../types';
import { generateId, formatCurrency, getCustomers, addOrUpdateCustomer } from '../store';
import CustomerSelector from './CustomerSelector';

interface Props {
  devices: Device[];
  lots: Lot[];
  refacciones?: Refaccion[];
  onSave: (sale: Sale) => void;
  editingSale?: Sale | null;
  onCancel: () => void;
}

export default function SaleForm({ devices, lots, refacciones, onSave, editingSale, onCancel }: Props) {
  // Tipo de artículo a vender: dispositivo (teléfono) o refacción
  const [saleType, setSaleType] = useState<'dispositivo' | 'refaccion'>('dispositivo');
  const [deviceId, setDeviceId] = useState('');
  const [refaccionId, setRefaccionId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [salePrice, setSalePrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);

  const availableDevices = devices.filter(d => d.status !== 'sold');
  const refaccionList = Array.isArray(refacciones) ? refacciones : [];
  const availableRefacciones = refaccionList.filter(r => (Number(r.quantity) || 0) > 0);

  useEffect(() => {
    if (editingSale) {
      setSaleType(editingSale.type === 'refaccion' ? 'refaccion' : 'dispositivo');
      setDeviceId(editingSale.deviceId);
      setRefaccionId(editingSale.type === 'refaccion' ? editingSale.deviceId : '');
      setQuantity(String(editingSale.quantity || 1));
      setSaleDate(editingSale.saleDate);
      setSalePrice(editingSale.salePrice.toString());
      setCustomerName(editingSale.customerName);
      setCustomerPhone(editingSale.customerPhone);
      setCustomerEmail(editingSale.customerEmail || '');
      setPaymentMethod(editingSale.paymentMethod || '');
      setNotes(editingSale.notes);
    }
  }, [editingSale]);

  const selectedDevice = devices.find(d => d.id === deviceId);
  const selectedRefaccion = refaccionList.find(r => r.id === refaccionId);
  const quantityNum = Math.max(1, parseInt(quantity) || 1);

  // Calculate cost and profit
  const deviceCost = selectedDevice 
    ? selectedDevice.purchasePrice + selectedDevice.importExpenses + selectedDevice.shippingExpenses + selectedDevice.otherExpenses
    : 0;
  const refaccionUnitCost = selectedRefaccion ? Number(selectedRefaccion.costPrice) || 0 : 0;
  const refaccionUnitSale = selectedRefaccion ? Number(selectedRefaccion.salePrice) || 0 : 0;
  const refaccionCost = refaccionUnitCost * quantityNum;
  const salePriceNum = parseFloat(salePrice) || 0;
  const unitSalePrice = quantityNum > 0 ? salePriceNum / quantityNum : salePriceNum;
  const baseCost = saleType === 'refaccion' ? refaccionCost : deviceCost;
  const profit = salePriceNum - baseCost;
  const profitMargin = baseCost > 0 ? (profit / baseCost) * 100 : 0;

  // Al elegir una refacción, autocompletar el precio con su precio de venta x cantidad
  const handleSelectRefaccion = (id: string) => {
    setRefaccionId(id);
    const r = refaccionList.find(x => x.id === id);
    if (r) {
      const qty = Math.max(1, parseInt(quantity) || 1);
      const suggested = (Number(r.salePrice) || 0) * qty;
      if (suggested > 0) setSalePrice(suggested.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (saleType === 'dispositivo') {
      if (!selectedDevice) return;

      // Save customer
      addOrUpdateCustomer(customerName, customerPhone, customerEmail || undefined, parseFloat(salePrice) || 0, saleDate);

      const sale: Sale = {
        id: editingSale?.id || generateId(),
        type: 'dispositivo',
        deviceId,
        imei: selectedDevice.imei,
        model: selectedDevice.model,
        color: selectedDevice.color,
        storage: selectedDevice.storage,
        lotId: selectedDevice.lotId,
        saleDate,
        salePrice: parseFloat(salePrice) || 0,
        quantity: 1,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        paymentMethod: paymentMethod || undefined,
        notes,
      };
      onSave(sale);
      return;
    }

    // Venta de refacción
    if (!selectedRefaccion) return;
    const qty = Math.max(1, parseInt(quantity) || 1);
    if (qty > (Number(selectedRefaccion.quantity) || 0)) {
      alert(`Solo hay ${Number(selectedRefaccion.quantity) || 0} piezas disponibles de "${selectedRefaccion.name}"`);
      return;
    }

    addOrUpdateCustomer(customerName, customerPhone, customerEmail || undefined, parseFloat(salePrice) || 0, saleDate);

    const sale: Sale = {
      id: editingSale?.id || generateId(),
      type: 'refaccion',
      deviceId: selectedRefaccion.id,
      imei: '',
      model: selectedRefaccion.name,
      color: selectedRefaccion.category || '',
      storage: `x${qty}`,
      lotId: '',
      saleDate,
      salePrice: parseFloat(salePrice) || 0,
      quantity: qty,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      paymentMethod: paymentMethod || undefined,
      notes,
    };
    onSave(sale);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingSale ? 'Editar Venta' : 'Nueva Venta'}
        </h1>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de artículo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Artículo *</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSaleType('dispositivo')}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${
                saleType === 'dispositivo'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">📱</span>
              <span className={`block text-sm font-semibold ${saleType === 'dispositivo' ? 'text-blue-800' : 'text-gray-700'}`}>
                Dispositivo / Teléfono
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {availableDevices.length} disponibles en inventario
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSaleType('refaccion')}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${
                saleType === 'refaccion'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">🔩</span>
              <span className={`block text-sm font-semibold ${saleType === 'refaccion' ? 'text-purple-800' : 'text-gray-700'}`}>
                Refacción
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {availableRefacciones.length} refacciones con existencias
              </span>
            </button>
          </div>
        </div>

        {/* Selección de Dispositivo */}
        {saleType === 'dispositivo' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Dispositivo</h3>
          {availableDevices.length === 0 ? (
            <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium">No hay dispositivos disponibles para vender</p>
              <p className="text-sm text-yellow-700 mt-1">
                {devices.length === 0 
                  ? 'Primero agrega dispositivos al inventario' 
                  : 'Todos los dispositivos ya han sido vendidos'}
              </p>
              {devices.length > 0 && (
                <p className="text-xs text-yellow-600 mt-2">
                  Total de dispositivos en sistema: {devices.length}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Dispositivo *</label>
                <span className="text-xs text-gray-500">{availableDevices.length} disponibles</span>
              </div>
              <select
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccionar dispositivo</option>
                {availableDevices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.model} - {d.imei} ({d.color}, {d.storage})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedDevice && (
            <div className="mt-4 space-y-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-blue-600">Modelo</p>
                    <p className="text-sm font-semibold text-blue-800">{selectedDevice.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">IMEI</p>
                    <p className="text-sm font-mono font-semibold text-blue-800">{selectedDevice.imei}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Color</p>
                    <p className="text-sm font-semibold text-blue-800">{selectedDevice.color}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Almacenamiento</p>
                    <p className="text-sm font-semibold text-blue-800">{selectedDevice.storage}</p>
                  </div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Desglose de Costos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Precio de Compra</p>
                    <p className="font-semibold text-gray-900">${selectedDevice.purchasePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Importación</p>
                    <p className="font-semibold text-gray-900">${selectedDevice.importExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Envío</p>
                    <p className="font-semibold text-gray-900">${selectedDevice.shippingExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Otros Gastos</p>
                    <p className="font-semibold text-gray-900">${selectedDevice.otherExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Costo Total del Dispositivo:</span>
                    <span className="text-lg font-bold text-gray-900">${deviceCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>
              </div>

              {/* Profit preview */}
              {salePriceNum > 0 && (
                <div className={`rounded-lg p-4 border-2 ${profit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '💰 Ganancia' : '📉 Pérdida'}
                      </p>
                      <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${Math.abs(profit).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </p>
                      <p className={`text-xs ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Margen: {profitMargin.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Precio de Venta</p>
                      <p className="text-lg font-semibold text-gray-900">${salePriceNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">- Costo: ${deviceCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Selección de Refacción */}
        {saleType === 'refaccion' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Refacción</h3>
          {availableRefacciones.length === 0 ? (
            <div className="text-center py-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium">No hay refacciones con existencias disponibles</p>
              <p className="text-sm text-yellow-700 mt-1">
                {refaccionList.length === 0
                  ? 'Primero registra refacciones en Inventario → Refacciones'
                  : 'Todas las refacciones registradas están agotadas'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Refacción *</label>
                  <span className="text-xs text-gray-500">{availableRefacciones.length} disponibles</span>
                </div>
                <select
                  value={refaccionId}
                  onChange={e => handleSelectRefaccion(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccionar refacción</option>
                  {availableRefacciones.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({Number(r.quantity) || 0} en stock) — venta ${Number(r.salePrice || 0).toLocaleString('es-MX')} c/u
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedRefaccion ? Number(selectedRefaccion.quantity) || 1 : undefined}
                  value={quantity}
                  onChange={e => {
                    setQuantity(e.target.value);
                    // Recalcular precio sugerido si hay refacción seleccionada
                    const r = selectedRefaccion;
                    if (r) {
                      const qty = Math.max(1, parseInt(e.target.value) || 1);
                      const suggested = (Number(r.salePrice) || 0) * qty;
                      if (suggested > 0) setSalePrice(suggested.toFixed(2));
                    }
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {selectedRefaccion && (
                  <p className="text-xs text-gray-500 mt-1">
                    Existencias actuales: {Number(selectedRefaccion.quantity) || 0} piezas
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedRefaccion && (
            <div className="mt-4 space-y-3">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-purple-600">Refacción</p>
                    <p className="text-sm font-semibold text-purple-800">{selectedRefaccion.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Categoría</p>
                    <p className="text-sm font-semibold text-purple-800">{selectedRefaccion.category || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Precio venta unitario</p>
                    <p className="text-sm font-semibold text-purple-800">${refaccionUnitSale.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600">Después de esta venta</p>
                    <p className="text-sm font-semibold text-purple-800">{Math.max(0, (Number(selectedRefaccion.quantity) || 0) - quantityNum)} en stock</p>
                  </div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Desglose de Costos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Costo unitario</p>
                    <p className="font-semibold text-gray-900">${refaccionUnitCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cantidad</p>
                    <p className="font-semibold text-gray-900">{quantityNum}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Precio venta unitario</p>
                    <p className="font-semibold text-gray-900">${unitSalePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Costo Total de la Refacción:</span>
                    <span className="text-lg font-bold text-gray-900">${refaccionCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>
              </div>

              {/* Profit preview */}
              {salePriceNum > 0 && (
                <div className={`rounded-lg p-4 border-2 ${profit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '💰 Ganancia' : '📉 Pérdida'}
                      </p>
                      <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${Math.abs(profit).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </p>
                      <p className={`text-xs ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Margen: {profitMargin.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Precio de Venta</p>
                      <p className="text-lg font-semibold text-gray-900">${salePriceNum.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">- Costo: ${refaccionCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Sale Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Venta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Venta *</label>
              <input
                type="date"
                value={saleDate}
                onChange={e => setSaleDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta (MXN) *</label>
              <input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccionar</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
            <button
              type="button"
              onClick={() => setShowCustomerSelector(true)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 flex items-center gap-1"
            >
              👥 Seleccionar Cliente
            </button>
          </div>
          
          {/* Customer Preview */}
          {customerName && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">{customerName}</p>
                  <p className="text-xs text-green-700">📞 {customerPhone}</p>
                  {customerEmail && <p className="text-xs text-green-700">✉️ {customerEmail}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Nombre completo"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Ej: 55 1234 5678"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Customer Selector Modal */}
        <CustomerSelector
          isOpen={showCustomerSelector}
          onClose={() => setShowCustomerSelector(false)}
          onSelect={(customer: Customer) => {
            setCustomerName(customer.name);
            setCustomerPhone(customer.phone);
            setCustomerEmail(customer.email || '');
          }}
        />

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">📝 Observaciones de Garantía (opcional)</label>
          <p className="text-xs text-gray-500 mb-2">Estas observaciones aparecerán en la póliza de garantía del cliente</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ej: Se entregó con funda, pantalla con protector, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={availableDevices.length === 0}
              className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {editingSale ? 'Actualizar Venta' : 'Registrar Venta'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
