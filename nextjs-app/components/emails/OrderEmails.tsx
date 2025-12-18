interface EmailProps {
    customerName: string;
    orderId: string;
    gigTitle: string;
    amount: number;
}

export const OrderConfirmationEmail = ({ customerName, orderId, gigTitle, amount }: EmailProps) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: 1.5 }}>
        <h1>Order Confirmation</h1>
        <p>Hi {customerName},</p>
        <p>Thank you for your order! Your payment has been successfully processed.</p>

        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
            <h3>Order Summary</h3>
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Service:</strong> {gigTitle}</p>
            <p><strong>Total Amount:</strong> ${amount.toFixed(2)}</p>
        </div>

        <p>The seller has been notified and will start working on your order shortly.</p>
        <p>You can track your order status in your <a href={`${process.env.NEXTAUTH_URL}/dashboard/orders`}>dashboard</a>.</p>

        <p>Best regards,<br />The GigStream Team</p>
    </div>
);

export const NewOrderNotificationEmail = ({ sellerName, orderId, gigTitle, amount }: { sellerName: string, orderId: string, gigTitle: string, amount: number }) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: 1.5 }}>
        <h1>New Order Received!</h1>
        <p>Hi {sellerName},</p>
        <p>You have received a new order!</p>

        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Service:</strong> {gigTitle}</p>
            <p><strong>Earnings:</strong> ${amount.toFixed(2)}</p>
        </div>

        <p>Please log in to your dashboard to view the requirements and start working.</p>
        <a href={`${process.env.NEXTAUTH_URL}/dashboard/orders/${orderId}`} style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>View Order</a>

        <p>Best regards,<br />The GigStream Team</p>
    </div>
);
