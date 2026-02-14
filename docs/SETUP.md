# Brigada Web CMS - Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Backend API running on `http://localhost:8000` (or configure in `.env.local`)

## Setup Steps

### 1. Install Dependencies

```bash
cd brigadaWebCMS
npm install
```

### 2. Configure Environment

The `.env.local` file is already created. Update if your backend URL is different:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Login

Use your admin credentials from the backend.

## Project Structure Overview

```
src/
├── app/              # Pages (Next.js App Router)
├── components/       # React components
├── store/            # Zustand stores (state management)
├── lib/api/          # API service layer
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
└── middleware.ts     # Route protection
```

## Key Files

- **`src/middleware.ts`** - Protects dashboard routes
- **`src/lib/api/client.ts`** - Axios configuration with interceptors
- **`src/store/auth-store.ts`** - Authentication state
- **`src/hooks/use-auth.ts`** - Authentication hooks
- **`src/components/layout/dashboard-layout.tsx`** - Main layout

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## Default Pages

- `/` - Redirects to `/login`
- `/login` - Login page
- `/dashboard` - Dashboard home (protected)
- `/dashboard/users` - User management (protected)
- `/dashboard/surveys` - Survey management (protected)
- `/dashboard/assignments` - Assignment management (protected)

## Architecture Highlights

### 1. State Management (Zustand)

```typescript
import { useUserStore } from '@/store/user-store'

const { users, isLoading } = useUserStore()
```

### 2. API Services

```typescript
import { userService } from '@/lib/api'

const users = await userService.getUsers({ page: 1, size: 10 })
```

### 3. Authentication

```typescript
import { useAuth } from '@/hooks/use-auth'

const { user, handleLogin, handleLogout } = useAuth()
```

### 4. Route Protection

All routes under `/dashboard/*` are automatically protected by middleware.

## Next Steps

1. **Implement User Management**: Complete CRUD operations in `/dashboard/users`
2. **Survey Builder**: Create survey creation/editing interface
3. **Assignment Interface**: Build assignment creation and tracking
4. **Dashboard Analytics**: Add statistics and charts
5. **Form Validation**: Add Zod schemas for all forms

## Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Troubleshooting

### "Cannot find module '@/...'"

TypeScript path aliases are configured. Restart your editor/IDE.

### "API request failed"

Check:
1. Backend is running
2. `NEXT_PUBLIC_API_URL` is correct
3. CORS is enabled on backend

### "Redirecting to /login in loop"

Check:
1. Cookies are being set after login
2. Middleware is properly configured
3. Token format matches backend

## Support

For issues or questions, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
- [README.md](../README.md) - General information
- Backend API documentation

---

Happy coding! 🚀
