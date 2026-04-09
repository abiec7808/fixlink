import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { TIER_CONFIG, TierId, UnitTypeId } from './constants';

export type UserRole = 'customer' | 'tradesman' | 'admin';

export interface InventoryItem {
  id: string;
  name: string;
  unitType: UnitTypeId;
  costExcl: number;
  sellingIncl: number;
  stockLevel: number;
  updatedAt: any;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  categories: string[];
  status: 'pending' | 'quoted' | 'estimated' | 'declined' | 'assigned' | 'accepted' | 'in-progress' | 'billed' | 'invoiced' | 'completed' | 'cancelled';
  total?: number;
  location: string;
  customerName: string;
  customerId?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  isStandalone?: boolean;
  tradesmanId?: string;
  amount?: number;
  estimateAmount?: number;
  lineItems?: any[];
  notes?: string;
  images?: string[];
  createdAt: any;
  expireAt?: any;
  estimatedAt?: any;
  billedAt?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  tier?: TierId;
  fullName: string;
  imageUrl?: string;
  website?: string;
  isVatRegistered?: boolean;
  contactPhone?: string;
  businessName?: string;
  companyName?: string;
  vatNumber?: string;
  registrationNumber?: string;
  isCompany?: boolean;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  branchCode?: string;
  onboardingCompleted?: boolean;
  bio?: string;
  trade?: string;
  trades?: string[];
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  serviceRadius?: number;
  rating?: number;
  reviewCount?: number;
  companyLogoUrl?: string;
  hasSeenWelcome?: boolean;
  estimateExpiryDays?: number;
  tierStatus?: 'active' | 'trial';
  tierTrialExpiresAt?: any;
  preTrialTier?: TierId;
  createdAt: any;
}

// Helper to remove undefined values before Firestore write
const sanitizeData = (data: any): any => {
  if (data === null || data === undefined) return null;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) return data.map(item => sanitizeData(item));
  if (typeof data !== 'object') return data;
  
  const result: any = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      result[key] = sanitizeData(data[key]);
    }
  });
  return result;
};

export const syncUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const sanitized = sanitizeData(data);

  if (!userSnap.exists()) {
    const newUser = {
      ...sanitized,
      createdAt: new Date(),
    };
    await setDoc(userRef, newUser);
    return { ...newUser, id: userId };
  } else {
    // Merge existing with new data
    const existingData = userSnap.data();
    const updatedData = { ...existingData, ...sanitized };
    await updateDoc(userRef, sanitized);
    return { ...updatedData, id: userId };
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  const sanitized = sanitizeData(data);
  await updateDoc(userRef, sanitized);
  return { id: userId, ...sanitized };
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
};

// Simple Haversine distance for 70km filtering
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getProsByTrade = async (trade: string, userLat?: number, userLng?: number, searchRadiusKm: number = 70) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', '==', 'tradesman'), where('trade', '==', trade));
  const querySnapshot = await getDocs(q);
  
  const results: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as UserProfile;
    
    // Tier-based constraint enforcement
    const tier = data.tier || 'starter';
    const maxRadius = TIER_CONFIG[tier].radius;
    
    if (userLat && userLng && data.location) {
      const distance = getDistance(userLat, userLng, data.location.lat, data.location.lng);
      
      if (distance <= Math.min(searchRadiusKm, maxRadius)) {
        results.push({ ...data, id: doc.id });
      }
    } else {
      results.push({ ...data, id: doc.id });
    }
  });

  return results;
};

export const getUsersByRole = async (role: UserRole) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('role', '==', role));
  const querySnapshot = await getDocs(q);
  
  const results: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    results.push({ ...doc.data() as UserProfile, id: doc.id });
  });

  return results;
};

// Inventory Helpers
export const getInventory = async (userId: string): Promise<InventoryItem[]> => {
  const inventoryRef = collection(db, 'users', userId, 'inventory');
  const querySnapshot = await getDocs(inventoryRef);
  
  const results: InventoryItem[] = [];
  querySnapshot.forEach((doc) => {
    results.push({ ...doc.data() as InventoryItem, id: doc.id });
  });

  return results;
};

export const upsertInventoryItem = async (userId: string, item: Partial<InventoryItem>) => {
  const inventoryRef = collection(db, 'users', userId, 'inventory');
  const docRef = item.id ? doc(inventoryRef, item.id) : doc(inventoryRef);
  const data = {
    ...item,
    id: docRef.id,
    updatedAt: new Date()
  };
  await setDoc(docRef, sanitizeData(data), { merge: true });
  return data as InventoryItem;
};

export const updateStock = async (userId: string, itemId: string, change: number) => {
  const itemRef = doc(db, 'users', userId, 'inventory', itemId);
  const itemSnap = await getDoc(itemRef);
  if (itemSnap.exists()) {
    const currentStock = itemSnap.data().stockLevel || 0;
    await updateDoc(itemRef, { stockLevel: currentStock + change });
  }
};

export const getJob = async (jobId: string): Promise<Job | null> => {
  const jobRef = doc(db, 'jobs', jobId);
  const jobSnap = await getDoc(jobRef);
  if (jobSnap.exists()) {
    return { ...jobSnap.data(), id: jobSnap.id } as Job;
  }
  return null;
};

export const updateJob = async (jobId: string, data: any) => {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, sanitizeData(data));
};

export const deleteJob = async (jobId: string) => {
  const jobRef = doc(db, 'jobs', jobId);
  await deleteDoc(jobRef);
};

export const createJob = async (data: any) => {
  const jobsRef = collection(db, 'jobs');
  const docRef = data.id ? doc(jobsRef, data.id) : doc(jobsRef);
  const finalData = { ...data, id: docRef.id, createdAt: data.createdAt || new Date() };
  await setDoc(docRef, sanitizeData(finalData));
  
  // Sync to leads if it's a new pending job and NOT standalone
  if (finalData.status === 'pending' && !finalData.isStandalone) {
    const leadsRef = collection(db, 'leads');
    await setDoc(doc(leadsRef, docRef.id), sanitizeData({
      title: finalData.title,
      description: finalData.description,
      category: finalData.category,
      categories: finalData.categories || [finalData.category],
      location: finalData.location,
      createdAt: finalData.createdAt,
      customerId: finalData.customerId,
      jobId: docRef.id,
      images: finalData.images || []
    }));
  }
  
  return finalData as Job;
};
export const getJobsByTradesman = async (tradesmanId: string): Promise<Job[]> => {
  const jobsRef = collection(db, 'jobs');
  const q = query(jobsRef, where('tradesmanId', '==', tradesmanId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const results: Job[] = [];
  querySnapshot.forEach((doc) => {
    results.push({ ...doc.data() as Job, id: doc.id });
  });

  return results;
};

export const getJobsByCustomer = async (customerId: string): Promise<Job[]> => {
  const jobsRef = collection(db, 'jobs');
  const q = query(jobsRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const results: Job[] = [];
  querySnapshot.forEach((doc) => {
    results.push({ ...doc.data() as Job, id: doc.id });
  });

  return results;
};

export const getQuotesByJob = async (jobId: string): Promise<any[]> => {
  // In this system, quotes are stored in 'estimates' collection linked to jobId
  const estimatesRef = collection(db, 'jobs', jobId, 'estimates');
  const querySnapshot = await getDocs(estimatesRef);
  
  const results: any[] = [];
  querySnapshot.forEach((doc) => {
    results.push({ ...doc.data(), id: doc.id });
  });

  return results;
};

export const getLeads = async (category?: string | string[]): Promise<any[]> => {
  const leadsRef = collection(db, 'leads');
  let q;
  
  if (category) {
    if (Array.isArray(category)) {
      if (category.length > 0) {
        q = query(leadsRef, where('category', 'in', category), orderBy('createdAt', 'desc'), limit(10));
      } else {
        q = query(leadsRef, orderBy('createdAt', 'desc'), limit(10));
      }
    } else {
      q = query(leadsRef, where('category', '==', category), orderBy('createdAt', 'desc'), limit(10));
    }
  } else {
    q = query(leadsRef, orderBy('createdAt', 'desc'), limit(10));
  }
  const querySnapshot = await getDocs(q);
  const results: any[] = [];
  querySnapshot.forEach((doc) => {
    results.push({ ...doc.data(), id: doc.id });
  });
  return results;
};
