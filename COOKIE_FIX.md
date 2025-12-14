# Cookie/Session Fix for Production

## Problem
After OAuth callback, the session cookie is not being sent with subsequent requests from the frontend. The logs show:
- OAuth callback creates session successfully
- But `/auth/me` requests show `Cookies: undefined`
- Each request gets a new session ID (new session created each time)

## Root Cause
The session cookie is being set during the OAuth redirect, but the browser isn't sending it back with subsequent requests. This is typically a cross-domain cookie issue.

## Solutions Applied

### 1. Explicit Cookie Path
Added explicit `path: '/'` to cookie configuration to ensure cookies are accessible across all routes.

### 2. Enhanced Logging
Added comprehensive logging to track:
- When cookies are being set
- Cookie settings (domain, path, secure, sameSite)
- Incoming cookie headers
- Session state

### 3. Session Save Before Redirect
Ensured session is explicitly saved before redirecting to frontend.

## Required Configuration

### Environment Variables
Make sure these are set correctly:

```env
# Must be HTTPS in production
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Must be set
NODE_ENV=production
JWT_SECRET=your-secret-key
```

### Cookie Requirements
For cross-domain cookies to work:
1. ✅ `secure: true` - Requires HTTPS (set automatically in production)
2. ✅ `sameSite: 'none'` - Allows cross-site cookies (set automatically in production)
3. ✅ `httpOnly: true` - Prevents XSS (already set)
4. ✅ CORS `credentials: true` - Allows sending cookies (already set)
5. ✅ Frontend `withCredentials: true` - Sends cookies with requests (already set)

### Testing
1. Check if cookie is being set:
   - Look for `🍪 Setting cookie:` in server logs during OAuth callback
   - Check browser DevTools → Application → Cookies → Your backend domain

2. Check if cookie is being sent:
   - Look for `Cookie header:` in server logs for `/auth/me` requests
   - Check browser DevTools → Network → `/auth/me` request → Request Headers → Cookie

3. Test endpoint:
   - Visit `https://your-backend-domain.com/auth/test-session` after OAuth
   - Should show session information

## Common Issues

### Issue: Cookie not being set
**Check:**
- Is backend on HTTPS? (Required for `secure: true`)
- Are you seeing `🍪 Setting cookie:` in logs?
- Check browser console for cookie warnings

### Issue: Cookie set but not sent
**Check:**
- Is frontend making requests with `withCredentials: true`? (Already configured)
- Is CORS allowing credentials? (Already configured)
- Are both frontend and backend on HTTPS?
- Check browser DevTools → Network → Request Headers → Cookie

### Issue: Different session IDs on each request
**This means:** Cookie isn't being sent, so server creates new session each time
**Solution:** Follow the checks above

## Debug Steps

1. **After OAuth callback, check server logs:**
   ```
   Session saved - Session ID: [some-id]
   Cookie settings: { domain, path, secure, sameSite, httpOnly }
   🍪 Setting cookie: [cookie-value]
   ```

2. **Check browser after redirect:**
   - Open DevTools → Application → Cookies
   - Look for `connect.sid` cookie on your backend domain
   - Check if it has correct settings (Secure, SameSite=None)

3. **Check `/auth/me` request:**
   - Open DevTools → Network → `/auth/me`
   - Check Request Headers → Cookie header
   - Should contain `connect.sid=[session-id]`

4. **If cookie is missing:**
   - Verify HTTPS is enabled on both frontend and backend
   - Check if browser is blocking third-party cookies
   - Verify CORS and cookie settings match

## Browser Cookie Settings

Some browsers block third-party cookies by default. Users may need to:
- Allow third-party cookies in browser settings
- Or use same root domain for frontend and backend (e.g., `app.example.com` and `api.example.com`)

## Alternative Solution: Same Root Domain

If cross-domain cookies continue to be problematic, consider:
- Using same root domain: `app.yourdomain.com` and `api.yourdomain.com`
- Set cookie domain to `.yourdomain.com` in session config
- This allows cookies to work across subdomains

