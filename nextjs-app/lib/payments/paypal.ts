/**
 * PayPal Payment Integration
 * Handles PayPal payment processing for orders
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

interface PayPalAccessToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface PayPalOrder {
    id: string;
    status: string;
    links: Array<{ href: string; rel: string }>;
}

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        throw new Error('Failed to get PayPal access token');
    }

    const data: PayPalAccessToken = await response.json();
    return data.access_token;
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(
    amount: number,
    currency: string = 'USD',
    orderId: string
): Promise<PayPalOrder> {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: orderId,
                    amount: {
                        currency_code: currency,
                        value: amount.toFixed(2),
                    },
                },
            ],
            application_context: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
                cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
                brand_name: 'GigStream',
                user_action: 'PAY_NOW',
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal order creation failed: ${JSON.stringify(error)}`);
    }

    return response.json();
}

/**
 * Capture PayPal order
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<any> {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal capture failed: ${JSON.stringify(error)}`);
    }

    return response.json();
}

/**
 * Refund PayPal payment
 */
export async function refundPayPalPayment(
    captureId: string,
    amount?: number,
    currency: string = 'USD'
): Promise<any> {
    const accessToken = await getAccessToken();

    const body: any = {};
    if (amount) {
        body.amount = {
            currency_code: currency,
            value: amount.toFixed(2),
        };
    }

    const response = await fetch(
        `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`PayPal refund failed: ${JSON.stringify(error)}`);
    }

    return response.json();
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(paypalOrderId: string): Promise<any> {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to get PayPal order details');
    }

    return response.json();
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(
    webhookId: string,
    headers: Record<string, string>,
    body: any
): Promise<boolean> {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transmission_id: headers['paypal-transmission-id'],
                transmission_time: headers['paypal-transmission-time'],
                cert_url: headers['paypal-cert-url'],
                auth_algo: headers['paypal-auth-algo'],
                transmission_sig: headers['paypal-transmission-sig'],
                webhook_id: webhookId,
                webhook_event: body,
            }),
        }
    );

    if (!response.ok) {
        return false;
    }

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
}
