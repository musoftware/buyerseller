import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler, getPaginationParams, createPaginatedResponse } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Digital Wallet System for GigStream
 * Allows sellers to accumulate earnings and request withdrawals
 */

interface WalletTransaction {
    id: string
    userId: string
    type: 'CREDIT' | 'DEBIT' | 'WITHDRAWAL' | 'REFUND' | 'FEE'
    amount: number
    currency: string
    balance: number
    description: string
    orderId?: string
    createdAt: Date
    metadata?: Record<string, any>
}

interface Wallet {
    userId: string
    balance: number
    currency: string
    pendingBalance: number // Funds in escrow
    totalEarnings: number
    totalWithdrawals: number
    lastUpdated: Date
}

// In production, use database
const wallets: Map<string, Wallet> = new Map()
const transactions: Map<string, WalletTransaction[]> = new Map()

/**
 * Get wallet balance
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const includeTransactions = searchParams.get('includeTransactions') === 'true'

    // Get or create wallet
    let wallet = wallets.get(session.user.id)
    if (!wallet) {
        wallet = {
            userId: session.user.id,
            balance: 0,
            currency: 'USD',
            pendingBalance: 0,
            totalEarnings: 0,
            totalWithdrawals: 0,
            lastUpdated: new Date(),
        }
        wallets.set(session.user.id, wallet)
    }

    const response: any = { wallet }

    if (includeTransactions) {
        const userTransactions = transactions.get(session.user.id) || []
        const params = getPaginationParams(searchParams, 20)
        const paginatedTransactions = userTransactions.slice(
            params.skip,
            params.skip + params.limit
        )
        response.transactions = createPaginatedResponse(
            paginatedTransactions,
            userTransactions.length,
            params
        )
    }

    return ApiResponse.success(response)
})

/**
 * Add funds to wallet (called when order is completed)
 */
export async function creditWallet(
    userId: string,
    amount: number,
    description: string,
    orderId?: string
): Promise<void> {
    let wallet = wallets.get(userId)
    if (!wallet) {
        wallet = {
            userId,
            balance: 0,
            currency: 'USD',
            pendingBalance: 0,
            totalEarnings: 0,
            totalWithdrawals: 0,
            lastUpdated: new Date(),
        }
    }

    wallet.balance += amount
    wallet.totalEarnings += amount
    wallet.lastUpdated = new Date()
    wallets.set(userId, wallet)

    // Record transaction
    const transaction: WalletTransaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'CREDIT',
        amount,
        currency: 'USD',
        balance: wallet.balance,
        description,
        orderId,
        createdAt: new Date(),
    }

    const userTransactions = transactions.get(userId) || []
    userTransactions.unshift(transaction)
    transactions.set(userId, userTransactions)

    // TODO: Save to database
    // TODO: Send notification to user
}

/**
 * Deduct funds from wallet
 */
export async function debitWallet(
    userId: string,
    amount: number,
    description: string,
    type: 'DEBIT' | 'WITHDRAWAL' | 'FEE' = 'DEBIT'
): Promise<{ success: boolean; error?: string }> {
    const wallet = wallets.get(userId)
    if (!wallet) {
        return { success: false, error: 'Wallet not found' }
    }

    if (wallet.balance < amount) {
        return { success: false, error: 'Insufficient balance' }
    }

    wallet.balance -= amount
    if (type === 'WITHDRAWAL') {
        wallet.totalWithdrawals += amount
    }
    wallet.lastUpdated = new Date()
    wallets.set(userId, wallet)

    // Record transaction
    const transaction: WalletTransaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type,
        amount: -amount,
        currency: 'USD',
        balance: wallet.balance,
        description,
        createdAt: new Date(),
    }

    const userTransactions = transactions.get(userId) || []
    userTransactions.unshift(transaction)
    transactions.set(userId, userTransactions)

    // TODO: Save to database

    return { success: true }
}

/**
 * Move funds to pending (when order is in progress)
 */
export async function holdFunds(userId: string, amount: number): Promise<void> {
    const wallet = wallets.get(userId)
    if (wallet) {
        wallet.pendingBalance += amount
        wallet.lastUpdated = new Date()
        wallets.set(userId, wallet)
    }
}

/**
 * Release pending funds (when order is completed)
 */
export async function releaseFunds(userId: string, amount: number): Promise<void> {
    const wallet = wallets.get(userId)
    if (wallet) {
        wallet.pendingBalance -= amount
        wallet.lastUpdated = new Date()
        wallets.set(userId, wallet)
    }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
    userId: string,
    limit: number = 50
): Promise<WalletTransaction[]> {
    const userTransactions = transactions.get(userId) || []
    return userTransactions.slice(0, limit)
}
