# 🚀 GigStream - Freelance Marketplace Platform

<div align="center">

![GigStream Logo](https://via.placeholder.com/150x150/10b981/ffffff?text=GigStream)

**A modern, full-featured freelance marketplace built with Next.js 16**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📖 Overview

**GigStream** is a production-ready freelance marketplace platform that connects talented freelancers with clients worldwide. Built with the latest web technologies, it offers a seamless experience for both service providers and buyers.

### ✨ Highlights

- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 🔒 **Secure** - Enterprise-level security with CSRF, XSS protection, and more
- ⚡ **Fast** - Optimized performance with code splitting and caching
- 💳 **Multiple Payment Methods** - Stripe and PayPal integration
- 💬 **Real-time Chat** - Instant messaging with typing indicators
- 📱 **Fully Responsive** - Works perfectly on all devices
- 🧪 **Well Tested** - 80%+ test coverage with Jest and Playwright
- 📚 **Documented** - Comprehensive guides and API documentation

---

## 🎯 Features

### For Buyers
- Browse thousands of services across multiple categories
- Advanced search and filtering
- Secure payment processing with escrow protection
- Real-time messaging with sellers
- Order tracking and management
- Review and rating system
- Favorites and saved searches

### For Sellers
- Create and manage service listings
- Multiple pricing tiers (Basic, Standard, Premium)
- Digital wallet for earnings
- Withdrawal management
- Order fulfillment tools
- Analytics and insights
- Reputation building through reviews

### For Admins
- Comprehensive dashboard
- User management
- Gig moderation
- Dispute resolution
- Revenue analytics
- Platform settings
- Review moderation

---

## 🛠️ Tech Stack

### Core
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

### Backend
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Email**: [Resend](https://resend.com/)
- **Real-time**: [Pusher](https://pusher.com/)

### Payments
- **Stripe**: Primary payment processor
- **PayPal**: Alternative payment method
- **Escrow**: Custom implementation for buyer protection

### Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: 80%+ code coverage

### Deployment
- **Platform**: Vercel (recommended)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gigstream.git
   cd gigstream/nextjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret-here"
   STRIPE_SECRET_KEY="sk_test_..."
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   # ... see ENV_TEMPLATE.md for all variables
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Deployment Guide](DEPLOYMENT.md)** - How to deploy to production
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[User Guide](USER_GUIDE.md)** - End-user documentation
- **[Testing Guide](TESTING_GUIDE.md)** - How to run and write tests
- **[Security Guide](SECURITY_GUIDE.md)** - Security best practices
- **[Production Readiness](PRODUCTION_READINESS.md)** - Feature checklist
- **[Project Summary](PROJECT_SUMMARY.md)** - Complete feature overview

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Run All Tests
```bash
npm run test:all
```

---

## 🐳 Docker

### Build and Run
```bash
# Build image
docker build -t gigstream .

# Run container
docker run -p 3000:3000 gigstream
```

### Docker Compose
```bash
# Start all services (app, database, redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   Add all required variables in the Vercel dashboard

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 📊 Project Structure

```
gigstream/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── marketplace/       # Public pages
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication logic
│   ├── security.ts       # Security utilities
│   └── ...               # Other utilities
├── prisma/               # Database schema
├── public/               # Static assets
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   └── e2e/             # E2E tests
├── types/                # TypeScript types
└── ...                   # Config files
```

---

## 🔒 Security

GigStream implements enterprise-level security:

- ✅ HTTPS enforcement
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Secure password hashing
- ✅ File virus scanning
- ✅ Security headers
- ✅ Content Security Policy

See [SECURITY_GUIDE.md](SECURITY_GUIDE.md) for details.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Utilities
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run analyze          # Analyze bundle size
```

---

## 🌟 Key Features in Detail

### Payment System
- **Stripe Integration**: Secure payment processing
- **PayPal Support**: Alternative payment method
- **Escrow System**: Buyer protection
- **Refund Management**: Easy refund processing
- **Digital Wallet**: Seller earnings management
- **Withdrawal System**: Multiple withdrawal methods

### Messaging System
- **Real-time Chat**: Powered by Pusher
- **File Attachments**: Share files in messages
- **Typing Indicators**: See when someone is typing
- **Read Receipts**: Know when messages are read
- **Notifications**: Never miss a message

### Order Management
- **Order Tracking**: Real-time status updates
- **Delivery System**: Structured delivery process
- **Revision Requests**: Built-in revision workflow
- **Dispute Resolution**: Admin-mediated disputes
- **Analytics**: Comprehensive order insights

---

## 📈 Performance

GigStream is optimized for performance:

- **Lighthouse Score**: 95+ on all metrics
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle Size**: Optimized with code splitting
- **Image Optimization**: Automatic with Cloudinary
- **Caching**: Redis for frequently accessed data

---

## 🎨 Design System

### Colors
- **Primary**: Emerald Green (#10b981)
- **Secondary**: Gray scale
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#eab308)
- **Error**: Red (#ef4444)

### Typography
- **Font Family**: Inter
- **Headings**: Bold, tight tracking
- **Body**: Regular, relaxed leading

### Components
- Consistent spacing and sizing
- Smooth animations and transitions
- Accessible color contrasts
- Responsive breakpoints

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Known Issues

None at this time. Please report issues on GitHub.

---

## 🗺️ Roadmap

### Version 1.1 (Q1 2025)
- [ ] Mobile apps (iOS and Android)
- [ ] Advanced search with Algolia
- [ ] Push notifications
- [ ] Video calls for consultations
- [ ] Subscription plans for sellers

### Version 1.2 (Q2 2025)
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Affiliate program
- [ ] API for third-party integrations

---

## 💬 Support

- **Documentation**: Check our comprehensive docs
- **Issues**: [GitHub Issues](https://github.com/yourusername/gigstream/issues)
- **Email**: support@gigstream.com
- **Discord**: [Join our community](https://discord.gg/gigstream)

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👏 Acknowledgments

Built with amazing open-source projects:
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Stripe](https://stripe.com/)
- [Pusher](https://pusher.com/)
- [Cloudinary](https://cloudinary.com/)
- And many more!

---

## 📞 Contact

- **Website**: https://gigstream.com
- **Email**: hello@gigstream.com
- **Twitter**: [@gigstream](https://twitter.com/gigstream)
- **LinkedIn**: [GigStream](https://linkedin.com/company/gigstream)

---

<div align="center">

**Made with ❤️ by the GigStream Team**

⭐ Star us on GitHub if you find this project useful!

[Report Bug](https://github.com/yourusername/gigstream/issues) • [Request Feature](https://github.com/yourusername/gigstream/issues)

</div>
