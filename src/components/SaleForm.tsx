import { useState, useEffect } from 'react';
import { Sale, Device, Lot, Customer } from '../types';
import { generateId, formatCurrency, getCustomers, addOrUpdateCustomer } from '../store';
import CustomerSelector from './CustomerSelector';

interface Props {
  devices: Device[];
  lots: Lot[];
  onSave: (sale: Sale) => void;
  editingSale?: Sale | null;
  onCancel: () => void;
}

export default function SaleForm({ devices, lots, onSave, editingSale, onCancel }: Props) {
  const [deviceId, setDeviceId] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [salePrice, setSalePrice] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);

  const availableDevices = devices.filter(d => d.status !== 'sold');

  useEffect(() => {
    if (editingSale) {
      setDeviceId(editingSale.deviceId);
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

  // Calculate cost and profit
  const deviceCost = selectedDevice 
    ? selectedDevice.purchasePrice + selectedDevice.importExpenses + selectedDevice.shippingExpenses + selectedDevice.otherExpenses
    : 0;
  const salePriceNum = parseFloat(salePrice) || 0;
  const profit = salePriceNum - deviceCost;
  const profitMargin = deviceCost > 0 ? (profit / deviceCost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    // Save customer
    addOrUpdateCustomer(customerName, customerPhone, customerEmail || undefined, parseFloat(salePrice) || 0, saleDate);

    const sale: Sale = {
      id: editingSale?.id || generateId(),
      deviceId,
      imei: selectedDevice.imei,
      model: selectedDevice.model,
      color: selectedDevice.color,
      storage: selectedDevice.storage,
      lotId: selectedDevice.lotId,
      saleDate,
      salePrice: parseFloat(salePrice) || 0,
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
        {/* Device Selection */}
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
