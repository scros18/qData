# 🚀 QData Quick Start - Authentication Edition

## ⚡ First-Time Setup (1 minute)

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:3000/qdata`

3. **Create Admin Account:**
   - Username: `admin` (or your choice)
   - Password: `MySecurePass123!` (min 8 chars)
   - PIN: `123456` (4-6 digits)
   - Click "Create Admin Account"

4. **Done!** Your admin account is created 🎉

---

## 🔐 Daily Login Flow

1. **Go to:** `/qdata`
2. **Enter:** Username & Password
3. **Click:** "Sign In"
4. **Enter:** Your PIN (the one you set)
5. **Access:** Full dashboard!

---

## 👥 Adding Team Members (Admin Only)

1. **Login as admin**
2. **Click "Users" tab** in header
3. **Click "+ Add User"**
4. **Fill in:**
   - Username for team member
   - Their password
   - Their PIN
5. **Click "Create User"**
6. **Share credentials** with team member securely
7. **They can login** with their own account!

---

## 🗄️ Database Connection (After Auth)

1. **After PIN verification**, you see the main dashboard
2. **Click "Connect to Database"**
3. **Enter MySQL credentials:**
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: `your-mysql-password`
4. **Click "Connect"**
5. **Browse databases!**

---

## 🔑 Default Credentials (Example)

**Admin Account (You Create):**
- Username: `admin`
- Password: `SecurePass123`
- PIN: `123456`

**MySQL Connection:**
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `root` (or your MySQL password)

---

## 🎯 Key Features

### ✅ Security Layers
1. **Username/Password** - First layer
2. **PIN Verification** - Second layer
3. **Session Management** - 24-hour expiry
4. **Encrypted Storage** - PBKDF2-SHA512

### ✅ User Roles
- **Admin** - Can create users, manage everything
- **User** - Can access databases, no user management

### ✅ What's Protected
- `/qdata` route requires authentication
- All database operations require valid session
- PIN required on every login
- All API endpoints check authentication

---

## 📱 Mobile Support

- ✅ PIN pad with number buttons on mobile
- ✅ Touch-friendly inputs
- ✅ Responsive design
- ✅ Auto-focus and auto-advance

---

## 🛡️ Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| Password Encryption | ✅ | PBKDF2-SHA512, 100k iterations |
| PIN Security | ✅ | PBKDF2-SHA512, 50k iterations |
| Session Tokens | ✅ | 64-char random hex |
| HTTP-Only Cookies | ✅ | Not accessible via JS |
| Auto Logout | ✅ | 24-hour expiration |
| Git-Ignored Data | ✅ | Credentials never committed |

---

## 🔥 Cool Features

1. **Animated Backgrounds** - Beautiful gradients
2. **Shake on Error** - PIN box shakes if wrong
3. **Auto-Submit** - PIN submits when complete
4. **Mobile Number Pad** - On-screen keyboard
5. **Show/Hide Password** - Toggle visibility
6. **Real-time Validation** - Instant feedback
7. **User Cards** - Beautiful user management
8. **Logout Button** - In header (top-right)

---

## 📊 File Locations

**Your Data (Git-Ignored):**
```
qData/
└── data/
    ├── users.json      # Your accounts (encrypted)
    └── sessions.json   # Active logins
```

**IMPORTANT:** Never commit the `/data/` folder!

---

## 🆘 Troubleshooting

### Problem: "Can't see setup screen"
**Solution:** 
```bash
# Delete data folder to reset
rm -rf data/
# Restart app
npm run dev
```

### Problem: "Wrong PIN"
**Solution:** 
- Check for typos
- PIN is the one YOU set during setup
- Only numbers allowed (4-6 digits)

### Problem: "Session expired"
**Solution:** 
- Just login again
- Sessions last 24 hours
- Normal behavior

### Problem: "Forgot admin password"
**Solution:** 
```bash
# Nuclear option - deletes all users
rm data/users.json
# Now setup again from scratch
```

---

## 🎨 UI Colors

- **Emerald Green** (`#10b981`) - Admin/Success
- **Blue** (`#3b82f6`) - Regular users
- **Red** (`#ef4444`) - Errors/Logout
- **Slate** (`#1e293b`) - Background
- **Amber** (`#f59e0b`) - Warnings

---

## 💡 Pro Tips

1. **Use Strong Passwords**
   - Min 12 characters
   - Mix letters, numbers, symbols
   - Don't reuse passwords

2. **PIN Best Practices**
   - Don't use obvious PINs (1234, 0000)
   - Don't share your PIN
   - Different from birthday/phone

3. **Team Management**
   - Create individual accounts for team
   - Don't share the admin password
   - Disable users when they leave

4. **Backups**
   ```bash
   # Backup your users
   cp data/users.json data/users.backup.json
   ```

5. **Production Deployment**
   - Use HTTPS (required!)
   - Set strong passwords
   - Use firewall rules
   - Monitor sessions

---

## 📞 Support

If you encounter issues:
1. Check `AUTHENTICATION.md` for detailed docs
2. Check `TROUBLESHOOTING.md` for solutions
3. Review `SECURITY.md` for best practices

---

## 🎉 You're All Set!

QData is now secured with **enterprise-grade authentication**. No one can access your database admin panel without proper credentials!

**Login → Enter PIN → Manage Databases** 🚀

Enjoy your secure, beautiful database management tool! ✨

