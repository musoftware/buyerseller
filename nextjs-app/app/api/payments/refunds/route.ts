import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
})

/**
 * Refund Management System
 */

interface RefundRequest {
    id: string
    orderId: string
    paymentIntentId: string
    amount: number
    reason: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
    requestedBy: string
    requestedAt: Date
    processedAt?: Date
    processedBy?: string
    notes?: string
}

// In production, use database
const refundRequests: Map<string, RefundRequest> = new Map()

/**
 * Request a refund
 */
export const POST = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { orderId, paymentIntentId, amount, reason } = await request.json()

    if (!orderId || !paymentIntentId || !amount || !reason) {
        return ApiResponse.error('Missing required fields')
    }

    // TODO: Verify that the user owns this order
    // TODO: Check if refund is allowed (within refund window, order status, etc.)

    const refundRequest: RefundRequest = {
        id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        paymentIntentId,
        amount,
        reason,
        status: 'PENDING',
        requestedBy: session.user.id,
        requestedAt: new Date(),
    }

    refundRequests.set(refundRequest.id, refundRequest)

    // TODO: Save to database
    // TODO: Send notification to admin for review
    // TODO: Send confirmation email to user

    return ApiResponse.success({
        refundRequestId: refundRequest.id,
        message: 'Refund request submitted successfully',
    })
})

/**
 * Process refund (Admin only)
 */
export const PUT = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return ApiResponse.forbidden()
    }

    const { refundRequestId, approve, notes } = await request.json()

    if (!refundRequestId || approve === undefined) {
        return ApiResponse.error('Missing required fields')
    }

    const refundRequest = refundRequests.get(refundRequestId)

    if (!refundRequest) {
        return ApiResponse.notFound('Refund request not found')
    }

    if (refundRequest.status !== 'PENDING') {
        return ApiResponse.error('Refund request already processed')
    }

    if (approve) {
        try {
            // Process refund via Stripe
            const refund = await stripe.refunds.create({
                payment_intent: refundRequest.paymentIntentId,
                amount: Math.round(refundRequest.amount * 100), // Convert to cents
                reason: 'requested_by_customer',
                metadata: {
                    orderId: refundRequest.orderId,
                    refundRequestId: refundRequest.id,
                },
            })

            refundRequest.status = 'COMPLETED'
            refundRequest.processedAt = new Date()
            refundRequest.processedBy = session.user.id
            refundRequest.notes = notes

            // TODO: Update order status to 'REFUNDED'
            // TODO: Update escrow status
            // TODO: Send notification to buyer
            // TODO: Send notification to seller

            return ApiResponse.success({
                message: 'Refund processed successfully',
                refundId: refund.id,
            })
        } catch (error) {
            console.error('Stripe refund error:', error)
            return ApiResponse.serverError('Failed to process refund')
        }
    } else {
        refundRequest.status = 'REJECTED'
        refundRequest.processedAt = new Date()
        refundRequest.processedBy = session.user.id
        refundRequest.notes = notes

        // TODO: Send notification to buyer about rejection

        return ApiResponse.success({
            message: 'Refund request rejected',
        })
    }
})

/**
 * Get refund requests
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    let requests = Array.from(refundRequests.values())

    // Filter by order ID if provided
    if (orderId) {
        requests = requests.filter(r => r.orderId === orderId)
    }

    // Non-admin users can only see their own requests
    if (session.user.role !== 'ADMIN') {
        requests = requests.filter(r => r.requestedBy === session.user.id)
    }

    return ApiResponse.success(requests)
})

/**
 * Partial refund helper
 */
export async function processPartialRefund(
    paymentIntentId: string,
    amount: number,
    reason: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100),
            reason: 'requested_by_customer',
        })

        return { success: true, refundId: refund.id }
    } catch (error) {
        console.error('Partial refund error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Refund failed',
        }
    }
}

/**
 * Full refund helper
 */
export async function processFullRefund(
    paymentIntentId: string,
    reason: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            reason: 'requested_by_customer',
        })

        return { success: true, refundId: refund.id }
    } catch (error) {
        console.error('Full refund error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Refund failed',
        }
    }
}
