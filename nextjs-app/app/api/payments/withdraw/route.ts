import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withdrawalRequestSchema } from '@/lib/security/validation-schemas';

/**
 * POST /api/payments/withdraw
 * Create a withdrawal request
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
        const validatedData = withdrawalRequestSchema.parse(body);

        // Get user's wallet
        const wallet = await prisma.wallet.findUnique({
            where: { userId: session.user.id },
        });

        if (!wallet) {
            return NextResponse.json(
                { error: 'Wallet not found' },
                { status: 404 }
            );
        }

        // Check if user has sufficient balance
        if (wallet.balance < validatedData.amount) {
            return NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            );
        }

        // Check minimum withdrawal amount
        if (validatedData.amount < 10) {
            return NextResponse.json(
                { error: 'Minimum withdrawal amount is $10' },
                { status: 400 }
            );
        }

        // Create withdrawal transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId: session.user.id,
                type: 'WITHDRAWAL',
                amount: validatedData.amount,
                currency: 'USD',
                paymentMethod: validatedData.method,
                status: 'PENDING',
                description: `Withdrawal request via ${validatedData.method}`,
            },
        });

        // Update wallet balance (deduct from available balance)
        await prisma.wallet.update({
            where: { userId: session.user.id },
            data: {
                balance: {
                    decrement: validatedData.amount,
                },
                totalWithdrawals: {
                    increment: validatedData.amount,
                },
            },
        });

        // Create notification
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                type: 'WITHDRAWAL_COMPLETED',
                title: 'Withdrawal Request Submitted',
                message: `Your withdrawal request for ${validatedData.amount} USD has been submitted and is being processed.`,
                link: '/dashboard/wallet',
            },
        });

        return NextResponse.json({
            success: true,
            transaction,
            message: 'Withdrawal request submitted successfully',
        });
    } catch (error: any) {
        console.error('Withdrawal error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to process withdrawal request' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/payments/withdraw
 * Get withdrawal history
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const withdrawals = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                type: 'WITHDRAWAL',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ withdrawals });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch withdrawal history' },
            { status: 500 }
        );
    }
}
