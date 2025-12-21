# Supabase Quick Reference

## Common Operations in Your Finance AI App

### Authentication

```typescript
import { useAuth } from '@/context/AuthContext';

// In your component
const { user, session, signIn, signUp, signOut } = useAuth();

// Sign up
await signUp('user@example.com', 'password123');

// Sign in
await signIn('user@example.com', 'password123');

// Sign out
await signOut();

// Check if logged in
if (user) {
  console.log('User email:', user.email);
}
```

### Storage Operations

```typescript
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/storage';

// Upload a file
const result = await uploadFile(file, 'invoices', user.id);
console.log('File URL:', result.url);
console.log('File path:', result.path);

// Delete a file
await deleteFile('user-id/filename.pdf', 'invoices');

// Get public URL
const url = getPublicUrl('user-id/filename.pdf', 'invoices');
```

### Database Operations

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
    total: 99.99
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

### Using Custom Hooks

```typescript
import { useProfile, useInvoices } from '@/hooks/useSupabase';

// Get user profile
const { profile, loading, updateProfile } = useProfile();

// Update profile
await updateProfile({ full_name: 'John Doe' });

// Get user's invoices with auto-refresh
const { invoices, loading, refresh } = useInvoices();

// Manually refresh
await refresh();
```

### Realtime Subscriptions

```typescript
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

// Subscribe to invoice changes
useEffect(() => {
  const channel = supabase
    .channel('invoices-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'invoices',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Change received!', payload);
        // Update your state here
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user.id]);
```

### Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');

  if (error) throw error;

  console.log('Data:', data);
} catch (error) {
  console.error('Error:', error.message);
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive'
  });
}
```

### Profile Management

```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Update user metadata
const { data, error } = await supabase.auth.updateUser({
  data: { full_name: 'John Doe' }
});

// Update email
const { data, error } = await supabase.auth.updateUser({
  email: 'newemail@example.com'
});

// Update password
const { data, error } = await supabase.auth.updateUser({
  password: 'new_password'
});
```

### Query Filters

```typescript
// Equal to
.eq('status', 'paid')

// Not equal to
.neq('status', 'pending')

// Greater than
.gt('amount', 100)

// Less than
.lt('amount', 1000)

// In array
.in('category', ['food', 'transport'])

// Like (pattern matching)
.like('vendor', '%Amazon%')

// Is null
.is('deleted_at', null)

// Order by
.order('created_at', { ascending: false })

// Limit
.limit(10)

// Range (pagination)
.range(0, 9)  // First 10 items
```

### Complex Queries

```typescript
// Join tables
const { data } = await supabase
  .from('expenses')
  .select(`
    *,
    invoice:invoices(*)
  `)
  .eq('user_id', user.id);

// Multiple filters
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', user.id)
  .gte('total', 100)
  .lte('total', 1000)
  .order('date', { ascending: false })
  .limit(20);

// Count
const { count } = await supabase
  .from('invoices')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);
```

### File Operations Advanced

```typescript
// List files in a folder
import { listFiles } from '@/lib/storage';
const files = await listFiles(user.id, 'invoices');

// Download file
import { downloadFile } from '@/lib/storage';
const blob = await downloadFile('path/to/file.pdf', 'invoices');

// Create download link
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'invoice.pdf';
a.click();
```

### Environment Variables Access

```typescript
// Access in your code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if defined
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}
```

## Tips & Best Practices

1. **Always check for errors**: Supabase operations return `{ data, error }`
2. **Use RLS policies**: Never disable Row Level Security in production
3. **Handle loading states**: Show loading indicators during async operations
4. **Validate user input**: Use Zod or similar for validation before DB operations
5. **Clean up subscriptions**: Always unsubscribe from realtime channels
6. **Use transactions**: For operations that need to succeed or fail together
7. **Optimize queries**: Select only the columns you need
8. **Cache when possible**: Use React Query for automatic caching

## Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Reference](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
