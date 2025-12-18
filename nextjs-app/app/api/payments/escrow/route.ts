import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Escrow System for GigStream
 * Holds funds until work is completed and approved
 */

interface EscrowTransaction {
    id: string
    orderId: string
    amount: number
    currency: string
    status: 'HELD' | 'RELEASED' | 'REFUNDED'
    buyerId: string
    sellerId: string
    createdAt: Date
    releasedAt?: Date
    refundedAt?: Date
}

// In production, use database
const escrowTransactions: Map<string, EscrowTransaction> = new Map()

/**
 * Create escrow transaction (called after successful payment)
 */
export async function createEscrow(
    orderId: string,
    amount: number,
    buyerId: string,
    sellerId: string,
    currency: string = 'USD'
): Promise<EscrowTransaction> {
    const transaction: EscrowTransaction = {
        id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        amount,
        currency,
        status: 'HELD',
        buyerId,
        sellerId,
        createdAt: new Date(),
    }

    escrowTransactions.set(transaction.id, transaction)

    // TODO: Save to database
    // TODO: Send notification to seller that funds are in escrow

    return transaction
}

/**
 * Release escrow funds to seller (called when buyer approves work)
 */
export async function releaseEscrow(
    escrowId: string,
    releasedBy: string
): Promise<{ success: boolean; error?: string }> {
    const transaction = escrowTransactions.get(escrowId)

    if (!transaction) {
        return { success: false, error: 'Escrow transaction not found' }
    }

    if (transaction.status !== 'HELD') {
        return { success: false, error: 'Escrow already processed' }
    }

    // Verify that the buyer is releasing the funds
    if (transaction.buyerId !== releasedBy) {
        return { success: false, error: 'Only buyer can release escrow' }
    }

    // Calculate platform fee (10%)
    const platformFee = transaction.amount * 0.10
    const sellerAmount = transaction.amount - platformFee

    // TODO: Transfer funds to seller via Stripe Connect or PayPal Payouts
    // TODO: Record platform fee

    transaction.status = 'RELEASED'
    transaction.releasedAt = new Date()
    escrowTransactions.set(escrowId, transaction)

    // TODO: Update database
    // TODO: Send notification to seller about payment release

    return { success: true }
}

/**
 * Refund escrow to buyer (called in case of dispute or cancellation)
 */
export async function refundEscrow(
    escrowId: string,
    reason: string,
    refundedBy: string
): Promise<{ success: boolean; error?: string }> {
    const transaction = escrowTransactions.get(escrowId)

    if (!transaction) {
        return { success: false, error: 'Escrow transaction not found' }
    }

    if (transaction.status !== 'HELD') {
        return { success: false, error: 'Escrow already processed' }
    }

    // TODO: Process refund via Stripe or PayPal
    // TODO: Deduct any processing fees if applicable

    transaction.status = 'REFUNDED'
    transaction.refundedAt = new Date()
    escrowTransactions.set(escrowId, transaction)

    // TODO: Update database
    // TODO: Send notification to buyer about refund
    // TODO: Log refund reason

    return { success: true }
}

/**
 * Get escrow status
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const escrowId = searchParams.get('id')

    if (!escrowId) {
        return ApiResponse.error('Escrow ID is required')
    }

    const transaction = escrowTransactions.get(escrowId)

    if (!transaction) {
        return ApiResponse.notFound('Escrow transaction not found')
    }

    // Verify user has access to this transaction
    if (
        transaction.buyerId !== session.user.id &&
        transaction.sellerId !== session.user.id &&
        session.user.role !== 'ADMIN'
    ) {
        return ApiResponse.forbidden()
    }

    return ApiResponse.success(transaction)
})

/**
 * Release escrow funds
 */
export const POST = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { escrowId } = await request.json()

    if (!escrowId) {
        return ApiResponse.error('Escrow ID is required')
    }

    const result = await releaseEscrow(escrowId, session.user.id)

    if (!result.success) {
        return ApiResponse.error(result.error || 'Failed to release escrow')
    }

    return ApiResponse.success({ message: 'Escrow released successfully' })
})

/**
 * Refund escrow
 */
export const PUT = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { escrowId, reason } = await request.json()

    if (!escrowId || !reason) {
        return ApiResponse.error('Escrow ID and reason are required')
    }

    const result = await refundEscrow(escrowId, reason, session.user.id)

    if (!result.success) {
        return ApiResponse.error(result.error || 'Failed to refund escrow')
    }

    return ApiResponse.success({ message: 'Escrow refunded successfully' })
})
