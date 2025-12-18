# Environment Variables Template
# Copy this file to .env and fill in your actual values

# ============================================
# DATABASE
# ============================================
DATABASE_URL="file:./dev.db"
# For production, use PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:5432/database"

# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# ============================================
# PAYMENTS
# ============================================

# Stripe
STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# PayPal
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
PAYPAL_MODE="sandbox" # or "live" for production

# ============================================
# FILE UPLOAD
# ============================================

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OR AWS S3 (alternative)
# AWS_ACCESS_KEY_ID="your-access-key"
# AWS_SECRET_ACCESS_KEY="your-secret-key"
# AWS_S3_BUCKET="your-bucket-name"
# AWS_REGION="us-east-1"

# ============================================
# EMAIL
# ============================================

# Resend
RESEND_API_KEY="re_your_resend_api_key"

# OR SendGrid (alternative)
# SENDGRID_API_KEY="SG.your_sendgrid_api_key"

# ============================================
# REAL-TIME MESSAGING
# ============================================

# Pusher
PUSHER_APP_ID="your-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster" # e.g., "us2"

# OR Socket.io (alternative)
# SOCKET_IO_URL="http://localhost:3001"

# ============================================
# ANALYTICS
# ============================================

# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Plausible (alternative)
# NEXT_PUBLIC_PLAUSIBLE_DOMAIN="yourdomain.com"

# ============================================
# ERROR TRACKING
# ============================================

# Sentry
SENTRY_DSN="https://your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="https://your-public-sentry-dsn"

# ============================================
# SECURITY
# ============================================

# CSRF Protection
CSRF_SECRET="your-csrf-secret-change-in-production"

# ============================================
# REDIS (for caching)
# ============================================

# Upstash Redis
REDIS_URL="redis://default:your-password@your-redis-url:6379"

# ============================================
# SEARCH (optional)
# ============================================

# Algolia
# ALGOLIA_APP_ID="your-app-id"
# ALGOLIA_API_KEY="your-api-key"
# ALGOLIA_INDEX_NAME="gigs"

# OR Elasticsearch
# ELASTICSEARCH_URL="http://localhost:9200"

# ============================================
# APPLICATION
# ============================================

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development" # or "production"

# ============================================
# RATE LIMITING
# ============================================

# Upstash Rate Limit (optional)
# UPSTASH_REDIS_REST_URL="your-upstash-url"
# UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
