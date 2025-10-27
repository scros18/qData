# 🔧 MySQL Installation Failed - Fix Guide

## ❌ Error You're Seeing:

```
Job for mysql.service failed because the control process exited with error code.
See "systemctl status mysql.service" and "journalctl -xeu mysql.service" for details.
```

## 🎯 Quick Fix Steps:

### Step 1: Check What Went Wrong

Run these commands on your VPS:

```bash
# Check MySQL service status
sudo systemctl status mysql.service

# Check detailed error logs
sudo journalctl -xeu mysql.service | tail -50

# Check MySQL error log
sudo tail -100 /var/log/mysql/error.log
```

### Step 2: Common Issues & Solutions

#### Issue A: MySQL Already Installed/Conflicting

**Check if MySQL is already installed:**
```bash
sudo dpkg -l | grep mysql
```

**Solution - Clean install:**
```bash
# Stop any running MySQL
sudo systemctl stop mysql

# Remove existing MySQL completely
sudo apt remove --purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-*
sudo apt autoremove
sudo apt autoclean

# Remove old data (CAREFUL: This deletes databases!)
sudo rm -rf /var/lib/mysql
sudo rm -rf /etc/mysql

# Reinstall
sudo apt update
sudo apt install -y mysql-server

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Issue B: Port 3306 Already in Use

**Check what's using port 3306:**
```bash
sudo netstat -tulpn | grep 3306
# OR
sudo lsof -i :3306
```

**Solution - Kill the process:**
```bash
# If something else is using port 3306
sudo kill -9 [PID_FROM_ABOVE]

# Then restart MySQL
sudo systemctl start mysql
```

#### Issue C: Disk Space Full

**Check disk space:**
```bash
df -h
```

**Solution - Free up space:**
```bash
# Clean package cache
sudo apt clean
sudo apt autoremove

# Remove old logs
sudo journalctl --vacuum-time=3d
```

#### Issue D: Permissions Problem

**Fix MySQL data directory permissions:**
```bash
sudo chown -R mysql:mysql /var/lib/mysql
sudo chmod 750 /var/lib/mysql

# Restart MySQL
sudo systemctl start mysql
```

#### Issue E: AppArmor Blocking MySQL

**Check AppArmor status:**
```bash
sudo aa-status | grep mysql
```

**Solution - Temporarily disable:**
```bash
sudo systemctl stop apparmor
sudo systemctl start mysql

# If this works, permanently fix:
sudo aa-complain /usr/sbin/mysqld
sudo systemctl start apparmor
sudo systemctl restart mysql
```

### Step 3: Manual MySQL Setup

If automatic installation keeps failing, do it manually:

```bash
# 1. Install MySQL
sudo apt update
sudo apt install -y mysql-server

# 2. Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 3. Check it's running
sudo systemctl status mysql

# 4. Secure MySQL (run this command and follow prompts)
sudo mysql_secure_installation
```

**During mysql_secure_installation:**
- Validate Password Component? **Y**
- Password Validation Level? **2** (STRONG)
- Set root password? **Y** - Enter a strong password
- Remove anonymous users? **Y**
- Disallow root login remotely? **N** (we need this for QData)
- Remove test database? **Y**
- Reload privileges? **Y**

### Step 4: Create QData Admin User Manually

```bash
# Login to MySQL as root
sudo mysql -u root -p

# In MySQL prompt, run these commands:
```

```sql
-- Create the qdata_admin user with a strong password
CREATE USER 'qdata_admin'@'%' IDENTIFIED BY 'YOUR_STRONG_PASSWORD_HERE';

-- Grant all privileges
GRANT ALL PRIVILEGES ON *.* TO 'qdata_admin'@'%' WITH GRANT OPTION;

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify user was created
SELECT User, Host FROM mysql.user WHERE User IN ('root', 'qdata_admin');

-- Exit
EXIT;
```

### Step 5: Configure MySQL for Remote Access

```bash
# Edit MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find this line:
# bind-address = 127.0.0.1

# Change it to:
# bind-address = 0.0.0.0

# Save (CTRL+X, Y, ENTER)

# Restart MySQL
sudo systemctl restart mysql

# Open firewall
sudo ufw allow 3306/tcp
```

### Step 6: Test MySQL Connection

```bash
# Test local connection
mysql -u qdata_admin -p

# Test root connection
sudo mysql -u root -p

# If both work, you're good!
```

## 🚀 After MySQL is Working:

### Continue with Deployment:

```bash
# Go to qdata directory
cd ~/qdata

# Run the deployment script
./deploy-qdata.sh
```

## 🔍 Quick Diagnostic Script

Create this script to check everything:

```bash
cat > check_mysql.sh << 'EOF'
#!/bin/bash

echo "=== MySQL Diagnostic Check ==="
echo ""

echo "1. MySQL Service Status:"
sudo systemctl status mysql --no-pager

echo ""
echo "2. Port 3306 Status:"
sudo netstat -tulpn | grep 3306 || echo "Nothing on port 3306"

echo ""
echo "3. Disk Space:"
df -h | grep -E "Filesystem|/$"

echo ""
echo "4. MySQL Process:"
ps aux | grep mysql | grep -v grep || echo "MySQL not running"

echo ""
echo "5. MySQL Error Log (last 20 lines):"
sudo tail -20 /var/log/mysql/error.log 2>/dev/null || echo "No error log found"

echo ""
echo "6. MySQL Data Directory:"
ls -la /var/lib/mysql 2>/dev/null || echo "No data directory found"

echo ""
echo "=== End of Diagnostics ==="
EOF

chmod +x check_mysql.sh
./check_mysql.sh
```

## 📝 What to Send Me:

If you still can't fix it, send me the output of:

```bash
# Run these and send me the output:
sudo systemctl status mysql
sudo journalctl -xeu mysql.service | tail -50
sudo tail -50 /var/log/mysql/error.log
df -h
```

## 🎯 Most Likely Issues (in order):

1. **MySQL already partially installed** - Solution: Clean reinstall (Issue A)
2. **Permissions problem** - Solution: Fix ownership (Issue D)
3. **Port conflict** - Solution: Kill conflicting process (Issue B)
4. **Disk full** - Solution: Free space (Issue C)
5. **AppArmor blocking** - Solution: Adjust AppArmor (Issue E)

## ⚡ Quick Try First:

```bash
# Try this quick fix first:
sudo systemctl stop mysql
sudo killall -9 mysqld 2>/dev/null
sudo rm -rf /var/run/mysqld
sudo mkdir /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
sudo systemctl start mysql
sudo systemctl status mysql
```

If that works, you can continue with the manual user creation (Step 4).

## 💡 Pro Tip:

Many VPS providers (like DigitalOcean, Linode) offer MySQL pre-installed images. If you keep having issues, consider:

1. Using a fresh VPS with MySQL pre-installed
2. OR use Docker to run MySQL (I can help with this)
3. OR use a managed MySQL service (like AWS RDS, DigitalOcean Managed DB)

---

**Let me know which error you see when you run:**
```bash
sudo journalctl -xeu mysql.service | tail -50
```

I'll help you fix the specific issue! 🔧
