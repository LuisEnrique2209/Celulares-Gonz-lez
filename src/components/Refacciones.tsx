import { useState } from 'react';
import { Refaccion } from '../types';
import { formatCurrency, formatDate, generateId, REFACCION_CATEGORIES } from '../store';

interface Props {
  refacciones: Refaccion[];
  onSave: (refaccion: Refaccion) => void;   // crea o actualiza
  onDelete: (id: string) => void;
}

const emptyForm = (): Refaccion => ({
  id: '',
  name: '',
  category: 'Baterías',
  brand: '',
  compatibleModels: '',
  quantity: 0,
  minStock: 0,
  costPrice: 0,
  salePrice: 0,
  supplier: '',
  location: '',
  notes: '',
  createdAt: new Date().toISOString(),
});

export default function Refacciones({ refacciones, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Refaccion>(emptyForm());
  const [isNew, setIsNew] = useState(true);

  // Todos los campos se leen con valor por defecto para evitar errores si
  // un documento viene incompleto desde Firestore.
  const list = Array.isArray(refacciones) ? refacciones : [];

  const filtered = list.filter(r => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      q === '' ||
      String(r.name || '').toLowerCase().includes(q) ||
      String(r.category || '').toLowerCase().includes(q) ||
      String(r.brand || '').toLowerCase().includes(q) ||
      String(r.compatibleModels || '').toLowerCase().includes(q) ||
      String(r.supplier || '').toLowerCase().includes(q) ||
      String(r.location || '').toLowerCase().includes(q);
    const matchCategory = filterCategory === '' || r.category === filterCategory;
    const qty = Number(r.quantity) || 0;
    const min = Number(r.minStock) || 0;
    const matchStock =
      filterStock === '' ||
      (filterStock === 'out' && qty <= 0) ||
      (filterStock === 'low' && qty > 0 && qty <= min) ||
      (filterStock === 'ok' && qty > min);
    return matchSearch && matchCategory && matchStock;
  });

  const totalItems = list.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const totalValue = list.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.costPrice) || 0),
    0
  );
  const lowCount = list.filter(r => (Number(r.quantity) || 0) > 0 && (Number(r.quantity) || 0) <= (Number(r.minStock) || 0)).length;
  const outCount = list.filter(r => (Number(r.quantity) || 0) <= 0).length;

  const categories = Array.from(new Set(list.map(r => r.category).filter(Boolean))).sort();

  const openNew = () => {
    setForm(emptyForm());
    setIsNew(true);
    setShowForm(true);
  };

  const openEdit = (r: Refaccion) => {
    setForm({ ...emptyForm(), ...r });
    setIsNew(false);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Escribe el nombre de la refacción');
      return;
    }
    const payload: Refaccion = {
      ...form,
      id: form.id || generateId(),
      quantity: Number(form.quantity) || 0,
      minStock: Number(form.minStock) || 0,
      costPrice: Number(form.costPrice) || 0,
      salePrice: Number(form.salePrice) || 0,
    };
    onSave(payload);
    setShowForm(false);
  };

  const adjustQty = (r: Refaccion, delta: number) => {
    const next = Math.max(0, (Number(r.quantity) || 0) + delta);
    onSave({ ...r, quantity: next });
  };

  const stockBadge = (r: Refaccion) => {
    const qty = Number(r.quantity) || 0;
    const min = Number(r.minStock) || 0;
    if (qty <= 0) return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 font-semibold">Agotado</span>;
    if (qty <= min) return <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-semibold">Stock bajo</span>;
    return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 font-semibold">Disponible</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Inventario de Refacciones</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Nueva refacción
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Catálogo</p>
          <p className="text-xl font-bold text-gray-900">{list.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Piezas en stock</p>
          <p className="text-xl font-bold text-blue-700">{totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Valor de inventario</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Por reponer</p>
          <p className="text-xl font-bold text-orange-600">{lowCount + outCount}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, modelo, proveedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStock}
            onChange={e => setFilterStock(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todo el stock</option>
            <option value="ok">Disponibles</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotados</option>
          </select>
        </div>
      </div>

      {/* Tabla desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Refacción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Compatible</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Existencias</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Costo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Venta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{r.name}</p>
                    {r.brand ? <p className="text-xs text-gray-500">{r.brand}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.compatibleModels || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjustQty(r, -1)} className="w-6 h-6 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">−</button>
                      <span className="text-sm font-bold text-gray-900 w-8 text-center">{Number(r.quantity) || 0}</span>
                      <button onClick={() => adjustQty(r, 1)} className="w-6 h-6 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{stockBadge(r)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(Number(r.costPrice) || 0)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(Number(r.salePrice) || 0)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.supplier || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(r)} className="text-gray-600 hover:text-gray-800 text-xs font-medium">Editar</button>
                      <button
                        onClick={() => { if (confirm('¿Eliminar esta refacción?')) onDelete(r.id); }}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards móvil */}
      <div className="lg:hidden space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{r.name}</h3>
                <p className="text-xs text-gray-500">{r.category}{r.brand ? ` • ${r.brand}` : ''}</p>
              </div>
              {stockBadge(r)}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div><span className="text-xs text-gray-500">Existencias:</span> <span className="font-bold">{Number(r.quantity) || 0}</span></div>
              <div><span className="text-xs text-gray-500">Mínimo:</span> <span className="font-medium">{Number(r.minStock) || 0}</span></div>
              <div><span className="text-xs text-gray-500">Costo:</span> <span className="font-medium">{formatCurrency(Number(r.costPrice) || 0)}</span></div>
              <div><span className="text-xs text-gray-500">Venta:</span> <span className="font-semibold">{formatCurrency(Number(r.salePrice) || 0)}</span></div>
            </div>
            {r.compatibleModels ? <p className="text-xs text-gray-500 mb-3">Compatible: {r.compatibleModels}</p> : null}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => adjustQty(r, -1)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100">−1</button>
              <button onClick={() => adjustQty(r, 1)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100">+1</button>
              <button onClick={() => openEdit(r)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100">Editar</button>
              <button
                onClick={() => { if (confirm('¿Eliminar esta refacción?')) onDelete(r.id); }}
                className="px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔩</span>
          </div>
          <p className="text-gray-500 text-lg font-medium">
            {list.length === 0 ? 'Aún no hay refacciones registradas' : 'No se encontraron refacciones con los filtros actuales'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {list.length === 0 ? 'Agrega baterías, pantallas y demás repuestos para llevar tu inventario' : 'Prueba con otros filtros'}
          </p>
          {list.length === 0 && (
            <button onClick={openNew} className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
              + Registrar refacción
            </button>
          )}
        </div>
      )}

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{isNew ? 'Nueva refacción' : 'Editar refacción'}</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Batería iPhone 11 / Pantalla iPhone 12 Pro..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {REFACCION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Marca / calidad</label>
                  <input
                    type="text"
                    value={form.brand || ''}
                    onChange={e => setForm({ ...form, brand: e.target.value })}
                    placeholder="Original, OEM, Genérica..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Modelos compatibles</label>
                  <input
                    type="text"
                    value={form.compatibleModels || ''}
                    onChange={e => setForm({ ...form, compatibleModels: e.target.value })}
                    placeholder="iPhone 11, 11 Pro, 11 Pro Max"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Existencias</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Stock mínimo (alerta)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStock}
                    onChange={e => setForm({ ...form, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Precio de compra</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Precio de venta</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salePrice}
                    onChange={e => setForm({ ...form, salePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={form.supplier || ''}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ubicación / estante</label>
                  <input
                    type="text"
                    value={form.location || ''}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="Vitrina 2, casillero B..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notas</label>
                  <textarea
                    value={form.notes || ''}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {!isNew && form.createdAt ? (
                <p className="text-xs text-gray-400">Registrada: {formatDate(form.createdAt)}</p>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
