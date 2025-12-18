import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoice, sendInvoiceEmail } from '@/lib/payments/invoice-generator';

/**
 * GET /api/invoices/[orderId]
 * Get invoice for an order
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderId } = await params;

        // Generate invoice HTML
        const invoiceHTML = await generateInvoice(orderId);

        // Return HTML response
        return new NextResponse(invoiceHTML, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error: any) {
        console.error('Invoice generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate invoice' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/invoices/[orderId]/send
 * Send invoice via email
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderId } = await params;

        // Send invoice email
        await sendInvoiceEmail(orderId);

        return NextResponse.json({
            success: true,
            message: 'Invoice sent successfully',
        });
    } catch (error: any) {
        console.error('Send invoice error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send invoice' },
            { status: 500 }
        );
    }
}
