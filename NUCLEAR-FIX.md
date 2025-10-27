# 🚨 NUCLEAR OPTION - Force Remove Everything

Your system is completely borked. Here's the aggressive fix:

## Step 1: Force Kill Everything

```bash
# Kill all MySQL/MariaDB processes
sudo killall -9 mysqld mysqld_safe mariadbd 2>/dev/null

# Stop all database services
sudo systemctl stop mysql mariadb plesk-mysql 2>/dev/null
sudo systemctl disable mysql mariadb plesk-mysql 2>/dev/null
```

## Step 2: Force Remove Plesk MySQL

```bash
# Remove Plesk's MySQL/MariaDB
sudo apt remove --purge plesk-mysql plesk-mariadb -y 2>/dev/null
sudo apt remove --purge psa-* -y 2>/dev/null
```

## Step 3: Nuclear Package Removal

```bash
# Force remove all MySQL/MariaDB packages
sudo dpkg --force-all --purge mysql-server mysql-client mysql-common mariadb-server mariadb-client 2>/dev/null
sudo dpkg --force-all --purge mysql-server-core-* mysql-client-core-* mariadb-server-* mariadb-client-* 2>/dev/null
sudo dpkg --force-all --purge libmysql* libmariadb* 2>/dev/null

# Clean up
sudo apt autoremove -y --purge
sudo apt autoclean
```

## Step 4: Force Delete All Database Files

```bash
# Delete EVERYTHING
sudo rm -rf /var/lib/mysql*
sudo rm -rf /var/lib/mariadb
sudo rm -rf /etc/mysql*
sudo rm -rf /etc/mariadb
sudo rm -rf /var/run/mysqld
sudo rm -rf /var/log/mysql*
sudo rm -rf /var/log/mariadb
sudo rm -rf /usr/sbin/mysqld
sudo rm -rf /usr/bin/mysql*
sudo rm -rf /usr/share/mysql*
```

## Step 5: Fix Broken Packages Aggressively

```bash
# Force fix
sudo dpkg --configure -a --force-all
sudo apt --fix-broken install -y --force-yes 2>/dev/null
sudo apt clean
sudo apt update --fix-missing
```

## Step 6: Install Using Docker (EASIEST!)

Since your system is messed up, **use Docker instead**:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Run MySQL in Docker (isolated from system)
sudo docker run -d \
  --name qdata-mysql \
  --restart unless-stopped \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=MySecurePassword123! \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0

# Wait 10 seconds for MySQL to start
sleep 10

# Test it
sudo docker exec qdata-mysql mysql -u root -pMySecurePassword123! -e "SELECT 'MySQL is working!' as Status;"
```

**✅ Done! MySQL is running in Docker on port 3306**

### Use These Credentials in QData:
- **Host:** `localhost` (or your VPS IP)
- **Port:** `3306`
- **User:** `root`
- **Password:** `MySecurePassword123!` (or whatever you set)
- **Database:** (leave empty)

---

## 🎯 FULL DOCKER SETUP (Copy-Paste All):

```bash
# Clean up system
sudo killall -9 mysqld mysqld_safe mariadbd 2>/dev/null
sudo systemctl stop mysql mariadb 2>/dev/null
sudo rm -rf /var/lib/mysql* /etc/mysql* /var/run/mysqld

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Run MySQL
sudo docker run -d \
  --name qdata-mysql \
  --restart unless-stopped \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=MySecurePassword123! \
  -v mysql-data:/var/lib/mysql \
  mysql:8.0

# Wait for startup
echo "Waiting for MySQL to start..."
sleep 15

# Enable remote root access
sudo docker exec qdata-mysql mysql -u root -pMySecurePassword123! -e "CREATE USER 'root'@'%' IDENTIFIED BY 'MySecurePassword123!';"
sudo docker exec qdata-mysql mysql -u root -pMySecurePassword123! -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;"
sudo docker exec qdata-mysql mysql -u root -pMySecurePassword123! -e "FLUSH PRIVILEGES;"

# Open firewall
sudo ufw allow 3306/tcp

# Test
sudo docker exec qdata-mysql mysql -u root -pMySecurePassword123! -e "SHOW DATABASES;"

echo ""
echo "✅ MySQL is running in Docker!"
echo "Use these credentials:"
echo "Host: localhost"
echo "Port: 3306"
echo "User: root"
echo "Password: MySecurePassword123!"
```

**⚠️ Change `MySecurePassword123!` to your own password in ALL places!**

---

## 🎉 Why Docker is Better:

1. ✅ **Isolated from system** - won't conflict with Plesk
2. ✅ **Easy to remove** - just `sudo docker rm -f qdata-mysql`
3. ✅ **Always works** - no dependency issues
4. ✅ **Easy to backup** - volumes are separate
5. ✅ **Easy to restart** - `sudo docker restart qdata-mysql`

---

## 📋 Useful Docker Commands:

```bash
# Check if running
sudo docker ps | grep qdata-mysql

# View logs
sudo docker logs qdata-mysql

# Restart MySQL
sudo docker restart qdata-mysql

# Stop MySQL
sudo docker stop qdata-mysql

# Start MySQL
sudo docker start qdata-mysql

# Connect to MySQL
sudo docker exec -it qdata-mysql mysql -u root -p

# Remove MySQL (if needed)
sudo docker stop qdata-mysql
sudo docker rm qdata-mysql
sudo docker volume rm mysql-data
```

---

## 🚀 After Docker MySQL is Running:

```bash
cd ~/qdata
./deploy-qdata.sh
```

Then open: `http://YOUR_VPS_IP:3000/qdata`

Connect with:
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `MySecurePassword123!`

---

## 💡 THIS IS THE EASIEST SOLUTION!

Docker completely bypasses your broken system packages. Just run the Docker commands above and you're done! 🎉
