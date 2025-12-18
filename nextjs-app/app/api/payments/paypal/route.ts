import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPayPalOrder, capturePayPalOrder } from '@/lib/payments/paypal';
import { prisma } from '@/lib/prisma';
import { holdFundsInEscrow } from '@/lib/payments/escrow';

/**
 * POST /api/payments/paypal/create-order
 * Create a PayPal order
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

        const { orderId } = await req.json();

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                gig: true,
                buyer: true,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify the user is the buyer
        if (order.buyerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Create PayPal order
        const paypalOrder = await createPayPalOrder(
            order.totalAmount,
            'USD',
            order.id
        );

        // Update order with PayPal order ID
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentIntentId: paypalOrder.id,
                paymentStatus: 'PENDING',
            },
        });

        return NextResponse.json({
            success: true,
            paypalOrderId: paypalOrder.id,
            approvalUrl: paypalOrder.links.find(link => link.rel === 'approve')?.href,
        });
    } catch (error: any) {
        console.error('PayPal create order error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create PayPal order' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/payments/paypal/capture-order
 * Capture a PayPal order after approval
 */
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { paypalOrderId, orderId } = await req.json();

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify the user is the buyer
        if (order.buyerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Capture PayPal payment
        const captureData = await capturePayPalOrder(paypalOrderId);

        // Hold funds in escrow
        await holdFundsInEscrow(orderId, order.totalAmount, paypalOrderId);

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'IN_PROGRESS',
                paymentStatus: 'COMPLETED',
            },
        });

        // Update buyer's total spent
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                totalSpent: {
                    increment: order.totalAmount,
                },
            },
        });

        // Update gig stats
        await prisma.gig.update({
            where: { id: order.gigId },
            data: {
                totalOrders: {
                    increment: 1,
                },
            },
        });

        // Create notifications
        await Promise.all([
            prisma.notification.create({
                data: {
                    userId: order.buyerId,
                    type: 'ORDER_PLACED',
                    title: 'Payment Successful',
                    message: 'Your payment has been processed successfully.',
                    link: `/dashboard/orders/${order.id}`,
                },
            }),
            prisma.notification.create({
                data: {
                    userId: order.sellerId,
                    type: 'ORDER_PLACED',
                    title: 'New Order Received',
                    message: 'You have received a new order!',
                    link: `/dashboard/orders/${order.id}`,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            captureData,
            message: 'Payment captured successfully',
        });
    } catch (error: any) {
        console.error('PayPal capture order error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to capture PayPal payment' },
            { status: 500 }
        );
    }
}
