import { useState, useEffect, useRef } from 'react';
import { Customer } from '../types';
import { getCustomers } from '../store';

interface Props {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function CustomerSelector({ onSelect, onClose, isOpen }: Props) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomers(getCustomers());
      setSearch('');
      setSelectedId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(c => {
    const matchSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  }).sort((a, b) => b.lastPurchaseDate.localeCompare(a.lastPurchaseDate));

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    onClose();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
      'from-cyan-500 to-cyan-600',
      'from-emerald-500 to-emerald-600',
      'from-orange-500 to-orange-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
    return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 'es' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Seleccionar Cliente</h3>
                <p className="text-xs text-white/80">{customers.length} clientes registrados</p>
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
              placeholder="Buscar por nombre, teléfono o email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-gray-500 font-medium mb-1">
                {customers.length === 0 
                  ? 'No hay clientes registrados' 
                  : 'No se encontraron resultados'}
              </p>
              <p className="text-xs text-gray-400">
                {customers.length === 0 
                  ? 'Los clientes aparecerán aquí después de realizar ventas'
                  : 'Intenta con otro término de búsqueda'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  onMouseEnter={() => setSelectedId(customer.id)}
                  onMouseLeave={() => setSelectedId(null)}
                  className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${
                    selectedId === customer.id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-gray-50'
                  } border-2`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(customer.name)} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-white text-sm font-bold">
                        {getInitials(customer.name)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {customer.name}
                        </h4>
                        <span className="text-xs font-bold text-green-600 flex-shrink-0">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {customer.phone}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {customer.totalPurchases} {customer.totalPurchases === 1 ? 'compra' : 'compras'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(customer.lastPurchaseDate)}
                        </span>
                      </div>

                      {customer.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>
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
