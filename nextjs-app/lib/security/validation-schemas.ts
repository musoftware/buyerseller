import { z } from 'zod';

/**
 * Validation Schemas for API Routes and Forms
 * Using Zod for type-safe validation
 */

// ============================================
// USER SCHEMAS
// ============================================

export const registerSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30)
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    role: z.enum(['BUYER', 'SELLER']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    languages: z.string().optional(),
    skills: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// ============================================
// GIG SCHEMAS
// ============================================

export const packageSchema = z.object({
    name: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
    description: z.string().min(10).max(500),
    price: z.number().min(5).max(10000),
    deliveryDays: z.number().int().min(1).max(90),
    revisions: z.number().int().min(0).max(10),
    features: z.array(z.string()).min(1).max(10),
});

export const createGigSchema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters').max(100),
    description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().optional(),
    tags: z.array(z.string()).min(1, 'At least one tag is required').max(10),
    images: z.array(z.string().url()).min(1, 'At least one image is required').max(5),
    video: z.string().url().optional(),
    packages: z.object({
        basic: packageSchema,
        standard: packageSchema.optional(),
        premium: packageSchema.optional(),
    }),
    faqs: z.array(z.object({
        question: z.string().min(5).max(200),
        answer: z.string().min(5).max(500),
    })).max(10).optional(),
    requirements: z.array(z.string()).min(1).max(10),
});

export const updateGigSchema = createGigSchema.partial();

// ============================================
// ORDER SCHEMAS
// ============================================

export const createOrderSchema = z.object({
    gigId: z.string().cuid(),
    packageType: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
    requirements: z.record(z.string(), z.any()).optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        'PENDING',
        'IN_PROGRESS',
        'DELIVERED',
        'REVISION_REQUESTED',
        'COMPLETED',
        'CANCELLED',
        'DISPUTED'
    ]),
    cancellationReason: z.string().min(10).max(500).optional(),
});

export const deliverOrderSchema = z.object({
    message: z.string().min(10).max(1000),
    files: z.array(z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number().int().positive(),
        fileType: z.string(),
    })).min(1).max(10),
});

export const requestRevisionSchema = z.object({
    message: z.string().min(10, 'Please provide detailed revision instructions').max(1000),
});

// ============================================
// REVIEW SCHEMAS
// ============================================

export const createReviewSchema = z.object({
    orderId: z.string().cuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10, 'Review must be at least 10 characters').max(1000),
});

export const respondToReviewSchema = z.object({
    reviewId: z.string().cuid(),
    response: z.string().min(10).max(500),
});

// ============================================
// MESSAGE SCHEMAS
// ============================================

export const sendMessageSchema = z.object({
    conversationId: z.string().cuid(),
    content: z.string().min(1).max(5000),
    attachments: z.array(z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number().int().positive(),
        fileType: z.string(),
    })).max(5).optional(),
});

export const createConversationSchema = z.object({
    participantId: z.string().cuid(),
    initialMessage: z.string().min(1).max(5000).optional(),
});

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const createPaymentIntentSchema = z.object({
    orderId: z.string().cuid(),
    paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'STRIPE']),
});

export const refundSchema = z.object({
    orderId: z.string().cuid(),
    amount: z.number().positive().optional(), // Partial refund
    reason: z.string().min(10).max(500),
});

export const withdrawalRequestSchema = z.object({
    amount: z.number().positive().min(10, 'Minimum withdrawal is $10'),
    method: z.enum(['STRIPE', 'PAYPAL', 'BANK_TRANSFER']),
    accountDetails: z.record(z.string(), z.any()),
});

// ============================================
// DISPUTE SCHEMAS
// ============================================

export const createDisputeSchema = z.object({
    orderId: z.string().cuid(),
    reason: z.string().min(1).max(100),
    description: z.string().min(50, 'Please provide detailed description').max(2000),
});

export const resolveDisputeSchema = z.object({
    disputeId: z.string().cuid(),
    status: z.enum(['RESOLVED_REFUND', 'RESOLVED_COMPLETED', 'CANCELLED']),
    resolution: z.string().min(10).max(1000),
});

// ============================================
// FILE UPLOAD SCHEMAS
// ============================================

export const fileUploadSchema = z.object({
    file: z.instanceof(File),
    type: z.enum(['image', 'video', 'document', 'deliverable']),
}).refine((data) => {
    const maxSizes = {
        image: 5 * 1024 * 1024, // 5MB
        video: 100 * 1024 * 1024, // 100MB
        document: 10 * 1024 * 1024, // 10MB
        deliverable: 50 * 1024 * 1024, // 50MB
    };
    return data.file.size <= maxSizes[data.type];
}, {
    message: 'File size exceeds maximum allowed size',
});

// ============================================
// SEARCH SCHEMAS
// ============================================

export const searchSchema = z.object({
    q: z.string().max(200).optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().positive().optional(),
    rating: z.number().min(0).max(5).optional(),
    deliveryTime: z.number().int().positive().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular']).optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(12),
}).refine((data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
    }
    return true;
}, {
    message: 'Minimum price must be less than or equal to maximum price',
});

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const notificationPreferencesSchema = z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    orderUpdates: z.boolean(),
    messages: z.boolean(),
    reviews: z.boolean(),
    marketing: z.boolean(),
});

// ============================================
// ADMIN SCHEMAS
// ============================================

export const updateUserStatusSchema = z.object({
    userId: z.string().cuid(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']),
    reason: z.string().min(10).max(500).optional(),
});

export const updateGigStatusSchema = z.object({
    gigId: z.string().cuid(),
    status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT', 'PENDING_APPROVAL']),
    reason: z.string().min(10).max(500).optional(),
});

export const systemSettingsSchema = z.object({
    siteName: z.string().min(1).max(100),
    platformFeePercent: z.number().min(0).max(50),
    maintenanceMode: z.boolean(),
});

// ============================================
// HELPER TYPES
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGigInput = z.infer<typeof createGigSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
