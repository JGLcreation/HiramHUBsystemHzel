import { UserProfile, Equipment, Rental, UserRole } from '../types';
import { storage } from './storage';

// Mock objects for type compatibility
export const auth = { currentUser: null };
export const db = {};

// Auth Services
export const signInWithGoogle = async () => {
  const demoProfile: UserProfile = {
    uid: 'google-user-123',
    email: 'jaysongeronlozada@gmail.com',
    displayName: 'Jayson Geron Lozada',
    fullName: 'Jayson Geron Lozada',
    role: 'admin',
    createdAt: new Date(),
    studentId: 'ADMIN-2026',
    department: 'System Architecture'
  };
  localStorage.setItem('hiramhub_session', JSON.stringify(demoProfile));
  window.location.reload();
  return demoProfile;
};

export const registerUser = async (email: string, pass: string, profileData: Omit<UserProfile, 'uid' | 'createdAt'>) => {
  const newProfile: UserProfile = {
    ...profileData,
    uid: Math.random().toString(36).substr(2, 9),
    createdAt: new Date()
  };
  await storage.register(newProfile, pass);
  localStorage.setItem('hiramhub_session', JSON.stringify(newProfile));
  window.location.reload();
  return newProfile;
};

export const signInEmail = async (email: string, pass: string) => {
  const profile = await storage.login(email, pass);
  localStorage.setItem('hiramhub_session', JSON.stringify(profile));
  window.location.reload();
  return profile;
};

export const logout = async () => {
  localStorage.removeItem('hiramhub_session');
  window.location.reload();
};

// Equipment Services
export const getEquipment = (callback: (equipment: Equipment[]) => void) => {
  const fetch = () => callback(storage.getEquipment());
  fetch();
  const interval = setInterval(fetch, 2000); // Polling simulation
  return () => clearInterval(interval);
};

export const addEquipment = async (equipment: Omit<Equipment, 'id' | 'lastUpdated'>) => {
  return storage.addEquipment(equipment as any);
};

export const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
  const items = storage.getEquipment();
  const item = items.find(i => i.id === id);
  if (item) {
    storage.updateEquipment({ ...item, ...updates });
  }
};

// Rental Services
export const borrowEquipment = async (
  userId: string, 
  userName: string, 
  equipmentId: string, 
  equipmentName: string,
  borrowedAt: Date,
  expectedReturnAt: Date,
  purpose: string
) => {
  return storage.createRental({
    userId,
    userName,
    equipmentId,
    equipmentName,
    borrowedAt,
    expectedReturnAt,
    purpose,
  } as any);
};

export const approveRental = async (rentalId: string) => {
  return storage.approveRental(rentalId);
};

export const rejectRental = async (rentalId: string) => {
  return storage.rejectRental(rentalId);
};

export const returnEquipment = async (rentalId: string, equipmentId: string, condition: string) => {
  return storage.returnRental(rentalId);
};

export const getMyRentals = (userId: string, callback: (rentals: Rental[]) => void) => {
  const fetch = () => {
    const rentals = storage.getRentals().filter(r => r.userId === userId);
    callback(rentals);
  };
  fetch();
  const interval = setInterval(fetch, 2000);
  return () => clearInterval(interval);
};

export const getAllRentals = (callback: (rentals: Rental[]) => void) => {
  const fetch = () => callback(storage.getRentals());
  fetch();
  const interval = setInterval(fetch, 2000);
  return () => clearInterval(interval);
};

export const getUserProfiles = (callback: (users: UserProfile[]) => void) => {
  const fetch = () => callback(storage.getUsers());
  fetch();
  const interval = setInterval(fetch, 2000);
  return () => clearInterval(interval);
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  const users = storage.getUsers();
  const updatedUsers = users.map(u => u.uid === userId ? { ...u, role } : u);
  localStorage.setItem('hiramhub_users', JSON.stringify(updatedUsers));
};

export const seedEquipment = async () => {
  // Already handled in storage INITIAL_EQUIPMENT
};

export const getNotifications = (userId: string, callback: (notifications: any[]) => void) => {
  const fetch = () => callback(storage.getNotifications(userId));
  fetch();
  const interval = setInterval(fetch, 2000);
  return () => clearInterval(interval);
};

export const markNotificationRead = async (id: string) => {
  return storage.markNotificationAsRead(id);
};
