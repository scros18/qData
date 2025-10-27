#!/bin/bash

# qData Deployment Setup Script for Ubuntu VPS with Apache2
# Run this script on your Ubuntu VPS

echo "========================================="
echo "qData Deployment Setup"
echo "========================================="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Install MariaDB
echo "Installing MariaDB..."
sudo apt install mariadb-server -y

# Secure MariaDB
echo "Securing MariaDB..."
echo "Please run: sudo mysql_secure_installation"
echo "Set root password, remove anonymous users, disallow root remote login"

# Enable Apache modules
echo "Enabling Apache proxy modules..."
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod ssl

# Create qData directory
echo "Creating qData directory..."
sudo mkdir -p /var/www/qdata
sudo chown $USER:$USER /var/www/qdata

# Create logs directory
mkdir -p /var/www/qdata/logs

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run: sudo mysql_secure_installation"
echo "2. Create database and user (see setup-database.sql)"
echo "3. Upload your qData files to /var/www/qdata"
echo "4. Update .env.production with your database credentials"
echo "5. Run: cd /var/www/qdata && npm install"
echo "6. Run: npm run build"
echo "7. Copy apache-qdata.conf to Apache sites-available"
echo "8. Start with PM2: pm2 start ecosystem.config.js"
echo "9. Save PM2: pm2 save && pm2 startup"
echo ""
