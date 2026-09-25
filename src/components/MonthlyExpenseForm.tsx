import { useState, useEffect } from 'react';
import { MonthlyExpense } from '../types';
import { generateId } from '../store';

interface Props {
  onSave: (expense: MonthlyExpense) => void;
  editingExpense?: MonthlyExpense | null;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES = [
  'Renta',
  'Luz',
  'Agua',
  'Internet',
  'Teléfono',
  'Transporte',
  'Publicidad',
  'Herramientas',
  'Refacciones',
  'Empleados',
  'Comisiones',
  'Impuestos',
  'Mantenimiento',
  'Papelería',
  'Otros'
];

export default function MonthlyExpenseForm({ onSave, editingExpense, onCancel }: Props) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (editingExpense) {
      setMonth(editingExpense.month);
      setCategory(editingExpense.category);
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.date);
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expense: MonthlyExpense = {
      id: editingExpense?.id || generateId(),
      month,
      category,
      description,
      amount: parseFloat(amount) || 0,
      date,
    };

    onSave(expense);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto Mensual'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes *
              </label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccionar categoría</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej: Renta del local, factura de luz, etc."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto (MXN) *
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-2 sm:gap-3 pt-4 pb-safe">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                {editingExpense ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
