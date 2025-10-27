# qData Deployment Instructions

## Step-by-Step Deployment to Ubuntu VPS with Apache2 and MariaDB

### Prerequisites
- Ubuntu VPS with root/sudo access
- Domain (samcroston.com) pointing to your VPS IP
- Apache2 already installed and running

---

## 1. Initial Server Setup

```bash
# SSH into your VPS
ssh root@your_vps_ip

# Run the setup script
chmod +x deploy-setup.sh
./deploy-setup.sh
```

---

## 2. Secure MariaDB

```bash
sudo mysql_secure_installation
```

**Settings:**
- Set root password: `Password123` (or your choice)
- Switch to unix_socket authentication: **n**
- Remove anonymous users: **Y**
- Disallow root login remotely: **Y**
- Remove test database: **Y**
- Reload privilege tables: **Y**

---

## 3. Create Database and User

```bash
# Edit the password in setup-database.sql first
nano setup-database.sql
# Change 'your_secure_password_here' to your actual password

# Run the SQL script
sudo mysql -u root -p < setup-database.sql
# Enter the root password you set in step 2
```

---

## 4. Upload Your Files

```bash
# From your local machine, upload files to VPS
scp -r * root@your_vps_ip:/var/www/qdata/

# OR use git
cd /var/www/qdata
git clone https://github.com/scros18/qdata.git .
```

---

## 5. Configure Environment Variables

```bash
cd /var/www/qdata
nano .env.production
```

**Update these values:**
```env
DB_USER=qdata_user
DB_PASSWORD=your_secure_password_here  # Same as in setup-database.sql
SESSION_SECRET=generate_a_random_32_character_string_here
```

---

## 6. Install Dependencies and Build

```bash
cd /var/www/qdata
npm install
npm run build
```

---

## 7. Configure Apache

```bash
# Enable required modules (if not already enabled)
sudo a2enmod proxy proxy_http rewrite ssl

# Update your existing Apache config or create new one
sudo nano /etc/apache2/sites-available/samcroston.com.conf
```

Copy the content from `apache-qdata.conf` into your Apache configuration.

**Or add just the proxy rules to your existing VirtualHost:**
```apache
# Add these lines inside your existing <VirtualHost *:80> and <VirtualHost *:443>
ProxyPreserveHost On
ProxyPass /qdata http://localhost:3000/qdata
ProxyPassReverse /qdata http://localhost:3000/qdata
```

```bash
# Test Apache configuration
sudo apache2ctl configtest

# If OK, restart Apache
sudo systemctl restart apache2
```

---

## 8. Start Application with PM2

```bash
cd /var/www/qdata

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Enable PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs qdata
```

---

## 9. Verify Deployment

Visit: **https://samcroston.com/qdata**

You should see the qData login/setup screen.

---

## Useful Commands

```bash
# View application logs
pm2 logs qdata

# Restart application
pm2 restart qdata

# Stop application
pm2 stop qdata

# View Apache logs
sudo tail -f /var/logs/apache2/samcroston.com-error.log

# Rebuild after changes
cd /var/www/qdata
git pull
npm install
npm run build
pm2 restart qdata
```

---

## Troubleshooting

### Application not accessible
```bash
# Check PM2 status
pm2 status

# Check if app is listening on port 3000
sudo netstat -tulpn | grep 3000

# Check Apache proxy
sudo apache2ctl -M | grep proxy
```

### Database connection issues
```bash
# Test MariaDB connection
mysql -u qdata_user -p qdata

# Check MariaDB status
sudo systemctl status mariadb
```

### Permission issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/qdata

# Fix permissions
chmod -R 755 /var/www/qdata
```

---

## Security Checklist

- [ ] Changed default database password
- [ ] Generated random SESSION_SECRET
- [ ] Enabled firewall (ufw)
- [ ] SSL/TLS enabled (Certbot)
- [ ] Database only accessible from localhost
- [ ] Regular backups configured

---

## Need Help?

Check the logs:
- PM2: `pm2 logs qdata`
- Apache: `sudo tail -f /var/log/apache2/samcroston.com-error.log`
- MariaDB: `sudo tail -f /var/log/mysql/error.log`
