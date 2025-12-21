# Supabase Integration Setup Guide

This guide will help you set up Supabase for authentication and storage in your Finance AI application.

## 📋 Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## 🚀 Setup Steps

### 1. Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Finance AI (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest to your users
4. Wait for the project to be created (~2 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 3. Configure Environment Variables

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **⚠️ Important**: Never commit `.env` to version control!

### 4. Set Up Database Schema

1. Go to your Supabase dashboard → **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql` and paste it
4. Click "Run" to execute the schema

This will create:
- ✅ `profiles` table for user data
- ✅ `invoices` table for invoice storage
- ✅ `expenses` table for expense tracking
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers for timestamps

### 5. Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Create a bucket named `invoices`:
   - **Name**: invoices
   - **Public bucket**: ✅ Check this (for easy file access)
   - Click "Create bucket"

#### Configure Storage Policies

1. Click on the `invoices` bucket
2. Go to **Policies**
3. Add the following policies:

**Insert Policy:**
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Select Policy:**
```sql
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Delete Policy:**
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invoices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 6. Configure Email Authentication

1. Go to **Authentication** → **Settings** → **Auth Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and reset password emails

#### Disable Email Confirmation (Optional - for development only)

For testing, you can disable email confirmation:
1. Go to **Authentication** → **Settings**
2. Scroll to "User Signups"
3. Uncheck "Enable email confirmations"

**⚠️ Warning**: Re-enable this in production!

### 7. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/auth` and try:
   - ✅ Creating a new account
   - ✅ Signing in
   - ✅ Signing out

3. Navigate to `/upload` and test:
   - ✅ Uploading a file
   - ✅ Viewing uploaded files

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` to git
- ✅ Add `.env` to `.gitignore`
- ✅ Use different Supabase projects for development and production

### Row Level Security (RLS)
- ✅ Always keep RLS enabled on all tables
- ✅ Test your policies thoroughly
- ✅ Never use service_role key in client-side code

### Storage Security
- ✅ Validate file types and sizes on upload
- ✅ Use user-specific folders (implemented in storage.ts)
- ✅ Set appropriate storage limits

## 📊 Database Structure

### Tables Created

#### `profiles`
- Automatically created when a user signs up
- Stores user metadata (name, avatar, etc.)
- One-to-one relationship with `auth.users`

#### `invoices`
- Stores uploaded invoice files and extracted data
- Links to uploaded files in Storage
- Contains AI-extracted invoice information

#### `expenses`
- Optional table for expense tracking
- Can be linked to invoices
- Supports categorization and status tracking

## 🎨 Features Implemented

### Authentication
- ✅ Email/Password signup
- ✅ Email/Password signin
- ✅ Password reset
- ✅ Protected routes
- ✅ Auth state management
- ✅ Automatic redirect on login/logout

### Storage
- ✅ File upload to Supabase Storage
- ✅ User-specific folders
- ✅ Public URL generation
- ✅ File deletion
- ✅ File listing
- ✅ Progress tracking (ready for implementation)

## 🔄 Next Steps

1. **Add Social Authentication** (Optional):
   - Google, GitHub, etc.
   - Go to Authentication → Providers

2. **Implement Real AI Extraction**:
   - Replace mock data in `Upload.tsx`
   - Integrate with OpenAI, Claude, or custom model
   - Use the uploaded file URL from Storage

3. **Add Profile Management**:
   - Create a profile page
   - Allow users to update their info
   - Upload avatar to Storage

4. **Add Expense Management**:
   - Create/Read/Update/Delete expenses
   - Link expenses to invoices
   - Add analytics and charts

5. **Set Up Production**:
   - Create a separate Supabase project for production
   - Enable email confirmations
   - Set up proper email templates
   - Configure custom SMTP (optional)

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists
- Check that variable names start with `VITE_`
- Restart your dev server after adding env vars

### "Failed to fetch"
- Check your Supabase URL and key
- Verify your project is not paused
- Check network connectivity

### "Row Level Security policy violation"
- Make sure you ran the SQL schema
- Verify RLS policies are created
- Check that user is authenticated

### Storage upload fails
- Verify the `invoices` bucket exists
- Check storage policies are configured
- Ensure bucket is set to public

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase dashboard logs
3. Verify your environment variables
4. Check that all SQL migrations ran successfully

---

Happy coding! 🚀
