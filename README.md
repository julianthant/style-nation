# Style Nation

A modern, full-stack web application for car showrooms with automated Facebook integration, built with Next.js, NestJS, and Supabase.

## 🚀 Features

- **Modern Stack**: Next.js 14, NestJS, TypeScript, Prisma, Supabase
- **Dual Interface**: Admin dashboard and customer-facing website
- **Facebook Integration**: Automatic posting of new listings to Facebook
- **Advanced Search**: Comprehensive filtering and search capabilities
- **Mobile-First**: Responsive design optimized for all devices
- **Performance**: Optimized for speed with caching and lazy loading
- **Security**: Role-based access control and data protection

## 📋 Current Status

✅ **Project Foundation Complete**

- [x] Monorepo structure setup with pnpm workspace
- [x] Next.js 14 frontend with TypeScript and Tailwind CSS
- [x] NestJS backend with comprehensive dependencies
- [x] Complete Prisma database schema
- [x] Environment files configured
- [x] Prisma client generated
- [x] Development-ready setup

🔄 **Next Steps**

- [x] Supabase account setup and configuration
- [ ] Database migrations and seeding
- [ ] Authentication system implementation
- [ ] Admin dashboard development

## 🏗️ Architecture

This is a monorepo containing:

- **`apps/web`** - Next.js frontend application
- **`apps/api`** - NestJS backend API server
- **`packages/database`** - Shared Prisma schema and client
- **`packages/types`** - Shared TypeScript types
- **`packages/config`** - Shared configuration and utilities

## 🛠️ Quick Start

### Prerequisites

- Node.js 20+ (recommended via nvm)
- pnpm 9+
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd style-nation
```

2. Install dependencies:

```bash
pnpm install
```

3. Setup environment variables:

```bash
# Environment files are already created from templates
# You need to update them with your actual Supabase credentials
# See SUPABASE_SETUP.md for detailed instructions
```

4. Setup Supabase and Database:

```bash
# Follow the detailed setup guide
# See SUPABASE_SETUP.md for step-by-step instructions

# After configuring Supabase credentials:
# Generate Prisma client (already done)
cd packages/database && pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed
```

5. Start development servers:

```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:web    # Frontend at http://localhost:3000
pnpm dev:api    # Backend at http://localhost:3001
```

## 📁 Project Structure

```
style-nation/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # Reusable components
│   │   │   └── lib/         # Utilities and configurations
│   │   └── public/          # Static assets
│   │
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── auth/        # Authentication module
│       │   ├── cars/        # Cars management module
│       │   ├── common/      # Shared resources
│       │   └── main.ts      # Application entry point
│       └── test/            # Test files
│
├── packages/
│   ├── database/            # Prisma schema and client
│   ├── types/               # Shared TypeScript types
│   └── config/              # Shared configuration
│
└── docs/                    # Documentation
    ├── CLAUDE.md            # AI development guide
    ├── PLANNING.md          # Project planning
    ├── PRD.md               # Product requirements
    └── TASKS.md             # Development tasks
```

## 🔧 Available Scripts

### Root Level

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests
- `pnpm clean` - Clean all build outputs

### Database

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data

## 🌐 Environment Variables

Key environment variables you need to configure:

### Database

- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)

### Supabase

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key

### Authentication

- `JWT_SECRET` - Secret for JWT token signing
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens

### Facebook Integration

- `FACEBOOK_APP_ID` - Facebook App ID
- `FACEBOOK_APP_SECRET` - Facebook App Secret
- `FACEBOOK_PAGE_ID` - Facebook Page ID
- `FACEBOOK_PAGE_ACCESS_TOKEN` - Facebook Page Access Token

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Connect your GitHub repository to Vercel
# Environment variables will be configured in Vercel dashboard
vercel --prod
```

### Backend (Railway/Vercel Functions)

```bash
# Build and deploy backend
pnpm build:api
# Deploy using your chosen platform
```

### Database

```bash
# Run production migrations
pnpm db:migrate:prod
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test:unit

# Run e2e tests
pnpm test:e2e

# Run with coverage
pnpm test:cov
```

## 📚 Documentation

- [Development Guide](CLAUDE.md) - Complete development guide
- [Supabase Setup](SUPABASE_SETUP.md) - Database and authentication setup
- [Project Planning](PLANNING.md) - Architecture and planning
- [Product Requirements](PRD.md) - Feature specifications
- [Task List](TASKS.md) - Development roadmap

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [NestJS](https://nestjs.com/)
- Database with [Prisma](https://www.prisma.io/) and [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
