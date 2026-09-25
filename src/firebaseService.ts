import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Device, Lot, Sale, QualityCheck, CheckSlot, Customer, Repair, MonthlyExpense, MonthlyGoal } from './types';

// Helper para convertir documentos de Firestore
const docToData = (d: any) => ({ id: d.id, ...d.data() });

// Quita el "id" del objeto para guardarlo como campo de documento (evita duplicar el id)
const stripId = <T extends { id: string }>(item: T) => {
  const { id, ...data } = item;
  return data;
};

// Espera breve (para reintentos)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Reintenta una operación asíncrona ante errores transitorios de Firestore
 * (límite de escrituras por segundo, timeouts, unavailable, etc).
 */
async function withRetries<T>(fn: () => Promise<T>, attempts = 4, baseDelayMs = 500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const code = error?.code;
      const retriable =
        code === 'resource-exhausted' ||
        code === 'unavailable' ||
        code === 'deadline-exceeded' ||
        code === 'aborted' ||
        code === 'internal' ||
        !code; // errores de red suelen no traer code
      if (!retriable || i === attempts - 1) break;
      await sleep(baseDelayMs * (i + 1));
    }
  }
  throw lastError;
}

// Crea/actualiza un documento usando SU propio id como clave del documento.
// setDoc es idempotente: si la app reintenta el guardado, NO crea registros duplicados.
const upsertById = async <T extends { id: string }>(colName: string, item: T): Promise<void> => {
  await withRetries(() => setDoc(doc(db, colName, item.id), stripId(item)));
};

// ============ DEVICES ============
export const firebaseDevices = {
  getAll: async (): Promise<Device[]> => {
    const q = query(collection(db, 'devices'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (device: Device): Promise<void> => {
    await upsertById('devices', device);
  },

  update: async (device: Device): Promise<void> => {
    await upsertById('devices', device);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'devices', id));
  }
};

// ============ LOTS ============
export const firebaseLots = {
  getAll: async (): Promise<Lot[]> => {
    const q = query(collection(db, 'lots'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (lot: Lot): Promise<void> => {
    await upsertById('lots', lot);
  },

  update: async (lot: Lot): Promise<void> => {
    await upsertById('lots', lot);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'lots', id));
    // También eliminar los slots asociados
    const slotsQ = query(collection(db, 'checkSlots'));
    const snapshot = await getDocs(slotsQ);
    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
      if (d.data().lotId === id) {
        batch.delete(d.ref);
      }
    });
    await batch.commit();
  }
};

// ============ SALES ============
export const firebaseSales = {
  getAll: async (): Promise<Sale[]> => {
    const q = query(collection(db, 'sales'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (sale: Sale): Promise<void> => {
    await upsertById('sales', sale);
  },

  update: async (sale: Sale): Promise<void> => {
    await upsertById('sales', sale);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'sales', id));
  }
};

// ============ QUALITY CHECKS ============
export const firebaseChecks = {
  getAll: async (): Promise<QualityCheck[]> => {
    const q = query(collection(db, 'qualityChecks'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (check: QualityCheck): Promise<void> => {
    await upsertById('qualityChecks', check);
  },

  update: async (check: QualityCheck): Promise<void> => {
    await upsertById('qualityChecks', check);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'qualityChecks', id));
  }
};

// ============ CHECK SLOTS ============
export const firebaseSlots = {
  getAll: async (): Promise<CheckSlot[]> => {
    const q = query(collection(db, 'checkSlots'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (slot: CheckSlot): Promise<void> => {
    await upsertById('checkSlots', slot);
  },

  // Escribe todos los slots en lotes de máximo 400 operaciones (el límite de
  // writeBatch de Firestore es 500). Antes, un lote de más de 500 dispositivos
  // fallaba al intentar generar todos los slots de una sola vez.
  addMany: async (slots: CheckSlot[]): Promise<void> => {
    const BATCH_SIZE = 400;
    for (let i = 0; i < slots.length; i += BATCH_SIZE) {
      const chunk = slots.slice(i, i + BATCH_SIZE);
      await withRetries(async () => {
        const batch = writeBatch(db);
        chunk.forEach(slot => {
          batch.set(doc(db, 'checkSlots', slot.id), stripId(slot));
        });
        await batch.commit();
      });
    }
  },

  update: async (slot: CheckSlot): Promise<void> => {
    await upsertById('checkSlots', slot);
  }
};

// ============ CUSTOMERS ============
export const firebaseCustomers = {
  getAll: async (): Promise<Customer[]> => {
    const q = query(collection(db, 'customers'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  addOrUpdate: async (customer: Customer): Promise<void> => {
    // Buscar si ya existe por teléfono o nombre
    const q = query(collection(db, 'customers'));
    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find(d =>
      d.data().phone === customer.phone || d.data().name === customer.name
    );

    if (existing) {
      await withRetries(() => setDoc(doc(db, 'customers', existing.id), stripId(customer), { merge: true }));
    } else {
      await upsertById('customers', customer);
    }
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'customers', id));
  }
};

// ============ REPAIRS ============
export const firebaseRepairs = {
  getAll: async (): Promise<Repair[]> => {
    const q = query(collection(db, 'repairs'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (repair: Repair): Promise<void> => {
    await upsertById('repairs', repair);
  },

  update: async (repair: Repair): Promise<void> => {
    await upsertById('repairs', repair);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'repairs', id));
  }
};

// ============ MONTHLY EXPENSES ============
export const firebaseExpenses = {
  getAll: async (): Promise<MonthlyExpense[]> => {
    const q = query(collection(db, 'monthlyExpenses'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (expense: MonthlyExpense): Promise<void> => {
    await upsertById('monthlyExpenses', expense);
  },

  update: async (expense: MonthlyExpense): Promise<void> => {
    await upsertById('monthlyExpenses', expense);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'monthlyExpenses', id));
  }
};

// ============ MONTHLY GOALS ============
export const firebaseGoals = {
  getAll: async (): Promise<MonthlyGoal[]> => {
    const q = query(collection(db, 'monthlyGoals'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },

  add: async (goal: MonthlyGoal): Promise<void> => {
    await upsertById('monthlyGoals', goal);
  },

  update: async (goal: MonthlyGoal): Promise<void> => {
    await upsertById('monthlyGoals', goal);
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'monthlyGoals', id));
  }
};

// ============ SUPPLIERS & REVIEWERS ============
export const firebaseMeta = {
  getSuppliers: async (): Promise<string[]> => {
    const snap = await getDoc(doc(db, 'meta', 'suppliers'));
    return snap.exists() ? (snap.data().list || []) : [];
  },

  saveSuppliers: async (suppliers: string[]): Promise<void> => {
    await withRetries(() => setDoc(doc(db, 'meta', 'suppliers'), { list: suppliers }));
  },

  getReviewers: async (): Promise<string[]> => {
    const snap = await getDoc(doc(db, 'meta', 'reviewers'));
    return snap.exists() ? (snap.data().list || []) : [];
  },

  saveReviewers: async (reviewers: string[]): Promise<void> => {
    await withRetries(() => setDoc(doc(db, 'meta', 'reviewers'), { list: reviewers }));
  }
};
