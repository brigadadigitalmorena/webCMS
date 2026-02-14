# Activation Codes Module

A complete admin module for managing secure user activation codes in the Brigade CMS.

## Overview

This module allows administrators to:

- **Generate** time-limited activation codes for pre-authorized users
- **View** code status and usage statistics
- **Revoke** codes with audit trail
- **Extend** expiration times
- **Resend** activation emails
- **Monitor** activation attempts and failures
- **Review** complete audit logs

## Security Features

- **One-time visibility**: Plain code shown only once after generation
- **Bcrypt hashing**: Codes stored with bcrypt (work factor 12)
- **Rate limiting**: Backend enforces attempt limits (10/min validation, 3/hour activation)
- **Attempt tracking**: Failed attempts logged with IP addresses
- **Auto-locking**: Codes lock after max failed attempts
- **Comprehensive audit**: All actions logged with timestamps and metadata

## Architecture

### File Structure

```
src/
├── app/dashboard/activation-codes/
│   └── page.tsx                    # Main page component
├── components/activation/
│   ├── activation-codes-table.tsx  # Table with actions
│   ├── activation-status-badge.tsx # Status badge component
│   ├── create-code-modal.tsx       # Generate new code
│   ├── code-generated-modal.tsx    # Show plain code (once)
│   ├── code-detail-modal.tsx       # View code details
│   ├── revoke-code-modal.tsx       # Revoke with reason
│   ├── extend-code-modal.tsx       # Extend expiration
│   ├── attempts-modal.tsx          # View audit log
│   └── index.ts                    # Barrel exports
├── lib/api/
│   └── activation-code.service.ts  # API service layer
├── store/
│   └── activation-code-store.ts    # Zustand state management
└── types/
    └── activation.ts               # TypeScript definitions
```

### State Management (Zustand)

The `activation-code-store.ts` manages:

- **Data**: codes, audit logs, stats, selected code, generated plain code
- **Pagination**: current page, total pages, total items
- **Filters**: status filter, search term
- **UI State**: loading, generating, errors
- **Actions**: CRUD operations, fetch methods

### API Integration

The `activation-code.service.ts` provides:

- `list(params)` - List codes with filters and pagination
- `getById(id)` - Get single code details
- `generate(data)` - Generate new code (returns plain code once)
- `revoke(id, reason)` - Revoke with audit reason
- `extend(id, hours)` - Extend expiration time
- `resendEmail(id, message?)` - Resend activation email
- `getAuditLogs(params)` - Get filtered audit logs
- `getStats()` - Get dashboard statistics
- `getAttempts(codeId)` - Get attempts for specific code

## Components

### Page Component (`page.tsx`)

**Features**:
- Stats cards (total codes, active, used today, failed attempts)
- Search and filter bar
- Codes table with actions
- Error handling with dismissible alerts
- Debounced search (500ms)
- Pagination

### Table Component (`activation-codes-table.tsx`)

**Columns**:
- Name (with supervisor if applicable)
- Identifier (masked: `us***@example.com`, `***1234`)
- Role badge
- Status badge
- Expiration (relative time)
- Attempts (clickable)

**Actions per row**:
- 👁️ View Details (always available)
- 🕐 Extend (only for active codes)
- ✉️ Resend Email (only for active codes)
- 🚫 Revoke (not for used/revoked)
- 🛡️ View Attempts (always available)

### Modals

#### CreateCodeModal
- Form with validation
- Fields: name, identifier type, identifier, role, expiration hours, notes
- Quick options for expiration (12h, 24h, 72h, 7d)
- Real-time validation with error messages

#### CodeGeneratedModal
- **Critical**: Shows plain code only once
- Copy to clipboard button
- Warning message about security
- Instructions for next steps

#### CodeDetailModal
- User information section
- Code information with timestamps
- Additional notes (revoke reason, notes)
- Code hash display (for reference)

#### RevokeCodeModal
- Warning about permanent action
- Code details summary
- Required reason input with validation
- Confirmation flow

#### ExtendCodeModal
- Current expiry display
- Quick options (12h, 24h, 72h, 7d)
- Custom hours input (1-720 hours)
- New expiry preview with calculation

#### AttemptsModal
- Summary cards (total events, failed attempts, status)
- Warning for locked/high-risk codes
- Audit log table with:
  - Event type (badges with icons)
  - Timestamp
  - IP address
  - Details/failure reasons

### Status Badge

**Status Colors**:
- 🟢 **Active**: Green (bg-green-100)
- 🔵 **Used**: Blue (bg-blue-100)
- 🟠 **Expired**: Orange (bg-orange-100)
- 🔴 **Revoked**: Red (bg-red-100)
- ⚫ **Locked**: Gray (bg-gray-100)

Each status has appropriate icon and dark mode support.

## Types

### Main Interfaces

```typescript
// Whitelist entry (pre-authorized user)
interface WhitelistEntry {
  id: number;
  identifier: string;
  identifier_type: "email" | "phone" | "national_id";
  nombre: string;
  apellido: string;
  assigned_role: UserRole;
  supervisor_nombre?: string;
  notes?: string;
  // ...timestamps
}

// Activation code
interface ActivationCode {
  id: number;
  code_hash: string; // bcrypt hash
  whitelist_id: number;
  whitelist: WhitelistEntry;
  status: "active" | "used" | "expired" | "revoked" | "locked";
  expires_at: string | null;
  used_at: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  failed_attempts: number;
  max_attempts: number;
  created_at: string;
}

// Audit log entry
interface ActivationAuditLog {
  id: number;
  code_id: number;
  event_type: AuditEventType;
  success: boolean;
  failure_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}
```

### API Request/Response Types

Complete type coverage for all API operations:
- `CreateWhitelistRequest/Response`
- `GenerateCodeRequest/Response` (includes plain code)
- `ListActivationCodesParams/Response`
- `RevokeCodeRequest/Response`
- `ExtendCodeRequest/Response`
- `ResendEmailRequest/Response`
- `ListAuditLogsParams/Response`
- `ActivationStatsResponse`

## Usage

### Accessing the Page

Navigate to `/dashboard/activation-codes` in the admin panel.

### Generating a Code

1. Click "Generate Code" button
2. Fill in user details:
   - First name and last name
   - Identifier type (email, phone, national ID)
   - Identifier value
   - Role (brigadista, encargado, admin)
   - Expiration hours (default 72, max 720)
   - Optional notes
3. Click "Generate Code"
4. **Important**: Copy the plain code immediately (shown only once)
5. Send the code to the user securely

### Managing Codes

#### View Details
- Click the eye icon to see full code information
- View creation date, expiration, usage status
- See code hash (bcrypt)

#### Extend Expiration
- Click clock icon for active codes
- Choose quick option or enter custom hours
- See preview of new expiration time
- Confirm extension

#### Revoke Code
- Click ban icon for active/unused codes
- Enter required revocation reason
- Confirm permanent action
- Revocation is logged in audit trail

#### Resend Email
- Click mail icon for active codes
- Optionally add custom message
- Email sent to user's identifier

#### View Attempts
- Click shield icon or attempts count
- See summary of total events and failed attempts
- View detailed audit log with:
  - Event types (generated, attempted, failed, success, etc.)
  - Timestamps
  - IP addresses
  - Failure reasons

### Filtering

- **Search**: Type in search box (debounced 500ms)
  - Searches by name, email, identifier
- **Status Filter**: Dropdown to filter by status
  - All Statuses / Active / Used / Expired / Revoked / Locked
- **Pagination**: Navigate through pages if more than 10 codes

## Best Practices

### Security

1. **Never log plain codes**: Only show in CodeGeneratedModal
2. **Always provide revoke reason**: Creates audit trail
3. **Monitor failed attempts**: Review AttemptsModal regularly
4. **Use appropriate expiration**: Default 72h, max 30 days
5. **Verify identifier**: Ensure correct email/phone before generating

### User Experience

1. **Copy code immediately**: Warn user it's shown only once
2. **Provide clear notes**: Help future admins understand context
3. **Send secure**: Use encrypted channels for code delivery
4. **Monitor status**: Check codes before deadline if not activated
5. **Act on failures**: Investigate locked codes promptly

## Backend Integration

This module expects the following backend endpoints:

- `GET /admin/activation-codes` - List codes
- `GET /admin/activation-codes/:id` - Get code details
- `POST /admin/activation-codes/generate` - Generate new code
- `POST /admin/activation-codes/:id/revoke` - Revoke code
- `POST /admin/activation-codes/:id/extend` - Extend expiration
- `POST /admin/activation-codes/:id/resend-email` - Resend email
- `GET /admin/activation-audit` - Get audit logs
- `GET /admin/activation-audit/stats` - Get statistics

See [ACTIVATION_FLOW_PRODUCTION_DESIGN.md](../../../docs/ACTIVATION_FLOW_PRODUCTION_DESIGN.md) for complete API specification.

## Testing

### Manual Testing Checklist

- [ ] Generate code with all identifier types
- [ ] Verify code shown only once
- [ ] Copy code to clipboard
- [ ] View code details
- [ ] Extend active code
- [ ] Revoke code with reason
- [ ] Resend email
- [ ] View attempts log
- [ ] Search codes
- [ ] Filter by status
- [ ] Test pagination
- [ ] Verify error handling
- [ ] Test dark mode appearance
- [ ] Check mobile responsiveness

### Error Scenarios

- [ ] Network failure during generation
- [ ] Invalid form inputs
- [ ] Expired code extension attempt
- [ ] Revoking already used code
- [ ] Rate limit exceeded
- [ ] Backend validation errors

## Future Enhancements

- [ ] Bulk code generation
- [ ] CSV export of codes
- [ ] Email template customization
- [ ] SMS integration for phone identifiers
- [ ] Advanced analytics dashboard
- [ ] Code usage patterns visualization
- [ ] Automated expiration reminders
- [ ] Role-based generation limits

## Related Documentation

- [Backend Design](../../../docs/ACTIVATION_FLOW_PRODUCTION_DESIGN.md)
- [Architecture Analysis](../../../docs/USER_ACTIVATION_SYSTEM_ANALYSIS.md)
- [API Examples](../../../brigadaBackEnd/API_EXAMPLES.md)

## Support

For issues or questions:
1. Check backend logs for API errors
2. Review audit logs in AttemptsModal
3. Verify backend is running and accessible
4. Check network tab for failed requests
5. Ensure user has admin role permissions
