# Supabase Authentication with NestJS - Complete Guide

## Overview

This documentation explains the authentication system for Style Nation's NestJS backend API that integrates with Supabase Auth. The architecture follows a **frontend-first authentication** approach where:

1. **Frontend (Next.js)** handles all user authentication via Supabase Auth
2. **Backend (NestJS)** validates Supabase-issued JWT tokens for protected routes
3. **No traditional login endpoints** on the backend - authentication is handled entirely by Supabase

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   NestJS API    │
│   (Next.js)     │    │   Auth Server   │    │   Backend       │
│                 │    │                 │    │                 │
│ 1. User Login   │───▶│ 2. Authenticate │    │                 │
│                 │    │                 │    │                 │
│                 │◀───│ 3. Return JWT   │    │                 │
│                 │    │                 │    │                 │
│ 4. API Call     │─────────────────────────▶│ 5. Validate JWT │
│    + JWT Token  │                          │                 │
│                 │◀─────────────────────────│ 6. Return Data  │
└─────────────────┘                          └─────────────────┘
```

## Authentication Flow

### Step-by-Step Process

1. **User Authentication (Frontend)**
   - User visits `/login` page on Next.js frontend
   - Enters email/password credentials
   - Frontend calls Supabase Auth service directly
   - Supabase validates credentials and returns session with JWT

2. **Token Storage (Frontend)**
   - JWT access token stored securely by Supabase client
   - Session information maintained in cookies/localStorage
   - Token automatically refreshed by Supabase client

3. **API Requests (Frontend → Backend)**
   - Frontend makes API calls using Axios with interceptor
   - Interceptor automatically adds `Authorization: Bearer <jwt>` header
   - Each request includes the current Supabase session token

4. **Token Validation (Backend)**
   - NestJS receives request with Authorization header
   - `JwtAuthGuard` extracts token using Passport JWT strategy
   - `SupabaseStrategy` validates token using `SUPABASE_JWT_SECRET`
   - Decoded user information available in `req.user`

## Implementation Details

### Backend Authentication Components

#### 1. Supabase Strategy (`src/auth/strategies/supabase.strategy.ts`)

```typescript
@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  public constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET'),
    })
  }

  async validate(payload: any): Promise<any> {
    return payload // Returns decoded JWT payload as req.user
  }
}
```

**Key Points:**
- Uses `passport-jwt` strategy for JWT validation
- Extracts JWT from `Authorization: Bearer <token>` header
- Validates signature using `SUPABASE_JWT_SECRET`
- Returns full JWT payload (user info, metadata, roles)

#### 2. JWT Auth Guard (`src/auth/guards/jwt.auth.guard.ts`)

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

**Features:**
- Applied globally to all routes by default
- Respects `@Public()` decorator for open endpoints
- Automatically validates JWT on protected routes

#### 3. Auth Module Configuration

```typescript
@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('SUPABASE_JWT_SECRET'),
        signOptions: { expiresIn: 40000 },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthGuard, SupabaseStrategy],
  exports: [JwtAuthGuard, JwtModule]
})
export class AuthModule {}
```

### Frontend Integration (Next.js)

The frontend handles all authentication logic:

#### 1. Supabase Client Setup
```typescript
// lib/supabase/client.ts
export const getSupabaseFrontendClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

#### 2. Authentication Actions
```typescript
// app/auth/actions/index.ts
export async function signInWithEmailAndPassword(data: {
  email: string;
  password: string;
}) {
  const supabase = await createSupabaseServerClient();
  return supabase.auth.signInWithPassword(data);
}
```

#### 3. Axios Interceptor for Token Injection
```typescript
// lib/hooks/useAxiosAuth.ts
const useAxiosAuth = () => {
  const supabase = getSupabaseFrontendClient();

  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(async (config) => {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session?.session?.access_token;
      
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    });
    
    return () => axiosAuth.interceptors.request.eject(requestIntercept);
  }, []);

  return axiosAuth;
};
```

## Environment Configuration

### Required Environment Variables

#### Backend (`.env`)
```bash
# Supabase Configuration
SUPABASE_JWT_SECRET=your-supabase-jwt-secret-from-dashboard

# Database (if using Supabase database directly)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# API Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (`.env.local`)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Getting Supabase JWT Secret

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Find **JWT Settings** section
4. Copy the **JWT Secret** value
5. Add to backend `.env` as `SUPABASE_JWT_SECRET`

## API Endpoints

### Public Endpoints
```bash
GET  /api              # Health check
GET  /api/health       # Detailed health check
POST /api/users/register # User registration (creates in local DB)
```

### Protected Endpoints (Require JWT Token)
```bash
# User Management
GET    /api/users/me              # Get current user profile
PATCH  /api/users/me              # Update current user profile
POST   /api/users/change-password # Change password

# Admin Only (Role-based)
GET    /api/users                 # List all users
POST   /api/users                 # Create new user
GET    /api/users/:id             # Get user by ID
PATCH  /api/users/:id             # Update user by ID
DELETE /api/users/:id             # Delete user

# Example Protected Route
GET    /api/protected             # Test authentication
```

### JWT Payload Structure

When a valid token is provided, `req.user` contains:
```json
{
  "iss": "https://yourproject.supabase.co/auth/v1",
  "sub": "user-uuid-here",
  "aud": "authenticated",
  "exp": 1727865444,
  "iat": 1727861844,
  "email": "user@example.com",
  "phone": "",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "email": "user@example.com",
    "email_verified": false,
    "phone_verified": false
  },
  "role": "authenticated",
  "aal": "aal1",
  "session_id": "session-uuid-here",
  "is_anonymous": false
}
```

## Testing Authentication

### 1. Using curl

First, get a token from the frontend, then:
```bash
# Test protected endpoint
curl -X GET 'http://localhost:3001/api/protected' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN'

# Expected Response:
{
  "message": "AuthGuard works 🎉",
  "authenticated_user": { /* JWT payload */ }
}
```

### 2. Using Swagger UI

1. Visit `http://localhost:3001/api/docs`
2. Click the "Authorize" button
3. Enter: `Bearer YOUR_SUPABASE_ACCESS_TOKEN`
4. Test any protected endpoint

### 3. Getting Test Token

**Option 1: From Frontend Console**
```javascript
// In browser console on authenticated page
const { data } = await supabase.auth.getSession();
console.log('Token:', data.session?.access_token);
```

**Option 2: From Network Tab**
1. Open browser DevTools
2. Go to Network tab
3. Make API request from frontend
4. Check request headers for `Authorization: Bearer ...`

## Protecting Routes

### Using Guards

#### Method Level
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@Req() req) {
  return { user: req.user };
}
```

#### Controller Level
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  // All routes in this controller are protected
}
```

#### Global Guard (Already Configured)
```typescript
// app.module.ts - Applied to all routes
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

### Public Routes

Use `@Public()` decorator to exclude routes from authentication:
```typescript
@Post('register')
@Public()
async register(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

### Role-Based Access

```typescript
@Get('admin-only')
@Roles(Role.ADMIN)
async adminOnlyRoute(@CurrentUser() user) {
  // Only admin users can access
  return { message: 'Admin access granted' };
}
```

### Accessing User Information

```typescript
@Get('me')
async getCurrentUser(@CurrentUser() user) {
  // user contains full JWT payload
  return {
    id: user.sub,
    email: user.email,
    role: user.role,
    metadata: user.user_metadata
  };
}
```

## Error Handling

### Common HTTP Status Codes
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error during token validation

### Error Response Format
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Troubleshooting

### 1. 401 Unauthorized Errors

**Symptoms:** All protected routes return 401
**Causes & Solutions:**
```bash
# Check if JWT_SECRET is correctly set
echo $SUPABASE_JWT_SECRET

# Verify token format
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/protected

# Check token expiration
# Tokens expire - get fresh token from frontend
```

### 2. Invalid Token Signature

**Symptoms:** Token validation fails
**Solutions:**
- Ensure `SUPABASE_JWT_SECRET` matches Supabase dashboard value
- Check if using correct environment (dev/staging/prod secrets)
- Verify token wasn't corrupted during transmission

### 3. CORS Issues

**Symptoms:** Frontend can't reach API
**Solutions:**
```typescript
// main.ts - Ensure CORS is properly configured
app.enableCors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### 4. Token Not Being Sent

**Symptoms:** 401 errors from frontend
**Check:**
- Axios interceptor is properly configured
- User is authenticated (has valid session)
- Token is being attached to requests

### 5. Environment Variable Issues

**Quick Check:**
```bash
# Backend
node -e "console.log(process.env.SUPABASE_JWT_SECRET)"

# Frontend  
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

## Security Best Practices

### 1. Token Security
- Never log JWT tokens
- Use HTTPS in production
- Implement proper token refresh logic
- Set reasonable token expiration times

### 2. Environment Variables
- Use different secrets for each environment
- Never commit secrets to version control
- Rotate secrets regularly

### 3. CORS Configuration
- Restrict origins to trusted domains
- Don't use wildcard (*) in production
- Specify exact allowed headers

### 4. Input Validation
- All DTOs use class-validator
- Global validation pipe active
- Sanitize user inputs

## Development Workflow

### 1. Adding New Protected Endpoints

```typescript
@Post('new-feature')
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'New protected feature' })
async newFeature(@CurrentUser() user, @Body() dto: FeatureDto) {
  // Implementation
}
```

### 2. Testing Authentication

```bash
# Start backend
cd apps/api && npm run start:dev

# Start frontend
cd apps/web && npm run dev

# Test flow:
# 1. Login via frontend
# 2. Check browser console for token
# 3. Use token to test API directly
```

### 3. Debugging Steps

1. **Check Environment Variables**
2. **Verify Token Format**
3. **Test with curl/Postman**
4. **Check Network Tab in DevTools**
5. **Review Server Logs**

## Production Considerations

### 1. Environment Setup
```bash
# Production environment variables
SUPABASE_JWT_SECRET=prod-secret-from-supabase
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Security Headers
- Helmet.js already configured
- HTTPS enforcement
- Security headers properly set

### 3. Monitoring
- Log authentication failures
- Monitor token validation errors  
- Track suspicious access patterns

---

## Quick Reference

### Useful Commands
```bash
# Get Supabase project info
supabase projects list

# Test API health
curl http://localhost:3001/api/health

# Test protected route
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/protected
```

### Key Files
- `src/auth/strategies/supabase.strategy.ts` - JWT validation logic
- `src/auth/guards/jwt.auth.guard.ts` - Route protection
- `src/auth/auth.module.ts` - Auth configuration
- `src/app.module.ts` - Global guard setup

### Documentation Links
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [NestJS Passport Integration](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Last Updated:** August 28, 2025  
**Version:** 1.0.0  
**Status:** Production Ready