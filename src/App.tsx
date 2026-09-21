import { useState, useEffect } from 'react';
import { Device, Lot, Sale, QualityCheck, CheckSlot, Customer, Repair, MonthlyExpense, TabType } from './types';
import {
  getDevices, saveDevices, getLots, saveLots,
  getSales, saveSales, getQualityChecks, saveQualityChecks,
  getCheckSlots, saveCheckSlots, generateSlotsForLot, addCheckSlots, updateCheckSlot,
  addDevice, updateDevice, deleteDevice,
  addLot, updateLot, deleteLot,
  addSale, updateSale, deleteSale,
  addQualityCheck, updateQualityCheck, deleteQualityCheck,
  getLotTotalQuantity,
  generateId,
  getCustomers, deleteCustomer,
  getRepairs, addRepair, updateRepair, deleteRepair,
  getMonthlyExpenses, addMonthlyExpense, updateMonthlyExpense, deleteMonthlyExpense
} from './store';
import { firebaseDevices, firebaseLots, firebaseSales, firebaseChecks, firebaseSlots, firebaseCustomers, firebaseRepairs, firebaseExpenses, firebaseGoals } from './firebaseService';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Lots from './components/Lots';
import DeviceForm from './components/DeviceForm';
import LotForm from './components/LotForm';
import Sales from './components/Sales';
import SaleForm from './components/SaleForm';
import QualityChecks from './components/QualityChecks';
import QualityCheckForm from './components/QualityCheckForm';
import CheckLot from './components/CheckLot';
import Customers from './components/Customers';
import Policy from './components/Policy';
import Repairs from './components/Repairs';
import RepairForm from './components/RepairForm';
import FinancialAnalysis from './components/FinancialAnalysis';
import Goals from './components/Goals';
import FirebaseConfig from './components/FirebaseConfig';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [devices, setDevices] = useState<Device[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [checks, setChecks] = useState<QualityCheck[]>([]);
  const [slots, setSlots] = useState<CheckSlot[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingCheck, setEditingCheck] = useState<QualityCheck | null>(null);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [checkingLotId, setCheckingLotId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSaleForPolicy, setLastSaleForPolicy] = useState<Sale | null>(null);

  useEffect(() => {
    // Cargar datos desde Firebase
    const loadData = async () => {
      try {
        console.log('🔄 Cargando datos desde Firebase...');
        
        const [devicesData, lotsData, salesData, checksData, slotsData, customersData, repairsData, expensesData] = await Promise.all([
          firebaseDevices.getAll(),
          firebaseLots.getAll(),
          firebaseSales.getAll(),
          firebaseChecks.getAll(),
          firebaseSlots.getAll(),
          firebaseCustomers.getAll(),
          firebaseRepairs.getAll(),
          firebaseExpenses.getAll()
        ]);
        
        console.log('✅ Datos cargados desde Firebase:', {
          devices: devicesData.length,
          lots: lotsData.length,
          sales: salesData.length,
          checks: checksData.length,
          slots: slotsData.length,
          customers: customersData.length,
          repairs: repairsData.length,
          expenses: expensesData.length
        });
        
        setDevices(devicesData);
        setLots(lotsData);
        setSales(salesData);
        setChecks(checksData);
        setSlots(slotsData);
        setCustomers(customersData);
        setRepairs(repairsData);
        setMonthlyExpenses(expensesData);
      } catch (error) {
        console.error('❌ Error cargando datos desde Firebase:', error);
        // Fallback a localStorage si Firebase falla
        console.log('🔄 Usando datos locales como fallback...');
        setDevices(getDevices());
        setLots(getLots());
        setSales(getSales());
        setChecks(getQualityChecks());
        setSlots(getCheckSlots());
        setCustomers(getCustomers());
        setRepairs(getRepairs());
        setMonthlyExpenses(getMonthlyExpenses());
      }
    };
    
    loadData();
  }, []);

  // Device handlers
  const handleSaveDevice = async (device: Device) => {
    try {
      if (editingDevice) {
        await firebaseDevices.update(device);
      } else {
        await firebaseDevices.add(device);
      }
      // Actualizar estado local
      const updatedDevices = await firebaseDevices.getAll();
      setDevices(updatedDevices);
      setEditingDevice(null);
      setActiveTab('inventory');
    } catch (error) {
      console.error('Error guardando dispositivo:', error);
      alert('Error al guardar el dispositivo. Intenta de nuevo.');
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await firebaseDevices.delete(id);
      const updatedDevices = await firebaseDevices.getAll();
      setDevices(updatedDevices);
    } catch (error) {
      console.error('Error eliminando dispositivo:', error);
      alert('Error al eliminar el dispositivo. Intenta de nuevo.');
    }
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setActiveTab('add-device');
  };

  // Lot handlers
  const handleSaveLot = async (lot: Lot) => {
    try {
      if (editingLot) {
        await firebaseLots.update(lot);
        const existingSlots = (await firebaseSlots.getAll()).filter(s => s.lotId !== lot.id);
        const newSlots = generateSlotsForLot(lot);
        await firebaseSlots.addMany(newSlots);
        const updatedSlots = await firebaseSlots.getAll();
        setSlots(updatedSlots);
      } else {
        await firebaseLots.add(lot);
        const newSlots = generateSlotsForLot(lot);
        await firebaseSlots.addMany(newSlots);
        const updatedSlots = await firebaseSlots.getAll();
        setSlots(updatedSlots);
      }
      const updatedLots = await firebaseLots.getAll();
      setLots(updatedLots);
      setEditingLot(null);
      setActiveTab('lots');
    } catch (error) {
      console.error('Error guardando lote:', error);
      alert('Error al guardar el lote. Intenta de nuevo.');
    }
  };

  const handleDeleteLot = async (id: string) => {
    try {
      await firebaseLots.delete(id);
      const updatedLots = await firebaseLots.getAll();
      const updatedSlots = await firebaseSlots.getAll();
      setLots(updatedLots);
      setSlots(updatedSlots);
    } catch (error) {
      console.error('Error eliminando lote:', error);
      alert('Error al eliminar el lote. Intenta de nuevo.');
    }
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setActiveTab('add-lot');
  };

  const handleCheckLot = (lotId: string) => {
    setCheckingLotId(lotId);
    setActiveTab('check-lot');
  };

  const handleSlotUpdate = async (slot: CheckSlot) => {
    try {
      await firebaseSlots.update(slot);
      const updatedSlots = await firebaseSlots.getAll();
      setSlots(updatedSlots);
    } catch (error) {
      console.error('Error actualizando slot:', error);
      alert('Error al actualizar el slot. Intenta de nuevo.');
    }
  };

  const handleCheckComplete = async (check: QualityCheck, lot: Lot) => {
    try {
      await firebaseChecks.add(check);
      const updatedChecks = await firebaseChecks.getAll();
      setChecks(updatedChecks);
      
      // Create device in inventory automatically
      const slot = slots.find(s => s.id === check.slotId);
      if (slot) {
        // Calculate prorated costs from lot
        const totalQuantity = getLotTotalQuantity(lot);
        const rate = lot.exchangeRate || 0;
        const subtotalMXN = lot.totalPrice * rate;
        const totalCostMXN = subtotalMXN + lot.importExpenses + lot.shippingExpenses + lot.otherExpenses;
        const costPerUnit = totalQuantity > 0 ? totalCostMXN / totalQuantity : 0;
        
        // Create device with prorated costs
        const newDevice: Device = {
          id: generateId(),
          imei: slot.imei,
          model: slot.model,
          color: slot.color,
          storage: slot.storage,
          purchaseDate: lot.purchaseDate,
          arrivalDate: lot.arrivalDate,
          purchasePrice: costPerUnit, // Prorated cost
          importExpenses: 0, // Already included in prorated cost
          shippingExpenses: 0, // Already included in prorated cost
          otherExpenses: 0, // Already included in prorated cost
          status: check.overallStatus === 'approved' ? 'in_stock' : 'received',
          lotId: lot.id,
          notes: '',
          checked: true,
          checkDate: check.checkDate,
        };
        
        await firebaseDevices.add(newDevice);
        const updatedDevices = await firebaseDevices.getAll();
        setDevices(updatedDevices);
        
        // Mark slot as checked
        await firebaseSlots.update({ ...slot, checked: true, checkId: check.id });
        const updatedSlots = await firebaseSlots.getAll();
        setSlots(updatedSlots);
      }
    } catch (error) {
      console.error('Error completando chequeo:', error);
      alert('Error al completar el chequeo. Intenta de nuevo.');
    }
  };

  // Sale handlers
  const handleSaveSale = async (sale: Sale) => {
    try {
      if (editingSale) {
        await firebaseSales.update(sale);
        setEditingSale(null);
        setActiveTab('sales');
      } else {
        await firebaseSales.add(sale);
        setLastSaleForPolicy(sale);
      }
      // Update device status to sold
      const updatedDevices = await firebaseDevices.getAll();
      const deviceIndex = updatedDevices.findIndex(d => d.id === sale.deviceId);
      if (deviceIndex !== -1) {
        updatedDevices[deviceIndex] = {
          ...updatedDevices[deviceIndex],
          status: 'sold',
          salePrice: sale.salePrice,
          saleDate: sale.saleDate,
        };
        await firebaseDevices.update(updatedDevices[deviceIndex]);
        setDevices(updatedDevices);
      }
      const updatedSales = await firebaseSales.getAll();
      const updatedCustomers = await firebaseCustomers.getAll();
      setSales(updatedSales);
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error guardando venta:', error);
      alert('Error al guardar la venta. Intenta de nuevo.');
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await firebaseSales.delete(id);
      const updatedSales = await firebaseSales.getAll();
      setSales(updatedSales);
    } catch (error) {
      console.error('Error eliminando venta:', error);
      alert('Error al eliminar la venta. Intenta de nuevo.');
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab('add-sale');
  };

  const handleUpdateSale = async (sale: Sale) => {
    try {
      await firebaseSales.update(sale);
      const updatedSales = await firebaseSales.getAll();
      setSales(updatedSales);
    } catch (error) {
      console.error('Error actualizando venta:', error);
      alert('Error al actualizar la venta. Intenta de nuevo.');
    }
  };

  // Quality Check handlers
  const handleSaveCheck = async (check: QualityCheck) => {
    try {
      if (editingCheck) {
        await firebaseChecks.update(check);
      } else {
        await firebaseChecks.add(check);
      }
      const updatedChecks = await firebaseChecks.getAll();
      setChecks(updatedChecks);
      const slot = slots.find(s => s.id === check.slotId);
      if (slot) {
        await firebaseSlots.update({ ...slot, checked: true, checkId: check.id });
        const updatedSlots = await firebaseSlots.getAll();
        setSlots(updatedSlots);
      }
      setEditingCheck(null);
      setActiveTab('quality-check');
    } catch (error) {
      console.error('Error guardando chequeo:', error);
      alert('Error al guardar el chequeo. Intenta de nuevo.');
    }
  };

  const handleDeleteCheck = async (id: string) => {
    try {
      await firebaseChecks.delete(id);
      const updatedChecks = await firebaseChecks.getAll();
      setChecks(updatedChecks);
    } catch (error) {
      console.error('Error eliminando chequeo:', error);
      alert('Error al eliminar el chequeo. Intenta de nuevo.');
    }
  };

  const handleEditCheck = (check: QualityCheck) => {
    setEditingCheck(check);
    setActiveTab('add-check');
  };

  // Customer handlers
  const handleDeleteCustomer = async (id: string) => {
    try {
      await firebaseCustomers.delete(id);
      const updatedCustomers = await firebaseCustomers.getAll();
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente. Intenta de nuevo.');
    }
  };

  // Repair handlers
  const handleSaveRepair = async (repair: Repair) => {
    try {
      if (editingRepair) {
        await firebaseRepairs.update(repair);
      } else {
        await firebaseRepairs.add(repair);
      }
      const updatedRepairs = await firebaseRepairs.getAll();
      setRepairs(updatedRepairs);
      setEditingRepair(null);
      setActiveTab('repairs');
    } catch (error) {
      console.error('Error guardando reparación:', error);
      alert('Error al guardar la reparación. Intenta de nuevo.');
    }
  };

  const handleDeleteRepair = async (id: string) => {
    try {
      await firebaseRepairs.delete(id);
      const updatedRepairs = await firebaseRepairs.getAll();
      setRepairs(updatedRepairs);
    } catch (error) {
      console.error('Error eliminando reparación:', error);
      alert('Error al eliminar la reparación. Intenta de nuevo.');
    }
  };

  const handleEditRepair = async (repair: Repair) => {
    // Si el repair ya existe (tiene completedDate o status diferente), es una actualización rápida
    const existingRepair = repairs.find(r => r.id === repair.id);
    if (existingRepair) {
      try {
        await firebaseRepairs.update(repair);
        const updatedRepairs = await firebaseRepairs.getAll();
        setRepairs(updatedRepairs);
      } catch (error) {
        console.error('Error actualizando reparación:', error);
        alert('Error al actualizar la reparación. Intenta de nuevo.');
      }
    } else {
      setEditingRepair(repair);
      setActiveTab('add-repair');
    }
  };

  // Monthly Expense handlers
  const handleAddExpense = async (expense: MonthlyExpense) => {
    try {
      await firebaseExpenses.add(expense);
      const updatedExpenses = await firebaseExpenses.getAll();
      setMonthlyExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error agregando gasto:', error);
      alert('Error al agregar el gasto. Intenta de nuevo.');
    }
  };

  const handleUpdateExpense = async (expense: MonthlyExpense) => {
    try {
      await firebaseExpenses.update(expense);
      const updatedExpenses = await firebaseExpenses.getAll();
      setMonthlyExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error actualizando gasto:', error);
      alert('Error al actualizar el gasto. Intenta de nuevo.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await firebaseExpenses.delete(id);
      const updatedExpenses = await firebaseExpenses.getAll();
      setMonthlyExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      alert('Error al eliminar el gasto. Intenta de nuevo.');
    }
  };

  const pendingSlots = slots.filter(s => !s.checked);
  const checkingLot = checkingLotId ? lots.find(l => l.id === checkingLotId) : null;
  const checkingLotSlots = checkingLotId ? slots.filter(s => s.lotId === checkingLotId) : [];

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'inventory' as TabType, label: 'Inventario', icon: '📱' },
    { id: 'lots' as TabType, label: 'Lotes', icon: '📦' },
    { id: 'sales' as TabType, label: 'Ventas', icon: '💰' },
    { id: 'financial' as TabType, label: 'Análisis Financiero', icon: '📈' },
    { id: 'goals' as TabType, label: 'Metas', icon: '🎯' },
    { id: 'repairs' as TabType, label: 'Reparaciones', icon: '🔧' },
    { id: 'customers' as TabType, label: 'Clientes', icon: '👥' },
    { id: 'quality-check' as TabType, label: 'Historial Chequeo', icon: '📋' },
    { id: 'add-lot' as TabType, label: 'Nuevo Lote', icon: '🏷️' },
    { id: 'add-device' as TabType, label: 'Nuevo Dispositivo', icon: '➕' },
    { id: 'add-sale' as TabType, label: 'Nueva Venta', icon: '🛒' },
    { id: 'add-repair' as TabType, label: 'Nueva Reparación', icon: '🔨' },
  ];

  // Verificar si Firebase está configurado
  const isFirebaseConfigured = () => {
    try {
      const config = (window as any).firebaseConfig;
      return config && config.apiKey && config.apiKey !== "TU_API_KEY_AQUI";
    } catch {
      return false;
    }
  };

  // Si Firebase no está configurado, mostrar página de configuración
  if (!isFirebaseConfigured() && window.location.pathname === '/firebase-setup') {
    return <FirebaseConfig />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard devices={devices} lots={lots} sales={sales} checks={checks} customers={customers} />;
      case 'inventory':
        return <Inventory devices={devices} lots={lots} onEdit={handleEditDevice} onDelete={handleDeleteDevice} />;
      case 'lots':
        return <Lots lots={lots} devices={devices} slots={slots} onEdit={handleEditLot} onDelete={handleDeleteLot} onCheckLot={handleCheckLot} />;
      case 'sales':
        return <Sales sales={sales} lots={lots} onEdit={handleEditSale} onDelete={handleDeleteSale} onUpdateSale={handleUpdateSale} />;
      case 'financial':
        return <FinancialAnalysis 
          sales={sales} 
          lots={lots} 
          devices={devices}
          monthlyExpenses={monthlyExpenses}
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
        />;
      case 'goals':
        return <Goals sales={sales} repairs={repairs} />;
      case 'customers':
        return <Customers customers={customers} sales={sales} repairs={repairs} onDelete={handleDeleteCustomer} />;
      case 'repairs':
        return <Repairs repairs={repairs} onEdit={handleEditRepair} onDelete={handleDeleteRepair} />;
      case 'quality-check':
        return <QualityChecks checks={checks} lots={lots} onEdit={handleEditCheck} onDelete={handleDeleteCheck} />;
      case 'check-lot':
        if (checkingLot) {
          return (
            <CheckLot
              lot={checkingLot}
              slots={checkingLotSlots}
              onSlotUpdate={handleSlotUpdate}
              onCheckComplete={(check) => handleCheckComplete(check, checkingLot)}
              onBack={() => { setCheckingLotId(null); setActiveTab('lots'); }}
            />
          );
        }
        return <Lots lots={lots} devices={devices} slots={slots} onEdit={handleEditLot} onDelete={handleDeleteLot} onCheckLot={handleCheckLot} />;
      case 'add-device':
        return <DeviceForm lots={lots} onSave={handleSaveDevice} editingDevice={editingDevice} onCancel={() => { setEditingDevice(null); setActiveTab('inventory'); }} />;
      case 'add-lot':
        return <LotForm onSave={handleSaveLot} editingLot={editingLot} onCancel={() => { setEditingLot(null); setActiveTab('lots'); }} />;
      case 'add-sale':
        return <SaleForm devices={devices} lots={lots} onSave={handleSaveSale} editingSale={editingSale} onCancel={() => { setEditingSale(null); setActiveTab('sales'); }} />;
      case 'add-repair':
        return <RepairForm onSave={handleSaveRepair} editingRepair={editingRepair} onCancel={() => { setEditingRepair(null); setActiveTab('repairs'); }} />;
      case 'add-check':
        return <QualityCheckForm pendingSlots={pendingSlots} onSave={handleSaveCheck} editingCheck={editingCheck} onCancel={() => { setEditingCheck(null); setActiveTab('quality-check'); }} />;
      default:
        return <Dashboard devices={devices} lots={lots} sales={sales} checks={checks} customers={customers} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📱</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">iPhone Tracker</h1>
              <p className="text-xs text-gray-500">Gestión de Inventario</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                  if (item.id === 'add-device') setEditingDevice(null);
                  if (item.id === 'add-lot') setEditingLot(null);
                  if (item.id === 'add-sale') setEditingSale(null);
                  if (item.id === 'add-check') setEditingCheck(null);
                  if (item.id === 'add-repair') setEditingRepair(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {pendingSlots.length > 0 && (
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <p className="text-xs text-teal-700 font-medium">⚡ Pendientes de checar</p>
              <p className="text-lg font-bold text-teal-800">{pendingSlots.length} dispositivos</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Total en sistema</p>
            <p className="text-lg font-bold text-gray-900">{devices.length} dispositivos</p>
            <p className="text-xs text-gray-500">{lots.length} lotes • {sales.length} ventas</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <header className="bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-8 py-3 lg:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="hidden lg:inline">Sistema activo</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                <button
                  onClick={() => { setActiveTab('add-lot'); setEditingLot(null); }}
                  className="px-2.5 sm:px-3 py-2 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                >
                  <span>+</span>
                  <span className="hidden sm:inline">Lote</span>
              </button>
              <button
                  onClick={() => { setActiveTab('add-device'); setEditingDevice(null); }}
                  className="px-2.5 sm:px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <span>+</span>
                  <span className="hidden sm:inline">Dispositivo</span>
                </button>
                <button
                  onClick={() => { setActiveTab('add-sale'); setEditingSale(null); }}
                  className="px-2.5 sm:px-3 py-2 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <span>💰</span>
                  <span className="hidden sm:inline">Venta</span>
                </button>
                <button
                  onClick={() => { setActiveTab('add-repair'); setEditingRepair(null); }}
                  className="px-2.5 sm:px-3 py-2 bg-orange-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
                >
                  <span>🔧</span>
                  <span className="hidden sm:inline">Reparación</span>
                </button>
                {pendingSlots.length > 0 && (
                  <button
                    onClick={() => {
                      const lotWithPending = lots.find(l => slots.some(s => s.lotId === l.id && !s.checked));
                      if (lotWithPending) {
                        handleCheckLot(lotWithPending.id);
                      }
                    }}
                    className="px-2.5 sm:px-3 py-2 bg-teal-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                  >
                    <span>🔍</span>
                    <span className="hidden sm:inline">Checar ({pendingSlots.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-4 lg:p-8">
          {renderContent()}
        </div>

        {/* Bottom Navigation for Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="grid grid-cols-6 gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center py-2 px-1 ${
                activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">📊</span>
              <span className="text-xs mt-0.5">Inicio</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex flex-col items-center justify-center py-2 px-1 ${
                activeTab === 'inventory' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">📱</span>
              <span className="text-xs mt-0.5">Inventario</span>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex flex-col items-center justify-center py-2 px-1 ${
                activeTab === 'sales' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">💰</span>
              <span className="text-xs mt-0.5">Ventas</span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex flex-col items-center justify-center py-2 px-1 ${
                activeTab === 'goals' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">🎯</span>
              <span className="text-xs mt-0.5">Metas</span>
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              className={`flex flex-col items-center justify-center py-2 px-1 ${
                activeTab === 'repairs' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <span className="text-xl">🔧</span>
              <span className="text-xs mt-0.5">Reparaciones</span>
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 text-gray-600"
            >
              <span className="text-xl">☰</span>
              <span className="text-xs mt-0.5">Menú</span>
            </button>
          </div>
        </nav>
      </main>

      {/* Policy Modal - shown after new sale */}
      {lastSaleForPolicy && (
        <Policy
          sale={lastSaleForPolicy}
          lot={lots.find(l => l.id === lastSaleForPolicy.lotId)}
          onClose={() => setLastSaleForPolicy(null)}
        />
      )}
    </div>
  );
}
