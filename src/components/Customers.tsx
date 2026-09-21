import { useState } from 'react';
import { Customer, Sale, Repair } from '../types';
import { formatDate, formatCurrency } from '../store';

interface Props {
  customers: Customer[];
  sales: Sale[];
  repairs: Repair[];
  onDelete: (id: string) => void;
}

export default function Customers({ customers, sales, repairs, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sales' | 'repairs' | 'both'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Determine customer type based on sales and repairs
  const getCustomerType = (customer: Customer): 'sales' | 'repairs' | 'both' => {
    const hasSales = sales.some(s => 
      s.customerPhone === customer.phone || s.customerName === customer.name
    );
    const hasRepairs = repairs.some(r => 
      r.customerPhone === customer.phone || r.customerName === customer.name
    );
    
    if (hasSales && hasRepairs) return 'both';
    if (hasRepairs) return 'repairs';
    return 'sales';
  };

  // Calculate days since last interaction
  const getDaysSinceLastInteraction = (customer: Customer): number => {
    const lastSale = sales
      .filter(s => s.customerPhone === customer.phone || s.customerName === customer.name)
      .sort((a, b) => b.saleDate.localeCompare(a.saleDate))[0];
    
    const lastRepair = repairs
      .filter(r => r.customerPhone === customer.phone || r.customerName === customer.name)
      .sort((a, b) => b.receivedDate.localeCompare(a.receivedDate))[0];

    let lastDate = customer.lastPurchaseDate;
    
    if (lastSale && lastSale.saleDate > lastDate) {
      lastDate = lastSale.saleDate;
    }
    if (lastRepair && lastRepair.receivedDate > lastDate) {
      lastDate = lastRepair.receivedDate;
    }

    const last = new Date(lastDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCustomerSales = (customer: Customer) => {
    return sales.filter(s =>
      s.customerName === customer.name || s.customerPhone === customer.phone
    );
  };

  const getCustomerRepairs = (customer: Customer) => {
    return repairs.filter(r =>
      r.customerName === customer.name || r.customerPhone === customer.phone
    );
  };

  const filteredCustomers = customers.filter(c => {
    const matchSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    
    const type = getCustomerType(c);
    const matchType = filterType === 'all' || type === filterType || (filterType === 'both' && type === 'both');
    
    return matchSearch && matchType;
  });

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalTransactions = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  // Count customers by type
  const salesCustomers = customers.filter(c => getCustomerType(c) === 'sales').length;
  const repairsCustomers = customers.filter(c => getCustomerType(c) === 'repairs').length;
  const bothCustomers = customers.filter(c => getCustomerType(c) === 'both').length;

  // Customers needing follow-up (7-30 days since last interaction)
  const needsFollowUp = customers.filter(c => {
    const days = getDaysSinceLastInteraction(c);
    return days >= 7 && days <= 30;
  });

  const handleSendFeedback = (customer: Customer) => {
    const days = getDaysSinceLastInteraction(customer);
    const message = `Hola ${customer.name}, espero que estés bien. Han pasado ${days} días desde tu última compra con nosotros. ¿Cómo te ha funcionado tu dispositivo? Nos encantaría saber tu experiencia. ¡Gracias por preferirnos! 🙏`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = customer.phone.replace(/[\s\-\(\)]/g, '');
    const phoneWithCode = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    window.open(`https://wa.me/${phoneWithCode}?text=${encodedMessage}`, '_blank');
  };

  const getTypeBadge = (type: 'sales' | 'repairs' | 'both') => {
    if (type === 'both') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          <span>📱</span><span>🔧</span> Ambos
        </span>
      );
    }
    if (type === 'repairs') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          <span>🔧</span> Reparación
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
        <span>📱</span> Venta
      </span>
    );
  };

  const getFollowUpBadge = (days: number) => {
    if (days >= 7 && days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          <span>💬</span> Seguimiento ({days}d)
        </span>
      );
    }
    if (days > 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <span>⚠️</span> Contacto ({days}d)
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Base de Datos de Clientes</h1>
        <span className="text-sm text-gray-500">{totalCustomers} clientes</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">👥</span>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalCustomers}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Clientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">💰</span>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs sm:text-sm text-gray-500">Ingresos Totales</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">🛒</span>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalTransactions}</p>
              <p className="text-xs sm:text-sm text-gray-500">Transacciones</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl sm:text-2xl">💬</span>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{needsFollowUp.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Seguimiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <span className="text-lg">📱</span>
            <div>
              <p className="text-sm font-bold text-blue-900">{salesCustomers}</p>
              <p className="text-xs text-blue-700">Solo Ventas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
            <span className="text-lg">🔧</span>
            <div>
              <p className="text-sm font-bold text-orange-900">{repairsCustomers}</p>
              <p className="text-xs text-orange-700">Solo Reparaciones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
            <span className="text-lg">📱🔧</span>
            <div>
              <p className="text-sm font-bold text-purple-900">{bothCustomers}</p>
              <p className="text-xs text-purple-700">Ambos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({totalCustomers})
            </button>
            <button
              onClick={() => setFilterType('sales')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                filterType === 'sales'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📱 Ventas ({salesCustomers})
            </button>
            <button
              onClick={() => setFilterType('repairs')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                filterType === 'repairs'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔧 Reparaciones ({repairsCustomers})
            </button>
            <button
              onClick={() => setFilterType('both')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                filterType === 'both'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📱🔧 Ambos ({bothCustomers})
            </button>
          </div>
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-gray-500 text-lg">No hay clientes registrados</p>
          <p className="text-gray-400 text-sm mt-1">Los clientes aparecerán aquí cuando realices ventas o reparaciones</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCustomers.map(customer => {
            const type = getCustomerType(customer);
            const days = getDaysSinceLastInteraction(customer);
            
            return (
              <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{customer.name}</h3>
                        {getTypeBadge(type)}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{customer.phone}</p>
                      {customer.email && (
                        <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al cliente "${customer.name}"?`)) {
                        onDelete(customer.id);
                      }
                    }}
                    className="px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200 hover:border-red-600 flex-shrink-0"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600">Compras</p>
                    <p className="text-base sm:text-lg font-bold text-blue-800">{customer.totalPurchases}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600">Total Gastado</p>
                    <p className="text-base sm:text-lg font-bold text-green-800 truncate">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-600">Primera Compra</p>
                    <p className="text-xs sm:text-sm font-semibold text-purple-800">{formatDate(customer.firstPurchaseDate)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600">Última Compra</p>
                    <p className="text-xs sm:text-sm font-semibold text-orange-800">{formatDate(customer.lastPurchaseDate)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  {getFollowUpBadge(days) && (
                    <button
                      onClick={() => handleSendFeedback(customer)}
                      className="px-3 py-2 bg-yellow-50 text-yellow-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200 flex items-center gap-1"
                    >
                      💬 Enviar Retroalimentación
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="px-3 py-2 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    Ver Historial
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                    {selectedCustomer.email && (
                      <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sales History */}
              {getCustomerSales(selectedCustomer).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📱</span> Historial de Compras
                  </h4>
                  <div className="space-y-2">
                    {getCustomerSales(selectedCustomer).map(sale => (
                      <div key={sale.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{sale.model}</p>
                            <p className="text-xs text-gray-600 font-mono">IMEI: {sale.imei}</p>
                            <p className="text-xs text-gray-500">{sale.color} • {sale.storage}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(sale.saleDate)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold text-green-600">{formatCurrency(sale.salePrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Repairs History */}
              {getCustomerRepairs(selectedCustomer).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🔧</span> Historial de Reparaciones
                  </h4>
                  <div className="space-y-2">
                    {getCustomerRepairs(selectedCustomer).map(repair => (
                      <div key={repair.id} className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{repair.brand} {repair.model}</p>
                            <p className="text-xs text-gray-600">{repair.issue}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(repair.receivedDate)}</p>
                          </div>
                          {repair.finalCost && (
                            <div className="text-right">
                              <p className="text-base font-bold text-orange-600">{formatCurrency(repair.finalCost)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Total de compras:</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
