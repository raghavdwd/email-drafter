# Production Deployment Fix Guide

## Issues Fixed

1. ✅ **Session Cookie Configuration** - Updated to properly handle HTTPS and cross-site cookies
2. ✅ **Missing POST Route** - Added POST `/auth/google` endpoint for ID token authentication
3. ✅ **CORS Configuration** - Improved to handle production URLs and multiple origins
4. ✅ **Error Handling** - Enhanced OAuth callback with better error handling and user status checks

## Required Environment Variables

Make sure these are set in your production environment (Vercel, Railway, etc.):

```env
# Backend URL (your production API URL)
BACKEND_URL=https://your-api-domain.com

# Frontend URL (your production frontend URL)
FRONTEND_URL=https://your-frontend-domain.com

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Secret (use a strong random string)
JWT_SECRET=your-strong-random-secret

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-admin-password

# Node Environment
NODE_ENV=production
```

## Google Cloud Console Configuration

### Critical: OAuth Redirect URIs

You **MUST** add your production callback URL to Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://your-api-domain.com/auth/google/callback
   ```
5. Also add your localhost for development (if needed):
   ```
   http://localhost:3000/auth/google/callback
   ```

### Authorized JavaScript Origins

Add both:
- `https://your-frontend-domain.com`
- `https://your-api-domain.com`

## HTTPS Requirement

**IMPORTANT**: The app requires HTTPS in production because:
- Session cookies use `secure: true` (required for HTTPS)
- Cookies use `sameSite: 'none'` (requires `secure: true`)

If your deployment platform doesn't provide HTTPS automatically, you'll need to set up SSL certificates.

## Cookie Domain Configuration

If your frontend and backend are on:
- **Same domain** (e.g., `app.example.com` and `api.example.com`): 
  - The current configuration should work automatically
  - If cookies still don't work, you may need to set the cookie domain to `.example.com` in the session configuration

- **Different domains** (e.g., `myapp.vercel.app` and `myapi.railway.app`):
  - The current configuration should work with `sameSite: 'none'` and `secure: true`
  - Make sure CORS is properly configured (already done in the code)

## Testing the Fix

1. **Test Google Sign-In**:
   - Click "Sign in with Google" on your production site
   - You should be redirected to Google
   - After authorization, you should be redirected back and logged in

2. **Test Admin Login**:
   - Go to `/admin` on your production site
   - Enter admin credentials
   - You should be logged in and redirected to admin dashboard

3. **Check Browser Console**:
   - Open browser DevTools → Network tab
   - Look for the `/auth/google/callback` request
   - Check if cookies are being set (look for `Set-Cookie` header)
   - Check if subsequent requests include cookies (look for `Cookie` header)

## Common Issues & Solutions

### Issue: "Not allowed by CORS"
**Solution**: Make sure `FRONTEND_URL` environment variable matches exactly (including protocol `https://`)

### Issue: Cookies not being set
**Solution**: 
- Verify HTTPS is enabled
- Check browser console for cookie warnings
- Verify `secure: true` and `sameSite: 'none'` are set (they are in production)

### Issue: "redirect_uri_mismatch" error
**Solution**: The callback URL in Google Cloud Console must **exactly match** your `BACKEND_URL/auth/google/callback`

### Issue: Session not persisting
**Solution**:
- Check if `JWT_SECRET` is set in production
- Verify cookies are being sent with requests (check Network tab)
- Make sure `withCredentials: true` is set in frontend API calls (already done)

## Frontend Configuration

Make sure your frontend has the correct API URL:

```env
# In your frontend .env or environment variables
VITE_API_URL=https://your-api-domain.com
```

## Additional Notes

- The app now supports both authentication methods:
  - **OAuth Flow** (GET `/auth/google`) - Session-based, used by the "Sign in with Google" button
  - **ID Token** (POST `/auth/google`) - JWT-based, alternative method

- Session cookies are configured to work across different domains in production
- CORS is configured to allow credentials and handle multiple origins if needed

## Still Having Issues?

If authentication still doesn't work after these fixes:

1. Check your deployment platform's logs for errors
2. Verify all environment variables are set correctly
3. Test the OAuth callback URL directly: `https://your-api-domain.com/auth/google/callback`
4. Check browser console and network tab for detailed error messages
5. Verify Google OAuth credentials are correct and not expired

