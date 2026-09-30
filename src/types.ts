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
  batteryPercentage?: number; // % de batería registrado en el chequeo de calidad
  qualityStatus?: 'approved' | 'rejected'; // resultado del chequeo de calidad
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
  batteryPercentage?: number; // % de batería registrado al checar
  deviceId?: string; // dispositivo creado en inventario al aprobar/rechazar
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
  // Tipo de artículo vendido: dispositivo (teléfono) o refacción.
  // Las ventas antiguas no traen este campo => se asume 'dispositivo'.
  type?: 'dispositivo' | 'refaccion';
  quantity?: number; // Cantidad vendida (aplica para refacciones)
  // Canal de venta de la refacción (aplica solo a ventas de refacción):
  //   counter   → Mostrador / precio general del catálogo
  //   taller    → Venta a taller (precio sugerido = costo × 1.30)
  //   mercadolibre → Mercado Libre (precio sugerido = ((precio × 1.25) + 59.60) / 0.7145)
  saleChannel?: 'counter' | 'taller' | 'mercadolibre';
}

// Canales de venta disponibles para refacciones
export const REFACCION_SALE_CHANNELS: { value: NonNullable<Sale['saleChannel']>; label: string; emoji: string }[] = [
  { value: 'counter', label: 'Mostrador / General', emoji: '🏪' },
  { value: 'taller', label: 'Taller', emoji: '🔧' },
  { value: 'mercadolibre', label: 'Mercado Libre', emoji: '🛒' },
];

export const SALE_CHANNEL_LABELS: Record<string, string> = {
  counter: 'Mostrador',
  taller: 'Taller',
  mercadolibre: 'Mercado Libre',
};

// Ventas antiguas (sin campo type) se consideran ventas de dispositivos
export const isRefaccionSale = (s: { type?: string }) => s.type === 'refaccion';

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
  deviceId?: string; // id del dispositivo en inventario (si ya fue creado)
  slotId: string;
  lotId: string;
  imei: string;
  model: string;
  color?: string;
  storage?: string;
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

// Refacciones (repuestos / parts) usadas en reparaciones y venta suelta
export interface Refaccion {
  id: string;
  name: string;              // p.ej. "Batería iPhone 11"
  category: string;          // Baterías, Pantallas, Cámaras, Botones, Flex, Cargos, etc.
  brand?: string;            // Marca del repuesto (Original, OEM, Genérica...)
  compatibleModels?: string; // Modelos compatibles (texto libre)
  quantity: number;          // Existencias disponibles
  minStock: number;          // Nivel mínimo para alerta de compra
  costPrice: number;         // Precio de compra (unitario)
  salePrice: number;         // Precio de venta / costo aplicado en reparaciones
  supplier?: string;
  location?: string;         // Estante / casillero
  notes?: string;
  createdAt: string;
  // ---- Precios sugeridos por canal de venta ----
  // Se calculan automáticamente desde el precio base (precio de venta), pero
  // pueden editarse manualmente si se quiere un precio distinto.
  suggestedTallerPrice?: number;      // Taller: precio × 1.30
  suggestedMercadoLibrePrice?: number; // Mercado Libre: ((precio × 1.25) + 59.60) / 0.7145
}

export type TabType = 'dashboard' | 'inventory' | 'lots' | 'sales' | 'financial' | 'customers' | 'repairs' | 'goals' | 'quality-check' | 'add-device' | 'add-lot' | 'add-sale' | 'add-check' | 'add-repair' | 'check-lot' | 'admin';
