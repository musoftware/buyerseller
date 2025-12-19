// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface User {
    id: string;
    email: string;
    username: string;
    fullName: string;
    avatar?: string | null;
    role: UserRole;
    status: UserStatus;
    bio?: string | null;
    location?: string | null;
    languages: string;
    skills: string;
    rating: number;
    totalReviews: number;
    totalEarnings: number;
    totalSpent: number;
    createdAt: Date;
    lastActive: Date;
    isVerified: boolean;
    isOnline: boolean;
    socialLinks?: {
        website?: string;
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// ============================================
// GIG/SERVICE TYPES
// ============================================

export type GigStatus = "ACTIVE" | "PAUSED" | "DRAFT" | "PENDING_APPROVAL";

export type DeliveryTime = "1_DAY" | "3_DAYS" | "7_DAYS" | "14_DAYS" | "30_DAYS";

export interface GigPackage {
    name: "BASIC" | "STANDARD" | "PREMIUM";
    title: string;
    description: string;
    price: number;
    deliveryTime: DeliveryTime;
    revisions: number;
    features: string[];
}

export interface Gig {
    id: string;
    sellerId: string;
    // ...
    seller: User | {
        id: string;
        username: string;
        fullName: string | null;
        avatar?: string | null;
        isVerified: boolean;
        rating?: number;
        level?: string;
    };
    title: string;
    slug: string;
    description: string;
    category: string;
    subcategory?: string | null;
    tags: string[];
    images: string[];
    video?: string | null;
    packages: GigPackage[];
    status: GigStatus;
    rating: number;
    totalReviews: number;
    totalOrders: number;
    totalRevenue: number;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
    faqs?: FAQ[];
    requirements?: string[];
}

export interface FAQ {
    question: string;
    answer: string;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus =
    | "PENDING"
    | "IN_PROGRESS"
    | "DELIVERED"
    | "REVISION_REQUESTED"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED";

export type PaymentStatus =
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "REFUNDED";

export interface Order {
    id: string;
    gigId: string;
    gig: Gig;
    buyerId: string;
    buyer: User;
    sellerId: string;
    seller: User;
    packageType: "BASIC" | "STANDARD" | "PREMIUM";
    price: number;
    serviceFee: number;
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    deliveryDate: Date;
    requirements?: Record<string, string>;
    deliverables?: Deliverable[];
    revisionCount: number;
    maxRevisions: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
}

export interface Deliverable {
    id: string;
    orderId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedAt: Date;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
    id: string;
    orderId: string;
    gigId: string;
    reviewerId: string;
    reviewer: User;
    rating: number;
    comment: string;
    isPublic: boolean;
    sellerResponse?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    sender: User;
    content: string;
    attachments?: Attachment[];
    status: MessageStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    orderId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Attachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
    | "ORDER_PLACED"
    | "ORDER_DELIVERED"
    | "ORDER_COMPLETED"
    | "MESSAGE_RECEIVED"
    | "REVIEW_RECEIVED"
    | "PAYMENT_RECEIVED"
    | "WITHDRAWAL_COMPLETED"
    | "SYSTEM_ANNOUNCEMENT";

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentMethod = "CREDIT_CARD" | "PAYPAL" | "STRIPE" | "BANK_TRANSFER";

export type TransactionType =
    | "ORDER_PAYMENT"
    | "REFUND"
    | "WITHDRAWAL"
    | "SERVICE_FEE";

export interface Transaction {
    id: string;
    userId: string;
    orderId?: string;
    type: TransactionType;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    description: string;
    createdAt: Date;
}

export interface Wallet {
    userId: string;
    balance: number;
    pendingClearance: number;
    totalEarnings: number;
    totalWithdrawals: number;
    currency: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardStats {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    responseTime: number;
    completionRate: number;
}

export interface ChartData {
    date: string;
    value: number;
    label?: string;
}

export interface RevenueData {
    daily: ChartData[];
    weekly: ChartData[];
    monthly: ChartData[];
    yearly: ChartData[];
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface SearchFilters {
    query?: string;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    deliveryTime?: DeliveryTime;
    rating?: number;
    sellerLevel?: string;
    sortBy?: "RELEVANCE" | "RATING" | "PRICE_LOW" | "PRICE_HIGH" | "NEWEST";
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterFormData {
    email: string;
    username: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    agreeToTerms: boolean;
}

export interface GigFormData {
    title: string;
    category: string;
    subcategory?: string;
    description: string;
    tags: string[];
    images: File[];
    video?: File;
    packages: GigPackage[];
    faqs?: FAQ[];
    requirements?: string[];
}

export interface ProfileFormData {
    fullName: string;
    bio?: string;
    location?: string;
    languages: string[];
    skills: string[];
    avatar?: File;
    socialLinks?: {
        website?: string;
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    subcategories?: Subcategory[];
    gigCount: number;
}

export interface Subcategory {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description?: string;
    gigCount: number;
}
