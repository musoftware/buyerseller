
export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  location: string;
  joinedDate: string;
  rating: number;
  reviewCount: number;
  balance: number;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface GigPackage {
  name: string;
  description: string;
  price: number;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
}

export interface Gig {
  id: string;
  sellerId: string;
  title: string;
  category: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  description: string;
  packages: {
    basic: GigPackage;
    standard: GigPackage;
    premium: GigPackage;
  };
  tags: string[];
  status: 'PENDING' | 'PUBLISHED' | 'DENIED';
}

export type OrderStatus = 'PENDING' | 'REQUIREMENTS_NEEDED' | 'ACTIVE' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Order {
  id: string;
  gigId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  amount: number;
  packageName: string;
  createdAt: string;
  deadline: string;
  deliveredAt?: string;
  requirementsSubmitted: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  targetId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: string;
}
