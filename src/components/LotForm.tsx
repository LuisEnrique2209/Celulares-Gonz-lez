import { useState, useEffect } from 'react';
import { Lot, LotItem } from '../types';
import { IPHONE_MODELS, generateId, addSupplier } from '../store';
import SupplierSelector from './SupplierSelector';

interface Props {
  onSave: (lot: Lot) => void;
  editingLot?: Lot | null;
  onCancel: () => void;
}

export default function LotForm({ onSave, editingLot, onCancel }: Props) {
  const [name, setName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<LotItem[]>([{ model: '', quantity: 1, unitPrice: 0 }]);
  const [exchangeRate, setExchangeRate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [importExpenses, setImportExpenses] = useState('');
  const [shippingExpenses, setShippingExpenses] = useState('');
  const [otherExpenses, setOtherExpenses] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Lot['status']>('pending');
  const [showSupplierSelector, setShowSupplierSelector] = useState(false);

  useEffect(() => {
    if (editingLot) {
      setName(editingLot.name);
      setSupplier(editingLot.supplier);
      const lotItems = editingLot.items || [];
      setItems(lotItems.length > 0 ? lotItems : [{ model: '', quantity: 1, unitPrice: 0 }]);
      setExchangeRate(editingLot.exchangeRate?.toString() || '');
      setPurchaseDate(editingLot.purchaseDate);
      setArrivalDate(editingLot.arrivalDate);
      setImportExpenses(editingLot.importExpenses.toString());
      setShippingExpenses(editingLot.shippingExpenses.toString());
      setOtherExpenses(editingLot.otherExpenses.toString());
      setTrackingNumber(editingLot.trackingNumber);
      setNotes(editingLot.notes);
      setStatus(editingLot.status);
    }
  }, [editingLot]);

  const addItem = () => {
    setItems([...items, { model: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LotItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + (parseInt(String(item.quantity)) || 0), 0);
  const subtotalUSD = items.reduce((sum, item) => sum + ((parseInt(String(item.quantity)) || 0) * (parseFloat(String(item.unitPrice)) || 0)), 0);
  const rate = parseFloat(exchangeRate) || 0;
  const subtotalMXN = subtotalUSD * rate;
  const importExp = parseFloat(importExpenses) || 0;
  const shippingExp = parseFloat(shippingExpenses) || 0;
  const otherExp = parseFloat(otherExpenses) || 0;
  const extraExpenses = importExp + shippingExp + otherExp; // Ya están en MXN
  const totalCost = subtotalMXN + extraExpenses;
  const costPerUnit = totalQuantity > 0 ? totalCost / totalQuantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(item => item.model && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Agrega al menos un modelo con cantidad');
      return;
    }
    if (!rate || rate <= 0) {
      alert('Ingresa el tipo de cambio');
      return;
    }

    // Save supplier to list
    if (supplier) {
      addSupplier(supplier);
    }

    const lot: Lot = {
      id: editingLot?.id || generateId(),
      name,
      supplier,
      items: validItems,
      totalPrice: subtotalUSD, // Precio en USD
      exchangeRate: rate,
      purchaseDate,
      arrivalDate,
      importExpenses: importExp,
      shippingExpenses: shippingExp,
      otherExpenses: otherExp,
      trackingNumber,
      notes,
      status,
    };
    onSave(lot);
  };

  const formatMXN = (amount: number) => {
    return amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingLot ? 'Editar Lote' : 'Agregar Lote'}
        </h1>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Lot Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Lote</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Lote *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Lote Enero 2024"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  placeholder="Nombre del proveedor"
                  required
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSupplierSelector(true)}
                  className="px-3 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                  title="Seleccionar proveedor"
                >
                  🏭
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💱</span>
            <h3 className="text-lg font-semibold text-amber-900">Tipo de Cambio</h3>
          </div>
          <p className="text-sm text-amber-700 mb-3">
            Ingresa el tipo de cambio del día. Los precios de los iPhones se ingresan en USD y se convierten automáticamente a MXN. Los gastos extras (importación, envío) ya se consideran en MXN.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-amber-700 mb-1 font-medium">Tipo de Cambio (USD → MXN) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={exchangeRate}
                onChange={e => setExchangeRate(e.target.value)}
                placeholder="Ej: 17.50"
                required
                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
            {rate > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-lg border border-amber-300">
                <span className="text-sm text-amber-800 font-medium">$1 USD = ${formatMXN(rate)} MXN</span>
              </div>
            )}
          </div>
        </div>

        {/* Items - Multiple Models with Price */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Modelos, Cantidad y Precio (USD)</h3>
              <p className="text-sm text-gray-500">Los precios se ingresan en USD y se convierten a MXN con el tipo de cambio</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              + Agregar Modelo
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const itemTotalUSD = (parseInt(String(item.quantity)) || 0) * (parseFloat(String(item.unitPrice)) || 0);
              const itemTotalMXN = itemTotalUSD * rate;
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4">
                      <label className="block text-xs text-gray-500 mb-1">Modelo</label>
                      <select
                        value={item.model}
                        onChange={e => updateItem(index, 'model', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Seleccionar modelo</option>
                        {IPHONE_MODELS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Precio c/u (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                      <div className="space-y-0.5">
                        <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
                          USD: ${formatUSD(itemTotalUSD)}
                        </div>
                        {rate > 0 && (
                          <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-800">
                            MXN: ${formatMXN(itemTotalMXN)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar modelo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary of items */}
          {items.filter(i => i.model && i.quantity > 0).length > 0 && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm font-semibold text-blue-800 mb-2">Resumen del Lote:</p>
              <div className="space-y-1">
                {items.filter(i => i.model && i.quantity > 0).map((item, idx) => {
                  const itemTotalUSD = (parseInt(String(item.quantity)) || 0) * (parseFloat(String(item.unitPrice)) || 0);
                  const itemTotalMXN = itemTotalUSD * rate;
                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">
                        {item.quantity}x {item.model} @ ${formatUSD(item.unitPrice)} USD c/u
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-blue-800">${formatUSD(itemTotalUSD)} USD</span>
                        {rate > 0 && (
                          <span className="block text-xs text-green-700">= ${formatMXN(itemTotalMXN)} MXN</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Subtotal dispositivos ({totalQuantity} unidades)</span>
                  <span className="font-semibold text-blue-800">${formatUSD(subtotalUSD)} USD</span>
                </div>
                {rate > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">Subtotal en MXN</span>
                    <span className="font-bold text-green-800">${formatMXN(subtotalMXN)} MXN</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas y Rastreo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra *</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada de Llegada</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={e => setArrivalDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Rastreo</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="Tracking number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Extra Expenses (in MXN) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gastos Extras del Lote (en MXN)</h3>
          <p className="text-sm text-gray-500 mb-3">Estos gastos ya están en pesos mexicanos y se suman al subtotal convertido.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gastos de Importación (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={importExpenses}
                onChange={e => setImportExpenses(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gastos de Envío (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={shippingExpenses}
                onChange={e => setShippingExpenses(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Otros Gastos (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={otherExpenses}
                onChange={e => setOtherExpenses(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-3">Resumen de Inversión</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Subtotal dispositivos ({totalQuantity} unidades)</span>
              <div className="text-right">
                <span className="font-semibold text-green-800">${formatUSD(subtotalUSD)} USD</span>
                {rate > 0 && (
                  <span className="block text-xs text-green-600">= ${formatMXN(subtotalMXN)} MXN</span>
                )}
              </div>
            </div>
            {extraExpenses > 0 && (
              <>
                {importExp > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">+ Importación</span>
                    <span className="text-green-800">${formatMXN(importExp)} MXN</span>
                  </div>
                )}
                {shippingExp > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">+ Envío</span>
                    <span className="text-green-800">${formatMXN(shippingExp)} MXN</span>
                  </div>
                )}
                {otherExp > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">+ Otros gastos</span>
                    <span className="text-green-800">${formatMXN(otherExp)} MXN</span>
                  </div>
                )}
              </>
            )}
            <div className="pt-2 border-t border-green-200 flex items-center justify-between">
              <span className="text-base font-bold text-green-900">Inversión Total</span>
              <span className="text-xl font-bold text-green-900">${formatMXN(totalCost)} MXN</span>
            </div>
            {totalQuantity > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">Costo promedio por unidad</span>
                <span className="font-semibold text-green-800">${formatMXN(costPerUnit)} MXN</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'pending', label: 'Pendiente' },
              { value: 'in_transit', label: 'En Tránsito' },
              { value: 'received', label: 'Recibido' },
              { value: 'partial', label: 'Parcial' },
            ].map(s => (
              <label
                key={s.value}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  status === s.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="lotStatus"
                  value={s.value}
                  checked={status === s.value}
                  onChange={e => setStatus(e.target.value as Lot['status'])}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones adicionales sobre el lote..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingLot ? 'Actualizar Lote' : 'Crear Lote'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Supplier Selector Modal */}
      <SupplierSelector
        isOpen={showSupplierSelector}
        onClose={() => setShowSupplierSelector(false)}
        onSelect={(selectedSupplier: string) => {
          setSupplier(selectedSupplier);
        }}
      />
    </div>
  );
}
