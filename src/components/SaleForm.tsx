import { useState, useEffect } from 'react';
import { Sale, Device, Lot, Customer, Part, SoldPartItem, PartCategory } from '../types';
import { generateId, formatCurrency, getCustomers, addOrUpdateCustomer, getParts, applyPartsSale, restorePartsStock, PART_CATEGORY_LABELS } from '../store';

const categoryIcon = (c: PartCategory) => c === 'battery' ? '🔋' : c === 'screen' ? '📱' : '🔩';
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

  // Refacciones vendidas en esta venta
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [soldParts, setSoldParts] = useState<SoldPartItem[]>([]);
  const [partToAdd, setPartToAdd] = useState('');
  const [partQty, setPartQty] = useState('1');

  const availableDevices = devices.filter(d => d.status !== 'sold');

  useEffect(() => {
    setAllParts(getParts());
  }, []);

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
      setSoldParts(editingSale.soldParts || []);
    } else {
      setSoldParts([]);
    }
  }, [editingSale]);

  // Stock disponible considerando lo reservado por la venta que estoy editando
  const reservedInEditing = new Map((editingSale?.soldParts || []).map(p => [p.partId, p.quantity]));

  const addPartToSale = () => {
    const part = allParts.find(p => p.id === partToAdd);
    if (!part) return;
    const qty = Math.max(1, parseInt(partQty) || 1);
    const already = soldParts.find(s => s.partId === part.id)?.quantity || 0;
    const maxAvail = part.quantity + (editingSale ? (reservedInEditing.get(part.id) || 0) : 0);
    if (already + qty > maxAvail) {
      alert(`Solo hay ${Math.max(0, maxAvail - already)} unidad(es) disponibles de "${part.name}"`);
      return;
    }
    if (already > 0) {
      setSoldParts(soldParts.map(s => s.partId === part.id ? { ...s, quantity: s.quantity + qty } : s));
    } else {
      setSoldParts([...soldParts, {
        partId: part.id,
        name: part.name,
        category: part.category,
        model: part.model,
        quantity: qty,
        unitCost: part.costPrice,
        unitPrice: part.salePrice,
      }]);
    }
    setPartToAdd('');
    setPartQty('1');
  };

  const removePartFromSale = (partId: string) => {
    setSoldParts(soldParts.filter(s => s.partId !== partId));
  };

  const updatePartQtyInSale = (partId: string, qty: number) => {
    if (qty < 1) { removePartFromSale(partId); return; }
    const part = allParts.find(p => p.id === partId);
    const current = soldParts.find(s => s.partId === partId)?.quantity || 0;
    const maxAvail = part ? part.quantity + current + (editingSale ? (reservedInEditing.get(partId) || 0) : 0) : 0;
    if (qty > maxAvail) { alert(`No hay suficiente stock de "${part?.name}" (máx: ${maxAvail})`); return; }
    setSoldParts(soldParts.map(s => s.partId === partId ? { ...s, quantity: qty } : s));
  };

  // Totales de refacciones
  const partsRevenue = soldParts.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
  const partsCost = soldParts.reduce((sum, p) => sum + p.unitCost * p.quantity, 0);

  const selectedDevice = devices.find(d => d.id === deviceId);

  // Calculate cost and profit
  const deviceCost = selectedDevice 
    ? selectedDevice.purchasePrice + selectedDevice.importExpenses + selectedDevice.shippingExpenses + selectedDevice.otherExpenses
    : 0;
  const salePriceNum = parseFloat(salePrice) || 0;
  const totalRevenue = salePriceNum + partsRevenue;
  const totalCost = deviceCost + partsCost;
  const profit = totalRevenue - totalCost;
  const profitMargin = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    // Validar y descontar existencias de refacciones
    if (editingSale) {
      for (const item of soldParts) {
        const part = getParts().find(p => p.id === item.partId);
        const prevReserved = reservedInEditing.get(item.partId) || 0;
        const avail = (part?.quantity || 0) + prevReserved;
        if (!part || item.quantity > avail) {
          alert(`Stock insuficiente de "${item.name}". Disponible: ${Math.max(0, avail)}`);
          return;
        }
      }
    } else if (soldParts.length > 0) {
      if (!applyPartsSale(soldParts)) {
        alert('El stock de alguna refacción no es suficiente. Revisa el inventario.');
        return;
      }
    }

    // Save customer (incluye refacciones en el total gastado)
    addOrUpdateCustomer(customerName, customerPhone, customerEmail || undefined, totalRevenue, saleDate);

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
      partsRevenue: partsRevenue > 0 ? partsRevenue : undefined,
      soldParts: soldParts.length > 0 ? soldParts : undefined,
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
                      <p className="text-xs text-gray-600">Total Cobrado</p>
                      <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-500">Teléfono: ${salePriceNum.toLocaleString('es-MX')}</p>
                      {partsRevenue > 0 && <p className="text-xs text-orange-600">Refacciones: ${partsRevenue.toLocaleString('es-MX')}</p>}
                      <p className="text-xs text-gray-500">- Costo total: ${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
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

        {/* Refacciones vendidas */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">🔧 Refacciones (baterías, pantallas, etc.)</h3>
          <p className="text-xs text-gray-500 mb-4">Agrega refacciones que se venden o instalan en esta venta. El stock se descuenta automáticamente del inventario de refacciones.</p>

          {allParts.length === 0 ? (
            <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm font-medium">Aún no tienes refacciones registradas</p>
              <p className="text-xs text-yellow-700 mt-1">Ve a Inventario → 🔩 Refacciones para dar de alta baterías y pantallas</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_auto] gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refacción disponible</label>
                  <select
                    value={partToAdd}
                    onChange={e => setPartToAdd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Seleccionar refacción</option>
                    {allParts.filter(p => p.quantity + (editingSale ? (reservedInEditing.get(p.id) || 0) : 0) > (soldParts.find(s => s.partId === p.id)?.quantity || 0)).map(p => (
                      <option key={p.id} value={p.id}>
                        {categoryIcon(p.category)} {p.name} ({PART_CATEGORY_LABELS[p.category]} · {p.model}) — {p.quantity + (editingSale ? (reservedInEditing.get(p.id) || 0) : 0)} disp. · ${p.salePrice.toLocaleString('es-MX')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={partQty}
                    onChange={e => setPartQty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addPartToSale}
                  disabled={!partToAdd}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-40"
                >
                  + Agregar
                </button>
              </div>

              {soldParts.length > 0 && (
                <div className="mt-4 space-y-2">
                  {soldParts.map(sp => (
                    <div key={sp.partId} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{categoryIcon(sp.category)}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{sp.name}</p>
                          <p className="text-xs text-gray-600">{sp.model} · ${sp.unitPrice.toLocaleString('es-MX')} c/u</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => updatePartQtyInSale(sp.partId, sp.quantity - 1)} className="w-7 h-7 rounded-full bg-white border border-orange-300 text-orange-700 font-bold hover:bg-orange-100">−</button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{sp.quantity}</span>
                          <button type="button" onClick={() => updatePartQtyInSale(sp.partId, sp.quantity + 1)} className="w-7 h-7 rounded-full bg-white border border-orange-300 text-orange-700 font-bold hover:bg-orange-100">+</button>
                        </div>
                        <span className="text-sm font-bold text-orange-700 w-24 text-right">${(sp.unitPrice * sp.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        <button type="button" onClick={() => removePartFromSale(sp.partId)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                    <span className="text-sm font-semibold text-gray-700">Subtotal refacciones:</span>
                    <span className="text-base font-bold text-orange-700">${partsRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>
              )}
            </>
          )}
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
