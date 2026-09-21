export interface Device {
  id: string;
  imei: string;
  model: string;
  color: string;
  storage: string;
  purchaseDate: string;
  arrivalDate: string;
  purchasePrice: number;
  importExpenses: number;
  shippingExpenses: number;
  otherExpenses: number;
  status: 'in_transit' | 'received' | 'sold' | 'in_stock';
  lotId: string;
  notes: string;
  salePrice?: number;
  saleDate?: string;
  checked?: boolean;
  checkDate?: string;
}

export interface LotItem {
  model: string;
  quantity: number;
  unitPrice: number;
}

export interface Lot {
  id: string;
  name: string;
  supplier: string;
  items: LotItem[];
  totalPrice: number;
  exchangeRate: number; // Tipo de cambio USD a MXN
  purchaseDate: string;
  arrivalDate: string;
  importExpenses: number;
  shippingExpenses: number;
  otherExpenses: number;
  trackingNumber: string;
  notes: string;
  status: 'pending' | 'in_transit' | 'received' | 'partial';
}

export interface CheckSlot {
  id: string;
  lotId: string;
  model: string;
  imei: string;
  color: string;
  storage: string;
  checked: boolean;
  checkId?: string;
}

export interface Sale {
  id: string;
  deviceId: string;
  imei: string;
  model: string;
  color: string;
  storage: string;
  lotId: string;
  saleDate: string;
  salePrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod?: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
  totalSpent: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export interface Repair {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  brand: string;
  model: string;
  issue: string;
  issueCategory?: string;
  diagnosticNotes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  estimatedCost?: number;
  finalCost?: number;
  receivedDate: string;
  completedDate?: string;
  warrantyDays: number;
}

export interface MonthlyExpense {
  id: string;
  month: string; // formato: YYYY-MM
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface MonthlyGoal {
  id: string;
  month: string; // formato: YYYY-MM
  salesTarget: number; // Meta de ventas en MXN
  salesActual: number; // Ventas actuales
  repairsTarget: number; // Meta de reparaciones
  repairsActual: number; // Reparaciones actuales
  devicesSoldTarget: number; // Meta de dispositivos vendidos
  devicesSoldActual: number; // Dispositivos vendidos
  notes: string;
  completed: boolean;
  customGoals?: CustomGoal[]; // Metas personalizadas
}

export interface CustomGoal {
  id: string;
  title: string;
  description?: string;
  target: number;
  actual: number;
  unit: string; // "publicaciones", "seguidores", "teléfonos", etc.
  icon: string; // emoji
  completed: boolean;
}

export interface QualityCheck {
  id: string;
  deviceId: string;
  slotId: string;
  lotId: string;
  imei: string;
  model: string;
  checkDate: string;
  screen: 'pass' | 'fail';
  camera: 'pass' | 'fail';
  battery: 'pass' | 'fail';
  speakers: 'pass' | 'fail';
  microphone: 'pass' | 'fail';
  wifi: 'pass' | 'fail';
  bluetooth: 'pass' | 'fail';
  buttons: 'pass' | 'fail';
  charging: 'pass' | 'fail';
  faceId: 'pass' | 'fail';
  batteryPercentage: number;
  overallStatus: 'approved' | 'rejected' | 'pending';
  notes: string;
  checkedBy: string;
}

export type TabType = 'dashboard' | 'inventory' | 'lots' | 'sales' | 'financial' | 'customers' | 'repairs' | 'goals' | 'quality-check' | 'add-device' | 'add-lot' | 'add-sale' | 'add-check' | 'add-repair' | 'check-lot';
