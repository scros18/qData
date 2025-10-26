# QData - BlissHairStudio VPS Deployment Guide

## Quick Deployment Steps

### Step 1: Upload Files to VPS

```bash
# From your local machine
scp -r qData/ user@your-vps-ip:/home/user/

# Or use Git
ssh user@your-vps-ip
cd /home/user
git clone YOUR_REPO_URL qData
cd qData
```

### Step 2: Run Installation Script

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to qData directory
cd qData

# Make scripts executable
chmod +x install-mysql.sh
chmod +x deploy-qdata.sh

# Run MySQL installation (this will install MySQL and generate passwords)
./install-mysql.sh

# IMPORTANT: Copy the credentials displayed and save them securely!
# The credentials are also saved in ~/qdata-credentials.txt
```

### Step 3: Deploy QData Application

```bash
# After MySQL is installed, deploy the application
./deploy-qdata.sh

# Follow the prompts:
# - Nginx setup (recommended for production)
# - Domain configuration (optional)
# - SSL with Let's Encrypt (optional)
```

## What Gets Installed

✅ **MySQL 8.0**
- Root user with secure password
- qdata_admin user for database management
- Configured for remote access

✅ **Node.js 20.x LTS**
- Latest stable version
- npm package manager

✅ **PM2 Process Manager**
- Keeps QData running 24/7
- Auto-restart on crashes
- Starts on system boot

✅ **Nginx (Optional)**
- Reverse proxy for production
- SSL/HTTPS support
- Domain configuration

✅ **Firewall (UFW)**
- SSH (port 22)
- HTTP (port 80)
- HTTPS (port 443)
- MySQL (port 3306)

## Access QData

### After Deployment:

**With Nginx + Domain:**
```
https://admin.blisshairstudio.com/qdata
```

**Direct Access:**
```
http://YOUR_VPS_IP:3000/qdata
```

**MySQL Connection in QData:**
- Host: `localhost` (from VPS) or `YOUR_VPS_IP` (from local)
- Port: `3306`
- Username: `qdata_admin` or `root`
- Password: (from credentials file)
- Database: (leave empty to see all)

## Management Commands

### PM2 Commands
```bash
pm2 status              # Check if QData is running
pm2 logs qdata          # View real-time logs
pm2 restart qdata       # Restart the application
pm2 stop qdata          # Stop the application
pm2 start qdata         # Start the application
pm2 monit               # Monitor resources
```

### MySQL Commands
```bash
# Access MySQL
mysql -u root -p
mysql -u qdata_admin -p

# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# View MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Nginx Commands (if installed)
```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Can't Access QData

1. **Check if QData is running:**
   ```bash
   pm2 status
   pm2 logs qdata
   ```

2. **Check firewall:**
   ```bash
   sudo ufw status
   ```

3. **Check if port 3000 is listening:**
   ```bash
   sudo netstat -tlnp | grep 3000
   ```

### MySQL Connection Issues

1. **Check MySQL is running:**
   ```bash
   sudo systemctl status mysql
   ```

2. **Test MySQL connection:**
   ```bash
   mysql -u qdata_admin -p
   ```

3. **Check MySQL is listening:**
   ```bash
   sudo netstat -tlnp | grep 3306
   ```

4. **Check user permissions:**
   ```bash
   mysql -u root -p
   SELECT user, host FROM mysql.user;
   ```

### View Credentials Again

```bash
cat ~/qdata-credentials.txt
```

## Security Best Practices

### For Production:

1. **Restrict MySQL Access:**
   ```bash
   # Only allow localhost
   sudo ufw delete allow 3306
   ```

2. **Use SSH Tunnel for Remote Access:**
   ```bash
   # From local machine
   ssh -L 3306:localhost:3306 user@your-vps-ip
   ```

3. **Set up SSL/HTTPS:**
   ```bash
   sudo certbot --nginx -d admin.blisshairstudio.com
   ```

4. **Regular Backups:**
   ```bash
   # Backup all databases
   mysqldump -u root -p --all-databases > backup.sql
   ```

5. **Update Regularly:**
   ```bash
   sudo apt update && sudo apt upgrade
   npm update
   ```

## Updating QData

```bash
# Pull latest changes
cd ~/qData
git pull

# Rebuild and restart
npm install
npm run build
pm2 restart qdata
```

## Uninstallation

If you need to remove everything:

```bash
# Stop QData
pm2 delete qdata

# Remove MySQL
sudo apt remove --purge mysql-server mysql-client mysql-common
sudo apt autoremove
sudo rm -rf /etc/mysql /var/lib/mysql

# Remove Node.js
sudo apt remove --purge nodejs
sudo rm -rf /usr/local/lib/node_modules

# Remove application files
rm -rf ~/qData
```

## Support

- Check logs: `pm2 logs qdata`
- View README.md for features
- Check TESTING.md for local testing
- MySQL documentation: https://dev.mysql.com/doc/

---

**BlissHairStudio VPS - QData MySQL Admin Panel**

Deployed with ❤️ for easy database management
