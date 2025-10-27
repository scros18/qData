# 🔍 Audit Logging System

## Overview

QData includes a comprehensive audit logging system that tracks all user actions, providing transparency, security, and debugging capabilities.

## Features

### ✨ What Gets Logged

- **SQL Queries** - All executed queries with execution time
- **Data Updates** - Row edits with affected tables
- **User Authentication** - Logins, logouts, PIN verifications
- **Database Connections** - Connection attempts and status
- **User Management** - User creation, updates, deletions (admin only)
- **Errors** - Failed operations with error details

### 📊 Log Details

Each log entry includes:
- **Timestamp** - When the action occurred
- **User** - Who performed the action (username + ID)
- **Action** - Type of operation (e.g., "Execute Query", "Update Row")
- **Details** - Description of what happened
- **Database/Table** - Which database and table (if applicable)
- **Status** - Success or error
- **Duration** - How long the operation took (in milliseconds)

## Using the Logs Tab

### Accessing Logs

1. Navigate to the **Logs** tab in the main dashboard
2. Available to all authenticated users
3. Shows most recent 100 logs by default

### Filtering Logs

- **All** - View all logged actions
- **Success** - Only successful operations (green icon)
- **Errors** - Only failed operations (red icon)

### Log Display

Logs are displayed in a beautiful, mobile-responsive format:
- **Color-coded** by status (success/error)
- **Icons** representing action type
- **Relative timestamps** ("5m ago", "2h ago", etc.)
- **Full timestamps** on hover
- **Expandable details** with database, table, user info
- **Execution time** for performance tracking

### Actions

- **Refresh** - Reload logs to see latest entries
- **Clear** - Delete all logs (admin only, requires confirmation)

## Mobile Responsiveness

The Logs tab is fully optimized for mobile devices:
- **Compact cards** with touch-friendly spacing
- **Icon-only buttons** on small screens
- **Responsive text sizes** (xs on mobile, sm/base on desktop)
- **Horizontal scroll** for long log details
- **Stacked layout** on narrow screens

## Storage

### File Location
- Logs are stored in: `/data/audit-logs.json`
- Automatically created on first use
- **Never committed to Git** (in .gitignore)

### Log Rotation
- Keeps most recent **1000 logs**
- Older logs are automatically pruned
- Prevents file from growing indefinitely

### Security
- Logs stored locally, never in database
- Only accessible to authenticated users
- No sensitive data (passwords, PINs) logged
- User IDs hashed in storage

## API Endpoints

### GET /qdata/api/logs
Fetch audit logs with optional filters

**Query Parameters:**
- `limit` - Number of logs to return (default: 100)
- `action` - Filter by action type
- `status` - Filter by success/error

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "1698765432000-abc123",
      "timestamp": "2025-10-27T12:30:45.123Z",
      "userId": "user-123",
      "username": "admin",
      "action": "Execute Query",
      "details": "Executed: SELECT * FROM users LIMIT 10",
      "database": "test_db",
      "table": "users",
      "status": "success",
      "duration": 45.67
    }
  ],
  "count": 1
}
```

### DELETE /qdata/api/logs
Clear all audit logs (admin only)

**Response:**
```json
{
  "success": true,
  "message": "Audit logs cleared"
}
```

## Logged Actions

### Database Operations
- `Execute Query` - SQL query execution
- `Update Row` - Data modification
- `View Table` - Table data access
- `View Database` - Database browsing

### Authentication
- `User Login` - Successful login
- `User Logout` - Session termination
- `PIN Verification` - PIN entry
- `Failed Login` - Invalid credentials

### User Management (Admin)
- `Create User` - New user account
- `Update User` - User modifications
- `Delete User` - User removal

## Best Practices

### For Users
1. **Review logs regularly** to monitor activity
2. **Check error logs** when operations fail
3. **Track query performance** using duration times
4. **Report suspicious activity** to administrators

### For Administrators
1. **Monitor error patterns** for system issues
2. **Review user activity** for security audits
3. **Clear old logs periodically** to save space
4. **Export important logs** before clearing

### For Developers
1. **Add logging to new features** for consistency
2. **Log meaningful details** but avoid sensitive data
3. **Include performance metrics** (duration)
4. **Use appropriate status** (success/error)

## Adding Logging to New Features

Example of adding audit logging to a new API endpoint:

```typescript
import { addAuditLog } from '@/lib/audit';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  let session = null;
  
  try {
    // Get session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qdata_session')?.value;
    if (sessionId) {
      session = getSession(sessionId);
    }

    // Your operation here
    const result = await someOperation();
    
    const duration = performance.now() - startTime;

    // Log success
    if (session) {
      addAuditLog(
        session.userId,
        session.username,
        'Action Name',
        'Description of what happened',
        { 
          database: 'optional_db',
          table: 'optional_table',
          status: 'success',
          duration 
        }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    const duration = performance.now() - startTime;

    // Log error
    if (session) {
      addAuditLog(
        session.userId,
        session.username,
        'Action Name',
        `Failed: ${error.message}`,
        { status: 'error', duration }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Troubleshooting

### Logs Not Showing
- Check if `/data/` directory exists
- Verify file permissions on `audit-logs.json`
- Check browser console for API errors
- Ensure you're authenticated

### Logs Not Being Created
- Verify session is active
- Check if `addAuditLog()` is called in API routes
- Review server console for errors

### Performance Issues
- Clear old logs if file is very large
- Reduce `limit` parameter in API calls
- Consider implementing pagination for large datasets

## Security Considerations

✅ **What We Do:**
- Hash user IDs in storage
- Never log passwords or PINs
- Restrict log access to authenticated users
- Auto-prune old logs

⚠️ **What to Avoid:**
- Don't log sensitive user data
- Don't log full SQL queries with user input (truncate long queries)
- Don't expose logs via public endpoints
- Don't keep logs indefinitely in production

## Future Enhancements

Potential improvements for the logging system:

- [ ] Export logs to CSV/JSON
- [ ] Advanced filtering (date range, user, database)
- [ ] Real-time log streaming with WebSockets
- [ ] Log analytics dashboard with charts
- [ ] Email notifications for critical errors
- [ ] Log archival to external storage
- [ ] Search functionality within logs
- [ ] Log grouping by session/user

---

**Made with ❤️ for transparency and security**
