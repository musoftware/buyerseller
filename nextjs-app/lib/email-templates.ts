/**
 * Email Templates for GigStream
 * Professional, responsive email templates
 */

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .header {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    padding: 30px;
    text-align: center;
  }
  .header h1 {
    color: #ffffff;
    margin: 0;
    font-size: 28px;
  }
  .content {
    padding: 40px 30px;
  }
  .button {
    display: inline-block;
    padding: 12px 30px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
  }
  .footer {
    background-color: #f9fafb;
    padding: 30px;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
  }
  .footer a {
    color: #10b981;
    text-decoration: none;
  }
`

/**
 * Welcome Email Template
 */
export function welcomeEmail(userName: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to GigStream</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to GigStream!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Thank you for joining GigStream! We're excited to have you as part of our community.</p>
          <p>GigStream connects talented freelancers with clients looking for quality services. Whether you're here to offer your skills or find the perfect freelancer, we've got you covered.</p>
          
          <h3>Get Started:</h3>
          <ul>
            <li>Complete your profile to stand out</li>
            <li>Browse thousands of services</li>
            <li>Connect with top freelancers</li>
            <li>Start your first project</li>
          </ul>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
          
          <p>If you have any questions, our support team is here to help!</p>
          
          <p>Best regards,<br>The GigStream Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GigStream. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXTAUTH_URL}">Visit Website</a> |
            <a href="${process.env.NEXTAUTH_URL}/help">Help Center</a> |
            <a href="${process.env.NEXTAUTH_URL}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Order Confirmation Email Template
 */
export function orderConfirmationEmail(data: {
    buyerName: string
    sellerName: string
    gigTitle: string
    amount: number
    orderId: string
    deliveryTime: number
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.buyerName},</h2>
          <p>Your order has been confirmed and ${data.sellerName} has been notified.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Service:</strong> ${data.gigTitle}</p>
            <p><strong>Seller:</strong> ${data.sellerName}</p>
            <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Expected Delivery:</strong> ${data.deliveryTime} days</p>
          </div>
          
          <p>Your payment has been securely processed and held in escrow. It will be released to the seller once you approve the delivered work.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard/orders/${data.orderId}" class="button">View Order</a>
          
          <p>You can track your order progress and communicate with ${data.sellerName} through your dashboard.</p>
          
          <p>Best regards,<br>The GigStream Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GigStream. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Order Delivered Email Template
 */
export function orderDeliveredEmail(data: {
    buyerName: string
    sellerName: string
    gigTitle: string
    orderId: string
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Delivered!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.buyerName},</h2>
          <p>${data.sellerName} has delivered your order for "${data.gigTitle}".</p>
          
          <p>Please review the delivered work and let us know if it meets your expectations.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard/orders/${data.orderId}" class="button">Review Delivery</a>
          
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Review the delivered files and work</li>
            <li>Request revisions if needed</li>
            <li>Accept the delivery to release payment</li>
            <li>Leave a review for ${data.sellerName}</li>
          </ul>
          
          <p>If you have any concerns, please contact the seller or our support team.</p>
          
          <p>Best regards,<br>The GigStream Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GigStream. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * New Message Email Template
 */
export function newMessageEmail(data: {
    recipientName: string
    senderName: string
    messagePreview: string
    conversationId: string
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Message</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Message</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.recipientName},</h2>
          <p>You have a new message from ${data.senderName}:</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-style: italic;">"${data.messagePreview}"</p>
          </div>
          
          <a href="${process.env.NEXTAUTH_URL}/messages/${data.conversationId}" class="button">Reply Now</a>
          
          <p>Quick responses lead to better relationships and successful projects!</p>
          
          <p>Best regards,<br>The GigStream Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GigStream. All rights reserved.</p>
          <p><a href="${process.env.NEXTAUTH_URL}/settings/notifications">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Review Received Email Template
 */
export function reviewReceivedEmail(data: {
    sellerName: string
    buyerName: string
    rating: number
    comment: string
    gigTitle: string
}): string {
    const stars = '⭐'.repeat(data.rating)

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Review</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ New Review!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.sellerName},</h2>
          <p>Great news! ${data.buyerName} left you a ${data.rating}-star review for "${data.gigTitle}".</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 24px; margin: 0 0 10px 0;">${stars}</p>
            <p style="margin: 0; font-style: italic;">"${data.comment}"</p>
          </div>
          
          <p>Positive reviews help you attract more clients and grow your business on GigStream!</p>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard/reviews" class="button">View All Reviews</a>
          
          <p>Keep up the excellent work!</p>
          
          <p>Best regards,<br>The GigStream Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GigStream. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Withdrawal Approved Email Template
 */
export function withdrawalApprovedEmail(data: {
    userName: string
    amount: number
    method: string
    transactionId: string
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Withdrawal Approved</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Withdrawal Approved!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.userName},</h2>
          <p>Good news! Your withdrawal request has been approved and processed.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Withdrawal Details</h3>
            <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Method:</strong> ${data.method}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          </div>
          
          <p>The funds should arrive in your account within 3-5 business days, depending on your payment method.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/dashboard/wallet" class="button">View Wallet</a>
          
          <p>Thank you for being a valued member of GigStream!</p>
          
          <p>Best regards,<br>The GigStream Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GigStream. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
