import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  deleteDoc, 
  onSnapshot,
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Transaction, Budget, User } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  RECURRING: 'recurring',
  USERS: 'users'
};

export const api = {
  auth: {
    async login(email: string): Promise<{ user: User }> {
      // Logic handled via Firebase Auth in AppContext
      return { user: { id: 'temp', email } };
    }
  },
  transactions: {
    async list(userId: string): Promise<Transaction[]> {
      try {
        const q = query(collection(db, COLLECTIONS.TRANSACTIONS), where('user_id', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.TRANSACTIONS);
        return [];
      }
    },
    async create(data: Partial<Transaction>): Promise<Transaction> {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
          ...data,
          created_at: new Date().toISOString(), // Using ISO string to match existing types
          user_id: auth.currentUser?.uid
        });
        return { id: docRef.id, ...data } as Transaction;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.TRANSACTIONS);
        throw error;
      }
    },
    async delete(id: string): Promise<void> {
      try {
        await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.TRANSACTIONS}/${id}`);
      }
    }
  },
  budgets: {
    async list(userId: string): Promise<Budget[]> {
      try {
        const q = query(collection(db, COLLECTIONS.BUDGETS), where('user_id', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.BUDGETS);
        return [];
      }
    }
  },
  recurring: {
    async list(): Promise<any[]> {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const q = query(collection(db, COLLECTIONS.RECURRING), where('user_id', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, COLLECTIONS.RECURRING);
        return [];
      }
    },
    async update(id: string, data: any): Promise<any> {
      try {
        const docRef = doc(db, COLLECTIONS.RECURRING, id);
        await setDoc(docRef, { ...data, user_id: auth.currentUser?.uid }, { merge: true });
        return { id, ...data };
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.RECURRING}/${id}`);
      }
    }
  },
  ai: {
    async getInsights(): Promise<{ insight: string; suggestion: string }> {
      // Keeping this as a mock for now or could call Gemini skill later
      return { 
        insight: "Based on your spending, we recommend setting a budget for 'Entertainment'.",
        suggestion: "Reduce discretionary spending by 10%."
      };
    }
  }
};
