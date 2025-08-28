# Style Nation API

A modern NestJS REST API for car showroom management with Facebook integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x LTS
- npm or pnpm
- PostgreSQL database (or Supabase account)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

3. **Database setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed with demo data
   npm run prisma:seed
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

5. **View API documentation**
   - API Docs: http://localhost:3001/api/docs
   - Health Check: http://localhost:3001/api/health

## 📁 Project Structure

```
src/
├── auth/          # JWT authentication & authorization
├── users/         # User management (CRUD, profiles)
├── prisma/        # Database service & configuration
├── cars/          # Car listings (TODO)
├── inquiries/     # Customer inquiries (TODO)
├── facebook/      # Facebook integration (TODO)
└── main.ts        # Application entry point
```

## 🔐 Authentication

The API uses JWT Bearer token authentication:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stylenation.com","password":"admin123"}'

# Use token in requests
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Database

- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase recommended)
- **Models**: User, Profile, Car, CarImage, Inquiry

## 🛠️ Development Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production

# Database
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed demo data
npm run prisma:studio      # Database GUI

# Testing
npm run test              # Unit tests
npm run test:e2e          # E2E tests
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user

### Users
- `POST /api/users/register` - Register (public)
- `GET /api/users/me` - Current user profile
- `POST /api/users/change-password` - Change password
- `GET /api/users` - List users (admin only)

### Cars (Coming Soon)
- Car CRUD operations
- Search and filtering
- Image management

## 🔧 Environment Variables

See `.env.example` for all required configuration options.

## 📖 Documentation

- **Swagger API Docs**: http://localhost:3001/api/docs
- **Implementation Guide**: `./CLAUDE.md`
- **Detailed Tasks**: `./TASKS.md`

## 🧪 Demo Data

After running `npm run prisma:seed`:

- **Admin User**: admin@stylenation.com / admin123
- **Regular User**: john@example.com / user123
- **Sample Cars**: Honda Accord, BMW 330i, Subaru Outback

## 🚧 Status

- ✅ Authentication & Authorization
- ✅ User Management
- ⏳ Car Management (In Progress)
- ⏳ Customer Inquiries
- ⏳ Facebook Integration

## 📞 Support

For implementation details and troubleshooting, see `./CLAUDE.md`.