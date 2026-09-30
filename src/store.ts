import { Device, Lot, LotItem, Sale, QualityCheck, CheckSlot, MonthlyExpense, MonthlyGoal, Refaccion } from './types';

const DEVICES_KEY = 'iphone_tracker_devices';
const LOTS_KEY = 'iphone_tracker_lots';
const SALES_KEY = 'iphone_tracker_sales';
const QUALITY_CHECKS_KEY = 'iphone_tracker_checks';
const CHECK_SLOTS_KEY = 'iphone_tracker_slots';
const MONTHLY_EXPENSES_KEY = 'iphone_tracker_monthly_expenses';
const MONTHLY_GOALS_KEY = 'iphone_tracker_monthly_goals';

// Devices
export function getDevices(): Device[] {
  const data = localStorage.getItem(DEVICES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveDevices(devices: Device[]): void {
  localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
}

export function addDevice(device: Device): void {
  const devices = getDevices();
  devices.push(device);
  saveDevices(devices);
}

export function updateDevice(device: Device): void {
  const devices = getDevices();
  const index = devices.findIndex(d => d.id === device.id);
  if (index !== -1) {
    devices[index] = device;
    saveDevices(devices);
  }
}

export function deleteDevice(id: string): void {
  const devices = getDevices().filter(d => d.id !== id);
  saveDevices(devices);
}

// Lots
export function getLots(): Lot[] {
  const data = localStorage.getItem(LOTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLots(lots: Lot[]): void {
  localStorage.setItem(LOTS_KEY, JSON.stringify(lots));
}

export function addLot(lot: Lot): void {
  const lots = getLots();
  lots.push(lot);
  saveLots(lots);
}

export function updateLot(lot: Lot): void {
  const lots = getLots();
  const index = lots.findIndex(l => l.id === lot.id);
  if (index !== -1) {
    lots[index] = lot;
    saveLots(lots);
  }
}

export function deleteLot(id: string): void {
  const lots = getLots().filter(l => l.id !== id);
  saveLots(lots);
  // Also delete associated slots
  const slots = getCheckSlots().filter(s => s.lotId !== id);
  saveCheckSlots(slots);
}

// Check Slots
export function getCheckSlots(): CheckSlot[] {
  const data = localStorage.getItem(CHECK_SLOTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCheckSlots(slots: CheckSlot[]): void {
  localStorage.setItem(CHECK_SLOTS_KEY, JSON.stringify(slots));
}

export function generateSlotsForLot(lot: Lot): CheckSlot[] {
  const slots: CheckSlot[] = [];
  const items = lot.items || [];
  items.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      slots.push({
        id: generateId(),
        lotId: lot.id,
        model: item.model,
        imei: '',
        color: '',
        storage: '',
        checked: false,
      });
    }
  });
  return slots;
}

export function addCheckSlots(slots: CheckSlot[]): void {
  const existing = getCheckSlots();
  saveCheckSlots([...existing, ...slots]);
}

export function updateCheckSlot(slot: CheckSlot): void {
  const slots = getCheckSlots();
  const index = slots.findIndex(s => s.id === slot.id);
  if (index !== -1) {
    slots[index] = slot;
    saveCheckSlots(slots);
  }
}

export function getSlotsForLot(lotId: string): CheckSlot[] {
  return getCheckSlots().filter(s => s.lotId === lotId);
}

export function getPendingSlots(): CheckSlot[] {
  return getCheckSlots().filter(s => !s.checked);
}

// Sales
export function getSales(): Sale[] {
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSales(sales: Sale[]): void {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

export function addSale(sale: Sale): void {
  const sales = getSales();
  sales.push(sale);
  saveSales(sales);
}

export function updateSale(sale: Sale): void {
  const sales = getSales();
  const index = sales.findIndex(s => s.id === sale.id);
  if (index !== -1) {
    sales[index] = sale;
    saveSales(sales);
  }
}

export function deleteSale(id: string): void {
  const sales = getSales().filter(s => s.id !== id);
  saveSales(sales);
}

// Quality Checks
export function getQualityChecks(): QualityCheck[] {
  const data = localStorage.getItem(QUALITY_CHECKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveQualityChecks(checks: QualityCheck[]): void {
  localStorage.setItem(QUALITY_CHECKS_KEY, JSON.stringify(checks));
}

export function addQualityCheck(check: QualityCheck): void {
  const checks = getQualityChecks();
  checks.push(check);
  saveQualityChecks(checks);
}

export function updateQualityCheck(check: QualityCheck): void {
  const checks = getQualityChecks();
  const index = checks.findIndex(c => c.id === check.id);
  if (index !== -1) {
    checks[index] = check;
    saveQualityChecks(checks);
  }
}

export function deleteQualityCheck(id: string): void {
  const checks = getQualityChecks().filter(c => c.id !== id);
  saveQualityChecks(checks);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const IPHONE_MODELS = [
  'iPhone 11',
  'iPhone 11 Pro',
  'iPhone 11 Pro Max',
  'iPhone 12',
  'iPhone 12 Pro',
  'iPhone 12 Pro Max',
  'iPhone 13',
  'iPhone 13 Pro',
  'iPhone 13 Pro Max',
  'iPhone 14',
  'iPhone 14 Pro',
  'iPhone 14 Pro Max',
  'iPhone 15',
  'iPhone 15 Pro',
  'iPhone 15 Pro Max',
  'iPhone 16',
  'iPhone 16 Pro',
  'iPhone 16 Pro Max',
  'iPhone 17',
  'iPhone 17 Pro',
  'iPhone 17 Pro Max',
];

export const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];

export const COLOR_OPTIONS = [
  'Negro',
  'Blanco',
  'Plateado',
  'Dorado',
  'Azul',
  'Rojo',
  'Verde',
  'Morado',
  'Gris',
  'Natural Titanium',
  'Azul Titanium',
  'Negro Titanium',
  'Desert Titanium',
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getLotTotalQuantity(lot: Lot): number {
  const items = lot.items || [];
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getLotItems(lot: Lot): LotItem[] {
  return lot.items || [];
}

// Suppliers (Proveedores)
const SUPPLIERS_KEY = 'iphone_tracker_suppliers';

export function getSuppliers(): string[] {
  const data = localStorage.getItem(SUPPLIERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSuppliers(suppliers: string[]): void {
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

export function addSupplier(name: string): void {
  const suppliers = getSuppliers();
  if (!suppliers.includes(name)) {
    suppliers.push(name);
    saveSuppliers(suppliers);
  }
}

// Reviewers (Revisores)
const REVIEWERS_KEY = 'iphone_tracker_reviewers';

export function getReviewers(): string[] {
  const data = localStorage.getItem(REVIEWERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveReviewers(reviewers: string[]): void {
  localStorage.setItem(REVIEWERS_KEY, JSON.stringify(reviewers));
}

export function addReviewer(name: string): void {
  const reviewers = getReviewers();
  if (!reviewers.includes(name)) {
    reviewers.push(name);
    saveReviewers(reviewers);
  }
}

// Customers (Clientes)
import { Customer, Repair } from './types';

const CUSTOMERS_KEY = 'iphone_tracker_customers';
const REPAIRS_KEY = 'iphone_tracker_repairs';

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function addOrUpdateCustomer(name: string, phone: string, email: string | undefined, saleAmount: number, saleDate: string): void {
  const customers = getCustomers();
  const existingIndex = customers.findIndex(c => c.phone === phone || c.name === name);
  
  if (existingIndex !== -1) {
    // Update existing customer
    const customer = customers[existingIndex];
    customer.totalPurchases += 1;
    customer.totalSpent += saleAmount;
    customer.lastPurchaseDate = saleDate;
    if (email && !customer.email) {
      customer.email = email;
    }
    if (saleDate < customer.firstPurchaseDate) {
      customer.firstPurchaseDate = saleDate;
    }
    customers[existingIndex] = customer;
  } else {
    // Add new customer
    const newCustomer: Customer = {
      id: generateId(),
      name,
      phone,
      email: email || undefined,
      totalPurchases: 1,
      totalSpent: saleAmount,
      firstPurchaseDate: saleDate,
      lastPurchaseDate: saleDate,
    };
    customers.push(newCustomer);
  }
  
  saveCustomers(customers);
}

export function deleteCustomer(id: string): void {
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
}

// Repairs (Reparaciones)
export function getRepairs(): Repair[] {
  const data = localStorage.getItem(REPAIRS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRepairs(repairs: Repair[]): void {
  localStorage.setItem(REPAIRS_KEY, JSON.stringify(repairs));
}

export function addRepair(repair: Repair): void {
  const repairs = getRepairs();
  repairs.push(repair);
  saveRepairs(repairs);
}

export function updateRepair(repair: Repair): void {
  const repairs = getRepairs();
  const index = repairs.findIndex(r => r.id === repair.id);
  if (index !== -1) {
    repairs[index] = repair;
    saveRepairs(repairs);
  }
}

export function deleteRepair(id: string): void {
  const repairs = getRepairs().filter(r => r.id !== id);
  saveRepairs(repairs);
}

// Monthly Expenses (Gastos Mensuales)
export function getMonthlyExpenses(): MonthlyExpense[] {
  const data = localStorage.getItem(MONTHLY_EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMonthlyExpenses(expenses: MonthlyExpense[]): void {
  localStorage.setItem(MONTHLY_EXPENSES_KEY, JSON.stringify(expenses));
}

export function addMonthlyExpense(expense: MonthlyExpense): void {
  const expenses = getMonthlyExpenses();
  expenses.push(expense);
  saveMonthlyExpenses(expenses);
}

export function updateMonthlyExpense(expense: MonthlyExpense): void {
  const expenses = getMonthlyExpenses();
  const index = expenses.findIndex(e => e.id === expense.id);
  if (index !== -1) {
    expenses[index] = expense;
    saveMonthlyExpenses(expenses);
  }
}

export function deleteMonthlyExpense(id: string): void {
  const expenses = getMonthlyExpenses().filter(e => e.id !== id);
  saveMonthlyExpenses(expenses);
}

// Monthly Goals (Metas Mensuales)
export function getMonthlyGoals(): MonthlyGoal[] {
  const data = localStorage.getItem(MONTHLY_GOALS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMonthlyGoals(goals: MonthlyGoal[]): void {
  localStorage.setItem(MONTHLY_GOALS_KEY, JSON.stringify(goals));
}

export function addMonthlyGoal(goal: MonthlyGoal): void {
  const goals = getMonthlyGoals();
  goals.push(goal);
  saveMonthlyGoals(goals);
}

export function updateMonthlyGoal(goal: MonthlyGoal): void {
  const goals = getMonthlyGoals();
  const index = goals.findIndex(g => g.id === goal.id);
  if (index !== -1) {
    goals[index] = goal;
    saveMonthlyGoals(goals);
  }
}

export function deleteMonthlyGoal(id: string): void {
  const goals = getMonthlyGoals().filter(g => g.id !== id);
  saveMonthlyGoals(goals);
}

export function getMonthlyGoalByMonth(month: string): MonthlyGoal | undefined {
  const goals = getMonthlyGoals();
  return goals.find(g => g.month === month);
}

// ============ Refacciones (Inventario de repuestos) ============
const REFACCIONES_KEY = 'iphone_tracker_refacciones';

export const REFACCION_CATEGORIES = [
  'Baterías',
  'Pantallas',
  'Cámaras',
  'Botones / Flex',
  'Puertos de carga',
  'Altavoces / Buzzer',
  'Micrófonos',
  'Antenas / WiFi',
  'Vidrio trasero',
  'Chasis / Carcasas',
  'Cargadores / Accesorios',
  'Herramienta',
  'Otros',
];

export function getRefacciones(): Refaccion[] {
  try {
    const data = localStorage.getItem(REFACCIONES_KEY);
    const list = data ? JSON.parse(data) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveRefacciones(refacciones: Refaccion[]): void {
  localStorage.setItem(REFACCIONES_KEY, JSON.stringify(refacciones || []));
}

export function addRefaccion(refaccion: Refaccion): void {
  const list = getRefacciones();
  list.push(refaccion);
  saveRefacciones(list);
}

export function updateRefaccion(refaccion: Refaccion): void {
  const list = getRefacciones();
  const index = list.findIndex(r => r.id === refaccion.id);
  if (index !== -1) {
    list[index] = refaccion;
    saveRefacciones(list);
  } else {
    list.push(refaccion);
    saveRefacciones(list);
  }
}

export function deleteRefaccion(id: string): void {
  saveRefacciones(getRefacciones().filter(r => r.id !== id));
}

// Descuenta existencias al usar una refacción en una reparación
export function consumeRefaccion(id: string, qty = 1): void {
  const list = getRefacciones();
  const index = list.findIndex(r => r.id === id);
  if (index !== -1) {
    list[index].quantity = Math.max(0, (list[index].quantity || 0) - qty);
    saveRefacciones(list);
  }
}

// ============ Precios sugeridos por canal de venta (refacciones) ============
//
// Reglas del negocio:
//   • Taller          → precio base × 1.30
//   • Mercado Libre   → ((precio base × 1.25) + 59.60) / 0.7145
//                       (margen del 25% sobre el precio, más la comisión fija
//                        de publicación y la comisión porcentual de ML)
//
// El "precio base" es el precio de venta registrado en el catálogo
// (salePrice). Si no hay precio de venta se usa el costo (costPrice), para que
// siempre exista una referencia calculable.

export const TALLER_MULTIPLIER = 1.30;              // precio × 1.30
export const ML_MARGIN_MULTIPLIER = 1.25;          // precio × 1.25
export const ML_FIXED_COMMISSION = 59.60;          // + $59.60 fijos
export const ML_PERCENT_COMMISSION = 0.7145;       // ÷ 0.7145 (comisión ML)

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Precio unitario base usado para las sugerencias (venta > costo) */
export function refaccionBasePrice(r?: Refaccion | null): number {
  if (!r) return 0;
  const sale = Number(r.salePrice) || 0;
  if (sale > 0) return sale;
  return Number(r.costPrice) || 0;
}

/** Precio sugerido para venta a TALLER: precio × 1.30 */
export function calcTallerPrice(base: number): number {
  const b = Number(base) || 0;
  if (b <= 0) return 0;
  return round2(b * TALLER_MULTIPLIER);
}

/** Precio sugerido para MERCADO LIBRE: ((precio × 1.25) + 59.60) / 0.7145 */
export function calcMercadoLibrePrice(base: number): number {
  const b = Number(base) || 0;
  if (b <= 0) return 0;
  return round2((b * ML_MARGIN_MULTIPLIER + ML_FIXED_COMMISSION) / ML_PERCENT_COMMISSION);
}

/** Devuelve el precio unitario sugerido según el canal elegido */
export function suggestedUnitPriceByChannel(
  channel: Sale['saleChannel'],
  r?: Refaccion | null
): number {
  if (!r) return 0;
  const base = refaccionBasePrice(r);
  if (channel === 'taller') return tallerPrice(r, base);
  if (channel === 'mercadolibre') return mercadoLibrePrice(r, base);
  return round2(base); // mostrador / general
}

/**
 * Precio de TALLER guardado en la refacción. Si el usuario lo editó a mano se
 * respeta ese valor; si viene vacío se calcula automáticamente.
 */
export function tallerPrice(r?: Refaccion | null, base?: number): number {
  if (!r) return 0;
  const saved = Number(r.suggestedTallerPrice) || 0;
  if (saved > 0) return round2(saved);
  return calcTallerPrice(base !== undefined ? base : refaccionBasePrice(r));
}

/** Precio de MERCADO LIBRE guardado (o calculado si viene vacío) */
export function mercadoLibrePrice(r?: Refaccion | null, base?: number): number {
  if (!r) return 0;
  const saved = Number(r.suggestedMercadoLibrePrice) || 0;
  if (saved > 0) return round2(saved);
  return calcMercadoLibrePrice(base !== undefined ? base : refaccionBasePrice(r));
}

/**
 * Normaliza un registro de refacción asegurando que traiga los campos nuevos
 * (documentos antiguos de Firestore/localStorage pueden venir sin ellos).
 */
export function normalizeRefaccion(r: Refaccion): Refaccion {
  const base = refaccionBasePrice(r);
  return {
    ...r,
    quantity: Number(r.quantity) || 0,
    minStock: Number(r.minStock) || 0,
    costPrice: Number(r.costPrice) || 0,
    salePrice: base,
    suggestedTallerPrice: tallerPrice(r, base),
    suggestedMercadoLibrePrice: mercadoLibrePrice(r, base),
  };
}

/** Aplica los precios sugeridos calculados sobre el formulario antes de guardar */
export function applySuggestedPrices(form: Refaccion): Refaccion {
  const base = refaccionBasePrice(form);
  return {
    ...form,
    suggestedTallerPrice: calcTallerPrice(base),
    suggestedMercadoLibrePrice: calcMercadoLibrePrice(base),
  };
}

// ============ Nombre automático de refacciones ============
// Fórmula: Categoría + Modelo compatible + Calidad
// Ejemplo: "Batería iPhone 13 Diagnostico"
export function buildRefaccionName(
  category?: string,
  compatibleModels?: string,
  quality?: string
): string {
  const cat = String(category || '').trim();
  // Si hay varios modelos compatibles, usa el primero para el nombre.
  const model = String(compatibleModels || '')
    .split(',')[0]
    .trim();
  const qual = String(quality || '').trim();
  const parts = [cat, model, qual].filter(Boolean);
  return parts.join(' ');
}

// ============ Proveedores registrados desde refacciones ============
// Cuando se guarda una refacción con proveedor, este queda disponible para
// futuras compras/lotes (misma lista que usa SupplierSelector).
export function registerSupplier(name?: string): void {
  const trimmed = String(name || '').trim();
  if (!trimmed) return;
  addSupplier(trimmed);
}
