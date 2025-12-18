# GigStream - Complete API Documentation

## Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "BUYER" // or "SELLER"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "BUYER"
  }
}
```

### POST `/api/auth/[...nextauth]`
NextAuth.js authentication endpoints (handled automatically).

**Providers:**
- Credentials (email/password)
- Google OAuth

---

## Gig Endpoints

### GET `/api/gigs`
Get all gigs with optional filtering.

**Query Parameters:**
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort by: "newest", "price_low", "price_high", "rating"
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Response:**
```json
{
  "gigs": [...],
  "total": 100,
  "page": 1,
  "totalPages": 9
}
```

### POST `/api/gigs`
Create a new gig (requires authentication, SELLER role).

**Request Body:**
```json
{
  "title": "I will design a professional logo",
  "category": "Graphics & Design",
  "description": "Full description...",
  "images": ["url1", "url2"],
  "packages": {
    "BASIC": { "price": 50, "deliveryDays": 3, "features": [...] },
    "STANDARD": { "price": 100, "deliveryDays": 5, "features": [...] },
    "PREMIUM": { "price": 200, "deliveryDays": 7, "features": [...] }
  },
  "tags": ["logo", "design", "branding"],
  "faqs": [{ "question": "...", "answer": "..." }]
}
```

---

## Order Endpoints

### GET `/api/orders`
Get user's orders (buyer or seller).

**Query Parameters:**
- `role` - "buyer" or "seller"

**Response:**
```json
{
  "orders": [...]
}
```

### PATCH `/api/orders/[id]/status`
Update order status.

**Request Body:**
```json
{
  "status": "IN_PROGRESS" // or "DELIVERED", "COMPLETED"
}
```

---

## Message Endpoints

### GET `/api/conversations`
Get all conversations for the authenticated user.

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv_id",
      "participants": [...],
      "messages": [...],
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/conversations`
Create a new conversation.

**Request Body:**
```json
{
  "participantId": "user_id",
  "orderId": "order_id" // optional
}
```

### POST `/api/messages`
Send a message in a conversation.

**Request Body:**
```json
{
  "conversationId": "conv_id",
  "content": "Message text",
  "attachments": ["url1", "url2"] // optional
}
```

---

## Review Endpoints

### POST `/api/reviews`
Create a review for a completed order.

**Request Body:**
```json
{
  "orderId": "order_id",
  "rating": 5,
  "comment": "Excellent work!"
}
```

### DELETE `/api/reviews/[id]`
Delete a review (Admin only).

**Response:**
```json
{
  "success": true
}
```

---

## Payment Endpoints

### POST `/api/checkout`
Create a Stripe checkout session.

**Request Body:**
```json
{
  "gigId": "gig_id",
  "packageType": "BASIC",
  "requirements": "Project details..."
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/webhooks/stripe`
Stripe webhook handler (for payment confirmations).

---

## Admin Endpoints

### GET `/api/admin/analytics/revenue`
Get revenue analytics (Admin only).

**Query Parameters:**
- `range` - "30days" or "12months"

**Response:**
```json
{
  "data": [
    { "name": "Jan 2024", "total": 5000, "profit": 500 }
  ],
  "summary": {
    "totalRevenue": 50000,
    "totalFees": 5000
  }
}
```

### GET `/api/admin/settings`
Get platform settings (Admin only).

### PUT `/api/admin/settings`
Update platform settings (Admin only).

**Request Body:**
```json
{
  "siteName": "GigStream",
  "platformFeePercent": 10,
  "maintenanceMode": false
}
```

---

## Dispute Endpoints

### POST `/api/disputes`
Create a dispute for an order.

**Request Body:**
```json
{
  "orderId": "order_id",
  "reason": "Quality is poor",
  "description": "Detailed description of the issue..."
}
```

---

## Notification Endpoints

### GET `/api/notifications`
Get user notifications.

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_id",
      "type": "ORDER_PLACED",
      "title": "New Order",
      "message": "You have a new order!",
      "link": "/dashboard/orders/123",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Search Endpoints

### GET `/api/search/suggestions`
Get search suggestions.

**Query Parameters:**
- `q` - Search query

**Response:**
```json
{
  "gigs": [
    { "title": "Logo Design", "slug": "logo-design-pro" }
  ],
  "categories": ["Graphics & Design", "Web Development"]
}
```

---

## Upload Endpoints

### POST `/api/upload`
Upload files to Cloudinary.

**Request Body (multipart/form-data):**
- `file` - File to upload

**Response:**
```json
{
  "url": "https://res.cloudinary.com/..."
}
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

API routes are rate-limited to 100 requests per minute per IP address.

**Rate Limit Headers:**
- `Retry-After` - Seconds until rate limit resets

---

## Authentication

Most endpoints require authentication via NextAuth.js session cookies.

**Protected Routes:**
- All `/api/orders/*` endpoints
- All `/api/messages/*` endpoints
- All `/api/reviews/*` endpoints
- All `/api/admin/*` endpoints
- POST `/api/gigs`

**Public Routes:**
- GET `/api/gigs`
- POST `/api/auth/register`
- `/api/auth/[...nextauth]`
- `/api/search/suggestions`

---

## Webhooks

### Stripe Webhook
**Endpoint:** `/api/webhooks/stripe`
**Events Handled:**
- `checkout.session.completed` - Creates order after successful payment

**Webhook Secret:** Set in `STRIPE_WEBHOOK_SECRET` environment variable

---

## Real-time Features

### Pusher Channels

**Message Events:**
- Channel: `{conversationId}`
- Event: `new-message`
- Payload: Message object

**Notification Events:**
- Channel: `user-{userId}`
- Event: `notification`
- Payload: Notification object

---

## Best Practices

1. **Always validate input** on both client and server
2. **Use TypeScript types** for type safety
3. **Handle errors gracefully** with try-catch blocks
4. **Rate limit sensitive endpoints** (already implemented)
5. **Log errors** for debugging (use console.error)
6. **Sanitize user input** to prevent XSS attacks
7. **Use HTTPS** in production
8. **Keep secrets secure** in environment variables

---

## Testing

Use tools like:
- **Postman** - API testing
- **curl** - Command-line testing
- **Stripe CLI** - Webhook testing

Example curl request:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123","role":"BUYER"}'
```
