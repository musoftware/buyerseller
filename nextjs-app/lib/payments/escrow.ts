import { prisma } from '@/lib/prisma';

/**
 * Escrow System
 * Manages fund holding and release for orders
 */

export interface EscrowTransaction {
    orderId: string;
    amount: number;
    status: 'HELD' | 'RELEASED' | 'REFUNDED';
    paymentIntentId: string;
}

/**
 * Hold funds in escrow when order is placed
 */
export async function holdFundsInEscrow(
    orderId: string,
    amount: number,
    paymentIntentId: string
): Promise<void> {
    // Update order payment status
    await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: 'PROCESSING',
            paymentIntentId,
        },
    });

    // Create transaction record
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { seller: true },
    });

    if (!order) {
        throw new Error('Order not found');
    }

    await prisma.transaction.create({
        data: {
            userId: order.sellerId,
            orderId: orderId,
            type: 'ORDER_PAYMENT',
            amount: amount,
            currency: 'USD',
            paymentMethod: 'STRIPE',
            status: 'PROCESSING',
            description: `Escrow hold for order ${orderId}`,
            externalId: paymentIntentId,
        },
    });

    // Update seller's wallet - add to pending clearance
    await prisma.wallet.upsert({
        where: { userId: order.sellerId },
        create: {
            userId: order.sellerId,
            balance: 0,
            pendingClearance: amount,
            totalEarnings: 0,
            totalWithdrawals: 0,
        },
        update: {
            pendingClearance: {
                increment: amount,
            },
        },
    });
}

/**
 * Release funds from escrow when order is completed
 */
export async function releaseFundsFromEscrow(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { seller: true },
    });

    if (!order) {
        throw new Error('Order not found');
    }

    if (order.paymentStatus !== 'PROCESSING' && order.paymentStatus !== 'COMPLETED') {
        throw new Error('Invalid payment status for fund release');
    }

    // Calculate platform fee
    const settings = await prisma.systemSettings.findFirst();
    const platformFeePercent = settings?.platformFeePercent || 10;
    const platformFee = (order.totalAmount * platformFeePercent) / 100;
    const sellerAmount = order.totalAmount - platformFee;

    // Update order payment status
    await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: 'COMPLETED',
        },
    });

    // Update transaction status
    await prisma.transaction.updateMany({
        where: {
            orderId: orderId,
            type: 'ORDER_PAYMENT',
            status: 'PROCESSING',
        },
        data: {
            status: 'COMPLETED',
        },
    });

    // Create platform fee transaction
    await prisma.transaction.create({
        data: {
            userId: order.sellerId,
            orderId: orderId,
            type: 'SERVICE_FEE',
            amount: -platformFee,
            currency: 'USD',
            paymentMethod: 'STRIPE',
            status: 'COMPLETED',
            description: `Platform fee (${platformFeePercent}%) for order ${orderId}`,
        },
    });

    // Update seller's wallet - move from pending to available balance
    await prisma.wallet.update({
        where: { userId: order.sellerId },
        data: {
            balance: {
                increment: sellerAmount,
            },
            pendingClearance: {
                decrement: order.totalAmount,
            },
            totalEarnings: {
                increment: sellerAmount,
            },
        },
    });

    // Update seller's total earnings
    await prisma.user.update({
        where: { id: order.sellerId },
        data: {
            totalEarnings: {
                increment: sellerAmount,
            },
        },
    });

    // Update gig revenue
    await prisma.gig.update({
        where: { id: order.gigId },
        data: {
            totalRevenue: {
                increment: sellerAmount,
            },
        },
    });
}

/**
 * Refund funds from escrow when order is cancelled
 */
export async function refundFundsFromEscrow(
    orderId: string,
    amount?: number
): Promise<void> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { buyer: true, seller: true },
    });

    if (!order) {
        throw new Error('Order not found');
    }

    const refundAmount = amount || order.totalAmount;

    // Update order payment status
    await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: 'REFUNDED',
            status: 'CANCELLED',
        },
    });

    // Create refund transaction
    await prisma.transaction.create({
        data: {
            userId: order.buyerId,
            orderId: orderId,
            type: 'REFUND',
            amount: refundAmount,
            currency: 'USD',
            paymentMethod: 'STRIPE',
            status: 'COMPLETED',
            description: `Refund for order ${orderId}`,
        },
    });

    // Update seller's wallet - remove from pending clearance
    await prisma.wallet.update({
        where: { userId: order.sellerId },
        data: {
            pendingClearance: {
                decrement: refundAmount,
            },
        },
    });

    // Update buyer's total spent
    await prisma.user.update({
        where: { id: order.buyerId },
        data: {
            totalSpent: {
                decrement: refundAmount,
            },
        },
    });
}

/**
 * Get escrow balance for a seller
 */
export async function getEscrowBalance(sellerId: string): Promise<{
    available: number;
    pending: number;
    total: number;
}> {
    const wallet = await prisma.wallet.findUnique({
        where: { userId: sellerId },
    });

    if (!wallet) {
        return {
            available: 0,
            pending: 0,
            total: 0,
        };
    }

    return {
        available: wallet.balance,
        pending: wallet.pendingClearance,
        total: wallet.balance + wallet.pendingClearance,
    };
}

/**
 * Get pending orders for escrow clearance
 * Orders that are delivered and waiting for buyer approval
 */
export async function getPendingEscrowOrders(sellerId: string) {
    return prisma.order.findMany({
        where: {
            sellerId,
            status: 'DELIVERED',
            paymentStatus: 'PROCESSING',
        },
        include: {
            gig: true,
            buyer: true,
        },
        orderBy: {
            deliveryDate: 'asc',
        },
    });
}

/**
 * Auto-release funds after delivery period (e.g., 3 days)
 * This should be run as a cron job
 */
export async function autoReleaseFunds(): Promise<void> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find orders delivered more than 3 days ago
    const ordersToRelease = await prisma.order.findMany({
        where: {
            status: 'DELIVERED',
            paymentStatus: 'PROCESSING',
            updatedAt: {
                lte: threeDaysAgo,
            },
        },
    });

    // Release funds for each order
    for (const order of ordersToRelease) {
        try {
            await releaseFundsFromEscrow(order.id);

            // Update order status to completed
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });

            console.log(`Auto-released funds for order ${order.id}`);
        } catch (error) {
            console.error(`Failed to auto-release funds for order ${order.id}:`, error);
        }
    }
}
