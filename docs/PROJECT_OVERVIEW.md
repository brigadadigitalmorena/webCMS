# BrigadaWebCMS - Project Overview

> **Admin Web Panel for Survey Management System**  
> Enterprise-grade SaaS dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Zustand

---

## 📋 Project Summary

**Purpose:** Professional admin interface for managing surveys, users, assignments, and analyzing response data from the Brigada mobile app ecosystem.

**Tech Stack:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4
- **State:** Zustand 4.5 (with persistence)
- **API:** Axios 1.6 (with interceptors)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

**Target Users:**
- Administrators (full access)
- Supervisors/Encargados (team management)
- Analysts (reports and analytics)

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       NEXT.JS 14 APP                         │
│                     (App Router Mode)                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
         ┌────▼────┐                   ┌──────▼──────┐
         │  Pages  │                   │ Middleware  │
         │  (app/) │                   │  (Auth)     │
         └────┬────┘                   └──────┬──────┘
              │                               │
    ┌─────────┼───────────┐                   │
    │         │           │                   │
┌───▼───┐ ┌──▼───┐ ┌─────▼─────┐            │
│Login  │ │Dash  │ │Dashboard  │            │
│       │ │board │ │  Layout   │◄───────────┘
└───────┘ └──┬───┘ └─────┬─────┘
             │            │
        ┌────┼────────────┼───────────┐
        │    │            │           │
    ┌───▼┐ ┌─▼──┐ ┌──────▼─────┐ ┌──▼───┐
    │User│ │Surv│ │ Assignment │ │Report│
    │    │ │ey  │ │            │ │      │
    └─┬──┘ └─┬──┘ └──────┬─────┘ └──┬───┘
      │      │           │           │
      └──────┴───────────┴───────────┘
                     │
         ┌───────────┴───────────────┐
         │                           │
    ┌────▼─────┐              ┌─────▼──────┐
    │ Layout   │              │    UI      │
    │Components│              │ Components │
    │          │              │            │
    │ Sidebar  │              │ Button     │
    │ Header   │              │ Input      │
    │Breadcrumb│              │ Table      │
    │  ...     │              │ Card       │
    └────┬─────┘              └─────┬──────┘
         │                          │
         └──────────┬───────────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
    ┌────▼─────┐         ┌─────▼──────┐
    │  Zustand │         │   Hooks    │
    │  Stores  │         │            │
    │          │         │  useAuth   │
    │ auth     │◄────────┤  useRole   │
    │ user     │         │  ...       │
    │ survey   │         └─────┬──────┘
    │assignment│               │
    └────┬─────┘               │
         │                     │
         └──────────┬──────────┘
                    │
           ┌────────▼────────┐
           │  API Services   │
           │                 │
           │  Auth Service   │
           │  User Service   │
           │  Survey Service │
           │ Assignment Serv │
           └────────┬────────┘
                    │
           ┌────────▼────────┐
           │  Axios Client   │
           │  (Interceptors) │
           │                 │
           │ - Token Inject  │
           │ - Token Refresh │
           │ - Error Handler │
           └────────┬────────┘
                    │
                    ▼
        ┌──────────────────────┐
        │   BrigadaBackEnd     │
        │   (FastAPI)          │
        │   /api/admin/*       │
        │   /api/mobile/*      │
        └──────────────────────┘
```

---

## 📁 Project Structure

```
brigadaWebCMS/
│
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── login/                    # Login page
│   │   └── dashboard/                # Protected dashboard
│   │       ├── layout.tsx            # Dashboard layout wrapper
│   │       ├── page.tsx              # Dashboard home
│   │       ├── users/                # User management
│   │       ├── surveys/              # Survey management
│   │       ├── assignments/          # Assignment management
│   │       ├── reports/              # Analytics
│   │       └── system-health/        # Monitoring
│   │
│   ├── components/
│   │   ├── layout/                   # Layout components
│   │   │   ├── sidebar.tsx           # Collapsible sidebar
│   │   │   ├── header.tsx            # Top bar with alerts
│   │   │   ├── dashboard-layout.tsx  # Main wrapper
│   │   │   ├── breadcrumbs.tsx       # Auto breadcrumbs
│   │   │   └── system-alerts.tsx     # Alert dropdown
│   │   │
│   │   └── ui/                       # Reusable UI components
│   │       ├── button.tsx            # 4 variants, 3 sizes
│   │       ├── input.tsx             # Form input
│   │       ├── select.tsx            # Dropdown
│   │       ├── card.tsx              # Container
│   │       ├── table.tsx             # Data table
│   │       ├── pagination.tsx        # Pagination
│   │       ├── skeleton.tsx          # Loading states
│   │       ├── empty-state.tsx       # Zero states
│   │       └── badge.tsx             # Status badges
│   │
│   ├── store/                        # Zustand state stores
│   │   ├── auth-store.ts             # Auth state
│   │   ├── user-store.ts             # User management
│   │   ├── survey-store.ts           # Survey management
│   │   └── assignment-store.ts       # Assignment management
│   │
│   ├── lib/
│   │   ├── api/                      # API service layer
│   │   │   ├── client.ts             # Axios instance + interceptors
│   │   │   ├── auth.service.ts       # Auth endpoints
│   │   │   ├── user.service.ts       # User CRUD
│   │   │   ├── survey.service.ts     # Survey CRUD
│   │   │   └── assignment.service.ts # Assignment CRUD
│   │   │
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-auth.ts               # Auth hook
│   │   ├── use-require-auth.ts       # Route protection
│   │   └── use-role.ts               # Role checking
│   │
│   ├── types/                        # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── survey.types.ts
│   │   └── assignment.types.ts
│   │
│   └── middleware.ts                 # Next.js middleware (auth)
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # System architecture (25+ pages)
│   ├── LAYOUT_DESIGN.md              # Layout design guide (25+ pages)
│   ├── COMPONENT_API.md              # Component reference (this file)
│   ├── SETUP.md                      # Setup instructions
│   └── SUMMARY.md                    # Implementation summary
│
├── public/                           # Static assets
│
├── .env.local                        # Environment variables
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies
```

---

## 🔐 Authentication Flow

```
┌─────────┐
│  User   │
│ Enters  │
│  App    │
└────┬────┘
     │
     ▼
┌─────────────────┐
│  Middleware     │ ──No Token──> Redirect to /login
│  Checks Token   │
└────┬────────────┘
     │
     │ Has Token
     ▼
┌─────────────────┐
│ Token Valid?    │ ──Invalid──> Redirect to /login
└────┬────────────┘
     │
     │ Valid
     ▼
┌─────────────────┐
│ Load User Data  │
│ (useAuth hook)  │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Render Protected│
│    Content      │
└─────────────────┘


API Request Flow:
┌──────────────┐
│ Component    │
│ Calls API    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ API Service      │
│ (userService)    │
└──────┬───────────┘
       │
       ▼
┌────────────────────────┐
│ Axios Client           │
│ Request Interceptor    │
│ → Injects JWT Token    │
└──────┬─────────────────┘
       │
       ▼
┌──────────────┐
│  Backend API │ ◄─── HTTP Request with Token
└──────┬───────┘
       │
       ▼ Response
┌────────────────────────┐
│ Response Interceptor   │
│ → If 401: Refresh Token│
│ → Retry Request        │
└──────┬─────────────────┘
       │
       ▼
┌──────────────┐
│ Component    │
│ Gets Data    │
└──────────────┘
```

---

## 🎨 Design System

### Color Palette

**Primary (Blue):**
- 50: #eff6ff
- 100: #dbeafe
- 500: #3b82f6 ← Main brand color
- 700: #1d4ed8
- 900: #1e3a8a

**Semantic Colors:**
- **Success:** Green (#10b981)
- **Warning:** Yellow (#f59e0b)
- **Error:** Red (#ef4444)
- **Info:** Blue (#3b82f6)

### Typography

- **Headings:** font-semibold, tracking-tight
- **Body:** font-normal, text-gray-700
- **Labels:** text-sm, font-medium, text-gray-700
- **Captions:** text-xs, text-gray-500

### Spacing Scale

- **xs:** 8px (0.5rem)
- **sm:** 12px (0.75rem)
- **md:** 16px (1rem)
- **lg:** 24px (1.5rem)
- **xl:** 32px (2rem)
- **2xl:** 48px (3rem)

### Component Sizes

- **Sidebar (Desktop):** 256px expanded, 64px collapsed
- **Header:** 64px height
- **Content Max-Width:** 1600px
- **Card Padding:** 16px default
- **Border Radius:** 8px (rounded-lg)

---

## 🧩 Component Hierarchy

```
App
└── RootLayout
    ├── LoginPage (public)
    └── DashboardLayout (protected)
        ├── Sidebar
        │   ├── Logo
        │   ├── NavSection (Principal)
        │   │   ├── NavItem (Dashboard)
        │   │   ├── NavItem (Surveys)
        │   │   ├── NavItem (Users)
        │   │   └── NavItem (Assignments)
        │   └── NavSection (Análisis)
        │       ├── NavItem (Reports)
        │       └── NavItem (System Health)
        │
        ├── Header
        │   ├── MenuButton (mobile)
        │   ├── Breadcrumbs
        │   ├── SystemAlerts (dropdown)
        │   ├── HelpButton
        │   └── UserMenu (dropdown)
        │
        └── MainContent
            ├── Users Page
            │   ├── Card (header)
            │   ├── Table
            │   │   ├── TableHeader
            │   │   ├── TableBody
            │   │   │   ├── TableRow (n)
            │   │   │   └── TableEmpty
            │   │   └── Pagination
            │   └── UserModal
            │       └── UserForm
            │
            ├── Surveys Page
            │   ├── SurveyList
            │   │   └── Table + Pagination
            │   └── SurveyBuilder
            │       ├── SurveyForm
            │       └── QuestionBuilder
            │
            ├── Assignments Page
            │   ├── AssignmentFilters
            │   ├── AssignmentTable
            │   └── MapView
            │
            └── Dashboard Page
                ├── StatsCards (4x)
                ├── RecentActivity
                └── Charts
```

---

## 📊 State Management (Zustand)

### Store Structure

Each store follows consistent pattern:

```typescript
interface Store {
  // State
  data: T[];
  selectedItem: T | null;
  isLoading: boolean;
  error: string | null;
  pagination: { page, size, total };
  
  // Actions
  setData: (data: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (id, data) => void;
  deleteItem: (id) => void;
  setSelected: (item: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
```

### Available Stores

1. **Auth Store** (`useAuthStore`)
   - Current user session
   - Login/logout actions
   - Persisted to localStorage

2. **User Store** (`useUserStore`)
   - User list with pagination
   - CRUD operations
   - Selected user

3. **Survey Store** (`useSurveyStore`)
   - Survey list
   - Questions management
   - Conditional logic
   - Version support

4. **Assignment Store** (`useAssignmentStore`)
   - Assignment list
   - Filters (status, encargado, brigad ista, encuesta)
   - Bulk operations

---

## 🔌 API Integration

### Base Configuration

```typescript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL=840000 // 14 minutes
```

### Axios Client Features

1. **Request Interceptor:**
   - Automatically injects JWT access token
   - Adds `Authorization: Bearer {token}` header

2. **Response Interceptor:**
   - Detects 401 Unauthorized errors
   - Attempts token refresh
   - Retries failed request with new token
   - Logs out if refresh fails

3. **Error Handling:**
   - Standardized error responses
   - Network error detection
   - Timeout handling

### Available Services

All services in `src/lib/api/`:

- **authService:** login, logout, refresh, me
- **userService:** Full CRUD + toggleStatus, resetPassword
- **surveyService:** CRUD + questions, reorder, clone
- **assignmentService:** CRUD + filters, assign, bulkCreate

---

## 🚀 Key Features

### ✅ Implemented

- ✅ **Authentication System**
  - JWT access + refresh tokens
  - Secure cookie + localStorage
  - Automatic token refresh
  - Route protection middleware

- ✅ **Professional Layout**
  - Collapsible sidebar (256px → 64px)
  - System alerts dropdown
  - Auto-generated breadcrumbs
  - User menu with settings/logout
  - Responsive mobile design

- ✅ **UI Component Library**
  - 11+ reusable components
  - Consistent design system
  - Loading states (skeletons)
  - Empty states
  - Form components with validation support

- ✅ **State Management**
  - 4 Zustand stores
  - Persistence for auth
  - Pagination support
  - CRUD actions

- ✅ **API Layer**
  - Complete service abstraction
  - Axios interceptors
  - Error handling
  - Type safety

### 🔄 Pending Implementation

- ⏳ **User Management**
  - User table with sorting/filtering
  - Create/edit forms
  - Role assignment
  - Bulk actions

- ⏳ **Survey Builder**
  - Visual question builder
  - Drag-and-drop reordering
  - Conditional logic UI
  - Preview mode
  - Version management

- ⏳ **Assignment Management**
  - Assignment creation wizard
  - Bulk import from CSV
  - Map view for locations
  - Status workflow

- ⏳ **Analytics Dashboard**
  - Real-time statistics
  - Charts and graphs
  - Activity feed
  - Export reports

---

## 📈 Development Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Project setup
- [x] Authentication system
- [x] Base layout components
- [x] UI component library
- [x] State management
- [x] API services
- [x] Documentation

### Phase 2: User Management (Next)
- [ ] User table with data
- [ ] User creation form
- [ ] User edit form
- [ ] Role management
- [ ] User search and filters
- [ ] Bulk actions

### Phase 3: Survey Management
- [ ] Survey list page
- [ ] Survey creation wizard
- [ ] Question type components
- [ ] Conditional logic builder
- [ ] Survey preview
- [ ] Survey versioning
- [ ] Survey duplication

### Phase 4: Assignment Management
- [ ] Assignment creation
- [ ] Location picker (map)
- [ ] Bulk assignment import
- [ ] Assignment tracking
- [ ] Status updates
- [ ] Notifications

### Phase 5: Analytics & Reporting
- [ ] Dashboard widgets
- [ ] Charts integration (recharts)
- [ ] Custom reports
- [ ] Export functionality
- [ ] Real-time updates

### Phase 6: Advanced Features
- [ ] OCR integration
- [ ] Image management (Cloudinary)
- [ ] Email notifications
- [ ] Audit logs
- [ ] Advanced search
- [ ] Custom themes

---

## 🛠 Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📚 Documentation Files

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture (25+ pages)
2. **[LAYOUT_DESIGN.md](./LAYOUT_DESIGN.md)** - Layout design guide with UX rationale (25+ pages)
3. **[COMPONENT_API.md](./COMPONENT_API.md)** - Quick component reference (this file)
4. **[SETUP.md](./SETUP.md)** - Installation and setup guide
5. **[SUMMARY.md](./SUMMARY.md)** - Implementation summary

---

## 🎯 Quick Start Guide

### 1. Install Dependencies
```bash
cd brigadaWebCMS
npm install
```

### 2. Configure Environment
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 3. Start Development
```bash
npm run dev
```

### 4. Access Application
- Open: http://localhost:3000
- Login with test credentials (from backend seed data)

### 5. Start Building
- Begin with User Management page
- Follow component patterns in existing code
- Use UI components from `@/components/ui`
- Use Zustand stores for state
- Use API services for backend calls

---

## 📞 Support & Resources

**Backend API:**
- Repository: brigadaBackEnd/
- Documentation: brigadaBackEnd/docs/
- API Examples: brigadaBackEnd/docs/API_EXAMPLES.md

**Component Examples:**
- See `/app/dashboard/page.tsx` for usage examples
- Check `/components/layout/` for layout patterns
- Review `/components/ui/` for component code

**Best Practices:**
- Always use TypeScript types
- Follow Next.js App Router conventions
- Use server components where possible
- Keep components small and focused
- Test responsive design at all breakpoints

---

**Version:** 1.0.0  
**Status:** Phase 1 Complete, Ready for Phase 2  
**Last Updated:** February 14, 2026
