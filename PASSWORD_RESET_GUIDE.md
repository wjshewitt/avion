# Password Reset Guide

## Overview

Complete password reset functionality has been added to your FlightChat application. Users can now request password resets via email and securely update their passwords.

## Features Added

### 1. **Password Reset Request Page** (`/forgot-password`)
- Clean, user-friendly interface
- Email validation
- Success/error feedback
- "Try again" option if email doesn't arrive

### 2. **Password Update Page** (`/reset-password`)
- Secure password update form
- Password confirmation validation
- Minimum 6 character requirement
- Auto-redirect to login after success

### 3. **Server Actions**
- `requestPasswordReset()` - Sends reset email via Supabase
- `updatePassword()` - Updates user password securely

### 4. **Updated Login Form**
- "Forgot your password?" link now functional
- Links to `/forgot-password` page

## User Flow

```
1. User clicks "Forgot your password?" on login page
   ↓
2. User enters email on /forgot-password
   ↓
3. Email sent with reset link (if email exists)
   ↓
4. User clicks link in email → redirected to /reset-password
   ↓
5. User enters new password (twice for confirmation)
   ↓
6. Password updated → redirected to /login
   ↓
7. User signs in with new password
```

## Setup Requirements

### Important: Email Configuration

Password reset requires email to be working. You have two options:

#### Option 1: Disable Email Confirmation (Development)
If you've already disabled email confirmations per the `QUICK_FIX.md`, password reset emails should work with Supabase's default SMTP.

**Note:** Supabase's default SMTP can be unreliable. Emails may:
- Go to spam/junk folders
- Take several minutes to arrive
- Not arrive at all (rate limited)

#### Option 2: Set Up Custom SMTP (Recommended for Production)

1. **Sign up for Resend** (recommended):
   - Go to https://resend.com
   - Free tier: 3,000 emails/month
   - Get SMTP credentials

2. **Configure Supabase SMTP**:
   - Go to: https://app.supabase.com/project/weivxhdfturzlyaaxwvb/settings/auth
   - Scroll to "SMTP Settings"
   - Enter your SMTP credentials:
     ```
     Host: smtp.resend.com
     Port: 587 (or 465 for SSL)
     Username: [from Resend]
     Password: [from Resend]
     ```
   - Save changes

3. **Test the flow**:
   - Request a password reset
   - Check that email arrives quickly
   - Click reset link and update password

### Environment Variable (Optional)

Add to your `.env.local` if deploying to production:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This ensures password reset links point to your production URL instead of `localhost:3000`.

## Testing the Password Reset Flow

### Development Testing

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Test reset request**:
   - Go to: http://localhost:3000/forgot-password
   - Enter a test email (use a real email you can access)
   - Click "Send Reset Link"
   - Should see success message

3. **Check your email**:
   - Look in inbox (and spam/junk)
   - Find email from Supabase
   - Click the reset link

4. **Update password**:
   - Should be redirected to http://localhost:3000/reset-password
   - Enter new password (twice)
   - Click "Update Password"
   - Should see success and auto-redirect to login

5. **Test new password**:
   - Sign in with your email and new password
   - Should work!

## Security Features

✅ **Secure tokens** - Supabase generates time-limited, single-use tokens  
✅ **Email verification** - Only users with access to the email can reset  
✅ **Password validation** - Minimum 6 characters required  
✅ **Confirmation matching** - Must enter password twice  
✅ **Error handling** - Clear messages for all failure scenarios  
✅ **Auto-expiry** - Reset links expire after a set time (configured in Supabase)  

## Customization

### Change Password Requirements

Edit `/app/actions/auth.ts`:

```typescript
if (password.length < 8) {  // Change minimum length
  return {
    success: false,
    error: "Password must be at least 8 characters",
  };
}

// Add complexity requirements
if (!/[A-Z]/.test(password)) {
  return {
    success: false,
    error: "Password must contain at least one uppercase letter",
  };
}
```

### Customize Email Template

1. Go to Supabase Dashboard:
   ```
   https://app.supabase.com/project/weivxhdfturzlyaaxwvb/auth/templates
   ```

2. Select "Reset Password" template

3. Customize the HTML/text

4. Use variables like:
   - `{{ .ConfirmationURL }}` - The reset link
   - `{{ .SiteURL }}` - Your site URL
   - `{{ .Email }}` - User's email

### Change Link Expiry Time

1. Go to: https://app.supabase.com/project/weivxhdfturzlyaaxwvb/auth/url-configuration

2. Find "JWT expiry limit"

3. Default is usually 3600 seconds (1 hour)

4. Adjust as needed for your security requirements

## Troubleshooting

### Email Not Arriving

**Check spam/junk folders first!**

Then try:

1. **Verify SMTP configuration**:
   - Go to Supabase settings → Auth
   - Check SMTP settings are correct
   - Test with Resend's test mode

2. **Check Supabase logs**:
   - Go to: https://app.supabase.com/project/weivxhdfturzlyaaxwvb/logs/edge-logs
   - Look for email-related errors

3. **Rate limiting**:
   - Supabase limits password reset emails
   - Wait a few minutes between requests
   - Check user's email in Supabase auth dashboard

### Reset Link Not Working

1. **Check link expiry**:
   - Links expire after set time (default 1 hour)
   - Request a new reset if expired

2. **Verify redirect URL**:
   - Check `NEXT_PUBLIC_SITE_URL` is correct
   - Should match where app is running

3. **Check browser console**:
   - Look for JavaScript errors
   - Check network tab for API errors

### Password Update Fails

1. **Check password requirements**:
   - Minimum 6 characters
   - Passwords must match

2. **Check Supabase session**:
   - User must have valid reset token
   - Token might have expired (request new reset)

3. **Check browser console** for detailed error messages

## Integration with Existing Auth

The password reset integrates seamlessly with your existing auth:

- ✅ Works with email confirmation enabled/disabled
- ✅ Uses same Supabase auth instance
- ✅ Follows same middleware patterns
- ✅ Consistent UI/UX with login/signup
- ✅ Same error handling patterns

## Next Steps

Consider adding:

1. **Password strength indicator** - Visual feedback on password quality
2. **Password history** - Prevent reusing recent passwords
3. **2FA/MFA** - Additional security layer
4. **Account recovery questions** - Alternative to email-only reset
5. **Activity notifications** - Email when password is changed

## Files Modified/Created

```
Modified:
- app/actions/auth.ts (added reset functions)
- components/auth/LoginForm.tsx (updated forgot password link)
- middleware.ts (allow reset routes)

Created:
- app/(auth)/forgot-password/page.tsx
- app/(auth)/reset-password/page.tsx
- PASSWORD_RESET_GUIDE.md (this file)
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase auth logs
3. Verify email configuration
4. Test with different email providers

Your password reset is now fully functional! 🎉
