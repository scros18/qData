# 🎉 MySQL Installed on Windows!

## ✅ Installation Complete

MySQL 8.4.6 has been installed on your Windows PC!

## 🔧 Setup Instructions

### Step 1: Check MySQL Service

```powershell
# Check if MySQL service is running
Get-Service -Name MySQL* | Format-Table -AutoSize

# Start MySQL if not running
Start-Service -Name MySQL84
```

### Step 2: Set Root Password

Open **Command Prompt as Administrator** and run:

```cmd
cd "C:\Program Files\MySQL\MySQL Server 8.4\bin"

mysql -u root --skip-password

# In MySQL prompt, run:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Test Connection

```cmd
mysql -u root -p
# Enter password: root
```

### Step 4: Create Test Database

```sql
CREATE DATABASE test_db;
USE test_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Wilson', 'bob@example.com');

SELECT * FROM users;
EXIT;
```

---

## 🚀 Run QData Locally

### 1. Start the Dev Server

In VS Code terminal:

```powershell
cd "C:\Users\scros\New folder\qData"
npm install
npm run dev
```

### 2. Open QData

Open browser: **http://localhost:3000/qdata**

### 3. Connect to MySQL

In the connection dialog, use:

```
Host: localhost
Port: 3306
User: root
Password: root
Database: (leave empty or type "test_db")
```

### 4. Click Connect!

You should see all your databases including the test_db with the users table! 🎉

---

## 🎯 Your QData Credentials:

```yaml
Host: localhost
Port: 3306
User: root
Password: root
```

---

## 🔥 Quick Start Commands:

```powershell
# Start MySQL
Start-Service MySQL84

# Stop MySQL
Stop-Service MySQL84

# Restart MySQL
Restart-Service MySQL84

# Check MySQL Status
Get-Service MySQL84

# Connect to MySQL
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p
```

---

## 📝 Next Steps:

1. ✅ MySQL installed
2. ⏳ Set root password (see Step 2 above)
3. ⏳ Run `npm run dev` in this folder
4. ⏳ Open http://localhost:3000/qdata
5. ⏳ Connect with localhost:3306, root/root

Let's test it now! 🚀
