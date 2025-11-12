# Auth Setup Guide - Fix Email Confirmation Issues

## ✅ Database Status
- ✅ `user_profiles` table exists
- ✅ Database is accessible
- ⚠️  Trigger needs manual verification (see below)

## 🚀 Quick Fix (5 minutes)

### Step 1: Disable Email Confirmation

1. Open Supabase Dashboard:
   ```
   https://app.supabase.com/project/weivxhdfturzlyaaxwvb/auth/providers
   ```

2. Click on **"Email"** in the Auth Providers list

3. Scroll down and **UNCHECK** the box for:
   ```
   ☐ Enable email confirmations
   ```

4. Click **"Save"** at the bottom

5. Done! Users can now sign up and sign in immediately without email confirmation

### Step 2: Test the Auth Flow

1. Go to your signup page: `http://localhost:3000/signup`
2. Create a new account with a test email
3. You should be redirected to `/flights` immediately
4. Sign out using the user menu in the header
5. Sign in again with the same credentials - should work!

## 🔍 Verify Database Trigger (Optional)

To ensure the user profile trigger is working:

1. Go to SQL Editor:
   ```
   https://app.supabase.com/project/weivxhdfturzlyaaxwvb/editor
   ```

2. Run this query:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

3. If you see a result, the trigger exists ✅
4. If no results, run the fix:
   ```sql
   -- Copy/paste contents from: supabase/fix-user-trigger.sql
   ```

## 📊 Check Existing Users

To see if user profiles are being created:

```sql
SELECT 
  u.email,
  u.created_at as user_created,
  p.display_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;
```

If profiles are missing for some users, the trigger may not have been active when they signed up.

## 🎯 What Changed in Your Code

### 1. Enhanced Signup Flow
- ✅ Detects if email confirmation is required
- ✅ Shows helpful "Check your email" message when needed
- ✅ Provides "Go to Sign In" button after confirmation
- ✅ Checks for duplicate accounts before signup

### 2. Improved Login Errors
- ✅ Detects unconfirmed email errors
- ✅ Shows helpful message: "If you just signed up, check your email first"

### 3. Added Sign-Out Functionality
- ✅ User menu in header with sign-out option
- ✅ Redirects to login after sign-out

## 🔧 Troubleshooting

### Issue: Still getting "Invalid credentials" error
**Solution:** Make sure you disabled email confirmation in Step 1 above, then try signing up with a NEW email address.

### Issue: User profile not being created
**Solution:** 
1. Verify the trigger exists (see "Verify Database Trigger" above)
2. If missing, apply the migration:
   ```bash
   cd supabase
   node apply-migrations.js
   ```
   Or manually run the SQL from `supabase/migrations/20251105212034_create_user_profiles.sql`

### Issue: Want to use email confirmation in production
**Solution:** Set up a custom SMTP provider:
1. Sign up for [Resend](https://resend.com) (recommended - free tier: 3,000 emails/month)
2. Get SMTP credentials
3. Go to: https://app.supabase.com/project/weivxhdfturzlyaaxwvb/settings/auth
4. Scroll to "SMTP Settings" and enter your credentials
5. Re-enable email confirmations
6. Test with a real email address

## ⚠️ Important Note

**Both `flightapp` and `flightchat` use the SAME Supabase project!**

Any changes you make to auth settings will affect both apps. Consider:
- Creating separate Supabase projects for each app
- Or ensuring both apps handle the same auth configuration

## 📝 Next Steps for Production

When you're ready to deploy:

1. ✅ Set up custom SMTP (Resend recommended)
2. ✅ Re-enable email confirmations
3. ✅ Customize email templates in Supabase
4. ✅ Add password reset functionality
5. ✅ Consider adding OAuth providers (Google, GitHub, etc.)

## 🎉 You're All Set!

Your auth flow is now properly configured with:
- ✅ Immediate sign-up (no email confirmation needed for dev)
- ✅ Duplicate account detection
- ✅ Helpful error messages
- ✅ Sign-out functionality
- ✅ Proper user profile creation

Try signing up now and it should work perfectly!
