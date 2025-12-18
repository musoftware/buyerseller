# GigStream

A modern, full-featured freelance marketplace platform built with Next.js 16, TypeScript, and Prisma.

![GigStream](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### For Users
- 🔐 **Secure Authentication** - Email/password and Google OAuth
- 🛍️ **Marketplace** - Browse and search thousands of services
- 💬 **Real-time Messaging** - Chat with buyers/sellers instantly
- 💳 **Secure Payments** - Stripe integration with escrow
- ⭐ **Reviews & Ratings** - Build trust with verified reviews
- 📱 **Responsive Design** - Works on all devices

### For Sellers
- 📝 **Create Gigs** - Showcase your services with rich media
- 💰 **Flexible Pricing** - Three-tier packages (Basic, Standard, Premium)
- 📊 **Analytics** - Track your performance and earnings
- 🚀 **Easy Management** - Manage orders and deliveries
- 💬 **Direct Communication** - Chat with clients

### For Admins
- 👥 **User Management** - Manage all platform users
- 🎯 **Content Moderation** - Review and approve gigs
- 📈 **Revenue Analytics** - Track platform performance
- ⚙️ **Platform Settings** - Configure fees and settings
- 🛡️ **Dispute Resolution** - Handle conflicts fairly

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

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
   cp ENV_TEMPLATE.md .env
   # Edit .env with your values
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📚 Documentation

- **[Production Readiness](PRODUCTION_READINESS.md)** - Feature checklist and status
- **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[User Guide](USER_GUIDE.md)** - How to use the platform
- **[Project Summary](PROJECT_SUMMARY.md)** - Complete project overview

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma** - Type-safe ORM
- **NextAuth.js** - Authentication
- **Stripe** - Payment processing
- **Pusher** - Real-time messaging
- **Cloudinary** - Image hosting
- **Resend** - Email delivery

### Database
- **SQLite** (Development)
- **PostgreSQL** (Production)

## 📁 Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── marketplace/       # Browse gigs
│   └── ...
├── components/            # Reusable components
├── lib/                   # Utilities & configs
├── prisma/               # Database schema
├── public/               # Static assets
└── types/                # TypeScript types
```

## 🔒 Security

- ✅ Rate limiting (100 req/min)
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF protection (NextAuth)
- ✅ Secure password hashing (bcrypt)
- ✅ PCI-compliant payments (Stripe)

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Other Platforms

- **Netlify** - Supported
- **AWS** - Supported (requires configuration)
- **Docker** - Dockerfile included

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 📊 Performance

- ⚡ **Fast Build Times** - ~5-6 seconds
- 🎯 **Optimized Bundle** - Code splitting enabled
- 📱 **Mobile-First** - Responsive design
- 🚀 **SEO-Friendly** - Server-side rendering
- ♿ **Accessible** - WCAG 2.1 compliant

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Vercel** - Hosting and deployment
- **Stripe** - Payment processing
- **Pusher** - Real-time infrastructure
- **Cloudinary** - Image hosting

## 📧 Support

- **Email**: support@gigstream.com
- **Documentation**: [docs.gigstream.com](https://docs.gigstream.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/gigstream/issues)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Video uploads for gigs
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Subscription plans
- [ ] Affiliate program

## 📈 Stats

- **40+** Routes
- **24** API Endpoints
- **30+** Components
- **15** Database Models
- **100%** TypeScript
- **Production-Ready**

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

**[Live Demo](https://gigstream.vercel.app)** | **[Documentation](PRODUCTION_READINESS.md)** | **[API Docs](API_DOCUMENTATION.md)**
