# Security Implementation Guide

## Authentication Security

### JWT Token Strategy

#### Access Tokens
- **Lifetime**: 15 minutes (short-lived for security)
- **Storage**: Memory-first, secure cookie fallback
- **Usage**: Automatic attachment to all API requests
- **Validation**: Client-side expiry checking before requests

#### Refresh Tokens
- **Lifetime**: 7 days (longer-lived for usability)
- **Storage**: Secure httpOnly cookies only
- **Usage**: Automatic renewal of access tokens
- **Security**: Cannot be accessed via JavaScript

```typescript
// Token storage security implementation
setAccessToken(token: string): void {
  this.accessToken = token; // Memory storage
  Cookies.set('admin_access_token', token, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Needed for client-side access
    sameSite: 'strict',
    expires: 1/24, // 1 hour
  });
}
```

### Account Protection

#### Brute Force Prevention
- **Failed Attempts**: Maximum 5 attempts before lockout
- **Lockout Duration**: 15 minutes
- **Implementation**: Backend-enforced with frontend messaging
- **Recovery**: Automatic unlock after timeout period

```typescript
// Login attempt handling
if (error.response?.status === 429) {
  const message = error.response?.data?.message || 
    'Account temporarily locked due to too many failed attempts';
  throw new Error(message);
}
```

#### Session Management
- **Automatic Logout**: On token expiry or invalid tokens
- **Secure Cleanup**: All stored data cleared on logout
- **Backend Notification**: Server-side session invalidation
- **Graceful Degradation**: Local cleanup even if server fails

### Role-Based Access Control

#### Admin-Only Verification
Multiple layers of admin role checking:

1. **Login Validation**:
```typescript
if (user.role !== 'ADMIN') {
  this.logout();
  throw new Error('Access denied. Admin privileges required.');
}
```

2. **Middleware Protection**:
```typescript
if (decoded.role !== 'ADMIN') {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}
```

3. **Context Validation**:
```typescript
const isAdmin = user?.role === 'ADMIN';
if (!isAdmin) {
  // Redirect or show unauthorized message
}
```

### Request Security

#### API Communication
- **HTTPS Only**: Enforced in production
- **Bearer Token**: Standard authorization header format
- **Timeout Protection**: 10-second request timeout
- **Error Handling**: Comprehensive error response processing

#### CORS Configuration
```typescript
// API client setup
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
```

## Input Validation & Sanitization

### Login Form Security
- **Email Validation**: Format and length validation
- **Password Requirements**: Enforced on backend
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Token-based request validation

### Data Validation
```typescript
const loginSchema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});
```

## Storage Security

### Client-Side Data
- **Sensitive Data**: Never stored in localStorage
- **User Data**: Non-sensitive profile info only
- **Token Storage**: Memory + secure cookies strategy
- **Cleanup**: Automatic removal on logout/expiry

### Cookie Security Settings
```typescript
const cookieOptions = {
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  httpOnly: false, // Client needs access for access tokens
  sameSite: 'strict', // CSRF protection
  expires: tokenLifetime, // Appropriate expiry
};
```

## Error Handling & Security

### Information Disclosure Prevention
- **Generic Error Messages**: No sensitive information leaked
- **Logging**: Detailed logs server-side, generic client-side
- **Stack Traces**: Hidden in production
- **Rate Limiting**: Backend request throttling

### Error Response Handling
```typescript
try {
  // API operation
} catch (error: any) {
  // Log detailed error server-side
  console.error('Operation failed:', error);
  
  // Show generic message to user
  throw new Error('Operation failed. Please try again.');
}
```

## Production Security Checklist

### Environment Configuration
- [ ] **HTTPS Enforced**: All connections secure
- [ ] **API URLs**: Production endpoints configured
- [ ] **JWT Secrets**: Secure, randomly generated
- [ ] **Cookie Security**: Secure flags enabled
- [ ] **CORS Origins**: Restricted to allowed domains

### Monitoring & Logging
- [ ] **Authentication Events**: Login/logout tracking
- [ ] **Failed Attempts**: Brute force monitoring
- [ ] **Token Usage**: Refresh pattern analysis
- [ ] **Error Tracking**: Comprehensive error logging
- [ ] **Security Alerts**: Automated threat detection

### Code Security
- [ ] **Dependencies**: Regular security updates
- [ ] **Code Review**: Security-focused reviews
- [ ] **Static Analysis**: Automated security scanning
- [ ] **Penetration Testing**: Regular security audits

## Security Incident Response

### Compromise Scenarios

#### Token Compromise
1. **Immediate Action**: Revoke all tokens for affected users
2. **Backend Action**: Invalidate refresh tokens
3. **User Action**: Force re-authentication
4. **Investigation**: Audit access logs for unauthorized activity

#### Account Compromise
1. **Lock Account**: Immediate access suspension
2. **Reset Credentials**: Force password change
3. **Audit Activity**: Review recent actions
4. **Notify Stakeholders**: Security team notification

#### System Compromise
1. **Isolate System**: Prevent further access
2. **Revoke All Tokens**: Force universal re-authentication
3. **Audit Logs**: Comprehensive access review
4. **Patch System**: Address security vulnerabilities

## Security Testing

### Automated Security Tests
- **Authentication Flows**: All scenarios covered
- **Token Validation**: Expiry and format tests
- **Role Verification**: Permission boundary tests
- **Error Handling**: Security error scenarios

### Manual Security Testing
- **Session Management**: Token lifecycle validation
- **Access Control**: Role-based restrictions
- **Input Validation**: Injection attack prevention
- **Browser Security**: XSS and CSRF protection

This security implementation provides defense-in-depth protection while maintaining usability for admin users. Regular security reviews and updates ensure continued protection against evolving threats.