import { useState, useEffect, useRef } from 'react';
import { getSuppliers } from '../store';

interface Props {
  onSelect: (supplier: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function SupplierSelector({ onSelect, onClose, isOpen }: Props) {
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSuppliers(getSuppliers());
      setSearch('');
      setSelectedId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSuppliers = suppliers.filter(s => 
    s.toLowerCase().includes(search.toLowerCase())
  ).sort();

  const handleSelect = (supplier: string) => {
    onSelect(supplier);
    onClose();
  };

  const getSupplierIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('usa') || lowerName.includes('estados unidos')) return '🇺🇸';
    if (lowerName.includes('china') || lowerName.includes('shenzhen')) return '🇨🇳';
    if (lowerName.includes('mexico') || lowerName.includes('méxico')) return '🇲🇽';
    if (lowerName.includes('canada') || lowerName.includes('canadá')) return '🇨🇦';
    if (lowerName.includes('japan') || lowerName.includes('japón')) return '🇯🇵';
    if (lowerName.includes('korea') || lowerName.includes('corea')) return '🇰🇷';
    return '🏭';
  };

  const getSupplierColor = (name: string) => {
    const colors = [
      'from-purple-500 to-purple-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-violet-500 to-violet-600',
      'from-fuchsia-500 to-fuchsia-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🏭</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Seleccionar Proveedor</h3>
                <p className="text-xs text-white/80">{suppliers.length} proveedores registrados</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar proveedor..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all"
            />
          </div>
        </div>

        {/* Supplier List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-gray-500 font-medium mb-1">
                {suppliers.length === 0 
                  ? 'No hay proveedores registrados' 
                  : 'No se encontraron resultados'}
              </p>
              <p className="text-xs text-gray-400">
                {suppliers.length === 0 
                  ? 'Los proveedores aparecerán aquí después de crear lotes'
                  : 'Intenta con otro término de búsqueda'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredSuppliers.map((supplier, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(supplier)}
                  onMouseEnter={() => setSelectedId(supplier)}
                  onMouseLeave={() => setSelectedId(null)}
                  className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${
                    selectedId === supplier
                      ? 'bg-purple-50 border-purple-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-gray-50'
                  } border-2`}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${getSupplierColor(supplier)} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-xl">{getSupplierIcon(supplier)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {supplier}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Proveedor verificado
                      </p>
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
