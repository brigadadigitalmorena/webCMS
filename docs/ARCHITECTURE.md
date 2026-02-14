# Brigada Web CMS - Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [State Management](#state-management)
5. [API Service Layer](#api-service-layer)
6. [Authentication & Authorization](#authentication--authorization)
7. [Route Protection](#route-protection)
8. [Layout System](#layout-system)
9. [Component Architecture](#component-architecture)
10. [Scalability Considerations](#scalability-considerations)
11. [Development Guidelines](#development-guidelines)

---

## Overview

The Brigada Web CMS is an administrative control panel built with Next.js 14 (App Router) for managing the complete survey system. This admin panel is the **only interface** for administrative operations - the mobile app is strictly operational.

### Core Principles

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data
- **Type Safety**: Full TypeScript coverage for reliability
- **Scalability**: Modular architecture ready for feature expansion
- **DRY**: Reusable components and utilities
- **Performance**: Optimized for fast load times and smooth UX

---

## Technology Stack

### Core Technologies

- **Next.js 14** (App Router) - React framework with server/client components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management (vs Redux complexity)
- **Axios** - HTTP client with interceptors
- **React Hook Form + Zod** - Form validation

### Why These Choices?

- **Next.js App Router**: Superior performance, better SEO, simpler data fetching
- **Zustand over Redux**: Less boilerplate, better Developer Experience, sufficient for our needs
- **Axios over Fetch**: Built-in interceptors, better error handling, automatic transforms
- **Tailwind**: Rapid development, consistent design, smaller bundle size

---

## Project Structure

```
brigadaWebCMS/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (redirects to /login)
│   │   ├── globals.css               # Global styles
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   └── dashboard/                # Protected routes
│   │       ├── layout.tsx            # Dashboard layout wrapper
│   │       ├── page.tsx              # Dashboard home
│   │       ├── users/                # User management
│   │       ├── surveys/              # Survey management
│   │       └── assignments/          # Assignment management
│   │
│   ├── components/                   # React components
│   │   ├── auth/                     # Authentication components
│   │   │   └── login-form.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── select.tsx
│   │   ├── users/                    # User-specific components
│   │   ├── surveys/                  # Survey-specific components
│   │   └── assignments/              # Assignment-specific components
│   │
│   ├── store/                        # Zustand stores
│   │   ├── auth-store.ts             # Authentication state
│   │   ├── user-store.ts             # Users state
│   │   ├── survey-store.ts           # Surveys state
│   │   └── assignment-store.ts       # Assignments state
│   │
│   ├── lib/                          # Utilities & services
│   │   ├── api/                      # API service layer
│   │   │   ├── client.ts             # Axios instance + interceptors
│   │   │   ├── auth.service.ts       # Auth endpoints
│   │   │   ├── user.service.ts       # User endpoints
│   │   │   ├── survey.service.ts     # Survey endpoints
│   │   │   ├── assignment.service.ts # Assignment endpoints
│   │   │   └── index.ts              # Service exports
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── hooks/                        # Custom React hooks
│   │   └── use-auth.ts               # Authentication hooks
│   │
│   ├── types/                        # TypeScript types
│   │   └── index.ts                  # Shared type definitions
│   │
│   └── middleware.ts                 # Next.js middleware (route protection)
│
├── public/                           # Static assets
├── docs/                             # Documentation
├── .env.local                        # Environment variables
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

### Directory Conventions

- **`/app`**: Next.js pages and routing (file-system routing)
- **`/components`**: Organized by feature or shared UI
- **`/store`**: One store per domain entity
- **`/lib/api`**: One service file per API resource
- **`/hooks`**: Reusable React hooks
- **`/types`**: Centralized type definitions

---

## State Management

### Zustand Stores

We use Zustand for global state management due to its simplicity and performance.

#### Store Structure

Each store follows this pattern:

```typescript
interface StoreState {
  // Data
  items: Item[]
  selectedItem: Item | null
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Pagination
  pagination: {
    page: number
    size: number
    total: number
    pages: number
  }
  
  // Actions
  setItems: (items: Item[]) => void
  addItem: (item: Item) => void
  updateItem: (id: number, item: Partial<Item>) => void
  deleteItem: (id: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}
```

#### Available Stores

1. **authStore** - Authentication state, user session
2. **userStore** - User management state
3. **surveyStore** - Survey and questions state
4. **assignmentStore** - Assignment management state

#### Usage Example

```typescript
import { useUserStore } from '@/store/user-store'

function UsersPage() {
  const { users, isLoading, setUsers } = useUserStore()
  
  useEffect(() => {
    loadUsers()
  }, [])
  
  return <div>{/* ... */}</div>
}
```

#### Why Zustand?

- **Minimal boilerplate**: No providers, actions, or reducers
- **Performance**: Only re-renders components using changed state
- **DevTools**: Redux DevTools support
- **Persistence**: Built-in localStorage/sessionStorage support
- **TypeScript**: Excellent type inference

---

## API Service Layer

### Architecture

All API communication goes through service files that use a configured Axios instance.

#### Axios Client Configuration

**File**: `src/lib/api/client.ts`

Features:
- Base URL configuration from environment
- Request interceptor: Adds JWT token to headers
- Response interceptor: Handles token refresh and errors
- Automatic 401 handling with token refresh logic

#### Service Pattern

Each API resource has its own service file:

```typescript
// src/lib/api/user.service.ts
export const userService = {
  async getUsers(params) {
    const response = await apiClient.get('/users', { params })
    return response.data
  },
  
  async createUser(data) {
    const response = await apiClient.post('/users', data)
    return response.data
  },
  
  // ... other methods
}
```

#### Service Files

1. **auth.service.ts** - Login, logout, token refresh, me
2. **user.service.ts** - User CRUD operations
3. **survey.service.ts** - Survey and question management
4. **assignment.service.ts** - Assignment operations

#### Usage in Components

```typescript
import { userService } from '@/lib/api'

async function loadUsers() {
  try {
    setLoading(true)
    const data = await userService.getUsers({ page: 1, size: 10 })
    setUsers(data)
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}
```

---

## Authentication & Authorization

### JWT Token Flow

1. **Login**: User provides credentials → Backend returns JWT tokens
2. **Storage**: Tokens stored in Zustand (persisted to localStorage)
3. **Requests**: Token added to all requests via Axios interceptor
4. **Refresh**: On 401 error, attempt token refresh automatically
5. **Logout**: Clear tokens and redirect to login

### Token Storage Strategy

- **Access Token**: Stored in Zustand store + cookie (for middleware)
- **Refresh Token**: Stored in Zustand store only
- **Persistence**: Zustand persist middleware writes to localStorage

### Auth Hook

**File**: `src/hooks/use-auth.ts`

```typescript
const { 
  user, 
  isAuthenticated, 
  handleLogin, 
  handleLogout 
} = useAuth()
```

Features:
- Login/logout handlers
- Error state management
- Loading states
- Automatic cookie management

### Route Protection Hook

```typescript
const { isChecking } = useRequireAuth()
```

Automatically redirects to `/login` if not authenticated.

### Role-Based Access

```typescript
const { hasRole, role } = useRole(['admin'])

if (!hasRole) {
  return <AccessDenied />
}
```

---

## Route Protection

### Next.js Middleware

**File**: `src/middleware.ts`

Runs on **every request** before page renders.

#### Logic

1. Check for `access_token` cookie
2. If protected route + no token → redirect to `/login`
3. If auth page + has token → redirect to `/dashboard`

#### Protected Routes

All routes under `/dashboard/*` are protected.

#### Why Middleware?

- Server-side protection (cannot be bypassed)
- Fast redirects before page load
- Better UX than client-side checks

---

## Layout System

### Hierarchy

```
RootLayout (app/layout.tsx)
  └── LoginPage (app/login/page.tsx)
  └── DashboardLayout (app/dashboard/layout.tsx)
        └── Sidebar + Header
        └── DashboardPage (app/dashboard/page.tsx)
        └── UsersPage (app/dashboard/users/page.tsx)
        └── ...
```

### Components

#### Sidebar
- Fixed left navigation
- Active route highlighting
- Mobile responsive with overlay
- Collapsible on mobile

#### Header
- User profile display
- Logout button
- Breadcrumbs placeholder

#### DashboardLayout
- Wraps all dashboard pages
- Includes `useRequireAuth` check
- Shows loading spinner while checking auth
- Provides consistent layout structure

---

## Component Architecture

### Component Organization

```
components/
  ├── auth/          # Auth-specific (login, register)
  ├── layout/        # Layout components (sidebar, header)
  ├── ui/            # Generic reusable UI (button, input)
  ├── users/         # User management components
  ├── surveys/       # Survey management components
  └── assignments/   # Assignment management components
```

### UI Components Pattern

All UI components in `/components/ui` follow this pattern:

```typescript
interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary'
  // ... specific props
}

export function Component({ 
  variant = 'primary',
  className,
  ...props 
}: ComponentProps) {
  return (
    <element className={cn(baseStyles, variants[variant], className)} {...props}>
      {/* ... */}
    </element>
  )
}
```

#### Benefits

- Composable
- Consistent API
- Style override support via className
- TypeScript safe
- Accessible

### Feature Components

Domain-specific components (users, surveys, etc.) can be more complex:

```
surveys/
  ├── survey-list.tsx          # List view
  ├── survey-form.tsx          # Create/edit form
  ├── survey-detail.tsx        # Detail view
  ├── question-builder.tsx     # Question editor
  └── conditional-logic.tsx    # Logic builder
```

---

## Scalability Considerations

### Current Architecture Supports

1. **Survey Versioning**
   - Store structure includes `version` field
   - Clone endpoint for creating new versions
   - Question reordering support

2. **Conditional Logic**
   - Questions have `logica_condicional` field
   - Prepared for complex show/hide rules
   - Can store JSON logic expressions

3. **Document Configuration**
   - Question types include `documento`
   - Can add OCR flags per question
   - Cloudinary integration ready

4. **Role Expansion**
   - Easy to add new roles to type system
   - Role-based hooks already in place
   - Middleware supports role checks

### Future Enhancements

#### Multi-language Support
- Add i18n library (next-intl)
- Extract all strings to translation files
- Update types for multilingual content

#### Real-time Updates
- Add WebSocket connection
- Subscribe to assignment updates
- Push notifications for status changes

#### Advanced Analytics
- Create analytics store
- Add chart library (recharts)
- Build dashboard widgets

#### Bulk Operations
- Already prepared in services (bulkCreate)
- Add bulk edit UI components
- CSV import/export

#### Offline Support
- Add service worker
- Cache API responses
- Queue operations when offline

---

## Development Guidelines

### Code Style

- **Components**: PascalCase (`UserList.tsx`)
- **Files**: kebab-case (`use-auth.ts`)
- **Variables**: camelCase (`isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)

### TypeScript

- Always define types for props
- Use interfaces for objects
- Use types for unions/primitives
- Avoid `any` - use `unknown` if needed

### Component Guidelines

1. **Keep components small** (< 200 lines)
2. **Extract logic to hooks** when complex
3. **Use composition** over inheritance
4. **Prefer controlled components**
5. **Add loading/error states**

### State Management

1. **Keep API calls in components**, not stores
2. **Stores hold data**, components handle loading
3. **Update store after successful API call**
4. **Clear error states on retry**

### API Services

1. **One service file per resource**
2. **Type all request/response data**
3. **Handle errors in components**, not services
4. **Use async/await**, not .then()

### Performance

1. **Use Next.js Image** component for images
2. **Lazy load** heavy components
3. **Memoize expensive calculations**
4. **Debounce search inputs**
5. **Paginate large lists**

### Testing Strategy (Future)

```
tests/
  ├── unit/           # Hook and utility tests
  ├── integration/    # API service tests
  └── e2e/            # Playwright tests
```

---

## Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Auth Configuration  
NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL=14400000

# Cloudinary (future)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

### Naming Convention

- `NEXT_PUBLIC_*` - Exposed to browser
- Without prefix - Server-side only

---

## Getting Started

### Installation

```bash
cd brigadaWebCMS
npm install
```

### Development

```bash
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

### Type Check

```bash
npm run type-check
```

---

## API Integration

### Backend Endpoints Expected

The frontend expects these endpoints from the FastAPI backend:

#### Auth
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout  
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Current user

#### Users
- `GET /users` - List users (paginated)
- `GET /users/{id}` - Get user
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

#### Surveys
- `GET /admin/surveys` - List surveys
- `POST /admin/surveys` - Create survey
- `GET /admin/surveys/{id}` - Get survey
- `PUT /admin/surveys/{id}` - Update survey
- `DELETE /admin/surveys/{id}` - Delete survey
- `GET /admin/surveys/{id}/questions` - Get questions
- `POST /admin/surveys/{id}/questions` - Create question

#### Assignments
- `GET /assignments` - List assignments
- `POST /assignments` - Create assignment
- `GET /assignments/{id}` - Get assignment
- `PUT /assignments/{id}` - Update assignment
- `DELETE /assignments/{id}` - Delete assignment

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Troubleshooting

### Token Refresh Issues

Check:
1. Refresh token is being stored
2. Backend refresh endpoint matches URL
3. Axios interceptor is configured correctly

### Route Protection Not Working

Check:
1. Cookie is being set after login
2. Middleware is running (check logs)
3. Token format matches backend expectations

### Zustand State Not Persisting

Check:
1. `persist` middleware is configured
2. localStorage is available
3. State key name doesn't conflict

---

## Contributing

### Before Committing

1. Run type check: `npm run type-check`
2. Run linter: `npm run lint`
3. Test locally
4. Update documentation if needed

### Pull Request Process

1. Create feature branch from `main`
2. Make changes
3. Update ARCHITECTURE.md if adding features
4. Submit PR with clear description
5. Wait for review

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Version**: 1.0.0  
**Last Updated**: February 14, 2026  
**Author**: Brigada Development Team
