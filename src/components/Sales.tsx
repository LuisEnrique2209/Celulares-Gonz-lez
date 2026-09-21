import { useState } from 'react';
import { Sale, Lot } from '../types';
import { formatDate, formatCurrency } from '../store';
import Policy from './Policy';

interface Props {
  sales: Sale[];
  lots: Lot[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
  onUpdateSale: (sale: Sale) => void;
}

export default function Sales({ sales, lots, onEdit, onDelete, onUpdateSale }: Props) {
  const [search, setSearch] = useState('');
  const [filterLot, setFilterLot] = useState('');
  const [selectedSaleForPolicy, setSelectedSaleForPolicy] = useState<Sale | null>(null);

  const getLotName = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    return lot ? lot.name : 'Sin lote';
  };

  const filteredSales = sales.filter(s => {
    const matchSearch = search === '' ||
      s.imei.toLowerCase().includes(search.toLowerCase()) ||
      s.model.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.customerPhone.includes(search);
    const matchLot = filterLot === '' || s.lotId === filterLot;
    return matchSearch && matchLot;
  });

  const totalSales = sales.reduce((sum, s) => sum + s.salePrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total vendido</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalSales)}</p>
          </div>
          <span className="text-sm text-gray-500">{sales.length} ventas</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Buscar por IMEI, modelo o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterLot}
            onChange={e => setFilterLot(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los lotes</option>
            {lots.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-gray-500 text-lg">No hay ventas registradas</p>
          <p className="text-gray-400 text-sm mt-1">Registra tu primera venta</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSales.map(sale => (
            <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{sale.model}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Vendido
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono mb-3">IMEI: {sale.imei}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Color</p>
                      <p className="text-sm font-semibold text-gray-900">{sale.color}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Almacenamiento</p>
                      <p className="text-sm font-semibold text-gray-900">{sale.storage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lote</p>
                      <p className="text-sm font-semibold text-gray-900">{getLotName(sale.lotId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fecha de Venta</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(sale.saleDate)}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                    <p className="text-xs text-blue-600 mb-1">Cliente</p>
                    <p className="text-sm font-bold text-blue-900">{sale.customerName}</p>
                    <p className="text-sm text-blue-700">{sale.customerPhone}</p>
                    {sale.customerEmail && (
                      <p className="text-sm text-blue-700">{sale.customerEmail}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Precio de Venta</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(sale.salePrice)}</p>
                    </div>
                    {sale.paymentMethod && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Método de Pago</p>
                        <p className="text-sm font-semibold text-gray-900">{sale.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  {sale.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">📝</span>
                        <p className="text-xs text-sky-600 font-semibold">Observaciones de Garantía</p>
                      </div>
                      <p className="text-sm text-gray-700 bg-sky-50 p-2 rounded border border-sky-100">{sale.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedSaleForPolicy(sale)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border relative ${
                      sale.notes 
                        ? 'text-sky-600 hover:text-white hover:bg-sky-600 border-sky-200 hover:border-sky-600' 
                        : 'text-green-600 hover:text-white hover:bg-green-600 border-green-200 hover:border-green-600'
                    }`}
                  >
                    {sale.notes ? '📄 Ver Póliza' : '📱 Póliza'}
                    {sale.notes && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full"></span>
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(sale)}
                    className="px-3 py-1.5 text-blue-600 hover:text-white hover:bg-blue-600 text-sm font-medium rounded-lg transition-colors border border-blue-200 hover:border-blue-600"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta venta?')) {
                        onDelete(sale.id);
                      }
                    }}
                    className="px-3 py-1.5 text-red-600 hover:text-white hover:bg-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200 hover:border-red-600"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policy Modal */}
      {selectedSaleForPolicy && (
        <Policy
          sale={selectedSaleForPolicy}
          lot={lots.find(l => l.id === selectedSaleForPolicy.lotId)}
          onClose={() => setSelectedSaleForPolicy(null)}
          onSaveObservations={(observations) => {
            const updatedSale = { ...selectedSaleForPolicy, notes: observations };
            onUpdateSale(updatedSale);
            setSelectedSaleForPolicy(updatedSale);
          }}
        />
      )}
    </div>
  );
}
