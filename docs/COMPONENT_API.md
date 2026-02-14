# Component API Reference - Quick Guide

## Layout Components

### `<DashboardLayout>`
Main application wrapper for all authenticated pages.

```tsx
<DashboardLayout>
  {children}
</DashboardLayout>
```

**Features:**
- Auth protection (auto-redirects if not authenticated)
- Sidebar + Header management
- Responsive state management
- Loading state

---

### `<Sidebar>`
Collapsible navigation sidebar.

```tsx
<Sidebar
  isOpen={boolean}
  setIsOpen={(open) => void}
  isDesktopCollapsed={boolean}
  setIsDesktopCollapsed={(collapsed) => void}
/>
```

**Props:**
- `isOpen` - Mobile menu open state
- `setIsOpen` - Toggle mobile menu
- `isDesktopCollapsed` - Desktop collapsed state (icon-only)
- `setIsDesktopCollapsed` - Toggle desktop collapse

**Navigation Sections:**
- Defined in component (can be extracted to config)
- Supports badges, icons, active states
- Tooltips when collapsed

---

### `<Header>`
Top navigation bar with breadcrumbs, alerts, and user menu.

```tsx
<Header onMenuClick={() => void} />
```

**Props:**
- `onMenuClick` - Callback for mobile menu button

**Features:**
- Breadcrumbs auto-generated from route
- System alerts dropdown
- User menu with dropdown
- Sticky positioning

---

### `<Breadcrumbs>`
Auto-generated navigation breadcrumbs.

```tsx
<Breadcrumbs />
```

**Features:**
- Reads from `usePathname()` hook
- Home icon shortcut
- Clickable segments (except current page)
- Responsive truncation

**Route Mapping:**
Edit `routeMap` in component to customize labels.

---

### `<SystemAlerts>`
System notifications dropdown panel.

```tsx
<SystemAlerts
  isOpen={boolean}
  onClose={() => void}
/>
```

**Props:**
- `isOpen` - Panel visibility
- `onClose` - Close callback

**Alert Types:**
- `error` - Critical issues (red)
- `warning` - Warnings (yellow)
- `info` - Information (blue)
- `success` - Success messages (green)

**Data Source:**
Replace `mockAlerts` with real data from API/store.

---

## UI Components

### `<Button>`
Versatile button component.

```tsx
<Button
  variant="primary" | "secondary" | "danger" | "ghost"
  size="sm" | "md" | "lg"
  isLoading={boolean}
  onClick={() => void}
>
  Click me
</Button>
```

**Variants:**
- `primary` - Primary actions (blue)
- `secondary` - Secondary actions (gray)
- `danger` - Destructive actions (red)
- `ghost` - Minimal style (transparent)

---

### `<Input>`
Form input with label and error support.

```tsx
<Input
  label="Email"
  type="email"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errorMessage}
  required
/>
```

**Props:**
- All standard HTML input props
- `label` - Label text
- `error` - Error message (shows below input)

---

### `<Select>`
Dropdown select component.

```tsx
<Select
  label="Role"
  options={[
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User" },
  ]}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errorMessage}
/>
```

**Props:**
- All standard HTML select props
- `label` - Label text
- `options` - Array of `{ value, label }` objects
- `error` - Error message

---

### `<Card>`
Container for content blocks.

```tsx
<Card padding="sm" | "md" | "lg" | "none" hover={boolean}>
  <CardHeader
    title="Card Title"
    description="Optional description"
    action={<Button>Action</Button>}
  />
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer content */}
  </CardFooter>
</Card>
```

**Sub-components:**
- `<CardHeader>` - Title, description, action button
- `<CardContent>` - Main content area
- `<CardFooter>` - Footer with top border

---

### `<Table>`
Professional data table.

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.length === 0 ? (
      <TableEmpty message="No data" />
    ) : (
      data.map((item) => (
        <TableRow key={item.id} onClick={() => handleClick()}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.value}</TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>
```

**Components:**
- `<Table>` - Main wrapper (handles overflow)
- `<TableHeader>` - Header section
- `<TableBody>` - Body section
- `<TableRow>` - Row (supports onClick for clickable rows)
- `<TableHead>` - Header cell
- `<TableCell>` - Data cell
- `<TableEmpty>` - Zero state

---

### `<Pagination>`
Full-featured pagination component.

```tsx
<Pagination
  currentPage={1}
  totalPages={10}
  totalItems={247}
  itemsPerPage={25}
  onPageChange={(page) => loadPage(page)}
  showItemCount={true}
/>
```

**Features:**
- First/Previous/Next/Last buttons
- Page number display with ellipsis
- Item count ("Showing 1-25 of 247")
- Mobile-responsive
- Disabled states

---

### `<Badge>`
Status and label badges.

```tsx
<Badge variant="success" | "warning" | "error" | "info" | "default" size="sm" | "md" | "lg">
  Active
</Badge>

// Or use StatusBadge with dynamic colors
<StatusBadge status={statusString} size="md" />
```

**Variants:**
- `default` - Gray
- `success` - Green
- `warning` - Yellow
- `error` - Red
- `info` - Blue

`<StatusBadge>` automatically applies colors based on status string using `getStatusColor()` utility.

---

### `<Skeleton>`
Loading placeholders.

```tsx
// Custom skeleton
<Skeleton className="h-4 w-full" />

// Pre-built patterns
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonTable rows={5} columns={4} />
```

**Patterns:**
- `<SkeletonText>` - Multiple text lines
- `<SkeletonCard>` - Card with title + text
- `<SkeletonTable>` - Full table skeleton

---

### `<EmptyState>`
Zero state displays.

```tsx
<EmptyState
  type="no-data" | "no-results" | "no-access" | "error"
  title="Custom title"
  description="Custom description"
  action={{
    label: "Create New",
    onClick: () => handleCreate(),
  }}
/>
```

**Types:**
- `no-data` - No records exist yet
- `no-results` - Search/filter returned nothing
- `no-access` - Permission denied
- `error` - Failed to load data

---

## Utility Functions

### `formatDate(date: string | Date): string`
Formats date in Spanish long format.

```tsx
formatDate('2026-02-14') // "14 de febrero de 2026"
```

### `formatDateTime(date: string | Date): string`
Formats date + time in Spanish.

```tsx
formatDateTime('2026-02-14T10:30') // "14 de febrero de 2026, 10:30"
```

### `formatRoleName(role: string): string`
Translates role codes to readable names.

```tsx
formatRoleName('admin') // "Administrador"
formatRoleName('brigadista') // "Brigadista"
```

### `formatStatusName(status: string): string`
Translates status codes to readable names.

```tsx
formatStatusName('en_progreso') // "En Progreso"
formatStatusName('completado') // "Completado"
```

### `getStatusColor(status: string): string`
Returns Tailwind classes for status badges.

```tsx
getStatusColor('completado') // "bg-green-100 text-green-800"
getStatusColor('rechazado') // "bg-red-100 text-red-800"
```

### `cn(...inputs: ClassValue[]): string`
Merges Tailwind classes intelligently (via clsx).

```tsx
cn('text-sm', 'font-bold', isActive && 'text-primary') 
// "text-sm font-bold text-primary"
```

### `truncate(str: string, length: number): string`
Truncates string with ellipsis.

```tsx
truncate('Long text here', 10) // "Long text..."
```

### `debounce<T>(func: T, wait: number)`
Debounces function calls.

```tsx
const debouncedSearch = debounce(searchFunction, 300);
```

---

## Hooks

### `useAuth()`
Main authentication hook.

```tsx
const {
  user,                    // Current user object
  isAuthenticated,         // Boolean
  isLoading,              // Loading state
  error,                  // Error message
  handleLogin,            // (email, password) => Promise
  handleLogout,           // () => Promise
  refreshUser,            // () => Promise - Reload user data
} = useAuth();
```

### `useRequireAuth()`
Protects routes - redirects if not authenticated.

```tsx
const { isChecking } = useRequireAuth();

if (isChecking) return <Loading />;
return <ProtectedContent />;
```

### `useRole(allowedRoles: string[])`
Checks if user has required role.

```tsx
const { hasRole, role } = useRole(['admin', 'encargado']);

if (!hasRole) return <AccessDenied />;
```

---

## Store Usage

### Auth Store

```tsx
import { useAuthStore } from '@/store/auth-store';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### User Store

```tsx
import { useUserStore } from '@/store/user-store';

const {
  users,
  isLoading,
  pagination,
  setUsers,
  addUser,
  updateUser,
  deleteUser,
} = useUserStore();
```

### Survey Store

```tsx
import { useSurveyStore } from '@/store/survey-store';

const {
  surveys,
  selectedSurvey,
  surveyQuestions,
  setSurveys,
  setSelectedSurvey,
  addQuestion,
  reorderQuestions,
} = useSurveyStore();
```

### Assignment Store

```tsx
import { useAssignmentStore } from '@/store/assignment-store';

const {
  assignments,
  filters,
  setFilters,
  clearFilters,
  updateAssignment,
} = useAssignmentStore();
```

---

## API Services

### Auth Service

```tsx
import { authService } from '@/lib/api';

await authService.login({ email, password });
await authService.logout();
await authService.refresh(refreshToken);
const user = await authService.me();
```

### User Service

```tsx
import { userService } from '@/lib/api';

const users = await userService.getUsers({ page: 1, size: 10 });
const user = await userService.getUser(id);
const newUser = await userService.createUser(data);
await userService.updateUser(id, data);
await userService.deleteUser(id);
```

### Survey Service

```tsx
import { surveyService } from '@/lib/api';

const surveys = await surveyService.getSurveys({ page: 1 });
const questions = await surveyService.getSurveyQuestions(surveyId);
await surveyService.createQuestion(surveyId, data);
await surveyService.reorderQuestions(surveyId, questionIds);
```

### Assignment Service

```tsx
import { assignmentService } from '@/lib/api';

const assignments = await assignmentService.getAssignments({ estado: 'pendiente' });
await assignmentService.createAssignment(data);
await assignmentService.assignBrigadista(id, brigadistaId);
await assignmentService.updateStatus(id, 'completado');
```

---

## Common Patterns

### Loading State Pattern

```tsx
if (isLoading) {
  return <SkeletonTable rows={10} columns={5} />;
}
```

### Empty State Pattern

```tsx
{data.length === 0 ? (
  <EmptyState
    type="no-data"
    action={{ label: "Create New", onClick: handleCreate }}
  />
) : (
  data.map(...)
)}
```

### Error Handling Pattern

```tsx
try {
  setLoading(true);
  const result = await apiService.fetchData();
  setData(result);
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}
```

---

## Best Practices

1. **Always use components from `@/components/ui`** for consistency
2. **Use Zustand stores** for state, not local state for server data
3. **Use API services**, never call axios directly
4. **Show loading states** with skeletons, not spinners
5. **Show empty states** instead of empty tables
6. **Use semantic HTML** (`<nav>`, `<main>`, `<section>`)
7. **Add ARIA labels** to icon-only buttons
8. **Use `cn()` utility** for conditional classes
9. **Format data** with utility functions before display
10. **Keep components small** (< 200 lines)

---

**Version:** 1.0.0  
**Last Updated:** February 14, 2026
