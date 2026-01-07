# Finance AI - Smart Financial Assistant

An AI-powered financial assistant with invoice processing, expense tracking, and intelligent chat capabilities. Built with React, TypeScript, and Supabase.

## Features

- **AI Chat Assistant** - Get intelligent financial insights and advice
- **Invoice Processing** - Upload and automatically extract invoice data using AI
- **Expense Tracking** - Track and categorize your expenses with analytics
- **Secure Authentication** - Email-based authentication with Supabase Auth
- **Cloud Storage** - Secure file storage with user-specific isolation
- **Modern UI** - Beautiful, responsive design with dark mode support
- **Mobile Friendly** - Works seamlessly on all devices
- **Row Level Security** - Database-level access control for data protection
- **Realtime Updates** - Live data synchronization across devices

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

### UI & Styling
- **Shadcn UI** - Beautiful, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon set
- **Recharts** - Data visualization

### Backend & Services
- **Supabase** - Authentication, Database, and Storage
  - PostgreSQL Database with Row Level Security
  - Authentication with JWT
  - Cloud Storage for files
  - Realtime subscriptions
- **Zod** - Schema validation

## Architecture & Flows

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Application                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React UI   │  │  Auth Context│  │ Chat Context │          │
│  │  Components  │  │   Provider   │  │   Provider   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│  ┌──────▼──────────────────▼──────────────────▼──────┐          │
│  │              Custom Hooks & Services               │          │
│  │  (useAuth, useSupabase, useProfile, useInvoices)  │          │
│  └──────┬──────────────────┬──────────────────┬──────┘          │
│         │                  │                  │                  │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌─────▼──────┐          │
│  │   Supabase  │    │   Storage   │    │  AI APIs   │          │
│  │   Client    │    │   Utils     │    │  (Gemini,  │          │
│  │             │    │             │    │   Groq)    │          │
│  └──────┬──────┘    └──────┬──────┘    └─────┬──────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     Auth     │  │   Database   │  │   Storage    │          │
│  │  (JWT/Email) │  │ (PostgreSQL) │  │   (Files)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐          │
│  │           Row Level Security Policies              │          │
│  │  - User-specific data isolation                    │          │
│  │  - Automatic user_id filtering                     │          │
│  └────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User Action                Client                    Supabase
    │                         │                          │
    │   Enter Credentials     │                          │
    ├────────────────────────►│                          │
    │                         │  signUp/signIn Request   │
    │                         ├─────────────────────────►│
    │                         │                          │
    │                         │  ◄── Validate & Hash ───┤
    │                         │      Password            │
    │                         │                          │
    │                         │  ◄── Generate JWT ──────┤
    │                         │      Session Token       │
    │                         │                          │
    │                         │  ◄── Create Profile ────┤
    │                         │      (if signup)         │
    │                         │                          │
    │  ◄─── Session Data ─────┤                          │
    │   (user, token, etc)    │                          │
    │                         │                          │
    │   Redirect to App       │                          │
    ├────────────────────────►│                          │
    │                         │                          │
    │  All API Requests       │  Include JWT Token       │
    │  (authenticated)        ├─────────────────────────►│
    │                         │                          │
    │                         │  ◄── Verify Token ───────┤
    │                         │  ◄── Apply RLS ──────────┤
    │                         │  ◄── Return Data ────────┤
    │                         │      (user-specific)     │
```

### File Upload Flow

```
User                     Client                  Storage              Database
 │                         │                        │                    │
 │  Select File            │                        │                    │
 ├────────────────────────►│                        │                    │
 │                         │                        │                    │
 │                         │  Validate File         │                    │
 │                         │  (type, size)          │                    │
 │                         │                        │                    │
 │                         │  Generate Path         │                    │
 │                         │  (userId/filename)     │                    │
 │                         │                        │                    │
 │                         │  Upload File           │                    │
 │                         ├───────────────────────►│                    │
 │                         │                        │                    │
 │                         │                        │  Check RLS         │
 │                         │                        │  Policy            │
 │                         │                        │                    │
 │                         │  ◄─── File URL ────────┤                    │
 │                         │       (public URL)     │                    │
 │                         │                        │                    │
 │                         │  Save Metadata         │                    │
 │                         │  (file_url, name, etc) │                    │
 │                         ├────────────────────────┼───────────────────►│
 │                         │                        │                    │
 │                         │                        │  Insert Record     │
 │                         │                        │  (with RLS)        │
 │                         │                        │                    │
 │  ◄─── Success ──────────┤◄───────────────────────┼────────────────────┤
 │   (show confirmation)   │     Record ID          │                    │
```

### Invoice Processing Flow

```
┌──────────────┐
│ User Uploads │
│  PDF/Image   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  File Validation     │
│  - Type check        │
│  - Size limit        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Upload to Storage   │
│  - User folder       │
│  - Generate URL      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  AI Extraction       │
│  - Parse document    │
│  - Extract vendor    │
│  - Extract amounts   │
│  - Extract dates     │
│  - Extract items     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Validate Data       │
│  - Check required    │
│  - Format dates      │
│  - Parse numbers     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Save to Database    │
│  - Invoice table     │
│  - User association  │
│  - Extracted data    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Display Invoice     │
│  - Show details      │
│  - Allow editing     │
│  - Link expenses     │
└──────────────────────┘
```

### Database Query Flow with RLS

```
Client Request          Supabase                 Database
    │                      │                         │
    │  Query Invoices      │                         │
    ├─────────────────────►│                         │
    │  .from('invoices')   │                         │
    │  .select('*')        │                         │
    │                      │                         │
    │                      │  Extract JWT            │
    │                      │  Get user_id            │
    │                      │                         │
    │                      │  Build Query            │
    │                      ├────────────────────────►│
    │                      │  SELECT * FROM invoices │
    │                      │                         │
    │                      │                         │  Apply RLS
    │                      │                         │  WHERE user_id = 
    │                      │                         │  auth.uid()
    │                      │                         │
    │                      │  ◄─── Filtered Data ────┤
    │                      │       (user's only)     │
    │                      │                         │
    │  ◄─── JSON Data ─────┤                         │
    │   (user's invoices)  │                         │
```

### AI Chat Flow

```
User Input              Client                  AI Service          Database
    │                      │                         │                 │
    │  Type Message        │                         │                 │
    ├─────────────────────►│                         │                 │
    │                      │                         │                 │
    │                      │  Fetch Context          │                 │
    │                      │  (user data)            │                 │
    │                      ├─────────────────────────┼────────────────►│
    │                      │                         │                 │
    │                      │  ◄─── User Invoices ────┼─────────────────┤
    │                      │  ◄─── User Expenses ────┼─────────────────┤
    │                      │                         │                 │
    │                      │  Build Prompt           │                 │
    │                      │  (message + context)    │                 │
    │                      │                         │                 │
    │                      │  Send to AI             │                 │
    │                      ├────────────────────────►│                 │
    │                      │                         │                 │
    │                      │                         │  Process Query  │
    │                      │                         │  Generate Response
    │                      │                         │                 │
    │                      │  ◄─── AI Response ──────┤                 │
    │                      │                         │                 │
    │  ◄─── Display ───────┤                         │                 │
    │   (formatted answer) │                         │                 │
```

### Data Synchronization Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Realtime Updates                      │
│                                                          │
│  Database Change    →    Supabase    →    Client        │
│  (INSERT/UPDATE)         Realtime         Subscription  │
│                          Broadcast                       │
│                                                          │
│  Example:                                                │
│  1. User A uploads invoice                               │
│  2. Database INSERT triggered                            │
│  3. Realtime broadcasts change                           │
│  4. User A's UI auto-updates                             │
│  5. Other tabs/devices auto-update                       │
└─────────────────────────────────────────────────────────┘
```

### Security Layer Flow

```
Every Request
     │
     ▼
┌─────────────────┐
│  JWT Validation │
│  - Check token  │
│  - Verify sign  │
│  - Check expiry │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RLS Policies   │
│  - User check   │
│  - Data filter  │
│  - Action auth  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Query Execute  │
│  - Safe data    │
│  - User-scoped  │
└─────────────────┘
```

## Project Structure

```
Fin-ai/
├── public/              # Static assets
│   ├── pdf.worker.min.mjs
│   └── robots.txt
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (AppLayout, TopNavBar, BottomNav)
│   │   ├── ui/          # Shadcn UI components
│   │   ├── cards/       # Card components (Analytics, Expense, Invoice)
│   │   ├── chat/        # Chat interface components
│   │   ├── upload/      # File upload components
│   │   └── ProtectedRoute.tsx  # Route protection
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state management
│   │   └── ChatContext.tsx    # Chat state management
│   ├── hooks/           # Custom React hooks
│   │   ├── useSupabase.ts     # Supabase data hooks
│   │   ├── use-toast.ts       # Toast notifications
│   │   └── use-mobile.tsx     # Mobile detection
│   ├── lib/             # Utility functions and configs
│   │   ├── supabase.ts        # Supabase client configuration
│   │   ├── storage.ts         # Storage utilities
│   │   ├── api.ts             # API helpers
│   │   ├── gemini.ts          # Google Gemini AI integration
│   │   ├── groq.ts            # Groq AI integration
│   │   ├── openrouter.ts      # OpenRouter integration
│   │   ├── pdfParser.ts       # PDF parsing utilities
│   │   └── utils.ts           # General utilities
│   ├── pages/           # Page components
│   │   ├── Auth.tsx           # Login/Signup page
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Upload.tsx         # Invoice upload page
│   │   ├── Invoices.tsx       # Invoices list
│   │   ├── InvoiceDetail.tsx  # Invoice details
│   │   ├── Expenses.tsx       # Expense tracking
│   │   ├── ExpenseDetail.tsx  # Expense details
│   │   ├── Chat.tsx           # AI chat interface
│   │   ├── Market.tsx         # Market insights
│   │   └── Landing.tsx        # Landing page
│   ├── App.tsx          # Root component with routing
│   └── main.tsx         # Application entry point
├── android/             # Android mobile app (Capacitor)
├── .env.example         # Environment variables template
├── supabase-schema.sql  # Complete database schema
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **bun**
- A **Supabase account** (free tier available at https://supabase.com)

### Installation

#### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd Fin-ai
```

#### 2. Install Dependencies

```bash
npm install
# or
bun install
```

#### 3. Set Up Supabase

##### Create a Supabase Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in your project details:
   - **Name**: Finance AI (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest to your users
4. Wait for the project to initialize (~2 minutes)

##### Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

#### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: 
- Never commit `.env` to version control!
- Ensure `.env` is in your `.gitignore`
- Use different Supabase projects for development and production

#### 5. Set Up the Database

1. Go to your Supabase dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** to execute the schema

This creates:
- `profiles` table for user data
- `invoices` table for invoice storage
- `expenses` table for expense tracking
- Row Level Security (RLS) policies
- Automatic triggers for timestamps
- Database functions

#### 6. Set Up Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Click **"Create a new bucket"**
3. Create a bucket named **`invoices`**:
   - **Name**: `invoices`
   - **Public bucket**: Check this (for easy file access)
   - Click **"Create bucket"**

##### Configure Storage Policies

1. Click on the **`invoices`** bucket
2. Go to **Policies** tab
3. Click **"New Policy"** and add the following policies:

**Insert Policy** (Allow users to upload their own files):
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Select Policy** (Allow users to view their own files):
```sql
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Delete Policy** (Allow users to delete their own files):
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invoices' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 7. Configure Authentication (Optional)

##### Disable Email Confirmation (Development Only)

For faster testing during development:
1. Go to **Authentication** → **Settings** → **Auth Providers**
2. Scroll to **"User Signups"**
3. Uncheck **"Enable email confirmations"**

**Warning**: Re-enable email confirmations in production!

##### Customize Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and password reset emails
3. Add your branding and messaging

#### 8. Start the Development Server

```bash
npm run dev
# or
bun dev
```

The application will be available at **http://localhost:5173**

#### 9. Test the Integration

1. Navigate to **http://localhost:5173/auth**
2. Create a new account
3. Sign in with your credentials
4. Navigate to **/upload** and try uploading a file
5. Check your Supabase dashboard:
   - **Authentication** → **Users** (should show your user)
   - **Storage** → **invoices** bucket (should have your file)
   - **Table Editor** → **invoices** table (should have the record)

## Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run build:dev     # Build in development mode
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

## Authentication Features

### Implemented Features
- Email/password signup with automatic profile creation
- Email/password signin with session management
- Password reset via email
- Protected routes (auto-redirect if not authenticated)
- Session persistence across page reloads
- User profile dropdown with sign out
- Loading states during authentication
- Automatic redirect after login/logout

### Using Authentication in Your Code

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, session, signIn, signUp, signOut, loading } = useAuth();

  // Sign up a new user
  const handleSignUp = async () => {
    await signUp('user@example.com', 'password123');
  };

  // Sign in existing user
  const handleSignIn = async () => {
    await signIn('user@example.com', 'password123');
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut();
  };

  // Check if user is logged in
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

## Storage & File Upload

### Features
- Secure file upload to Supabase Storage
- User-specific folders (isolated by user ID)
- Public URL generation for file access
- File deletion and management
- File listing and download
- Support for PDFs, images, and documents

### Using Storage in Your Code

```typescript
import { uploadFile, deleteFile, getPublicUrl, listFiles, downloadFile } from '@/lib/storage';

// Upload a file
const handleUpload = async (file: File) => {
  const result = await uploadFile(file, 'invoices', user.id);
  console.log('File URL:', result.url);
  console.log('File path:', result.path);
};

// Delete a file
const handleDelete = async (filePath: string) => {
  await deleteFile(filePath, 'invoices');
};

// Get public URL
const url = getPublicUrl('user-id/filename.pdf', 'invoices');

// List all user files
const files = await listFiles(user.id, 'invoices');

// Download file
const blob = await downloadFile('user-id/file.pdf', 'invoices');
```

## Database Operations

### Using Custom Hooks

```typescript
import { useProfile, useInvoices } from '@/hooks/useSupabase';

// Get and update user profile
const { profile, loading, updateProfile } = useProfile();

await updateProfile({ full_name: 'John Doe' });

// Get user's invoices with auto-refresh
const { invoices, loading, refresh } = useInvoices();

// Manually refresh
await refresh();
```

### Direct Database Queries

```typescript
import { supabase } from '@/lib/supabase';

// Insert invoice
const { data, error } = await supabase
  .from('invoices')
  .insert({
    user_id: user.id,
    file_url: 'https://...',
    file_name: 'invoice.pdf',
    vendor: 'Amazon',
    total: 99.99,
    invoice_date: '2024-01-15'
  });

// Fetch user's invoices
const { data, error } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// Update invoice
const { data, error } = await supabase
  .from('invoices')
  .update({ vendor: 'Amazon Inc.' })
  .eq('id', invoiceId);

// Delete invoice
const { data, error } = await supabase
  .from('invoices')
  .delete()
  .eq('id', invoiceId);
```

### Query Filters & Operations

```typescript
// Equal to
.eq('status', 'paid')

// Not equal to
.neq('status', 'pending')

// Greater than / Less than
.gt('amount', 100)
.lt('amount', 1000)

// In array
.in('category', ['food', 'transport'])

// Pattern matching
.like('vendor', '%Amazon%')

// Is null
.is('deleted_at', null)

// Order by
.order('created_at', { ascending: false })

// Limit results
.limit(10)

// Pagination
.range(0, 9)  // First 10 items

// Complex queries with joins
const { data } = await supabase
  .from('expenses')
  .select(`
    *,
    invoice:invoices(*)
  `)
  .eq('user_id', user.id)
  .gte('amount', 100)
  .lte('amount', 1000);
```

### Realtime Subscriptions

```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

useEffect(() => {
  const channel = supabase
    .channel('invoices-changes')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE, or *
        schema: 'public',
        table: 'invoices',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Change received!', payload);
        // Update your UI state here
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user.id]);
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only read their own data
- Users can only insert data linked to their user ID
- Users can only update/delete their own records
- Database-level security (cannot be bypassed from client)

### Storage Security
- User-specific folders (files organized by user ID)
- Storage policies restrict access to own files only
- File type and size validation
- Public URLs are scoped to user access

### Authentication Security
- JWT-based authentication
- Secure session management
- Password hashing (handled by Supabase)
- Environment variables for sensitive data
- No service role keys in client code

## Key Features Explained

### Invoice Processing
1. **Upload**: Drag and drop or select PDF/image files
2. **Storage**: Files securely stored in Supabase Storage
3. **AI Extraction**: Automatically extract vendor, date, amount, items
4. **Database**: Structured data saved to PostgreSQL
5. **Management**: View, edit, delete invoices

### Expense Tracking
- Link expenses to invoices
- Categorize expenses (food, transport, utilities, etc.)
- Track expense status (pending, paid, recurring)
- View expense analytics and charts
- Filter and search expenses

### AI Chat Assistant
- Natural language financial queries
- Invoice insights and summaries
- Expense analysis and recommendations
- Integration with multiple AI providers (Gemini, Groq, OpenRouter)

## Database Schema

### Tables

#### `profiles`
```sql
- id (uuid, FK to auth.users)
- full_name (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `invoices`
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- file_url (text)
- file_name (text)
- file_type (text)
- vendor (text)
- invoice_number (text)
- invoice_date (date)
- due_date (date)
- total (decimal)
- subtotal (decimal)
- tax (decimal)
- currency (text)
- status (text)
- extracted_data (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `expenses`
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- invoice_id (uuid, FK to invoices, optional)
- title (text)
- amount (decimal)
- category (text)
- date (date)
- status (text)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## Troubleshooting

### Common Issues & Solutions

#### "Missing Supabase environment variables"
- Ensure `.env` file exists in project root
- Variable names must start with `VITE_`
- Restart dev server after adding/changing env vars
- Check for typos in variable names

#### Authentication Not Working
- Verify Supabase project is active (not paused)
- Check API keys are correct in `.env`
- Clear browser cache and cookies
- Check browser console for error messages
- Verify email confirmation settings

#### File Upload Fails
- Verify `invoices` bucket exists in Storage
- Check bucket is set to public
- Ensure storage policies are configured correctly
- Check file size limits (default 50MB)
- Verify file type is allowed

#### "Row Level Security policy violation"
- Make sure you ran the complete SQL schema
- Verify RLS policies exist on all tables
- Check user is authenticated before queries
- Review Supabase logs for specific policy errors

#### Database Query Errors
- Check table and column names match schema
- Verify user_id is being set correctly
- Review query syntax in Supabase logs
- Test queries in Supabase SQL Editor

### Getting Help

1. **Check Browser Console**: Look for JavaScript errors
2. **Supabase Logs**: Go to Supabase Dashboard → Logs
3. **Network Tab**: Check API requests/responses
4. **Database Logs**: View query logs in Supabase
5. **Documentation**: Review Supabase docs at https://supabase.com/docs

## Next Steps & Enhancements

### Immediate Improvements
1. **Integrate Real AI Processing**
   - Replace mock data in invoice extraction
   - Connect OpenAI, Claude, or Gemini API
   - Implement OCR for scanned documents
   - Add confidence scores for extracted data

2. **Complete Expense Management**
   - Add expense creation/editing UI
   - Implement expense categories management
   - Create expense analytics dashboard
   - Add budget tracking and alerts

3. **Profile Management**
   - Create profile page for users
   - Allow avatar uploads
   - Add user preferences
   - Implement account settings

### Feature Additions
4. **Data Export**
   - Export invoices to CSV
   - Generate PDF reports
   - Create expense summaries
   - Schedule automated reports

5. **Advanced Analytics**
   - Spending trends over time
   - Category breakdown charts
   - Vendor analysis
   - Tax preparation reports

6. **Social Authentication**
   - Google Sign-In
   - GitHub OAuth
   - Apple Sign-In
   - Microsoft Azure AD

7. **Mobile App**
   - Build with Capacitor (Android folder ready)
   - Add mobile-specific features
   - Implement push notifications
   - Offline support

### Production Readiness
8. **Deployment**
   - Deploy to Vercel/Netlify
   - Set up CI/CD pipeline
   - Create production Supabase project
   - Configure custom domain

9. **Monitoring & Analytics**
   - Add error tracking (Sentry)
   - Implement usage analytics
   - Set up performance monitoring
   - Create admin dashboard

10. **Security Hardening**
    - Enable email confirmations
    - Add 2FA support
    - Implement rate limiting
    - Set up security headers
    - Regular security audits

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Vite](https://vitejs.dev)
- UI components from [Shadcn UI](https://ui.shadcn.com)
- Backend powered by [Supabase](https://supabase.com)
- Icons by [Lucide](https://lucide.dev)

---
