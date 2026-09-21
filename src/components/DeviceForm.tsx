import { useState, useEffect } from 'react';
import { Device, Lot } from '../types';
import { IPHONE_MODELS, STORAGE_OPTIONS, COLOR_OPTIONS, generateId, getLotTotalQuantity } from '../store';
import { getColorsForModel } from '../iphoneColors';

interface Props {
  lots: Lot[];
  onSave: (device: Device) => void;
  editingDevice?: Device | null;
  onCancel: () => void;
}

export default function DeviceForm({ lots, onSave, editingDevice, onCancel }: Props) {
  const [imei, setImei] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [storage, setStorage] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [importExpenses, setImportExpenses] = useState('');
  const [shippingExpenses, setShippingExpenses] = useState('');
  const [otherExpenses, setOtherExpenses] = useState('');
  const [status, setStatus] = useState<Device['status']>('in_stock');
  const [lotId, setLotId] = useState('');
  const [notes, setNotes] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState('');

  useEffect(() => {
    if (editingDevice) {
      setImei(editingDevice.imei);
      setModel(editingDevice.model);
      setColor(editingDevice.color);
      setStorage(editingDevice.storage);
      setPurchaseDate(editingDevice.purchaseDate);
      setArrivalDate(editingDevice.arrivalDate);
      setPurchasePrice(editingDevice.purchasePrice.toString());
      setImportExpenses(editingDevice.importExpenses.toString());
      setShippingExpenses(editingDevice.shippingExpenses.toString());
      setOtherExpenses(editingDevice.otherExpenses.toString());
      setStatus(editingDevice.status);
      setLotId(editingDevice.lotId);
      setNotes(editingDevice.notes);
      setSalePrice(editingDevice.salePrice?.toString() || '');
      setSaleDate(editingDevice.saleDate || '');
    }
  }, [editingDevice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const device: Device = {
      id: editingDevice?.id || generateId(),
      imei,
      model,
      color,
      storage,
      purchaseDate,
      arrivalDate,
      purchasePrice: parseFloat(purchasePrice) || 0,
      importExpenses: parseFloat(importExpenses) || 0,
      shippingExpenses: parseFloat(shippingExpenses) || 0,
      otherExpenses: parseFloat(otherExpenses) || 0,
      status,
      lotId,
      notes,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      saleDate: saleDate || undefined,
      checked: editingDevice?.checked || false,
      checkDate: editingDevice?.checkDate || undefined,
    };
    onSave(device);
  };

  const handleLotSelect = (lotIdValue: string) => {
    setLotId(lotIdValue);
    if (lotIdValue) {
      const lot = lots.find(l => l.id === lotIdValue);
      if (lot) {
        setPurchaseDate(lot.purchaseDate);
        // If lot has only one model, auto-select it
        const items = lot.items || [];
        if (items.length === 1) {
          setModel(items[0].model);
        }
      }
    }
  };

  const getLotDescription = (lot: Lot) => {
    const items = lot.items || [];
    const itemsStr = items.map(i => `${i.quantity}x ${i.model}`).join(', ');
    return `${lot.name} - ${itemsStr}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingDevice ? 'Editar Dispositivo' : 'Agregar Dispositivo'}
        </h1>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Lot Selection */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            Asignar a Lote (opcional)
          </label>
          <select
            value={lotId}
            onChange={e => handleLotSelect(e.target.value)}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Sin lote</option>
            {lots.map(l => (
              <option key={l.id} value={l.id}>{getLotDescription(l)}</option>
            ))}
          </select>
        </div>

        {/* Device Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Dispositivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IMEI *</label>
              <input
                type="text"
                value={imei}
                onChange={e => setImei(e.target.value)}
                placeholder="Ej: 353456789012345"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar modelo</option>
                {IPHONE_MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color *
                {model && <span className="text-xs text-gray-500 ml-1">(Colores de {model})</span>}
              </label>
              <select
                value={color}
                onChange={e => setColor(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar color</option>
                {(model ? getColorsForModel(model) : COLOR_OPTIONS).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Almacenamiento *</label>
              <select
                value={storage}
                onChange={e => setStorage(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar almacenamiento</option>
                {STORAGE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Llegada</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={e => setArrivalDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Costs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Costos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Compra *</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gastos de Importación</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Gastos de Envío</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Otros Gastos</label>
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
          {(parseFloat(purchasePrice) > 0 || parseFloat(importExpenses) > 0 || parseFloat(shippingExpenses) > 0 || parseFloat(otherExpenses) > 0) && (
            <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-100">
              <p className="text-sm text-green-700">
                Costo total: <span className="font-bold">
                  ${((parseFloat(purchasePrice) || 0) + (parseFloat(importExpenses) || 0) + (parseFloat(shippingExpenses) || 0) + (parseFloat(otherExpenses) || 0)).toFixed(2)} MXN
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Status & Sale */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado y Venta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Device['status'])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in_transit">En Tránsito</option>
                <option value="received">Recibido</option>
                <option value="in_stock">En Stock</option>
                <option value="sold">Vendido</option>
              </select>
            </div>
            {status === 'sold' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Venta</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={e => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones adicionales..."
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
            {editingDevice ? 'Actualizar Dispositivo' : 'Agregar Dispositivo'}
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
    </div>
  );
}
