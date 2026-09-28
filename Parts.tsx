import { useState } from 'react';
import { Part, PartCategory } from '../types';
import { formatCurrency, formatDate, IPHONE_MODELS, PART_CATEGORY_LABELS } from '../store';

interface Props {
  parts: Part[];
  onSave: (part: Part) => void;
  onDelete: (id: string) => void;
}

const emptyForm = {
  name: '',
  category: 'battery' as PartCategory,
  model: '',
  sku: '',
  supplier: '',
  quantity: '',
  minStock: '5',
  costPrice: '',
  salePrice: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function Parts({ parts, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filteredParts = parts.filter(p => {
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === '' || p.category === filterCategory;
    const matchModel = filterModel === '' || p.model === filterModel;
    return matchSearch && matchCategory && matchModel;
  });

  // Resumen
  const totalItems = parts.reduce((s, p) => s + p.quantity, 0);
  const totalInvested = parts.reduce((s, p) => s + p.quantity * p.costPrice, 0);
  const lowStockCount = parts.filter(p => p.quantity <= p.minStock).length;

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      battery: 'bg-green-100 text-green-700 border-green-200',
      screen: 'bg-blue-100 text-blue-700 border-blue-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const icons: Record<string, string> = {
      battery: '🔋',
      screen: '📺',
      other: '⚙️',
    };
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium ${styles[category] || styles.other}`}>
        {icons[category] || '⚙️'} {PART_CATEGORY_LABELS[category] || category}
      </span>
    );
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPart(null);
    setShowForm(false);
  };

  const openEdit = (part: Part) => {
    setEditingPart(part);
    setForm({
      name: part.name,
      category: part.category,
      model: part.model,
      sku: part.sku || '',
      supplier: part.supplier || '',
      quantity: String(part.quantity),
      minStock: String(part.minStock),
      costPrice: String(part.costPrice),
      salePrice: String(part.salePrice),
      purchaseDate: part.purchaseDate || '',
      notes: part.notes || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.model) {
      alert('El nombre y el modelo compatible son obligatorios.');
      return;
    }
    const quantity = parseInt(form.quantity) || 0;
    if (quantity <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }
    const part: Part = {
      id: editingPart ? editingPart.id : (Date.now().toString(36) + Math.random().toString(36).substr(2)),
      name: form.name.trim(),
      category: form.category,
      model: form.model,
      sku: form.sku.trim() || undefined,
      supplier: form.supplier.trim() || undefined,
      quantity,
      minStock: parseInt(form.minStock) || 0,
      costPrice: parseFloat(form.costPrice) || 0,
      salePrice: parseFloat(form.salePrice) || 0,
      purchaseDate: form.purchaseDate,
      notes: form.notes.trim() || undefined,
    };
    onSave(part);
    resetForm();
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refacciones</h1>
          <p className="text-sm text-gray-500 mt-1">Baterías, pantallas y demás repuestos para tu taller</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Agregar Refacción
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase">SKUs</p>
          <p className="text-xl font-bold text-gray-900">{parts.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase">Piezas en stock</p>
          <p className="text-xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase">Inversión</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
        </div>
        <div className={`rounded-xl shadow-sm border p-4 ${lowStockCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
          <p className="text-xs text-gray-500 uppercase">Stock bajo</p>
          <p className={`text-xl font-bold ${lowStockCount > 0 ? 'text-orange-700' : 'text-gray-900'}`}>{lowStockCount}</p>
        </div>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {editingPart ? `Editar: ${editingPart.name}` : 'Nueva Refacción'}
            </h2>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-sm">
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Batería iPhone 13 (NK) / Pantalla OLED iPhone 12"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as PartCategory })}
                className={inputCls}
              >
                <option value="battery">🔋 Batería</option>
                <option value="screen">📺 Pantalla</option>
                <option value="other">⚙️ Otra</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Modelo compatible *</label>
              <select
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                className={inputCls}
              >
                <option value="">Selecciona modelo...</option>
                {IPHONE_MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SKU / Clave</label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                placeholder="Opcional"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
              <input
                type="text"
                value={form.supplier}
                onChange={e => setForm({ ...form, supplier: e.target.value })}
                placeholder="Opcional"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Existencia mínima</label>
              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={e => setForm({ ...form, minStock: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de compra</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Costo unitario (MXN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={e => setForm({ ...form, costPrice: e.target.value })}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio venta refacción (MXN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={e => setForm({ ...form, salePrice: e.target.value })}
                placeholder="0.00"
                className={inputCls}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Calidad, garantía del proveedor, etc. (opcional)"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingPart ? 'Guardar cambios' : 'Agregar refacción'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o proveedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={inputCls}
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className={inputCls}
          >
            <option value="">Todas las categorías</option>
            <option value="battery">🔋 Baterías</option>
            <option value="screen">📺 Pantallas</option>
            <option value="other">⚙️ Otras</option>
          </select>
          <select
            value={filterModel}
            onChange={e => setFilterModel(e.target.value)}
            className={inputCls}
          >
            <option value="">Todos los modelos</option>
            {IPHONE_MODELS.map(m => (
              <option key={m} value={m}>{m}</option>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Refacción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Compatible</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Costo U.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Venta U.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Ganancia U.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Compra</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredParts.map(part => {
                const lowStock = part.quantity <= part.minStock;
                const margin = part.salePrice - part.costPrice;
                return (
                  <tr key={part.id} className={`hover:bg-gray-50 transition-colors ${lowStock ? 'bg-orange-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{part.name}</p>
                      {part.sku && <p className="text-xs text-gray-400 font-mono">{part.sku}</p>}
                    </td>
                    <td className="px-4 py-3">{getCategoryBadge(part.category)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{part.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{part.supplier || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-bold ${lowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                        {part.quantity}
                        {lowStock && <span title={`Stock bajo (mín. ${part.minStock})`}>⚠️</span>}
                      </span>
                      <p className="text-[10px] text-gray-400">mín. {part.minStock}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(part.costPrice)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(part.salePrice)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(margin)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(part.purchaseDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(part)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${part.name}" del inventario de refacciones?`)) onDelete(part.id);
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
        {filteredParts.map(part => {
          const lowStock = part.quantity <= part.minStock;
          const margin = part.salePrice - part.costPrice;
          return (
            <div key={part.id} className={`bg-white rounded-xl shadow-sm border p-4 ${lowStock ? 'border-orange-200' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">{part.name}</h3>
                  <p className="text-xs text-gray-500">{part.model}{part.sku ? ` • ${part.sku}` : ''}</p>
                </div>
                {getCategoryBadge(part.category)}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Stock:</span>
                  <p className={`font-bold ${lowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                    {part.quantity} {lowStock && '⚠️ (mín. ' + part.minStock + ')'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Proveedor:</span>
                  <p className="font-medium text-gray-900">{part.supplier || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Costo:</span>
                  <p className="font-medium text-gray-900">{formatCurrency(part.costPrice)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Venta:</span>
                  <p className="font-medium text-gray-900">{formatCurrency(part.salePrice)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500">Ganancia por pieza:</span>
                  <p className={`font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(margin)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openEdit(part)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${part.name}" del inventario de refacciones?`)) onDelete(part.id);
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

      {filteredParts.length === 0 && (
        <div className="text-center py-12">
          {parts.length === 0 ? (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🔧
              </div>
              <p className="text-gray-500 text-lg font-medium">Aún no tienes refacciones en inventario</p>
              <p className="text-gray-400 text-sm mt-2 mb-4">Empieza surtiéndote de baterías y pantallas para tus reparaciones</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Agregar mi primera refacción
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🔍
              </div>
              <p className="text-gray-500 text-lg font-medium">No se encontraron refacciones con los filtros actuales</p>
              <button
                onClick={() => { setSearch(''); setFilterCategory(''); setFilterModel(''); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
