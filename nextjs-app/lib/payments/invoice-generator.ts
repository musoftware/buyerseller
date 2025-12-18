import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';

/**
 * Invoice Generator
 * Generates PDF invoices for completed orders
 */

export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: Date;
    order: {
        id: string;
        gigTitle: string;
        packageType: string;
        price: number;
        serviceFee: number;
        totalAmount: number;
        createdAt: Date;
        completedAt: Date | null;
    };
    buyer: {
        fullName: string;
        email: string;
        location?: string;
    };
    seller: {
        fullName: string;
        email: string;
        location?: string;
    };
    platformFee: number;
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(orderId: string, date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const orderShort = orderId.substring(0, 8).toUpperCase();
    return `INV-${year}${month}-${orderShort}`;
}

/**
 * Get invoice data for an order
 */
export async function getInvoiceData(orderId: string): Promise<InvoiceData> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            buyer: true,
            seller: true,
            gig: true,
        },
    });

    if (!order) {
        throw new Error('Order not found');
    }

    if (order.status !== 'COMPLETED') {
        throw new Error('Invoice can only be generated for completed orders');
    }

    const settings = await prisma.systemSettings.findFirst();
    const platformFeePercent = settings?.platformFeePercent || 10;
    const platformFee = (order.totalAmount * platformFeePercent) / 100;

    return {
        invoiceNumber: generateInvoiceNumber(order.id, order.completedAt || new Date()),
        invoiceDate: order.completedAt || new Date(),
        order: {
            id: order.id,
            gigTitle: order.gig.title,
            packageType: order.packageType,
            price: order.price,
            serviceFee: order.serviceFee,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            completedAt: order.completedAt,
        },
        buyer: {
            fullName: order.buyer.fullName || order.buyer.username || 'N/A',
            email: order.buyer.email,
            location: order.buyer.location || undefined,
        },
        seller: {
            fullName: order.seller.fullName || order.seller.username || 'N/A',
            email: order.seller.email,
            location: order.seller.location || undefined,
        },
        platformFee,
    };
}

/**
 * Generate HTML invoice
 */
export function generateInvoiceHTML(data: InvoiceData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #f5f5f5;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 60px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #10b981;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .invoice-date {
      color: #666;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .party h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
    }
    .party p {
      margin: 5px 0;
    }
    .items {
      margin-bottom: 40px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals tr td {
      padding: 8px 12px;
    }
    .totals tr:last-child {
      font-weight: bold;
      font-size: 18px;
      background: #f9fafb;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">GigStream</div>
      <div class="invoice-details">
        <div class="invoice-number">${data.invoiceNumber}</div>
        <div class="invoice-date">${formatDate(data.invoiceDate)}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>From (Seller)</h3>
        <p><strong>${data.seller.fullName}</strong></p>
        <p>${data.seller.email}</p>
        ${data.seller.location ? `<p>${data.seller.location}</p>` : ''}
      </div>
      <div class="party">
        <h3>To (Buyer)</h3>
        <p><strong>${data.buyer.fullName}</strong></p>
        <p>${data.buyer.email}</p>
        ${data.buyer.location ? `<p>${data.buyer.location}</p>` : ''}
      </div>
    </div>

    <div class="items">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Package</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${data.order.gigTitle}</td>
            <td>${data.order.packageType}</td>
            <td class="text-right">${formatCurrency(data.order.price)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <table class="totals">
      <tr>
        <td>Subtotal</td>
        <td class="text-right">${formatCurrency(data.order.price)}</td>
      </tr>
      <tr>
        <td>Service Fee</td>
        <td class="text-right">${formatCurrency(data.order.serviceFee)}</td>
      </tr>
      <tr>
        <td>Total</td>
        <td class="text-right">${formatCurrency(data.order.totalAmount)}</td>
      </tr>
    </table>

    <div class="footer">
      <p><strong>GigStream</strong></p>
      <p>Thank you for your business!</p>
      <p>Order ID: ${data.order.id}</p>
      <p>Completed: ${data.order.completedAt ? formatDate(data.order.completedAt) : 'N/A'}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate and save invoice (in a real app, you'd use a PDF library like puppeteer or pdfkit)
 * For now, we'll just return the HTML
 */
export async function generateInvoice(orderId: string): Promise<string> {
    const data = await getInvoiceData(orderId);
    return generateInvoiceHTML(data);
}

/**
 * Send invoice via email
 */
export async function sendInvoiceEmail(orderId: string): Promise<void> {
    const data = await getInvoiceData(orderId);
    const invoiceHTML = generateInvoiceHTML(data);

    // TODO: Integrate with email service (Resend)
    // For now, just log
    console.log(`Invoice ${data.invoiceNumber} generated for order ${orderId}`);

    // In production, you would:
    // await sendEmail({
    //   to: data.buyer.email,
    //   subject: `Invoice ${data.invoiceNumber} - GigStream`,
    //   html: invoiceHTML,
    // });
}
