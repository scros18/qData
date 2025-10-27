# 🔧 Fix MySQL Installation - Broken Dependencies

## The Problem:
Your system has broken package dependencies. MySQL can't install because some packages are in a bad state.

## ✅ THE FIX - Run These Commands:

### Step 1: Fix Broken Packages

```bash
# Fix dpkg interruptions
sudo dpkg --configure -a

# Fix broken dependencies
sudo apt --fix-broken install -y

# Clean package cache
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y
```

### Step 2: Update System Properly

```bash
# Update package lists
sudo apt update

# Upgrade any held packages
sudo apt upgrade -y
```

### Step 3: Remove MySQL Completely (Clean Slate)

```bash
# Stop MySQL if running
sudo systemctl stop mysql 2>/dev/null

# Kill any MySQL processes
sudo killall -9 mysqld 2>/dev/null

# Remove all MySQL packages
sudo apt purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-* -y
sudo apt purge libmysql* -y
sudo apt autoremove -y
sudo apt autoclean

# Delete MySQL directories
sudo rm -rf /var/lib/mysql
sudo rm -rf /var/log/mysql
sudo rm -rf /etc/mysql
sudo rm -rf /var/run/mysqld
```

### Step 4: Install MySQL Fresh

```bash
# Update again
sudo apt update

# Install MySQL
sudo apt install -y mysql-server

# Check installation status
sudo systemctl status mysql
```

### Step 5: If Step 4 Still Fails, Try This Alternative:

```bash
# Install specific version
sudo apt install -y mysql-server-8.0

# OR download and install manually
wget https://dev.mysql.com/get/mysql-apt-config_0.8.29-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.29-1_all.deb
sudo apt update
sudo apt install -y mysql-server
```

### Step 6: Start MySQL

```bash
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

**You should see "active (running)" now!**

### Step 7: Set Password

```bash
# Login to MySQL
sudo mysql

# In MySQL prompt, run these:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MyPassword123!';
CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'MyPassword123!';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

**⚠️ Replace `MyPassword123!` with your own password!**

### Step 8: Configure Remote Access

```bash
# Edit config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find: bind-address = 127.0.0.1
# Change to: bind-address = 0.0.0.0

# Save: CTRL+X, Y, ENTER
```

**OR use this one-liner:**

```bash
sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
```

### Step 9: Restart and Open Firewall

```bash
sudo systemctl restart mysql
sudo ufw allow 3306/tcp
```

### Step 10: Test It

```bash
mysql -u root -p
```

**Enter your password. Type `EXIT;` when done.**

---

## 🚀 Full Copy-Paste Script (All at Once):

```bash
# Fix system first
sudo dpkg --configure -a
sudo apt --fix-broken install -y
sudo apt clean && sudo apt autoremove -y

# Remove MySQL completely
sudo systemctl stop mysql 2>/dev/null
sudo killall -9 mysqld 2>/dev/null
sudo apt purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-* libmysql* -y
sudo apt autoremove -y
sudo rm -rf /var/lib/mysql /var/log/mysql /etc/mysql /var/run/mysqld

# Install fresh
sudo apt update
sudo apt install -y mysql-server

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Set your password (CHANGE MyPassword123!)
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MyPassword123!';"
sudo mysql -e "CREATE USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'MyPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configure remote access
sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo systemctl restart mysql
sudo ufw allow 3306/tcp

# Test
echo "Testing MySQL connection..."
mysql -u root -pMyPassword123! -e "SELECT 'MySQL is working!' as Status;"
```

**⚠️ Replace BOTH instances of `MyPassword123!` with your password before running!**

---

## 🆘 If STILL Not Working:

### Option A: Use Docker Instead

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Run MySQL in Docker
sudo docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=MyPassword123! \
  -v mysql-data:/var/lib/mysql \
  --restart unless-stopped \
  mysql:8.0

# Test it
sudo docker exec -it mysql mysql -u root -pMyPassword123! -e "SELECT 'Working!' as Status;"
```

### Option B: Use MariaDB Instead (MySQL Alternative)

```bash
# Install MariaDB (MySQL compatible)
sudo apt update
sudo apt install -y mariadb-server

# Start it
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Set password
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'MyPassword123!' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configure
sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf
sudo systemctl restart mariadb
sudo ufw allow 3306/tcp
```

**MariaDB works exactly the same as MySQL for QData!**

---

## 🎯 After MySQL Works:

```bash
cd ~/qdata
./deploy-qdata.sh
```

Then connect at: `http://YOUR_VPS_IP:3000/qdata`

Use:
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: Whatever you set above

---

## 💡 My Recommendation:

**Use Option B (MariaDB)** - it's more stable and doesn't have dependency issues like MySQL.

Just run:
```bash
sudo apt update
sudo apt install -y mariadb-server
sudo systemctl start mariadb
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyPassword123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'MyPassword123!' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"
sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf
sudo systemctl restart mariadb
sudo ufw allow 3306/tcp
```

**Done! Much easier.** 🎉
