# Style Nation API - Architecture Documentation

## Overview

The Style Nation API is built with NestJS following clean architecture principles, providing a robust and scalable backend for the car showroom management system.

## Technology Stack

- **Framework**: NestJS 10.x with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator + class-transformer
- **Testing**: Jest with supertest
- **Documentation**: Swagger/OpenAPI
- **Cloud**: Supabase (PostgreSQL + Storage)

## Project Structure

```
src/
├── auth/                      # Authentication module
│   ├── decorators/           # Custom decorators (@Public, @Roles, @CurrentUser)
│   ├── dto/                  # Data transfer objects
│   ├── entities/             # Response entities
│   ├── guards/               # Authentication & authorization guards
│   ├── strategies/           # Passport strategies (JWT, Local)
│   ├── auth.controller.ts    # Auth endpoints (login, logout, refresh)
│   ├── auth.service.ts       # Authentication business logic
│   └── auth.module.ts        # Module configuration
├── users/                    # User management module
│   ├── dto/                  # User DTOs (create, update, change password)
│   ├── entities/             # User response entities
│   ├── users.controller.ts   # User CRUD endpoints
│   ├── users.service.ts      # User business logic
│   └── users.module.ts       # Module configuration
├── cars/                     # Car management module
│   ├── dto/                  # Car DTOs (create, update, search)
│   ├── entities/             # Car response entities
│   ├── cars.controller.ts    # Car CRUD endpoints
│   ├── cars.service.ts       # Car business logic
│   ├── upload.controller.ts  # Image upload endpoints
│   └── cars.module.ts        # Module configuration
├── storage/                  # File storage module
│   ├── storage.service.ts    # Supabase Storage integration
│   └── storage.module.ts     # Module configuration
├── prisma/                   # Database integration
│   ├── prisma.service.ts     # Prisma client service
│   ├── prisma.module.ts      # Global database module
│   └── prisma-client-exception.filter.ts  # Database error handling
├── app.controller.ts         # Health check endpoints
├── app.service.ts            # Application services
├── app.module.ts             # Root module
└── main.ts                   # Application bootstrap
```

## Architecture Patterns

### 1. Module-Based Architecture

Each feature is organized into modules following NestJS conventions:
- **Controller**: HTTP request handling and routing
- **Service**: Business logic implementation
- **Module**: Dependency injection configuration
- **DTOs**: Request/response validation
- **Entities**: Response serialization

### 2. Authentication & Authorization

#### JWT Authentication Flow
1. User submits credentials via `/auth/login`
2. LocalStrategy validates credentials
3. AuthService generates JWT tokens (15m access + 7d refresh)
4. JWT stored securely and used for subsequent requests
5. JwtStrategy validates tokens on protected routes

#### Security Features
- **Account Lockout**: 5 failed attempts = 15 minute lockout
- **Password Hashing**: bcrypt with 10 salt rounds
- **Token Rotation**: New refresh token on each refresh
- **Rate Limiting**: Configurable request limits
- **Role-Based Access**: Admin-only endpoints protected

### 3. Database Design

#### Entity Relationships
```
User (1) -----> (*) Car
User (1) -----> (*) Inquiry
Car (1) -----> (*) CarImage
Car (1) -----> (*) Inquiry
```

#### Key Features
- **UUID Primary Keys**: Enhanced security and scalability
- **Soft Deletes**: Cars marked as INACTIVE instead of deleted
- **Audit Fields**: createdAt, updatedAt, lastLoginAt
- **Indexes**: Optimized queries for search and filtering
- **Constraints**: VIN uniqueness, email uniqueness

### 4. Error Handling

#### Global Exception Filters
- **PrismaClientExceptionFilter**: Database error mapping
- **ValidationPipe**: Request validation with detailed errors
- **HTTP Exception Handling**: Consistent error responses

#### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 5. Data Validation & Serialization

#### Request Validation
- **DTOs with class-validator**: Input validation
- **Whitelist**: Strip unknown properties
- **Transform**: Type conversion and sanitization

#### Response Serialization
- **Entity Classes**: Consistent response format
- **@Exclude()**: Hide sensitive data (passwords)
- **Nested Relations**: Proper serialization of related data

## Security Implementation

### 1. Authentication Security
- JWT tokens with short expiration (15 minutes)
- Refresh tokens with longer expiration (7 days)
- Account lockout after failed attempts
- Password complexity requirements (8+ characters)

### 2. Authorization Security
- Role-based access control (Admin/User)
- Route-level guards with decorator-based permissions
- API endpoint protection by default (opt-out with @Public)

### 3. Data Security
- Password hashing with bcrypt
- SQL injection prevention via Prisma
- Input validation and sanitization
- CORS configuration for frontend integration

### 4. API Security
- Rate limiting on sensitive endpoints
- Request size limits
- Security headers with Helmet.js
- HTTPS enforcement in production

## Performance Considerations

### 1. Database Optimization
- Strategic indexes on frequently queried fields
- Connection pooling via Prisma
- Query optimization with selective field loading
- Pagination for large result sets

### 2. Caching Strategy
- Server-side validation caching
- JWT token verification optimization
- File upload optimization with streaming

### 3. API Optimization
- Response compression
- Efficient JSON serialization
- Bulk operations for multiple records
- Background processing for heavy tasks

## Testing Strategy

### 1. Unit Testing
- Service layer testing with mocked dependencies
- Controller testing with mocked services
- Utility function testing
- 80%+ code coverage target

### 2. Integration Testing
- End-to-end API testing with real database
- Authentication flow testing
- Database operation testing
- Error scenario coverage

### 3. Testing Tools
- Jest for unit testing
- Supertest for HTTP testing
- Test data factories for consistent test data
- Database cleanup utilities

## Deployment Architecture

### 1. Development Environment
- Local PostgreSQL or Docker
- Hot reload with NestJS dev server
- Environment-based configuration
- Prisma Studio for database inspection

### 2. Production Environment
- Supabase PostgreSQL database
- Environment variable configuration
- SSL/TLS encryption
- Monitoring and logging

### 3. CI/CD Pipeline
- Automated testing on code changes
- Database migration verification
- Security vulnerability scanning
- Performance regression testing

## API Design Principles

### 1. RESTful Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent URL patterns
- Proper HTTP status codes
- Resource-based endpoints

### 2. Response Consistency
- Uniform response structure
- Standardized error format
- Consistent naming conventions
- Comprehensive Swagger documentation

### 3. Versioning Strategy
- URL-based versioning (v1, v2)
- Backward compatibility maintenance
- Deprecation warnings
- Migration guides for breaking changes

## Monitoring & Logging

### 1. Application Monitoring
- Health check endpoints
- Performance metrics
- Error rate tracking
- Uptime monitoring

### 2. Security Monitoring
- Failed authentication attempts
- Account lockout events
- Suspicious activity detection
- Access pattern analysis

### 3. Database Monitoring
- Query performance analysis
- Connection pool utilization
- Storage usage tracking
- Backup verification

## Future Enhancements

### 1. Scalability Improvements
- Redis caching layer
- Database read replicas
- Horizontal scaling preparation
- Microservice decomposition

### 2. Security Enhancements
- OAuth provider integration
- Two-factor authentication
- JWT blacklisting with Redis
- Advanced rate limiting

### 3. Feature Extensions
- Real-time notifications
- Advanced search with Elasticsearch
- Image processing pipeline
- Audit logging system

## Development Guidelines

### 1. Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier code formatting
- Git commit conventions

### 2. Documentation Requirements
- JSDoc for complex functions
- README for each module
- API documentation with examples
- Architecture decision records

### 3. Testing Requirements
- Unit tests for all services
- Integration tests for controllers
- E2E tests for critical flows
- Performance tests for heavy operations

---

This architecture provides a solid foundation for the Style Nation API, ensuring security, scalability, and maintainability while following NestJS best practices.