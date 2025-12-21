# Finance AI - Smart Financial Assistant

An AI-powered financial assistant with invoice processing, expense tracking, and intelligent chat capabilities. Built with React, TypeScript, and Supabase.

## ✨ Features

- 💬 **AI Chat Assistant** - Get intelligent financial insights and advice
- 📄 **Invoice Processing** - Upload and automatically extract invoice data
- 📊 **Expense Tracking** - Track and categorize your expenses
- 🔐 **Secure Authentication** - Email-based authentication with Supabase
- ☁️ **Cloud Storage** - Secure file storage in the cloud
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support
- 📱 **Mobile Friendly** - Works seamlessly on all devices

## 🛠 Tech Stack

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
- **Zod** - Schema validation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or bun
- A Supabase account (free tier available)

### Installation

1. **Clone the repository:**
```sh
git clone <YOUR_GIT_URL>
cd Fin-ai
```

2. **Install dependencies:**
```sh
npm install
```

3. **Set up Supabase:**

   Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

   Quick steps:
   - Create a Supabase project at https://supabase.com
   - Run the SQL schema from `supabase-schema.sql`
   - Create the `invoices` storage bucket
   - Configure storage policies

4. **Configure environment variables:**
```sh
cp .env.example .env
```

   Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

5. **Start the development server:**
```sh
npm run dev
```

The application will be available at `http://localhost:5173`

## 📂 Project Structure

```
Fin-ai/
├── public/              # Static assets
│   ├── pdf.worker.min.mjs
│   └── robots.txt
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   ├── ui/          # Shadcn UI components
│   │   ├── cards/       # Card components
│   │   ├── chat/        # Chat interface
│   │   └── upload/      # File upload
│   ├── context/         # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── ChatContext.tsx    # Chat state
│   ├── hooks/           # Custom React hooks
│   │   ├── useSupabase.ts     # Supabase data hooks
│   │   └── use-toast.ts       # Toast notifications
│   ├── lib/             # Utility functions
│   │   ├── supabase.ts        # Supabase client config
│   │   ├── storage.ts         # Storage utilities
│   │   ├── api.ts             # API helpers
│   │   └── utils.ts           # General utilities
│   ├── pages/           # Page components
│   │   ├── Auth.tsx           # Login/Signup
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Upload.tsx         # Invoice upload
│   │   ├── Expenses.tsx       # Expense tracking
│   │   └── Chat.tsx           # AI chat
│   ├── App.tsx          # Root component
│   └── main.tsx         # Application entry point
├── .env.example         # Environment variables template
├── supabase-schema.sql  # Database schema
├── SUPABASE_SETUP.md    # Detailed setup guide
└── vite.config.ts       # Vite configuration
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Protected Routes** - Client-side route protection
- **Secure File Storage** - User-specific file isolation
- **JWT Authentication** - Secure token-based auth
- **Environment Variables** - Sensitive data kept out of code

## 🎯 Key Features Explained

### Authentication
- Email/password signup and signin
- Automatic profile creation
- Protected routes for authenticated users
- Session management with Supabase Auth

### File Upload & Storage
- Drag-and-drop file upload
- Secure storage in Supabase Storage
- User-specific folders for isolation
- Public URLs for easy access
- File validation and size limits

### Invoice Processing
- PDF and image upload support
- Automatic data extraction (ready for AI integration)
- Structured data storage in PostgreSQL
- Link invoices to expenses

### Database
- PostgreSQL with full SQL support
- Row Level Security for data isolation
- Automatic timestamps
- Relational data structure

## 🔄 Next Steps & Enhancements

1. **Integrate Real AI Processing**
   - Connect OpenAI, Claude, or custom model
   - Implement OCR for invoice text extraction
   - Add natural language queries

2. **Add More Features**
   - Budget tracking and alerts
   - Expense categories and tags
   - Data export (CSV, PDF)
   - Analytics and reports

3. **Enhance UI/UX**
   - Add profile page
   - Implement notifications
   - Add file preview
   - Enhance mobile experience

4. **Production Deployment**
   - Deploy to Vercel/Netlify
   - Set up CI/CD
   - Configure production Supabase project
   - Add monitoring and analytics

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete setup instructions
- [Database Schema](./supabase-schema.sql) - SQL schema definition

## 🐛 Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Ensure `.env` file exists with correct variables
- Variable names must start with `VITE_`
- Restart dev server after changing env vars

**Authentication not working**
- Check Supabase project is active
- Verify API keys are correct
- Check browser console for errors

**File upload fails**
- Verify `invoices` bucket exists in Supabase Storage
- Check storage policies are configured
- Ensure bucket is set to public

For more help, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

Built with ❤️ using React, TypeScript, and Supabase
