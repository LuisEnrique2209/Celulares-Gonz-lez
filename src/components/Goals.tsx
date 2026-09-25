import { useState, useEffect } from 'react';
import { MonthlyGoal, CustomGoal, Sale, Repair } from '../types';
import { formatCurrency, generateId, getMonthlyGoals, saveMonthlyGoals } from '../store';

interface Props {
  sales: Sale[];
  repairs: Repair[];
}

export default function Goals({ sales, repairs }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
  const [showCustomGoalForm, setShowCustomGoalForm] = useState(false);
  const [newCustomGoal, setNewCustomGoal] = useState<Partial<CustomGoal>>({
    title: '',
    description: '',
    target: 0,
    actual: 0,
    unit: '',
    icon: '🎯',
    completed: false,
  });

  useEffect(() => {
    setGoals(getMonthlyGoals());
  }, []);

  const currentGoal = goals.find(g => g.month === selectedMonth);

  // Calculate actual values for selected month
  const monthSales = sales.filter(s => s.saleDate.startsWith(selectedMonth));
  const monthRepairs = repairs.filter(r => r.receivedDate.startsWith(selectedMonth));
  
  const actualSalesAmount = monthSales.reduce((sum, s) => sum + s.salePrice, 0);
  const actualRepairsCount = monthRepairs.length;
  const actualDevicesSold = monthSales.length;

  const handleSaveGoal = () => {
    if (!editingGoal) return;

    const updatedGoals = goals.filter(g => g.month !== selectedMonth);
    updatedGoals.push(editingGoal);
    saveMonthlyGoals(updatedGoals);
    setGoals(updatedGoals);
    setIsEditing(false);
    setEditingGoal(null);
  };

  const handleStartEdit = () => {
    if (currentGoal) {
      setEditingGoal({ ...currentGoal });
    } else {
      setEditingGoal({
        id: generateId(),
        month: selectedMonth,
        salesTarget: 0,
        salesActual: actualSalesAmount,
        repairsTarget: 0,
        repairsActual: actualRepairsCount,
        devicesSoldTarget: 0,
        devicesSoldActual: actualDevicesSold,
        notes: '',
        completed: false,
        customGoals: [],
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingGoal(null);
  };

  const handleAddCustomGoal = () => {
    if (!editingGoal || !newCustomGoal.title || !newCustomGoal.unit) return;

    const customGoal: CustomGoal = {
      id: generateId(),
      title: newCustomGoal.title || '',
      description: newCustomGoal.description,
      target: newCustomGoal.target || 0,
      actual: newCustomGoal.actual || 0,
      unit: newCustomGoal.unit || '',
      icon: newCustomGoal.icon || '🎯',
      completed: false,
    };

    const updatedGoal = {
      ...editingGoal,
      customGoals: [...(editingGoal.customGoals || []), customGoal],
    };

    setEditingGoal(updatedGoal);
    setNewCustomGoal({
      title: '',
      description: '',
      target: 0,
      actual: 0,
      unit: '',
      icon: '🎯',
      completed: false,
    });
    setShowCustomGoalForm(false);
  };

  const handleUpdateCustomGoal = (goalId: string, updates: Partial<CustomGoal>) => {
    if (!editingGoal) return;

    const updatedCustomGoals = (editingGoal.customGoals || []).map(g =>
      g.id === goalId ? { ...g, ...updates } : g
    );

    setEditingGoal({ ...editingGoal, customGoals: updatedCustomGoals });
  };

  const handleDeleteCustomGoal = (goalId: string) => {
    if (!editingGoal) return;

    const updatedCustomGoals = (editingGoal.customGoals || []).filter(g => g.id !== goalId);
    setEditingGoal({ ...editingGoal, customGoals: updatedCustomGoals });
  };

  const calculateProgress = (actual: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((actual / target) * 100));
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (progress: number): string => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const [year, monthNum] = selectedMonth.split('-');
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const selectedMonthLabel = `${monthNames[parseInt(monthNum) - 1]} ${year}`;

  const salesProgress = currentGoal ? calculateProgress(currentGoal.salesActual, currentGoal.salesTarget) : 0;
  const repairsProgress = currentGoal ? calculateProgress(currentGoal.repairsActual, currentGoal.repairsTarget) : 0;
  const devicesProgress = currentGoal ? calculateProgress(currentGoal.devicesSoldActual, currentGoal.devicesSoldTarget) : 0;

  // Calculate custom goals progress
  const customGoalsProgress = currentGoal?.customGoals?.length
    ? Math.round(
        currentGoal.customGoals.reduce((sum, g) => sum + calculateProgress(g.actual, g.target), 0) /
        currentGoal.customGoals.length
      )
    : 0;

  // Calculate overall progress including custom goals
  const totalGoals = 3 + (currentGoal?.customGoals?.length || 0);
  const overallProgress = currentGoal
    ? Math.round(
        (salesProgress + repairsProgress + devicesProgress + 
         (currentGoal.customGoals?.reduce((sum, g) => sum + calculateProgress(g.actual, g.target), 0) || 0)) /
        totalGoals
      )
    : 0;

  const iconOptions = ['🎯', '📱', '📸', '💰', '🔧', '📦', '👥', '📈', '⭐', '🏆', '🎨', '📝', '🚀', '💎', '🔥'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Metas Mensuales</h1>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{selectedMonthLabel}</h2>
            <p className="text-sm opacity-90">Progreso General del Mes</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{overallProgress}%</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4">
          <div
            className="bg-white h-4 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Standard Goals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sales Goal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h3 className="text-lg font-bold text-gray-900">Ventas</h3>
            </div>
            <span className={`text-2xl font-bold ${getProgressTextColor(salesProgress)}`}>
              {salesProgress}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Meta:</span>
                <span className="font-semibold text-gray-900">
                  {currentGoal ? formatCurrency(currentGoal.salesTarget) : formatCurrency(0)}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Actual:</span>
                <span className="font-semibold text-green-600">{formatCurrency(actualSalesAmount)}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${getProgressColor(salesProgress)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${salesProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Repairs Goal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              <h3 className="text-lg font-bold text-gray-900">Reparaciones</h3>
            </div>
            <span className={`text-2xl font-bold ${getProgressTextColor(repairsProgress)}`}>
              {repairsProgress}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Meta:</span>
                <span className="font-semibold text-gray-900">
                  {currentGoal ? currentGoal.repairsTarget : 0} reparaciones
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Actual:</span>
                <span className="font-semibold text-orange-600">{actualRepairsCount} reparaciones</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${getProgressColor(repairsProgress)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${repairsProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Devices Sold Goal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <h3 className="text-lg font-bold text-gray-900">Dispositivos</h3>
            </div>
            <span className={`text-2xl font-bold ${getProgressTextColor(devicesProgress)}`}>
              {devicesProgress}%
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Meta:</span>
                <span className="font-semibold text-gray-900">
                  {currentGoal ? currentGoal.devicesSoldTarget : 0} dispositivos
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Actual:</span>
                <span className="font-semibold text-blue-600">{actualDevicesSold} dispositivos</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${getProgressColor(devicesProgress)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${devicesProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Goals Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🎯</span> Metas Personalizadas
          </h3>
          <button
            onClick={() => {
              if (!isEditing) {
                handleStartEdit();
              }
              setTimeout(() => setShowCustomGoalForm(true), 100);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Agregar Meta Personalizada
          </button>
        </div>

        {(!currentGoal?.customGoals || currentGoal.customGoals.length === 0) && !showCustomGoalForm && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <span className="text-5xl mb-3 block">🎯</span>
            <p className="text-gray-500 font-medium mb-2">No hay metas personalizadas</p>
            <p className="text-sm text-gray-400 mb-4">
              Agrega metas como: publicaciones en redes, seguidores, teléfonos importados, etc.
            </p>
            <button
              onClick={() => {
                if (!isEditing) {
                  handleStartEdit();
                }
                setTimeout(() => setShowCustomGoalForm(true), 100);
              }}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Crear Primera Meta
            </button>
          </div>
        )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isEditing ? editingGoal?.customGoals : currentGoal?.customGoals)?.map(goal => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-xs text-gray-500">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleDeleteCustomGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600">Meta</label>
                        <input
                          type="number"
                          value={goal.target}
                          onChange={e => handleUpdateCustomGoal(goal.id, { target: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-600">Actual</label>
                        <input
                          type="number"
                          value={goal.actual}
                          onChange={e => handleUpdateCustomGoal(goal.id, { actual: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={e => handleUpdateCustomGoal(goal.id, { completed: e.target.checked })}
                        className="rounded"
                      />
                      <span className={goal.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                        Completada
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {goal.actual} / {goal.target} {goal.unit}
                      </span>
                      <span className={`font-bold ${getProgressTextColor(calculateProgress(goal.actual, goal.target))}`}>
                        {calculateProgress(goal.actual, goal.target)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getProgressColor(calculateProgress(goal.actual, goal.target))} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${calculateProgress(goal.actual, goal.target)}%` }}
                      ></div>
                    </div>
                    {goal.completed && (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        ✓ Completada
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
      </div>

      {/* Add Custom Goal Form */}
      {showCustomGoalForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Meta Personalizada</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewCustomGoal({ ...newCustomGoal, icon })}
                    className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center transition-all ${
                      newCustomGoal.icon === icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
              <input
                type="text"
                value={newCustomGoal.title}
                onChange={e => setNewCustomGoal({ ...newCustomGoal, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Publicaciones en Instagram"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
              <input
                type="text"
                value={newCustomGoal.description}
                onChange={e => setNewCustomGoal({ ...newCustomGoal, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Publicar contenido de calidad"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta *</label>
                <input
                  type="number"
                  value={newCustomGoal.target}
                  onChange={e => setNewCustomGoal({ ...newCustomGoal, target: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unidad *</label>
                <input
                  type="text"
                  value={newCustomGoal.unit}
                  onChange={e => setNewCustomGoal({ ...newCustomGoal, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: publicaciones, seguidores, teléfonos"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddCustomGoal}
                disabled={!newCustomGoal.title || !newCustomGoal.unit}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Agregar Meta
              </button>
              <button
                onClick={() => {
                  setShowCustomGoalForm(false);
                  setNewCustomGoal({
                    title: '',
                    description: '',
                    target: 0,
                    actual: 0,
                    unit: '',
                    icon: '🎯',
                    completed: false,
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                ✗ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goals Button */}
      {!isEditing && (
        <div className="flex justify-center gap-3">
          <button
            onClick={handleStartEdit}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            {currentGoal ? '✏️ Editar Metas Estándar' : '🎯 Establecer Metas Estándar'}
          </button>
        </div>
      )}

      {/* Edit Form for Standard Goals */}
      {isEditing && editingGoal && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Metas Estándar de {selectedMonthLabel}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💰 Meta de Ventas (MXN)
              </label>
              <input
                type="number"
                value={editingGoal.salesTarget}
                onChange={e => setEditingGoal({ ...editingGoal, salesTarget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔧 Meta de Reparaciones
              </label>
              <input
                type="number"
                value={editingGoal.repairsTarget}
                onChange={e => setEditingGoal({ ...editingGoal, repairsTarget: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📱 Meta de Dispositivos Vendidos
              </label>
              <input
                type="number"
                value={editingGoal.devicesSoldTarget}
                onChange={e => setEditingGoal({ ...editingGoal, devicesSoldTarget: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Notas (opcional)
              </label>
              <textarea
                value={editingGoal.notes}
                onChange={e => setEditingGoal({ ...editingGoal, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Escribe notas sobre tus metas..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveGoal}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                ✓ Guardar Metas
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                ✗ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Display */}
      {currentGoal && currentGoal.notes && !isEditing && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <h3 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
            <span>📝</span> Notas del Mes
          </h3>
          <p className="text-sm text-yellow-800 whitespace-pre-wrap">{currentGoal.notes}</p>
        </div>
      )}

      {/* Monthly History */}
      {goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Historial de Metas</h3>
          <div className="space-y-3">
            {goals
              .sort((a, b) => b.month.localeCompare(a.month))
              .slice(0, 6)
              .map(goal => {
                const [y, m] = goal.month.split('-');
                const label = `${monthNames[parseInt(m) - 1]} ${y}`;
                
                const customProgress = goal.customGoals?.length
                  ? goal.customGoals.reduce((sum, g) => sum + calculateProgress(g.actual, g.target), 0) / goal.customGoals.length
                  : 0;
                
                const progress = Math.round(
                  (calculateProgress(goal.salesActual, goal.salesTarget) +
                    calculateProgress(goal.repairsActual, goal.repairsTarget) +
                    calculateProgress(goal.devicesSoldActual, goal.devicesSoldTarget) +
                    customProgress) /
                  (3 + (goal.customGoals?.length || 0))
                );

                return (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(goal.salesActual)} • {goal.repairsActual} rep. • {goal.devicesSoldActual} disp.
                        {goal.customGoals && goal.customGoals.length > 0 && (
                          <span> • {goal.customGoals.length} metas personalizadas</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getProgressTextColor(progress)}`}>
                        {progress}%
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
