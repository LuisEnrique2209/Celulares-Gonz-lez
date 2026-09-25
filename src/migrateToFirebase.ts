import { db } from './firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';

/**
 * Script para migrar datos de localStorage a Firebase Firestore
 * Ejecutar desde la consola del navegador: migrateToFirebase()
 */
export async function migrateToFirebase() {
  console.log('🚀 Iniciando migración de datos a Firebase...');
  
  try {
    // Migrar Devices
    const devices = JSON.parse(localStorage.getItem('iphone_tracker_devices') || '[]');
    if (devices.length > 0) {
      console.log(`📱 Migrando ${devices.length} dispositivos...`);
      const batch1 = writeBatch(db);
      devices.forEach((device: any) => {
        const { id, ...data } = device;
        const docRef = doc(collection(db, 'devices'));
        batch1.set(docRef, data);
      });
      await batch1.commit();
      console.log('✅ Dispositivos migrados');
    }

    // Migrar Lots
    const lots = JSON.parse(localStorage.getItem('iphone_tracker_lots') || '[]');
    if (lots.length > 0) {
      console.log(`📦 Migrando ${lots.length} lotes...`);
      const batch2 = writeBatch(db);
      lots.forEach((lot: any) => {
        const { id, ...data } = lot;
        const docRef = doc(collection(db, 'lots'));
        batch2.set(docRef, data);
      });
      await batch2.commit();
      console.log('✅ Lotes migrados');
    }

    // Migrar Sales
    const sales = JSON.parse(localStorage.getItem('iphone_tracker_sales') || '[]');
    if (sales.length > 0) {
      console.log(`💰 Migrando ${sales.length} ventas...`);
      const batch3 = writeBatch(db);
      sales.forEach((sale: any) => {
        const { id, ...data } = sale;
        const docRef = doc(collection(db, 'sales'));
        batch3.set(docRef, data);
      });
      await batch3.commit();
      console.log('✅ Ventas migradas');
    }

    // Migrar Quality Checks
    const checks = JSON.parse(localStorage.getItem('iphone_tracker_checks') || '[]');
    if (checks.length > 0) {
      console.log(`✅ Migrando ${checks.length} revisiones de calidad...`);
      const batch4 = writeBatch(db);
      checks.forEach((check: any) => {
        const { id, ...data } = check;
        const docRef = doc(collection(db, 'qualityChecks'));
        batch4.set(docRef, data);
      });
      await batch4.commit();
      console.log('✅ Revisiones migradas');
    }

    // Migrar Check Slots
    const slots = JSON.parse(localStorage.getItem('iphone_tracker_slots') || '[]');
    if (slots.length > 0) {
      console.log(`🔍 Migrando ${slots.length} slots de chequeo...`);
      const batch5 = writeBatch(db);
      slots.forEach((slot: any) => {
        const { id, ...data } = slot;
        const docRef = doc(collection(db, 'checkSlots'));
        batch5.set(docRef, data);
      });
      await batch5.commit();
      console.log('✅ Slots migrados');
    }

    // Migrar Customers
    const customers = JSON.parse(localStorage.getItem('iphone_tracker_customers') || '[]');
    if (customers.length > 0) {
      console.log(`👥 Migrando ${customers.length} clientes...`);
      const batch6 = writeBatch(db);
      customers.forEach((customer: any) => {
        const { id, ...data } = customer;
        const docRef = doc(collection(db, 'customers'));
        batch6.set(docRef, data);
      });
      await batch6.commit();
      console.log('✅ Clientes migrados');
    }

    // Migrar Repairs
    const repairs = JSON.parse(localStorage.getItem('iphone_tracker_repairs') || '[]');
    if (repairs.length > 0) {
      console.log(`🔧 Migrando ${repairs.length} reparaciones...`);
      const batch7 = writeBatch(db);
      repairs.forEach((repair: any) => {
        const { id, ...data } = repair;
        const docRef = doc(collection(db, 'repairs'));
        batch7.set(docRef, data);
      });
      await batch7.commit();
      console.log('✅ Reparaciones migradas');
    }

    // Migrar Monthly Expenses
    const expenses = JSON.parse(localStorage.getItem('iphone_tracker_monthly_expenses') || '[]');
    if (expenses.length > 0) {
      console.log(`💸 Migrando ${expenses.length} gastos mensuales...`);
      const batch8 = writeBatch(db);
      expenses.forEach((expense: any) => {
        const { id, ...data } = expense;
        const docRef = doc(collection(db, 'monthlyExpenses'));
        batch8.set(docRef, data);
      });
      await batch8.commit();
      console.log('✅ Gastos migrados');
    }

    // Migrar Monthly Goals
    const goals = JSON.parse(localStorage.getItem('iphone_tracker_monthly_goals') || '[]');
    if (goals.length > 0) {
      console.log(`🎯 Migrando ${goals.length} metas mensuales...`);
      const batch9 = writeBatch(db);
      goals.forEach((goal: any) => {
        const { id, ...data } = goal;
        const docRef = doc(collection(db, 'monthlyGoals'));
        batch9.set(docRef, data);
      });
      await batch9.commit();
      console.log('✅ Metas migradas');
    }

    // Migrar Suppliers
    const suppliers = JSON.parse(localStorage.getItem('iphone_tracker_suppliers') || '[]');
    if (suppliers.length > 0) {
      console.log(`🏭 Migrando ${suppliers.length} proveedores...`);
      await addDoc(collection(db, 'meta'), { type: 'suppliers', list: suppliers });
      console.log('✅ Proveedores migrados');
    }

    // Migrar Reviewers
    const reviewers = JSON.parse(localStorage.getItem('iphone_tracker_reviewers') || '[]');
    if (reviewers.length > 0) {
      console.log(`👤 Migrando ${reviewers.length} revisores...`);
      await addDoc(collection(db, 'meta'), { type: 'reviewers', list: reviewers });
      console.log('✅ Revisores migrados');
    }

    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${devices.length} dispositivos`);
    console.log(`   - ${lots.length} lotes`);
    console.log(`   - ${sales.length} ventas`);
    console.log(`   - ${checks.length} revisiones`);
    console.log(`   - ${slots.length} slots`);
    console.log(`   - ${customers.length} clientes`);
    console.log(`   - ${repairs.length} reparaciones`);
    console.log(`   - ${expenses.length} gastos`);
    console.log(`   - ${goals.length} metas`);
    console.log(`   - ${suppliers.length} proveedores`);
    console.log(`   - ${reviewers.length} revisores`);
    
    return {
      success: true,
      message: 'Migración completada',
      stats: {
        devices: devices.length,
        lots: lots.length,
        sales: sales.length,
        checks: checks.length,
        slots: slots.length,
        customers: customers.length,
        repairs: repairs.length,
        expenses: expenses.length,
        goals: goals.length,
        suppliers: suppliers.length,
        reviewers: reviewers.length
      }
    };

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    return {
      success: false,
      message: 'Error durante la migración',
      error: error
    };
  }
}

/**
 * Función para limpiar localStorage después de migrar
 */
export function clearLocalStorage() {
  const keys = [
    'iphone_tracker_devices',
    'iphone_tracker_lots',
    'iphone_tracker_sales',
    'iphone_tracker_checks',
    'iphone_tracker_slots',
    'iphone_tracker_customers',
    'iphone_tracker_repairs',
    'iphone_tracker_monthly_expenses',
    'iphone_tracker_monthly_goals',
    'iphone_tracker_suppliers',
    'iphone_tracker_reviewers'
  ];

  keys.forEach(key => localStorage.removeItem(key));
  console.log('🗑️ localStorage limpiado');
}

// Hacer la función disponible globalmente para ejecutar desde consola
if (typeof window !== 'undefined') {
  (window as any).migrateToFirebase = migrateToFirebase;
  (window as any).clearLocalStorage = clearLocalStorage;
}
