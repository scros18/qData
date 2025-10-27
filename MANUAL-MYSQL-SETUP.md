# 🚀 Manual MySQL Setup - Simple Commands

## Copy and paste these commands one by one on your VPS:

### Step 1: Completely Remove MySQL (if exists)

```bash
sudo systemctl stop mysql
sudo apt remove --purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-* -y
sudo apt autoremove -y
sudo apt autoclean
sudo rm -rf /var/lib/mysql
sudo rm -rf /etc/mysql
```

### Step 2: Install MySQL Fresh

```bash
sudo apt update
sudo apt install -y mysql-server
```

### Step 3: Start MySQL

```bash
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

**You should see "active (running)" in green**

### Step 4: Set Root Password

```bash
sudo mysql
```

**You're now in MySQL. Copy/paste these SQL commands:**

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourPassword123!';
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'YourPassword123!';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

**Replace `YourPassword123!` with your own password** ⬆️

### Step 5: Configure for Remote Access

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**Find this line:**
```
bind-address = 127.0.0.1
```

**Change it to:**
```
bind-address = 0.0.0.0
```

**Save and exit:** Press `CTRL+X`, then `Y`, then `ENTER`

### Step 6: Restart MySQL

```bash
sudo systemctl restart mysql
```

### Step 7: Open Firewall

```bash
sudo ufw allow 3306/tcp
```

### Step 8: Test It Works

```bash
mysql -u root -p
```

**Enter your password. If you get "mysql>" prompt, it works!**

Type `EXIT;` to quit.

---

## 🎯 Your QData Connection Details:

When QData asks for connection details, use:

```
Host: localhost (or your VPS IP if connecting remotely)
Port: 3306
User: root
Password: YourPassword123! (or whatever you set)
Database: (leave empty)
```

---

## ⚡ Quick Copy-Paste Version (All Commands):

```bash
# Stop and remove MySQL
sudo systemctl stop mysql
sudo apt remove --purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-* -y
sudo apt autoremove -y
sudo rm -rf /var/lib/mysql
sudo rm -rf /etc/mysql

# Install fresh
sudo apt update
sudo apt install -y mysql-server

# Start it
sudo systemctl start mysql
sudo systemctl enable mysql

# Configure root user
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourPassword123!';"
sudo mysql -e "CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'YourPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configure for remote access
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# Restart
sudo systemctl restart mysql

# Open firewall
sudo ufw allow 3306/tcp

# Test
mysql -u root -p
```

**⚠️ Change `YourPassword123!` to your own strong password in the commands above!**

---

## ✅ Done!

Your MySQL is ready. Now deploy QData:

```bash
cd ~/qdata
./deploy-qdata.sh
```

Then open: `http://YOUR_VPS_IP:3000/qdata`

Use the password you set above! 🎉
