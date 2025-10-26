# QData - Modern MySQL Admin Panel

> Simple, beautiful, and open source MySQL database management

![QData Screenshot](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) ![MySQL](https://img.shields.io/badge/MySQL-Ready-orange?style=flat-square&logo=mysql)

## ✨ Features

- 🚀 **Fast & Lightweight** - Built with Next.js 14 for optimal performance
- 🎨 **Modern UI** - Clean, intuitive interface with dark mode support
- 📊 **Database Management** - Browse databases, tables, and run queries
- 🔒 **Secure** - Direct connection to your MySQL server (no cloud services)
- 💻 **Developer Friendly** - Designed for developers, by developers
- ⚡ **Real-time** - Instant query execution and results
- 🌙 **Dark Mode** - Beautiful dark theme by default

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MySQL server running (local or remote)
- MySQL credentials (host, port, username, password)

### Installation

```bash
# Clone or download the repository
cd qData

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000/qdata` to access QData

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔌 Connecting to MySQL

When you first open QData, you'll see the connection dialog. Enter:

- **Host**: Your MySQL server address (e.g., `localhost`, `127.0.0.1`, or IP address)
- **Port**: MySQL port (default: `3306`)
- **Username**: Your MySQL username (e.g., `root`)
- **Password**: Your MySQL password
- **Database**: (Optional) Specific database name, or leave empty to see all databases

### Example for Local Development

```
Host: localhost
Port: 3306
User: root
Password: your_password
Database: (leave empty)
```

### Example for Remote VPS (like BlissHairStudio)

```
Host: your-vps-ip-address
Port: 3306
User: root
Password: your_mysql_password
Database: (leave empty or specific database name)
```

## 🛡️ Security Notes

⚠️ **Important**: QData connects directly to your MySQL server.

**Best Practices:**

- ✅ Only use on trusted networks
- ✅ Use firewall rules to restrict MySQL access
- ✅ Consider using MySQL users with limited permissions
- ✅ Never expose your MySQL server to the public internet without proper security
- ✅ Use SSH tunneling for remote connections when possible
- ✅ Keep your MySQL server updated

**For Production Use:**

```bash
# Create a read-only MySQL user for safer browsing
CREATE USER 'qdata_readonly'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT ON *.* TO 'qdata_readonly'@'localhost';
FLUSH PRIVILEGES;
```

## 📁 Running on /qdata Route

QData is configured to run on the `/qdata` route by default, making it easy to integrate into existing applications.

To change the base path, edit `next.config.mjs`:

```javascript
basePath: '/your-custom-path',
assetPrefix: '/your-custom-path/',
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: MySQL2 with connection pooling
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout

## 📦 Project Structure

```
qData/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── connect/       # Database connection
│   │   ├── databases/     # List databases
│   │   └── query/         # Execute queries
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── database-dashboard.tsx
│   ├── connection-dialog.tsx
│   ├── query-editor.tsx
│   └── table-browser.tsx
├── lib/                  # Utilities
│   ├── database.ts       # MySQL connection logic
│   └── utils.ts          # Helper functions
└── hooks/                # Custom React hooks
```

## 🎯 Roadmap

- [x] Database connection management
- [x] Modern, beautiful UI
- [x] Dark mode support
- [ ] Database browser
- [ ] Table data viewer with pagination
- [ ] Visual query builder
- [ ] SQL query editor with syntax highlighting
- [ ] Query history
- [ ] Export data (SQL, CSV, JSON)
- [ ] Import data
- [ ] Table structure editor
- [ ] Multi-database support
- [ ] Query templates
- [ ] Performance monitoring

## 🤝 Contributing

Contributions are welcome! This is an open-source project aimed at making MySQL management easier for developers.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use in your projects!

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Icons from Lucide
- Inspired by the need for a modern, developer-friendly MySQL admin tool

---

**Made with ❤️ for the developer community**

If this project helps you, consider giving it a ⭐ on GitHub!
