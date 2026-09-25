import { useState } from 'react';
import { Sale, Lot, MonthlyExpense, Device } from '../types';
import { formatCurrency, formatDate } from '../store';
import MonthlyExpenseForm from './MonthlyExpenseForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  sales: Sale[];
  lots: Lot[];
  devices: Device[];
  monthlyExpenses: MonthlyExpense[];
  onAddExpense: (expense: MonthlyExpense) => void;
  onUpdateExpense: (expense: MonthlyExpense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function FinancialAnalysis({ 
  sales, 
  lots, 
  devices,
  monthlyExpenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MonthlyExpense | null>(null);

  // Obtener todos los meses disponibles
  const allMonths = new Set<string>();
  sales.forEach(s => allMonths.add(s.saleDate.slice(0, 7)));
  monthlyExpenses.forEach(e => allMonths.add(e.month));
  lots.forEach(l => allMonths.add(l.purchaseDate.slice(0, 7)));
  
  const sortedMonths = Array.from(allMonths).sort().reverse();

  // Calcular datos del mes seleccionado
  const monthSales = sales.filter(s => s.saleDate.startsWith(selectedMonth));
  const monthExpenses = monthlyExpenses.filter(e => e.month === selectedMonth);
  const monthLots = lots.filter(l => l.purchaseDate.startsWith(selectedMonth));

  // Calcular ingresos del mes
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.salePrice, 0);

  // Calcular costos del mes (dispositivos vendidos)
  const monthCosts = monthSales.reduce((sum, sale) => {
    const device = devices.find(d => d.id === sale.deviceId);
    if (device) {
      return sum + device.purchasePrice + device.importExpenses + device.shippingExpenses + device.otherExpenses;
    }
    return sum;
  }, 0);

  // Gastos adicionales del mes
  const monthAdditionalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Gastos de lotes del mes
  const monthLotExpenses = monthLots.reduce((sum, lot) => {
    return sum + lot.importExpenses + lot.shippingExpenses + lot.otherExpenses;
  }, 0);

  // Total gastos del mes
  const totalMonthExpenses = monthAdditionalExpenses + monthLotExpenses;

  // Ganancia del mes
  const monthProfit = monthRevenue - monthCosts - totalMonthExpenses;

  // Calcular crecimiento de capital (acumulado hasta el mes seleccionado)
  const capitalGrowth = sortedMonths
    .filter(m => m <= selectedMonth)
    .reverse()
    .map(month => {
      const salesInMonth = sales.filter(s => s.saleDate.startsWith(month));
      const expensesInMonth = monthlyExpenses.filter(e => e.month === month);
      const lotsInMonth = lots.filter(l => l.purchaseDate.startsWith(month));

      const revenue = salesInMonth.reduce((sum, s) => sum + s.salePrice, 0);
      const costs = salesInMonth.reduce((sum, sale) => {
        const device = devices.find(d => d.id === sale.deviceId);
        if (device) {
          return sum + device.purchasePrice + device.importExpenses + device.shippingExpenses + device.otherExpenses;
        }
        return sum;
      }, 0);
      const additionalExpenses = expensesInMonth.reduce((sum, e) => sum + e.amount, 0);
      const lotExpenses = lotsInMonth.reduce((sum, lot) => {
        return sum + lot.importExpenses + lot.shippingExpenses + lot.otherExpenses;
      }, 0);

      return {
        month,
        revenue,
        costs: costs + additionalExpenses + lotExpenses,
        profit: revenue - costs - additionalExpenses - lotExpenses,
      };
    })
    .reverse();

  // Calcular capital acumulado
  let accumulatedCapital = 0;
  const capitalData = capitalGrowth.map(data => {
    accumulatedCapital += data.profit;
    const [year, monthNum] = data.month.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      ...data,
      capital: accumulatedCapital,
      label: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
    };
  });

  const currentCapital = accumulatedCapital;

  // Gastos por categoría del mes
  const expensesByCategory = monthExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
  }));

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: MonthlyExpense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleSaveExpense = (expense: MonthlyExpense) => {
    if (editingExpense) {
      onUpdateExpense(expense);
    } else {
      onAddExpense(expense);
    }
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const selectedMonthLabel = `${monthNames[parseInt(monthNum) - 1]} ${year}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero</h1>
        <button
          onClick={handleAddExpense}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          + Agregar Gasto
        </button>
      </div>

      {/* Selector de Mes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Mes
        </label>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortedMonths.map(month => {
            const [y, m] = month.split('-');
            return (
              <option key={month} value={month}>
                {monthNames[parseInt(m) - 1]} {y}
              </option>
            );
          })}
        </select>
      </div>

      {/* Resumen del Mes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-3 sm:p-6 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-1">Ingresos</p>
          <p className="text-base sm:text-2xl font-bold truncate">{formatCurrency(monthRevenue)}</p>
          <p className="text-xs opacity-75 mt-1 sm:mt-2">{monthSales.length} ventas</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-sm p-3 sm:p-6 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-1">Costos</p>
          <p className="text-base sm:text-2xl font-bold truncate">{formatCurrency(monthCosts)}</p>
          <p className="text-xs opacity-75 mt-1 sm:mt-2">Inventario</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-3 sm:p-6 text-white">
          <p className="text-xs sm:text-sm opacity-90 mb-1">Gastos</p>
          <p className="text-base sm:text-2xl font-bold truncate">{formatCurrency(totalMonthExpenses)}</p>
          <p className="text-xs opacity-75 mt-1 sm:mt-2">Adicionales</p>
        </div>

        <div className={`bg-gradient-to-br ${monthProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'} rounded-xl shadow-sm p-3 sm:p-6 text-white`}>
          <p className="text-xs sm:text-sm opacity-90 mb-1">Ganancia</p>
          <p className="text-base sm:text-2xl font-bold truncate">{formatCurrency(Math.abs(monthProfit))}</p>
          <p className="text-xs opacity-75 mt-1 sm:mt-2">
            {monthProfit >= 0 ? 'Ganancia' : 'Pérdida'}
          </p>
        </div>
      </div>

      {/* Capital Actual */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-sm p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm opacity-90 mb-1">Capital Acumulado hasta {selectedMonthLabel}</p>
            <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(currentCapital)}</p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="text-xs sm:text-sm opacity-90 mb-1">Meses</p>
            <p className="text-2xl sm:text-3xl font-bold">{capitalData.length}</p>
          </div>
        </div>
      </div>

      {/* Gráfica de Crecimiento de Capital */}
      {capitalData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento de Capital</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={capitalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="capital" stroke="#10b981" strokeWidth={3} name="Capital Acumulado" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Ganancia Mensual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Desglose de Ingresos vs Gastos */}
      {capitalData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos vs Gastos por Mes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capitalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Ingresos" />
              <Bar dataKey="costs" fill="#ef4444" name="Gastos Totales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gastos Adicionales del Mes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Gastos Adicionales - {selectedMonthLabel}
          </h3>
          <span className="text-sm font-bold text-orange-600">
            Total: {formatCurrency(monthAdditionalExpenses)}
          </span>
        </div>

        {monthExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No hay gastos adicionales registrados para este mes</p>
            <button
              onClick={handleAddExpense}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              + Agregar primer gasto
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {monthExpenses.map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {expense.category}
                    </span>
                    {expense.description && (
                      <span className="text-xs text-gray-500">
                        - {expense.description}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(expense.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este gasto?')) {
                        onDeleteExpense(expense.id);
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gastos por Categoría */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gastos por Categoría - {selectedMonthLabel}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="amount" fill="#f97316" name="Monto" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de Resumen Mensual */}
      {capitalData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Histórico</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Mes</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Ingresos</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Gastos</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Ganancia</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Capital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {capitalData.map((data, index) => (
                  <tr key={data.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {data.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                      {formatCurrency(data.revenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {formatCurrency(data.costs)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-bold ${data.profit >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                      {formatCurrency(data.profit)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-emerald-600">
                      {formatCurrency(data.capital)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Gasto */}
      {showExpenseForm && (
        <MonthlyExpenseForm
          onSave={handleSaveExpense}
          editingExpense={editingExpense}
          onCancel={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}
