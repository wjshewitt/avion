# 🚨 QUICK FIX - Auth Not Working

## The Problem
You're not receiving confirmation emails from Supabase, so users can't sign in after signing up.

## The Solution (Takes 2 minutes)

### Option 1: Disable Email Confirmation (Recommended for Development)

1. **Go here:** https://app.supabase.com/project/weivxhdfturzlyaaxwvb/auth/providers

2. **Click:** "Email" provider

3. **Uncheck:** "Enable email confirmations"

4. **Save**

5. **Done!** Try signing up now - should work immediately

### Option 2: Set Up Custom SMTP (For Production)

If you need email confirmations to work:

1. **Sign up for Resend:** https://resend.com (free tier: 3,000 emails/month)

2. **Get SMTP credentials** from Resend dashboard

3. **Go here:** https://app.supabase.com/project/weivxhdfturzlyaaxwvb/settings/auth

4. **Enter SMTP settings:**
   - Host: `smtp.resend.com`
   - Port: `587` or `465`
   - Username: (from Resend)
   - Password: (from Resend)

5. **Save and test** with a real email address

## Test Your Fix

```bash
# Start your dev server
npm run dev

# Go to: http://localhost:3000/signup
# Sign up with a test email
# Should redirect to /flights immediately (Option 1)
# Or get confirmation email (Option 2)
```

## What We Fixed in Your Code

✅ **Sign-out button** - Now in the header user menu  
✅ **Email confirmation handling** - Shows proper messages  
✅ **Duplicate account detection** - Won't let you sign up twice  
✅ **Better error messages** - Tells you what went wrong  

## Need More Help?

Read the full guide: `AUTH_SETUP_GUIDE.md`
