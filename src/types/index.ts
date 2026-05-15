export type UserRole = 'admin' | 'athlete' | 'non-athlete';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  fullName?: string;
  studentId?: string;
  department?: string;
  role: UserRole;
  createdAt: Date;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  totalQuantity: number;
  availableQuantity: number;
  condition: string;
  status: 'active' | 'maintenance' | 'retired';
  lastUpdated: Date;
}

export interface Rental {
  id: string;
  userId: string;
  userName: string;
  equipmentId: string;
  equipmentName: string;
  borrowedAt: Date;
  expectedReturnAt: Date;
  returnedAt?: Date;
  purpose?: string;
  status: 'PENDING AUTHORIZATION' | 'APPROVED' | 'RETURNED' | 'OVERDUE' | 'REJECTED';
  conditionOnReturn?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  type: 'approval' | 'rejection' | 'return';
}
