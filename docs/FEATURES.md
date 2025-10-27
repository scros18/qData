# QData - Feature Summary

## ✨ Key Features

### 🎨 Beautiful Terminal-Style UI
- **PuTTY-inspired design** with macOS window controls (red/yellow/green dots)
- **Emerald green `mysql>` prompt** for authentic terminal feel
- **Dark theme optimized** for developers
- **Minimalistic and clean** - no branding clutter
- **Fully responsive** - perfect on mobile and desktop

### 💾 Database Management
- **Connect to MySQL** with saved credentials
- **View all databases** with real-time search
- **Browse tables** with click-to-view
- **Pagination support** (50 rows per page)
- **View table structure** with column details

### ✏️ Inline Editing
- **Double-click any cell** to edit (except system columns)
- **Keyboard shortcuts**: Enter to save, Escape to cancel
- **Visual feedback** - edited rows highlighted in amber
- **Batch updates** - edit multiple rows, save all at once
- **Green save button** appears when changes are made
- **Protected columns** - id, created_at, updated_at, timestamp are read-only

### 🔍 SQL Query Editor
- **Write and execute** custom SQL queries
- **Ctrl/Cmd+Enter** to execute
- **Query timing** - see execution time in milliseconds
- **Copy query** to clipboard
- **Clear query** with one click
- **CSV export** of query results
- **Sample queries** - pre-made templates to get started
- **Syntax highlighting** with monospace fonts
- **Security warnings** for dangerous operations (DROP, DELETE, etc.)

### 📱 Mobile Responsive
- **2-column grid** for databases on mobile
- **Touch-friendly buttons** with proper spacing
- **Responsive tables** with horizontal scroll
- **Icon-only mode** on small screens
- **Compact header** that adapts to screen size
- **Perfect layouts** on all screen sizes

### 🔒 Security Features
- **SQL injection prevention** - all queries parameterized
- **Dangerous query warnings** - confirms before DROP/DELETE/TRUNCATE/ALTER
- **Input validation** on all API endpoints
- **Connection state checking** - prompts reconnection if lost
- **No SEO metadata** - not indexed by search engines
- **Protected system columns** - prevents accidental corruption
- **Error handling** without leaking sensitive info

### ⚡ Performance
- **Connection pooling** - efficient database connections
- **Hot reload persistence** - connection survives Next.js HMR
- **Optimized queries** - only fetches what's needed
- **Lazy loading** - data loaded on demand
- **Fast pagination** - instant page switching

## 🎯 Perfect For

- **Developers** who need quick database access
- **DevOps teams** managing multiple databases
- **Local development** environments
- **Internal tools** and admin panels
- **Learning SQL** with sample queries
- **Anyone tired of PHPMyAdmin** 😄

## 🚀 Usage

### Connect to Database
1. Open QData at `/qdata`
2. Enter MySQL credentials (default: localhost:3306, root/root)
3. Click Connect

### Browse Data
1. Search for a database in the sidebar
2. Click a database to see its tables
3. Click a table to view data
4. Use pagination to navigate through rows

### Edit Data
1. Double-click any cell (except ID/timestamps)
2. Edit the value
3. Press Enter or click away to stage change
4. Edited rows turn amber/yellow
5. Click green "Save Changes" button to persist
6. Or click "Cancel" to revert

### Run SQL Queries
1. Click the "Query" tab
2. Type your SQL query
3. Press Ctrl+Enter or click Execute
4. View results in table format
5. Export to CSV if needed
6. Use sample queries for inspiration

## 📊 Sample Queries Included

1. **Show All Databases** - `SHOW DATABASES;`
2. **Describe Table** - `DESCRIBE table_name;`
3. **Select with Limit** - `SELECT * FROM table_name LIMIT 10;`
4. **Count Rows** - `SELECT COUNT(*) as total FROM table_name;`

## 🎨 UI Highlights

### Color Scheme
- **Background**: Slate 950/900 (dark charcoal)
- **Text**: White and Slate 400 (light gray)
- **Accent**: Emerald 500 (terminal green)
- **Success**: Green gradient
- **Error**: Red 500
- **Warning**: Amber 500
- **Info**: Blue 500

### Typography
- **Monospace**: For SQL, terminal, and data
- **Sans-serif**: For UI elements and labels
- **Responsive sizes**: xs on mobile, sm/base on desktop

### Interactive Elements
- **Hover effects**: All clickable items have hover states
- **Loading states**: Spinners for async operations
- **Toast notifications**: Success/error feedback
- **Smooth transitions**: Animations on state changes

## 🛠️ Technical Stack

- **Next.js 14** - App Router with TypeScript
- **React 18** - Modern hooks and patterns
- **TailwindCSS** - Utility-first responsive design
- **MySQL2** - Fast MySQL client with promises
- **shadcn/ui** - Beautiful accessible components
- **Lucide Icons** - Consistent icon set
- **TanStack Query** - Data fetching and caching

## 📁 Project Structure

```
qData/
├── app/
│   ├── api/              # API routes
│   │   ├── connect/      # Database connection
│   │   ├── databases/    # List databases
│   │   ├── tables/       # List tables
│   │   ├── table-data/   # Get table rows
│   │   ├── table-structure/ # Get columns
│   │   ├── query/        # Execute SQL
│   │   └── update-row/   # Update cell data
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── connection-dialog.tsx    # Login modal
│   ├── database-dashboard.tsx   # Main UI
│   ├── query-editor.tsx         # SQL terminal
│   ├── table-browser.tsx        # Table list
│   ├── table-data-viewer.tsx    # Data grid with editing
│   └── ui/               # shadcn components
├── lib/
│   ├── database.ts       # MySQL connection logic
│   └── utils.ts          # Utility functions
└── SECURITY.md           # Security documentation
```

## 🎓 Learning Resources

The codebase is well-commented and organized for learning:
- Study `lib/database.ts` for MySQL connection patterns
- Check `components/query-editor.tsx` for terminal UI design
- Review `components/table-data-viewer.tsx` for inline editing
- Explore API routes for backend structure

## 🔮 Future Ideas

- [ ] Dark/Light theme toggle
- [ ] Multiple database connections
- [ ] Query history
- [ ] Saved queries/favorites
- [ ] Visual query builder
- [ ] Import CSV data
- [ ] Backup/Export databases
- [ ] User authentication
- [ ] Role-based permissions
- [ ] Audit logging
- [ ] Database diff/compare tools

## 📝 Notes

- **Local development**: Best used in trusted environments
- **Not for production**: Implement authentication before public deployment
- **Open source**: MIT License - modify and share freely
- **Community**: Contributions and feedback welcome

---

**Made with ❤️ for developers who love clean, functional tools**
