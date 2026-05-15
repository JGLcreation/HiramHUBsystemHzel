import { UserProfile, Equipment, Rental, UserRole, Notification } from '../types';

// Initial Data Seed
const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'e1',
    name: 'Wilson Evolution Basketball',
    category: 'Basketball',
    description: 'Official size and weight basketball for indoor/outdoor use.',
    totalQuantity: 10,
    availableQuantity: 8,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1544919982-b61976f0ba43?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e2',
    name: 'Nike Vapor Soccer Ball',
    category: 'Soccer',
    description: 'FIFA quality pro soccer ball for tournament use.',
    totalQuantity: 15,
    availableQuantity: 12,
    condition: 'Good',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1614632537197-38a17461c29a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e3',
    name: 'Babolat Pure Drive Racket',
    category: 'Tennis',
    description: 'Lightweight carbon fiber racket for advanced players.',
    totalQuantity: 6,
    availableQuantity: 4,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a49530?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e4',
    name: 'Mikasa MVA200 Volleyball',
    category: 'Volleyball',
    description: 'Professional indoor volleyball with aerodynamic design.',
    totalQuantity: 12,
    availableQuantity: 10,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1592656670411-b91993ec736f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e5',
    name: 'Yonex Astrox Badminton Set',
    category: 'Badminton',
    description: 'High-tension racket set with synthetic shuttles.',
    totalQuantity: 8,
    availableQuantity: 8,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1626225916060-6423cc856f6c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e6',
    name: 'Stiga Pro Table Tennis Paddle',
    category: 'Table Tennis',
    description: 'Nano-tech rubber coating for maximum spin control.',
    totalQuantity: 20,
    availableQuantity: 18,
    condition: 'Excellent',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e7',
    name: 'Molten BG5000 Basketball',
    category: 'Basketball',
    description: 'FIBA approved leather competition basketball.',
    totalQuantity: 5,
    availableQuantity: 5,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e8',
    name: 'Adidas FIFA WC Match Ball',
    category: 'Soccer',
    description: 'Official match ball replica for elite training.',
    totalQuantity: 10,
    availableQuantity: 10,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e9',
    name: 'Fox 40 Classic Whistle',
    category: 'Training',
    description: 'Professional grade pealess whistle for coaches.',
    totalQuantity: 15,
    availableQuantity: 15,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'e10',
    name: 'Digital Training Stopwatch',
    category: 'Training',
    description: 'Multi-lap precision timer with split functionality.',
    totalQuantity: 10,
    availableQuantity: 10,
    condition: 'New',
    status: 'active',
    lastUpdated: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1508921334112-40a09c21b27b?q=80&w=800&auto=format&fit=crop'
  }
];

const INITIAL_USERS: (UserProfile & { pass: string })[] = [
  {
    uid: 'admin-seed',
    email: 'jaysongeronlozada@gmail.com',
    pass: 'admin123',
    displayName: 'System Admin',
    fullName: 'Jayson Geron Lozada',
    role: 'admin',
    createdAt: new Date(),
    studentId: 'ADMIN-2026',
    department: 'Athletics Office'
  }
];

class StorageService {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(`hiramhub_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(`hiramhub_${key}`, JSON.stringify(data));
  }

  // Auth
  async register(profile: UserProfile, pass: string) {
    const users = this.getUsersWithPass();
    if (users.find(u => u.email === profile.email)) throw new Error('Email already registered');
    
    const newUser = { ...profile, pass, createdAt: new Date() };
    this.set('users', [...users, newUser]);
    return profile;
  }

  async login(email: string, pass: string) {
    const users = this.getUsersWithPass();
    const user = users.find(u => u.email === email && u.pass === pass);
    if (!user) throw new Error('Invalid credentials');
    const { pass: _, ...profile } = user;
    return profile as UserProfile;
  }

  private getUsersWithPass() {
    const users = this.get<UserProfile & { pass: string }>('users');
    const hasAdmin = users.some(u => u.email === INITIAL_USERS[0].email);
    if (!hasAdmin) {
      const updatedUsers = [...users, ...INITIAL_USERS];
      this.set('users', updatedUsers);
      return updatedUsers;
    }
    return users;
  }

  // Users
  getUsers(): UserProfile[] {
    return this.getUsersWithPass().map(({ pass, ...u }) => u);
  }

  // Equipment
  getEquipment(): Equipment[] {
    const items = this.get<Equipment>('equipment');
    if (items.length === 0) {
      this.set('equipment', INITIAL_EQUIPMENT);
      return INITIAL_EQUIPMENT;
    }
    return items.map(i => ({ ...i, lastUpdated: new Date(i.lastUpdated) }));
  }

  updateEquipment(item: Equipment) {
    const items = this.getEquipment();
    this.set('equipment', items.map(i => i.id === item.id ? item : i));
  }

  addEquipment(item: Omit<Equipment, 'id'>) {
    const items = this.getEquipment();
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    this.set('equipment', [...items, newItem]);
  }

  // Rentals
  getRentals(): Rental[] {
    return this.get<Rental>('rentals').map(r => ({
      ...r,
      borrowedAt: new Date(r.borrowedAt),
      expectedReturnAt: new Date(r.expectedReturnAt),
      returnedAt: r.returnedAt ? new Date(r.returnedAt) : undefined
    }));
  }

  createRental(rental: Omit<Rental, 'id' | 'status'>) {
    const rentals = this.getRentals();
    // Check for existing request from the same user for this item
    const existing = rentals.find(r => r.equipmentId === rental.equipmentId && r.userId === rental.userId && (r.status === 'PENDING AUTHORIZATION' || r.status === 'APPROVED'));
    if (existing) {
        throw new Error('You already have an active or pending rental request for this item.');
    }                
    
    const newRental: Rental = {
      ...rental,
      id: `R-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      status: 'PENDING AUTHORIZATION' // Requests are PENDING AUTHORIZATION by default
    };
    this.set('rentals', [...rentals, newRental]);
    return newRental;
  }

  approveRental(rentalId: string) {
    const rentals = this.getRentals();
    const rental = rentals.find(r => r.id === rentalId);
    if (rental && rental.status === 'PENDING AUTHORIZATION') {
      const items = this.getEquipment();
      const item = items.find(i => i.id === rental.equipmentId);
      
      if (item && item.availableQuantity > 0) {
        rental.status = 'APPROVED';
        item.availableQuantity -= 1;
        this.updateEquipment(item);
        this.set('rentals', rentals);

        // Create notification
        this.createNotification(
          rental.userId,
          'Borrow Request Approved',
          `Your request for ${rental.equipmentName} has been approved. You can now pick it up at the athletics office.`,
          'approval'
        );
      } else {
        throw new Error('Equipment no longer available');
      }
    }
  }

  rejectRental(rentalId: string) {
    const rentals = this.getRentals();
    const rental = rentals.find(r => r.id === rentalId);
    if (rental && rental.status === 'PENDING AUTHORIZATION') {
      rental.status = 'REJECTED';
      this.set('rentals', rentals);

      // Create notification
      this.createNotification(
        rental.userId,
        'Borrow Request Rejected',
        `Unfortunately, your request for ${rental.equipmentName} was not authorized at this time.`,
        'rejection'
      );
    }
  }

  returnRental(rentalId: string) {
    const rentals = this.getRentals();
    const rental = rentals.find(r => r.id === rentalId);
    if (rental && rental.status === 'APPROVED') {
      rental.status = 'RETURNED';
      rental.returnedAt = new Date();
      this.set('rentals', rentals);

      // Create notification for return
      this.createNotification(
        rental.userId,
        'Equipment Returned',
        `The ${rental.equipmentName} has been successfully returned and logged.`,
        'return'
      );

      // Update available quantity
      const items = this.getEquipment();
      const item = items.find(i => i.id === rental.equipmentId);
      if (item) {
        item.availableQuantity = Math.min(item.totalQuantity, item.availableQuantity + 1);
        this.updateEquipment(item);
      }
    }
  }

  // Notifications
  getNotifications(userId: string): Notification[] {
    return this.get<Notification>('notifications')
      .map(n => ({ ...n, createdAt: new Date(n.createdAt) }))
      .filter(n => n.userId === userId);
  }

  createNotification(userId: string, title: string, message: string, type: Notification['type']) {
    const notifications = this.get<Notification>('notifications');
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      createdAt: new Date(),
      isRead: false,
      type
    };
    this.set('notifications', [newNotification, ...notifications]);
    return newNotification;
  }

  markNotificationAsRead(id: string) {
    const notifications = this.get<Notification>('notifications');
    this.set('notifications', notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  }
}

export const storage = new StorageService();
