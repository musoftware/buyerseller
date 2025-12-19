import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    })
    : null;

/**
 * Withdrawal Request System
 * Allows sellers to withdraw their earnings
 */

interface WithdrawalRequest {
    id: string
    userId: string
    amount: number
    currency: string
    method: 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE'
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED'
    accountDetails: {
        type: string
        last4?: string
        email?: string
        accountName?: string
    }
    requestedAt: Date
    processedAt?: Date
    completedAt?: Date
    rejectionReason?: string
    transactionId?: string
    fee: number
    netAmount: number
}

// In production, use database
const withdrawalRequests: Map<string, WithdrawalRequest> = new Map()

// Minimum withdrawal amount
const MIN_WITHDRAWAL = 10
// Withdrawal fee (2%)
const WITHDRAWAL_FEE_PERCENT = 0.02

/**
 * Request withdrawal
 */
export const POST = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { amount, method, accountDetails } = await request.json()

    if (!amount || !method || !accountDetails) {
        return ApiResponse.error('Missing required fields')
    }

    if (amount < MIN_WITHDRAWAL) {
        return ApiResponse.error(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}`)
    }

    // TODO: Check wallet balance
    // TODO: Verify account details

    const fee = amount * WITHDRAWAL_FEE_PERCENT
    const netAmount = amount - fee

    const withdrawalRequest: WithdrawalRequest = {
        id: `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.id,
        amount,
        currency: 'USD',
        method,
        status: 'PENDING',
        accountDetails,
        requestedAt: new Date(),
        fee,
        netAmount,
    }

    withdrawalRequests.set(withdrawalRequest.id, withdrawalRequest)

    // TODO: Deduct amount from wallet
    // TODO: Save to database
    // TODO: Send notification to admin
    // TODO: Send confirmation email to user

    return ApiResponse.success({
        withdrawalRequestId: withdrawalRequest.id,
        amount,
        fee,
        netAmount,
        message: 'Withdrawal request submitted successfully',
    })
})

/**
 * Process withdrawal (Admin or automated)
 */
export const PUT = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return ApiResponse.forbidden()
    }

    const { withdrawalRequestId, approve, rejectionReason } = await request.json()

    if (!withdrawalRequestId) {
        return ApiResponse.error('Withdrawal request ID is required')
    }

    const withdrawalRequest = withdrawalRequests.get(withdrawalRequestId)

    if (!withdrawalRequest) {
        return ApiResponse.notFound('Withdrawal request not found')
    }

    if (withdrawalRequest.status !== 'PENDING') {
        return ApiResponse.error('Withdrawal request already processed')
    }

    if (!approve) {
        withdrawalRequest.status = 'REJECTED'
        withdrawalRequest.processedAt = new Date()
        withdrawalRequest.rejectionReason = rejectionReason

        // TODO: Refund amount to wallet
        // TODO: Send notification to user

        return ApiResponse.success({
            message: 'Withdrawal request rejected',
        })
    }

    withdrawalRequest.status = 'PROCESSING'
    withdrawalRequest.processedAt = new Date()

    try {
        let transactionId: string | undefined

        // Process based on withdrawal method
        switch (withdrawalRequest.method) {
            case 'STRIPE':
                // Use Stripe Connect for payouts
                // TODO: Implement Stripe Connect payout
                transactionId = `stripe_${Date.now()}`
                break

            case 'PAYPAL':
                // Use PayPal Payouts API
                // TODO: Implement PayPal payout
                transactionId = `paypal_${Date.now()}`
                break

            case 'BANK_TRANSFER':
                // Manual bank transfer
                // TODO: Generate bank transfer instructions
                transactionId = `bank_${Date.now()}`
                break

            default:
                throw new Error('Invalid withdrawal method')
        }

        withdrawalRequest.status = 'COMPLETED'
        withdrawalRequest.completedAt = new Date()
        withdrawalRequest.transactionId = transactionId

        // TODO: Update database
        // TODO: Send notification to user with transaction details

        return ApiResponse.success({
            message: 'Withdrawal processed successfully',
            transactionId,
        })
    } catch (error) {
        withdrawalRequest.status = 'FAILED'
        console.error('Withdrawal processing error:', error)

        // TODO: Refund amount to wallet
        // TODO: Send notification to user

        return ApiResponse.serverError('Failed to process withdrawal')
    }
})

/**
 * Get withdrawal requests
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let requests = Array.from(withdrawalRequests.values())

    // Non-admin users can only see their own requests
    if (session.user.role !== 'ADMIN') {
        requests = requests.filter(r => r.userId === session.user.id)
    }

    // Filter by status if provided
    if (status) {
        requests = requests.filter(r => r.status === status)
    }

    // Sort by date (newest first)
    requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())

    return ApiResponse.success(requests)
})

/**
 * Cancel withdrawal request (before processing)
 */
export const DELETE = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const withdrawalRequestId = searchParams.get('id')

    if (!withdrawalRequestId) {
        return ApiResponse.error('Withdrawal request ID is required')
    }

    const withdrawalRequest = withdrawalRequests.get(withdrawalRequestId)

    if (!withdrawalRequest) {
        return ApiResponse.notFound('Withdrawal request not found')
    }

    if (withdrawalRequest.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return ApiResponse.forbidden()
    }

    if (withdrawalRequest.status !== 'PENDING') {
        return ApiResponse.error('Can only cancel pending withdrawal requests')
    }

    withdrawalRequests.delete(withdrawalRequestId)

    // TODO: Refund amount to wallet
    // TODO: Update database

    return ApiResponse.success({
        message: 'Withdrawal request cancelled successfully',
    })
})
