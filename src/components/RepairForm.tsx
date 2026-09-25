import { useState, useEffect } from 'react';
import { Repair, Customer } from '../types';
import { generateId } from '../store';
import { getAllBrands, getModelsByBrand, addCustomModel, addCustomBrand } from '../phoneModels';
import CustomerSelector from './CustomerSelector';

interface Props {
  onSave: (repair: Repair) => void;
  editingRepair?: Repair | null;
  onCancel: () => void;
}

export default function RepairForm({ onSave, editingRepair, onCancel }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [issueCategory, setIssueCategory] = useState('');
  const [diagnosticNotes, setDiagnosticNotes] = useState('');
  const [status, setStatus] = useState<Repair['status']>('pending');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyDays, setWarrantyDays] = useState('30');
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);

  useEffect(() => {
    if (editingRepair) {
      setCustomerName(editingRepair.customerName);
      setCustomerPhone(editingRepair.customerPhone);
      setCustomerEmail(editingRepair.customerEmail || '');
      setBrand(editingRepair.brand);
      setModel(editingRepair.model);
      setIssue(editingRepair.issue);
      setIssueCategory(editingRepair.issueCategory || '');
      setDiagnosticNotes(editingRepair.diagnosticNotes || '');
      setStatus(editingRepair.status);
      setEstimatedCost(editingRepair.estimatedCost?.toString() || '');
      setReceivedDate(editingRepair.receivedDate);
      setWarrantyDays(editingRepair.warrantyDays.toString());
    }
  }, [editingRepair]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const repair: Repair = {
      id: editingRepair?.id || generateId(),
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      brand,
      model,
      issue,
      issueCategory: issueCategory || undefined,
      diagnosticNotes: diagnosticNotes || undefined,
      status,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      receivedDate,
      warrantyDays: parseInt(warrantyDays),
    };

    onSave(repair);
  };

  const handleAddModel = () => {
    if (newModel && brand) {
      addCustomModel(brand, newModel);
      setModel(newModel);
      setNewModel('');
      setShowAddModel(false);
    }
  };

  const handleAddBrand = () => {
    if (newBrand) {
      addCustomBrand(newBrand);
      setBrand(newBrand);
      setNewBrand('');
      setShowAddBrand(false);
    }
  };

  const brands = getAllBrands();
  const models = brand ? getModelsByBrand(brand) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingRepair ? 'Editar Reparación' : 'Nueva Reparación'}
        </h1>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">{customerName}</p>
                  <p className="text-xs text-blue-700">📞 {customerPhone}</p>
                  {customerEmail && <p className="text-xs text-blue-700">✉️ {customerEmail}</p>}
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Device Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Dispositivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={brand}
                  onChange={e => { setBrand(e.target.value); setModel(''); }}
                  placeholder="Buscar o escribir marca..."
                  required
                  list="brands-list"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="brands-list">
                  {brands.map(b => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => setShowAddBrand(true)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  +
                </button>
              </div>
              {showAddBrand && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={e => setNewBrand(e.target.value)}
                    placeholder="Nueva marca"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBrand}
                    className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddBrand(false); setNewBrand(''); }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder={brand ? "Buscar o escribir modelo..." : "Selecciona una marca primero"}
                  required
                  disabled={!brand}
                  list="models-list"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <datalist id="models-list">
                  {models.map(m => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => setShowAddModel(true)}
                  disabled={!brand}
                  className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {showAddModel && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    placeholder="Nuevo modelo"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddModel}
                    className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddModel(false); setNewModel(''); }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Issue Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Reparación</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Problema *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {[
                  { id: 'cuenta_google', label: 'Cuenta Google', icon: '🔐' },
                  { id: 'pantalla', label: 'Pantalla', icon: '📱' },
                  { id: 'centro_carga', label: 'Centro de Carga', icon: '🔌' },
                  { id: 'liberacion_red', label: 'Liberación de Red', icon: '📡' },
                  { id: 'mojado', label: 'Mojado', icon: '💧' },
                  { id: 'bateria', label: 'Batería', icon: '🔋' },
                  { id: 'botones', label: 'Botones', icon: '🔘' },
                  { id: 'camara', label: 'Cámara', icon: '📷' },
                  { id: 'audio', label: 'Audio', icon: '🔊' },
                  { id: 'wifi', label: 'WiFi', icon: '📶' },
                  { id: 'software', label: 'Software', icon: '💻' },
                  { id: 'otro', label: 'Otro', icon: '⚙️' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setIssueCategory(cat.id);
                      setIssue(cat.label);
                    }}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                      issueCategory === cat.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg block mb-1">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Problema Reportado *</label>
              <textarea
                value={issue}
                onChange={e => setIssue(e.target.value)}
                placeholder="Describe el problema que reporta el cliente..."
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas de Diagnóstico</label>
              <textarea
                value={diagnosticNotes}
                onChange={e => setDiagnosticNotes(e.target.value)}
                placeholder="Notas técnicas, observaciones del diagnóstico..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Status and Cost */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado y Costo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Repair['status'])}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Proceso</option>
                <option value="completed">Completada</option>
                <option value="delivered">Entregada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado (MXN)</label>
              <input
                type="number"
                step="0.01"
                value={estimatedCost}
                onChange={e => setEstimatedCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Recepción *</label>
              <input
                type="date"
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días de Garantía</label>
              <input
                type="number"
                value={warrantyDays}
                onChange={e => setWarrantyDays(e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingRepair ? 'Actualizar Reparación' : 'Registrar Reparación'}
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
