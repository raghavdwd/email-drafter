# JWT Token Migration - Complete

## Overview
Successfully migrated from session-based authentication to JWT tokens. This is better suited for serverless environments like Vercel where sessions don't persist.

## Changes Made

### Backend Changes

#### 1. OAuth Callback (`server/src/routes/auth.route.js`)
- ✅ Removed session-based authentication (`session: false` in Passport)
- ✅ Generates JWT token after successful OAuth
- ✅ Redirects to frontend with token in URL: `/dashboard?token=<jwt-token>`
- ✅ No longer uses `req.session.save()` or cookie management

#### 2. `/auth/me` Endpoint
- ✅ Now uses `verifyToken` middleware instead of session check
- ✅ Verifies JWT token from Authorization header
- ✅ Returns user data from database

#### 3. Auth Middleware (`server/src/middleware/auth.middleware.js`)
- ✅ Completely rewritten to verify JWT tokens
- ✅ Extracts token from `Authorization: Bearer <token>` header or query parameter
- ✅ Verifies token signature and expiration
- ✅ Fetches user from database and attaches to `req.user`
- ✅ Handles admin tokens separately

#### 4. Admin Login (`server/src/controllers/admin.controller.js`)
- ✅ Returns JWT token instead of creating session
- ✅ Token includes admin role and email

#### 5. Logout Endpoint
- ✅ Simplified - just returns success message
- ✅ Client-side handles token removal

### Frontend Changes

#### 1. AuthContext (`web/src/context/AuthContext.jsx`)
- ✅ Checks for token in localStorage on mount
- ✅ Extracts token from URL parameters (OAuth redirect)
- ✅ Stores token in localStorage
- ✅ Sends token via Authorization header (handled by API interceptor)
- ✅ Removes token from URL after extraction

#### 2. API Configuration (`web/src/utils/api.js`)
- ✅ Removed `withCredentials: true` (no longer using cookies)
- ✅ Token is automatically sent via `Authorization: Bearer <token>` header

#### 3. Admin Login (`web/src/pages/AdminLogin.jsx`)
- ✅ Stores JWT token from response
- ✅ Passes token to `loginAdmin` function

#### 4. Dashboard (`web/src/pages/Dashboard.jsx`)
- ✅ Extracts token from URL if present (OAuth redirect)
- ✅ Stores token in localStorage

## How It Works

### User Login Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Google redirects back to `/auth/google/callback`
4. Backend verifies OAuth, checks user status
5. If approved, generates JWT token
6. Redirects to `/dashboard?token=<jwt-token>`
7. Frontend extracts token from URL, stores in localStorage
8. Token is sent with all subsequent API requests via Authorization header

### Admin Login Flow
1. Admin enters credentials
2. Backend verifies and generates JWT token
3. Frontend stores token in localStorage
4. Token is sent with all subsequent API requests

### Protected Routes
1. Frontend sends token in `Authorization: Bearer <token>` header
2. Backend `verifyToken` middleware verifies token
3. If valid, attaches user to `req.user`
4. Route handler can access `req.user`

## Token Structure

```javascript
{
  id: user.id,        // User ID or 'admin' for admin
  email: user.email,  // User email
  role: 'user' | 'admin',
  iat: timestamp,     // Issued at
  exp: timestamp      // Expires at (7 days)
}
```

## Benefits

1. ✅ **Serverless Compatible** - No session storage needed
2. ✅ **Stateless** - Each request is independent
3. ✅ **Scalable** - Works across multiple servers/instances
4. ✅ **No Cookie Issues** - No cross-domain cookie problems
5. ✅ **Mobile Friendly** - Easy to use with mobile apps

## Security Notes

- Tokens expire after 7 days
- Tokens are signed with `JWT_SECRET`
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Token is sent via HTTPS in production
- Invalid/expired tokens are rejected

## Testing

1. **User Login:**
   - Go to login page
   - Click "Sign in with Google"
   - Should redirect to dashboard with token in URL
   - Token should be stored and user should be logged in

2. **Admin Login:**
   - Go to `/admin`
   - Enter credentials
   - Should receive token and be logged in

3. **Token Verification:**
   - After login, check browser DevTools → Application → Local Storage
   - Should see `token` key with JWT value
   - Check Network tab → Request Headers → Authorization header should contain token

4. **Protected Routes:**
   - Try accessing `/dashboard` without token - should redirect to login
   - With valid token - should access dashboard
   - With expired token - should get 401 error

## Environment Variables

No changes needed - same variables:
- `JWT_SECRET` - Used to sign/verify tokens
- `FRONTEND_URL` - For redirects
- `BACKEND_URL` - For OAuth callback
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials

## Migration Complete ✅

All authentication now uses JWT tokens. Sessions are no longer used for authentication (though Passport still uses them internally for OAuth flow, which is fine).

