import { Device, Lot, Sale, QualityCheck, Customer } from '../types';
import { formatCurrency, formatDate } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface Props {
  devices: Device[];
  lots: Lot[];
  sales: Sale[];
  checks: QualityCheck[];
  customers: Customer[];
}

export default function Dashboard({ devices, lots, sales, checks, customers }: Props) {
  const totalDevices = devices.length;
  const inStock = devices.filter(d => d.status === 'in_stock').length;
  const sold = devices.filter(d => d.status === 'sold').length;
  const inTransit = devices.filter(d => d.status === 'in_transit').length;
  const received = devices.filter(d => d.status === 'received').length;

  const totalInvestment = devices.reduce(
    (acc, d) => acc + d.purchasePrice + d.importExpenses + d.shippingExpenses + d.otherExpenses,
    0
  );

  const totalSalesAmount = sales.reduce((acc, s) => acc + s.salePrice, 0);

  const soldDevicesCost = devices
    .filter(d => d.status === 'sold')
    .reduce(
      (acc, d) => acc + d.purchasePrice + d.importExpenses + d.shippingExpenses + d.otherExpenses,
      0
    );

  const profit = totalSalesAmount - soldDevicesCost;

  // Calcular ingresos por mes
  const salesByMonth = sales.reduce((acc, sale) => {
    const date = new Date(sale.saleDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { revenue: 0, cost: 0, count: 0 };
    }
    acc[monthKey].revenue += sale.salePrice;
    acc[monthKey].count += 1;
    
    // Buscar el costo del dispositivo vendido
    const device = devices.find(d => d.id === sale.deviceId);
    if (device) {
      acc[monthKey].cost += device.purchasePrice + device.importExpenses + device.shippingExpenses + device.otherExpenses;
    }
    
    return acc;
  }, {} as Record<string, { revenue: number; cost: number; count: number }>);

  // Ordenar meses cronológicamente
  const sortedMonths = Object.keys(salesByMonth).sort();
  const lastMonth = sortedMonths[sortedMonths.length - 1];
  const currentMonthData = lastMonth ? salesByMonth[lastMonth] : { revenue: 0, cost: 0, count: 0 };

  // Balance actual (dinero disponible)
  const currentBalance = totalSalesAmount - totalInvestment;

  // Gastos adicionales de lotes
  const totalAdditionalExpenses = lots.reduce(
    (acc, lot) => acc + lot.importExpenses + lot.shippingExpenses + lot.otherExpenses,
    0
  );

  const totalLots = lots.length;
  const pendingLots = lots.filter(l => l.status === 'pending' || l.status === 'in_transit').length;

  // Quality check stats
  const totalChecks = checks.length;
  const approvedChecks = checks.filter(c => c.overallStatus === 'approved').length;
  const rejectedChecks = checks.filter(c => c.overallStatus === 'rejected').length;

  const totalSlots = lots.reduce((sum, lot) => {
    const items = lot.items || [];
    return sum + items.reduce((s, i) => s + (i.quantity || 0), 0);
  }, 0);
  const checkedSlots = devices.filter(d => d.checked).length;

  // Model distribution
  const modelCount: Record<string, number> = {};
  devices.forEach(d => {
    modelCount[d.model] = (modelCount[d.model] || 0) + 1;
  });
  const topModels = Object.entries(modelCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent devices
  const recentDevices = [...devices]
    .sort((a, b) => new Date(b.arrivalDate || b.purchaseDate).getTime() - new Date(a.arrivalDate || a.purchaseDate).getTime())
    .slice(0, 5);

  // Customer follow-up analysis
  const getDaysSinceLastPurchase = (customer: Customer): number => {
    const customerSales = sales
      .filter(s => s.customerPhone === customer.phone || s.customerName === customer.name)
      .sort((a, b) => b.saleDate.localeCompare(a.saleDate));
    
    if (customerSales.length === 0) return 999;
    
    const lastSaleDate = new Date(customerSales[0].saleDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastSaleDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const customersNeedingFollowUp = customers
    .map(customer => ({
      ...customer,
      daysSinceLastPurchase: getDaysSinceLastPurchase(customer),
    }))
    .filter(c => c.daysSinceLastPurchase >= 7 && c.daysSinceLastPurchase <= 30)
    .sort((a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase);

  const customersOverdue = customers
    .map(customer => ({
      ...customer,
      daysSinceLastPurchase: getDaysSinceLastPurchase(customer),
    }))
    .filter(c => c.daysSinceLastPurchase > 30)
    .sort((a, b) => a.daysSinceLastPurchase - b.daysSinceLastPurchase);

  // Chart data for follow-up
  const followUpChartData = [
    {
      name: '7-14 días',
      clientes: customers.filter(c => {
        const days = getDaysSinceLastPurchase(c);
        return days >= 7 && days <= 14;
      }).length,
      color: '#fbbf24',
    },
    {
      name: '15-21 días',
      clientes: customers.filter(c => {
        const days = getDaysSinceLastPurchase(c);
        return days >= 15 && days <= 21;
      }).length,
      color: '#f59e0b',
    },
    {
      name: '22-30 días',
      clientes: customers.filter(c => {
        const days = getDaysSinceLastPurchase(c);
        return days >= 22 && days <= 30;
      }).length,
      color: '#d97706',
    },
    {
      name: '30+ días',
      clientes: customers.filter(c => getDaysSinceLastPurchase(c) > 30).length,
      color: '#dc2626',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">Resumen general del negocio</span>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(currentBalance)}</p>
              <p className="text-xs sm:text-sm opacity-90">Balance Actual</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(currentMonthData.revenue)}</p>
              <p className="text-xs sm:text-sm opacity-90">Ingresos del Mes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(totalAdditionalExpenses)}</p>
              <p className="text-xs sm:text-sm opacity-90">Gastos Adicionales</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-4 lg:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(currentMonthData.revenue - currentMonthData.cost)}</p>
              <p className="text-xs sm:text-sm opacity-90">Ganancia del Mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
              <p className="text-sm text-gray-500">Total Dispositivos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inStock}</p>
              <p className="text-sm text-gray-500">En Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inTransit}</p>
              <p className="text-sm text-gray-500">En Tránsito</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sold}</p>
              <p className="text-sm text-gray-500">Vendidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Second row of stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
              <p className="text-sm text-gray-500">Ventas Realizadas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedChecks}</p>
              <p className="text-sm text-gray-500">Checados OK</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedChecks}</p>
              <p className="text-sm text-gray-500">Rechazados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalLots}</p>
              <p className="text-sm text-gray-500">Total Lotes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-600 mb-1">Inversión Total</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalInvestment)}</p>
            <p className="text-xs text-blue-600 mt-1">En {totalDevices} dispositivos</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-green-600 mb-1">Ventas Totales</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(totalSalesAmount)}</p>
            <p className="text-xs text-green-600 mt-1">{sales.length} transacciones</p>
          </div>
          <div className={`rounded-lg p-4 border ${profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-sm mb-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {profit >= 0 ? 'Ganancia Total' : 'Pérdida Total'}
            </p>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
              {formatCurrency(Math.abs(profit))}
            </p>
            <p className={`text-xs mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Margen: {soldDevicesCost > 0 ? ((profit / soldDevicesCost) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {sortedMonths.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose Mensual</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Mes</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Ventas</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Ingresos</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Costos</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Ganancia</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedMonths.slice(-6).reverse().map(month => {
                  const data = salesByMonth[month];
                  const monthProfit = data.revenue - data.cost;
                  const margin = data.cost > 0 ? (monthProfit / data.cost) * 100 : 0;
                  const [year, monthNum] = month.split('-');
                  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  
                  return (
                    <tr key={month} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {monthNames[parseInt(monthNum) - 1]} {year}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {data.count}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                        {formatCurrency(data.revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">
                        {formatCurrency(data.cost)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-bold ${monthProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(monthProfit)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Expenses Breakdown */}
      {totalAdditionalExpenses > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos Adicionales por Lote</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <p className="text-sm text-orange-600 mb-1">Importación</p>
              <p className="text-xl font-bold text-orange-900">
                {formatCurrency(lots.reduce((acc, lot) => acc + lot.importExpenses, 0))}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-600 mb-1">Envío</p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(lots.reduce((acc, lot) => acc + lot.shippingExpenses, 0))}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-purple-600 mb-1">Otros Gastos</p>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(lots.reduce((acc, lot) => acc + lot.otherExpenses, 0))}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Lote</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Importación</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Envío</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Otros</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lots.filter(lot => lot.importExpenses + lot.shippingExpenses + lot.otherExpenses > 0).map(lot => {
                  const lotTotal = lot.importExpenses + lot.shippingExpenses + lot.otherExpenses;
                  return (
                    <tr key={lot.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{lot.name}</td>
                      <td className="px-4 py-3 text-sm text-right text-orange-600">
                        {lot.importExpenses > 0 ? formatCurrency(lot.importExpenses) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-blue-600">
                        {lot.shippingExpenses > 0 ? formatCurrency(lot.shippingExpenses) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-purple-600">
                        {lot.otherExpenses > 0 ? formatCurrency(lot.otherExpenses) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                        {formatCurrency(lotTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gráficas */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfica de ingresos mensuales */}
          {sortedMonths.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución Financiera Mensual</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sortedMonths.slice(-6).map(month => {
                  const data = salesByMonth[month];
                  const [year, monthNum] = month.split('-');
                  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  return {
                    mes: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
                    ingresos: data.revenue,
                    costos: data.cost,
                    ganancia: data.revenue - data.cost,
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                  <Line type="monotone" dataKey="costos" stroke="#ef4444" strokeWidth={2} name="Costos" />
                  <Line type="monotone" dataKey="ganancia" stroke="#3b82f6" strokeWidth={2} name="Ganancia" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfica de modelos más populares */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modelos en Inventario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topModels.map(([model, count]) => ({ model: model.replace('iPhone ', ''), cantidad: count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de estado del inventario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Inventario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'En Stock', value: inStock, color: '#10b981' },
                    { name: 'Vendido', value: sold, color: '#8b5cf6' },
                    { name: 'En Tránsito', value: inTransit, color: '#f59e0b' },
                    { name: 'Recibido', value: received, color: '#3b82f6' },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'En Stock', value: inStock, color: '#10b981' },
                    { name: 'Vendido', value: sold, color: '#8b5cf6' },
                    { name: 'En Tránsito', value: inTransit, color: '#f59e0b' },
                    { name: 'Recibido', value: received, color: '#3b82f6' },
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de colores más populares */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Colores Más Populares</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={Object.entries(
                  devices.reduce((acc, d) => {
                    acc[d.color] = (acc[d.color] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([color, count]) => ({ color, cantidad: count }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="color" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de control de calidad */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Control de Calidad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Aprobados', value: approvedChecks, color: '#10b981' },
                    { name: 'Rechazados', value: rejectedChecks, color: '#ef4444' },
                    { name: 'Pendientes', value: totalSlots - checkedSlots, color: '#f59e0b' },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Aprobados', value: approvedChecks, color: '#10b981' },
                    { name: 'Rechazados', value: rejectedChecks, color: '#ef4444' },
                    { name: 'Pendientes', value: totalSlots - checkedSlots, color: '#f59e0b' },
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Inventario</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">En Tránsito</span>
              </div>
              <span className="font-semibold text-gray-900">{inTransit}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Recibido</span>
              </div>
              <span className="font-semibold text-gray-900">{received}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">En Stock</span>
              </div>
              <span className="font-semibold text-gray-900">{inStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Vendidos</span>
              </div>
              <span className="font-semibold text-gray-900">{sold}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Control de Calidad</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total por Checar</span>
              <span className="font-semibold text-gray-900">{totalSlots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ya Checados</span>
              <span className="font-semibold text-green-600">{checkedSlots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pendientes</span>
              <span className="font-semibold text-orange-600">{totalSlots - checkedSlots}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Revisiones</span>
              <span className="font-semibold text-gray-900">{totalChecks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Follow-up Section */}
      {customers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Follow-up Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>💬</span> Clientes para Retroalimentación
              </h3>
              <span className="text-sm font-bold text-orange-600">
                {customersNeedingFollowUp.length + customersOverdue.length} pendientes
              </span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={followUpChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clientes" radius={[8, 8, 0, 0]}>
                  {followUpChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Follow-up List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> Requieren Contacto
            </h3>
            {customersNeedingFollowUp.length === 0 && customersOverdue.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">✅</span>
                <p className="text-gray-500 text-sm">¡Todos los clientes están al día!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {customersNeedingFollowUp.slice(0, 5).map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        💬 {customer.daysSinceLastPurchase}d
                      </span>
                    </div>
                  </div>
                ))}
                {customersOverdue.slice(0, 3).map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        ⚠️ {customer.daysSinceLastPurchase}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Models & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Modelos Más Comunes</h3>
          {topModels.length > 0 ? (
            <div className="space-y-3">
              {topModels.map(([model, count]) => (
                <div key={model} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{model}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / totalDevices) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No hay dispositivos registrados</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispositivos Recientes</h3>
          {recentDevices.length > 0 ? (
            <div className="space-y-3">
              {recentDevices.map(device => (
                <div key={device.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{device.model}</p>
                    <p className="text-xs text-gray-500">{device.color} • {device.storage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.checked ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">✓ Revisado</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">Sin revisar</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      device.status === 'in_stock' ? 'bg-green-100 text-green-700' :
                      device.status === 'sold' ? 'bg-purple-100 text-purple-700' :
                      device.status === 'in_transit' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {device.status === 'in_stock' ? 'En Stock' :
                       device.status === 'sold' ? 'Vendido' :
                       device.status === 'in_transit' ? 'En Tránsito' : 'Recibido'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No hay dispositivos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}
