import { 
  collection, 
  doc, 
  getDocs, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Device, Lot, Sale, QualityCheck, CheckSlot, Customer, Repair, MonthlyExpense, MonthlyGoal } from './types';

// Helper para convertir documentos de Firestore
const docToData = (doc: any) => ({ id: doc.id, ...doc.data() });

// ============ DEVICES ============
export const firebaseDevices = {
  getAll: async (): Promise<Device[]> => {
    const q = query(collection(db, 'devices'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
  },
  
  add: async (device: Device): Promise<void> => {
    // Verificar si ya existe un dispositivo con el mismo IMEI (evita duplicados
    // si se re-intenta guardar un chequeo que falló a mitad del proceso)
    const qImei = query(collection(db, 'devices'), where('imei', '==', device.imei));
    const snap = await getDocs(qImei);
    if (!snap.empty) {
      // Ya existe: actualizarlo en lugar de crear un duplicado
      const existingId = snap.docs[0].id;
      const { id, ...data } = device;
      await updateDoc(doc(db, 'devices', existingId), data);
      return;
    }
    const { id, ...data } = device;
    // Usar setDoc con id explícito para que sea idempotente y no choque
    // contra reglas/índices de addDoc
    await setDoc(doc(db, 'devices', id), data);
  },
  
  update: async (device: Device): Promise<void> => {
    const { id, ...data } = device;
    await updateDoc(doc(db, 'devices', id), data);
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
    const { id, ...data } = lot;
    await addDoc(collection(db, 'lots'), data);
  },
  
  update: async (lot: Lot): Promise<void> => {
    const { id, ...data } = lot;
    await updateDoc(doc(db, 'lots', id), data);
  },
  
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'lots', id));
    // También eliminar los slots asociados
    const slotsQ = query(collection(db, 'checkSlots'));
    const snapshot = await getDocs(slotsQ);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      if (doc.data().lotId === id) {
        batch.delete(doc.ref);
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
    const { id, ...data } = sale;
    await addDoc(collection(db, 'sales'), data);
  },
  
  update: async (sale: Sale): Promise<void> => {
    const { id, ...data } = sale;
    await updateDoc(doc(db, 'sales', id), data);
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
    const { id, ...data } = check;
    await addDoc(collection(db, 'qualityChecks'), data);
  },
  
  update: async (check: QualityCheck): Promise<void> => {
    const { id, ...data } = check;
    await updateDoc(doc(db, 'qualityChecks', id), data);
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
    const { id, ...data } = slot;
    await addDoc(collection(db, 'checkSlots'), data);
  },
  
  addMany: async (slots: CheckSlot[]): Promise<void> => {
    const batch = writeBatch(db);
    slots.forEach(slot => {
      const { id, ...data } = slot;
      const docRef = doc(collection(db, 'checkSlots'));
      batch.set(docRef, data);
    });
    await batch.commit();
  },
  
  update: async (slot: CheckSlot): Promise<void> => {
    const { id, ...data } = slot;
    try {
      await updateDoc(doc(db, 'checkSlots', id), data);
    } catch (err: any) {
      // Si el documento no existe (p.ej. migraciones antiguas), crearlo con setDoc
      if (err?.code === 'not-found' || err?.message?.includes('not found')) {
        await setDoc(doc(db, 'checkSlots', id), data);
      } else {
        throw err;
      }
    }
  },

  getByLot: async (lotId: string): Promise<CheckSlot[]> => {
    const q = query(collection(db, 'checkSlots'), where('lotId', '==', lotId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToData);
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
    const existing = snapshot.docs.find(doc => 
      doc.data().phone === customer.phone || doc.data().name === customer.name
    );
    
    const { id, ...data } = customer;
    
    if (existing) {
      await updateDoc(doc(db, 'customers', existing.id), data);
    } else {
      await addDoc(collection(db, 'customers'), data);
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
    const { id, ...data } = repair;
    await addDoc(collection(db, 'repairs'), data);
  },
  
  update: async (repair: Repair): Promise<void> => {
    const { id, ...data } = repair;
    await updateDoc(doc(db, 'repairs', id), data);
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
    const { id, ...data } = expense;
    await addDoc(collection(db, 'monthlyExpenses'), data);
  },
  
  update: async (expense: MonthlyExpense): Promise<void> => {
    const { id, ...data } = expense;
    await updateDoc(doc(db, 'monthlyExpenses', id), data);
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
    const { id, ...data } = goal;
    await addDoc(collection(db, 'monthlyGoals'), data);
  },
  
  update: async (goal: MonthlyGoal): Promise<void> => {
    const { id, ...data } = goal;
    await updateDoc(doc(db, 'monthlyGoals', id), data);
  },
  
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'monthlyGoals', id));
  }
};

// ============ SUPPLIERS & REVIEWERS ============
export const firebaseMeta = {
  getSuppliers: async (): Promise<string[]> => {
    const q = query(collection(db, 'meta'));
    const snapshot = await getDocs(q);
    const metaDoc = snapshot.docs.find(d => d.id === 'suppliers');
    return metaDoc?.data().list || [];
  },
  
  saveSuppliers: async (suppliers: string[]): Promise<void> => {
    await updateDoc(doc(db, 'meta', 'suppliers'), { list: suppliers });
  },
  
  getReviewers: async (): Promise<string[]> => {
    const q = query(collection(db, 'meta'));
    const snapshot = await getDocs(q);
    const metaDoc = snapshot.docs.find(d => d.id === 'reviewers');
    return metaDoc?.data().list || [];
  },
  
  saveReviewers: async (reviewers: string[]): Promise<void> => {
    await updateDoc(doc(db, 'meta', 'reviewers'), { list: reviewers });
  }
};
