# Password Reset Error Fix

## Problem
You encountered an "unexpected error from server" when submitting a new password during the password reset flow.

## Root Cause
The issue was that the password reset page wasn't properly handling the recovery token that Supabase sends in the email link. When users clicked the reset link, the token needed to be:
1. Extracted from the URL hash (`#access_token=...&type=recovery`)
2. Exchanged for a valid session
3. Used to authorize the password update

The original implementation was trying to use a server action which didn't have access to the recovery session context.

## What Was Fixed

### 1. **Token Verification** (reset-password page)
- Added `useEffect` hook to verify the reset token when page loads
- Checks for recovery token in URL hash
- Validates session exists before showing password form
- Shows helpful loading state while verifying

### 2. **Client-Side Password Update**
- Changed from server action to direct Supabase client call
- Uses the active recovery session to update password
- Signs user out after reset (forces fresh login with new password)
- Better error handling with specific messages

### 3. **Improved UX**
- Shows "Verifying your reset link..." loading state
- Clear error messages if link is invalid/expired
- "Request a new reset link" button if token is invalid
- Success message with countdown before redirect
- Redirect to login with success message

### 4. **Environment Configuration**
- Added `NEXT_PUBLIC_SITE_URL` to .env files
- Ensures password reset emails link to correct URL
- Works in both development and production

## Changes Made

### Files Modified:
1. **`app/(auth)/reset-password/page.tsx`**
   - Added token verification on mount
   - Switched to client-side Supabase call
   - Added loading/error/success states
   - Better error messages with recovery options

2. **`app/actions/auth.ts`**
   - Kept `updatePassword()` for future use
   - Added `requestPasswordReset()` for forgot password flow

3. **`middleware.ts`**
   - Added `/reset-password` to allowed auth routes

4. **`.env.local` & `.env.local.example`**
   - Added `NEXT_PUBLIC_SITE_URL` configuration

## How It Works Now

### The Flow:
```
1. User clicks "Forgot password?" on login
   ↓
2. Enters email on /forgot-password
   ↓
3. Receives email with reset link
   ↓
4. Clicks link → /reset-password#access_token=...&type=recovery
   ↓
5. Page verifies token, extracts and creates session
   ↓
6. Shows password form (only if token valid)
   ↓
7. User enters new password
   ↓
8. Password updated via Supabase client
   ↓
9. User signed out automatically
   ↓
10. Redirected to login with success message
```

### Under the Hood:
- Supabase embeds the recovery token in the URL hash for security
- The browser extracts the token via JavaScript
- Supabase SDK automatically exchanges token for session
- The session is used to authorize the password update
- No server-side code needed (happens entirely client-side)

## Testing the Fix

### 1. Request Password Reset
```bash
# Start your server
npm run dev

# Navigate to
http://localhost:3000/forgot-password

# Enter a real email you can access
# Click "Send Reset Link"
```

### 2. Check Email
- Look in your inbox (and spam folder)
- Open email from Supabase
- You should see a "Reset Password" or similar button/link

### 3. Click Reset Link
- Should redirect to: `http://localhost:3000/reset-password#access_token=...`
- You'll see "Verifying your reset link..." briefly
- Then the password form appears

### 4. Enter New Password
- Type a new password (minimum 6 characters)
- Confirm it in the second field
- Click "Update Password"
- Should see success message
- Auto-redirected to login after 2 seconds

### 5. Sign In With New Password
- Login page should show: "Password updated successfully. Please sign in with your new password."
- Enter your email and NEW password
- Should successfully sign in

## What If It Still Doesn't Work?

### Check These:

1. **Email Not Arriving?**
   ```
   - Check spam/junk folder
   - Verify email in Supabase dashboard: 
     https://app.supabase.com/project/weivxhdfturzlyaaxwvb/auth/users
   - Try with a different email provider
   - Set up custom SMTP (see PASSWORD_RESET_GUIDE.md)
   ```

2. **"Invalid or expired link" Error?**
   ```
   - Links expire after 1 hour (default)
   - Request a new reset (use the blue link in error message)
   - Check that NEXT_PUBLIC_SITE_URL matches your actual URL
   ```

3. **Still Getting Server Error?**
   ```
   - Open browser console (F12)
   - Look for error messages
   - Check Network tab for failed requests
   - Verify Supabase credentials in .env.local
   ```

4. **Password Update Fails?**
   ```
   - Ensure password is at least 6 characters
   - Both password fields must match
   - Try a different password (maybe Supabase has requirements)
   ```

## Technical Details

### Why Client-Side?
Password resets must be handled client-side because:
- Recovery tokens are in URL hash (browser-only)
- Hash params (#...) aren't sent to server
- Supabase SDK handles token exchange automatically
- More secure (token never hits server logs)

### Session Management
After password update:
- Old sessions are invalidated
- User is signed out
- Must sign in again with new password
- This prevents session hijacking

### Security Features
✅ Time-limited tokens (expire after 1 hour)
✅ Single-use tokens (can't be reused)
✅ Email verification required
✅ Secure token exchange
✅ Automatic session cleanup
✅ HTTPS enforced in production

## Production Checklist

Before deploying to production:

- [ ] Set up custom SMTP (Resend recommended)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Test reset flow with production email
- [ ] Customize email template in Supabase
- [ ] Set appropriate token expiry time
- [ ] Test from different email providers
- [ ] Verify HTTPS is working
- [ ] Check email deliverability

## Related Documentation

- `PASSWORD_RESET_GUIDE.md` - Complete setup guide
- `AUTH_SETUP_GUIDE.md` - Auth configuration
- `QUICK_FIX.md` - Email confirmation fix

## Support

If you continue to have issues:
1. Check browser console for errors
2. Review Supabase auth logs
3. Verify all environment variables
4. Test with a fresh browser session
5. Try incognito/private mode

The password reset should now work correctly! 🎉
