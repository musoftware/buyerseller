import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { refundSchema } from '@/lib/security/validation-schemas';
import { refundFundsFromEscrow } from '@/lib/payments/escrow';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

/**
 * POST /api/payments/refund
 * Process a refund for an order
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validatedData = refundSchema.parse(body);

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: validatedData.orderId },
            include: {
                buyer: true,
                seller: true,
                gig: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if user is authorized (buyer, seller, or admin)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        const isAuthorized =
            user?.role === 'ADMIN' ||
            order.buyerId === session.user.id ||
            order.sellerId === session.user.id;

        if (!isAuthorized) {
            return NextResponse.json(
                { error: 'Not authorized to refund this order' },
                { status: 403 }
            );
        }

        // Check if order can be refunded
        if (order.paymentStatus === 'REFUNDED') {
            return NextResponse.json(
                { error: 'Order has already been refunded' },
                { status: 400 }
            );
        }

        if (!order.paymentIntentId) {
            return NextResponse.json(
                { error: 'No payment intent found for this order' },
                { status: 400 }
            );
        }

        const refundAmount = validatedData.amount || order.totalAmount;

        // Process Stripe refund
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
            amount: Math.round(refundAmount * 100), // Convert to cents
            reason: 'requested_by_customer',
            metadata: {
                orderId: order.id,
                reason: validatedData.reason,
            },
        });

        // Update escrow and database
        await refundFundsFromEscrow(order.id, refundAmount);

        // Create notifications
        await Promise.all([
            prisma.notification.create({
                data: {
                    userId: order.buyerId,
                    type: 'PAYMENT_RECEIVED',
                    title: 'Refund Processed',
                    message: `Your refund of $${refundAmount.toFixed(2)} for "${order.gig.title}" has been processed.`,
                    link: `/dashboard/orders/${order.id}`,
                },
            }),
            prisma.notification.create({
                data: {
                    userId: order.sellerId,
                    type: 'ORDER_COMPLETED',
                    title: 'Order Refunded',
                    message: `Order "${order.gig.title}" has been refunded.`,
                    link: `/dashboard/orders/${order.id}`,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            refund,
            message: 'Refund processed successfully',
        });
    } catch (error: any) {
        console.error('Refund error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to process refund' },
            { status: 500 }
        );
    }
}
