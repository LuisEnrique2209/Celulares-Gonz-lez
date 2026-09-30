import { useState } from 'react';
import { Refaccion, REFACCION_QUALITIES } from '../types';
import {
  formatCurrency,
  formatDate,
  generateId,
  REFACCION_CATEGORIES,
  refaccionBasePrice,
  calcTallerPrice,
  calcMercadoLibrePrice,
  tallerPrice,
  mercadoLibrePrice,
  buildRefaccionName,
  getSuppliers,
  registerSupplier,
} from '../store';
import { REFACCION_MODEL_BRANDS, getRefaccionModelsByBrand } from '../phoneModels';

interface Props {
  refacciones: Refaccion[];
  onSave: (refaccion: Refaccion) => void;   // crea o actualiza
  onDelete: (id: string) => void;
}

const emptyForm = (): Refaccion => ({
  id: '',
  name: '',
  category: 'Baterías',
  brand: 'Diagnostico', // calidad: Diagnostico | Original
  compatibleModels: '',
  quantity: 0,
  minStock: 0,
  costPrice: 0,
  salePrice: 0,
  supplier: '',
  location: '',
  notes: '',
  createdAt: new Date().toISOString(),
  suggestedTallerPrice: 0,
  suggestedMercadoLibrePrice: 0,
});

export default function Refacciones({ refacciones, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Refaccion>(emptyForm());
  const [isNew, setIsNew] = useState(true);
  // ---- Búsqueda de modelos compatibles (marca → modelo) ----
  const [modelBrand, setModelBrand] = useState('Apple');
  const [modelSearch, setModelSearch] = useState('');
  // El nombre se genera solo (categoría + modelo + calidad), pero se puede
  // escribir uno a mano con esta opción.
  const [manualName, setManualName] = useState(false);
  const [customName, setCustomName] = useState('');

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
    setModelBrand('Apple');
    setModelSearch('');
    setManualName(false);
    setCustomName('');
    setShowForm(true);
  };

  const openEdit = (r: Refaccion) => {
    // Si el registro no trae precios sugeridos (documentos antiguos), se
    // calculan con las fórmulas del negocio al abrir el formulario.
    const base = refaccionBasePrice(r);
    setForm({
      ...emptyForm(),
      ...r,
      suggestedTallerPrice: tallerPrice(r, base),
      suggestedMercadoLibrePrice: mercadoLibrePrice(r, base),
    });
    setIsNew(false);
    // Preselecciona la marca según los modelos ya guardados
    const firstModel = String(r.compatibleModels || '').split(',')[0].trim();
    const detected = REFACCION_MODEL_BRANDS.find(b =>
      getRefaccionModelsByBrand(b.brand).some(m => firstModel.toLowerCase() === m.toLowerCase())
    );
    setModelBrand(detected ? detected.brand : 'Apple');
    setModelSearch('');
    setManualName(false);
    setCustomName(r.name || '');
    setShowForm(true);
  };

  // ---- Modelos compatibles: búsqueda por marca y modelo ----
  const selectedModels = String(form.compatibleModels || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const brandModels = getRefaccionModelsByBrand(modelBrand);
  const modelQuery = modelSearch.trim().toLowerCase();
  const filteredModels = brandModels.filter(m => m.toLowerCase().includes(modelQuery));

  const toggleModel = (model: string) => {
    const current = String(form.compatibleModels || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const exists = current.some(m => m.toLowerCase() === model.toLowerCase());
    const next = exists ? current.filter(m => m.toLowerCase() !== model.toLowerCase()) : [...current, model];
    setForm(prev => ({ ...prev, compatibleModels: next.join(', ') }));
  };

  const clearModels = () => setForm(prev => ({ ...prev, compatibleModels: '' }));

  // Nombre automático: Categoría + Modelo compatible + Calidad
  const autoName = buildRefaccionName(form.category, form.compatibleModels, form.brand);
  const finalName = manualName ? customName.trim() : autoName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalName) {
      alert('Elige un modelo compatible para generar el nombre de la refacción');
      return;
    }
    const cost = Number(form.costPrice) || 0;
    const sale = Number(form.salePrice) || 0;
    if (cost <= 0 && sale <= 0) {
      alert('Captura al menos uno de los dos precios: precio de compra O precio de venta.\nCon cualquiera de los dos se calculan automáticamente los precios de Taller y Mercado Libre.');
      return;
    }
    // Uno solo precio: si capturas compra y dejaste venta vacía → venta = compra
    // (así nunca queda "0" en el catálogo); si solo capturas venta → costo 0.
    const resolvedCost = cost > 0 ? cost : 0;
    const resolvedSale = sale > 0 ? sale : cost > 0 ? cost : 0;
    const base = resolvedSale > 0 ? resolvedSale : resolvedCost;
    const payload: Refaccion = {
      ...form,
      id: form.id || generateId(),
      name: finalName,
      quantity: Number(form.quantity) || 0,
      minStock: Number(form.minStock) || 0,
      costPrice: resolvedCost,
      salePrice: resolvedSale,
      // Precios sugeridos: se conservan los editados a mano y si están vacíos
      // se calculan con las reglas del negocio.
      suggestedTallerPrice:
        Number(form.suggestedTallerPrice) > 0
          ? Number(form.suggestedTallerPrice)
          : calcTallerPrice(base),
      suggestedMercadoLibrePrice:
        Number(form.suggestedMercadoLibrePrice) > 0
          ? Number(form.suggestedMercadoLibrePrice)
          : calcMercadoLibrePrice(base),
    };
    // El proveedor se guarda automáticamente para futuras compras
    registerSupplier(payload.supplier);
    onSave(payload);
    setShowForm(false);
  };

  // ---- Precios sugeridos en el formulario ----
  // Precio base usado para las fórmulas (precio de venta, o costo si no hay venta)
  const formBase = refaccionBasePrice(form);
  const autoTaller = calcTallerPrice(formBase);
  const autoML = calcMercadoLibrePrice(formBase);

  /** Cambia el precio de venta/costo y recalcula automáticamente las sugerencias */
  const setSalePriceValue = (value: number) => {
    setForm(prev => {
      const next = { ...prev, salePrice: value };
      const base = refaccionBasePrice(next);
      return {
        ...next,
        suggestedTallerPrice: calcTallerPrice(base),
        suggestedMercadoLibrePrice: calcMercadoLibrePrice(base),
      };
    });
  };

  const setCostPriceValue = (value: number) => {
    setForm(prev => {
      const next = { ...prev, costPrice: value };
      // Si no hay precio de venta, el costo es la base de las sugerencias
      if (!(Number(next.salePrice) || 0)) {
        const base = refaccionBasePrice(next);
        return {
          ...next,
          suggestedTallerPrice: calcTallerPrice(base),
          suggestedMercadoLibrePrice: calcMercadoLibrePrice(base),
        };
      }
      return next;
    });
  };

  /** Recalcula ambas sugerencias con las fórmulas (descarta ediciones manuales) */
  const recalcSuggested = () => {
    setForm(prev => ({
      ...prev,
      suggestedTallerPrice: calcTallerPrice(refaccionBasePrice(prev)),
      suggestedMercadoLibrePrice: calcMercadoLibrePrice(refaccionBasePrice(prev)),
    }));
  };

  const tallerEdited = Number(form.suggestedTallerPrice) > 0 && Number(form.suggestedTallerPrice) !== autoTaller;
  const mlEdited = Number(form.suggestedMercadoLibrePrice) > 0 && Number(form.suggestedMercadoLibrePrice) !== autoML;

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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Taller (×1.30)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Mercado Libre</th>
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
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-orange-700">{formatCurrency(tallerPrice(r))}</p>
                    <p className="text-[10px] text-gray-400">precio × 1.30</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-sky-700">{formatCurrency(mercadoLibrePrice(r))}</p>
                    <p className="text-[10px] text-gray-400">(precio × 1.25 + 59.60) ÷ 0.7145</p>
                  </td>
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
              <div><span className="text-xs text-orange-600">🔧 Taller (×1.30):</span> <span className="font-semibold text-orange-700">{formatCurrency(tallerPrice(r))}</span></div>
              <div><span className="text-xs text-sky-600">🛒 Mercado Libre:</span> <span className="font-semibold text-sky-700">{formatCurrency(mercadoLibrePrice(r))}</span></div>
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
                {/* Nombre automático: Categoría + Modelo compatible + Calidad */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nombre (se genera automáticamente)
                  </label>
                  {manualName ? (
                    <input
                      type="text"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="Escribe el nombre a mano…"
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 font-medium min-h-[38px]">
                      {autoName || 'Selecciona un modelo compatible para generar el nombre'}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-gray-400">
                      Fórmula: categoría + modelo compatible + calidad. Ej: «Batería iPhone 13 Diagnostico»
                    </p>
                    <button
                      type="button"
                      onClick={() => { if (!manualName) setCustomName(autoName); setManualName(!manualName); }}
                      className="text-[11px] text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap ml-2"
                    >
                      {manualName ? '↩ Usar nombre automático' : '✏️ Escribir nombre a mano'}
                    </button>
                  </div>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Calidad *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REFACCION_QUALITIES.map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, brand: q }))}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                          form.brand === q
                            ? q === 'Original'
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {q === 'Original' ? 'Original' : 'Diagnóstico'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modelos compatibles: búsqueda por marca → modelo (iPhone 12 en adelante) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Modelos compatibles * <span className="font-normal text-gray-400">(busca por marca y modelo)</span>
                  </label>
                  <div className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={modelBrand}
                        onChange={e => { setModelBrand(e.target.value); setModelSearch(''); }}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {REFACCION_MODEL_BRANDS.map(b => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
                      </select>
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={e => setModelSearch(e.target.value)}
                        placeholder={modelBrand === 'Apple' ? 'Buscar modelo (ej: 13 Pro)…' : 'Buscar modelo…'}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    {modelBrand === 'Apple' && (
                      <p className="text-[11px] text-gray-400">
                        📱 Solo se muestran iPhones del 12 hacia arriba.
                      </p>
                    )}
                    <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2">
                      {filteredModels.length === 0 && (
                        <p className="text-xs text-gray-400 py-1">No hay modelos que coincidan con la búsqueda.</p>
                      )}
                      {filteredModels.map(m => {
                        const active = selectedModels.some(s => s.toLowerCase() === m.toLowerCase());
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => toggleModel(m)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                              active
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                            }`}
                          >
                            {active ? '✓ ' : ''}{m}
                          </button>
                        );
                      })}
                    </div>
                    {selectedModels.length > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                          Seleccionados: <b>{selectedModels.join(', ')}</b>
                        </p>
                        <button
                          type="button"
                          onClick={clearModels}
                          className="text-xs text-red-500 hover:text-red-700 font-medium ml-2 whitespace-nowrap"
                        >
                          Limpiar
                        </button>
                      </div>
                    )}
                  </div>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Precio de compra (costo)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice || ''}
                    placeholder="Opcional — captura solo uno de los dos"
                    onChange={e => setCostPriceValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-300"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Si solo capturas este precio, las sugerencias se calculan con él.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Precio de venta</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salePrice || ''}
                    placeholder="Opcional — captura solo uno de los dos"
                    onChange={e => setSalePriceValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-300"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Con este precio (o con el de compra si está vacío) se calculan Taller y Mercado Libre.
                  </p>
                </div>

                {/* Precios sugeridos por canal */}
                <div className="md:col-span-2 bg-gradient-to-r from-orange-50 to-sky-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-800">💡 Precios sugeridos por canal de venta</h4>
                    <button
                      type="button"
                      onClick={recalcSuggested}
                      className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                    >
                      ↺ Recalcular
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-orange-700 mb-1">🔧 Taller — precio × 1.30</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.suggestedTallerPrice ?? autoTaller}
                        onChange={e => setForm({ ...form, suggestedTallerPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      {tallerEdited ? (
                        <p className="text-[11px] text-orange-600 mt-1">Editado a mano (la fórmula da {formatCurrency(autoTaller)})</p>
                      ) : (
                        <p className="text-[11px] text-gray-500 mt-1">Calculado automáticamente</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-sky-700 mb-1">🛒 Mercado Libre — (precio × 1.25 + 59.60) ÷ 0.7145</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.suggestedMercadoLibrePrice ?? autoML}
                        onChange={e => setForm({ ...form, suggestedMercadoLibrePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-sky-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      {mlEdited ? (
                        <p className="text-[11px] text-sky-600 mt-1">Editado a mano (la fórmula da {formatCurrency(autoML)})</p>
                      ) : (
                        <p className="text-[11px] text-gray-500 mt-1">Calculado automáticamente (incluye comisión de ML)</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3">
                    Estos precios se aplican solos al registrar la venta en <b>Ventas → Refacción</b>, según el canal que marques.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Proveedor</label>
                  <input
                    type="text"
                    list="refaccion-suppliers"
                    value={form.supplier || ''}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                    placeholder="Escribe o elige uno ya registrado…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <datalist id="refaccion-suppliers">
                    {getSuppliers().map(s => <option key={s} value={s} />)}
                  </datalist>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Al guardar, este proveedor queda guardado para las próximas refacciones.
                  </p>
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
