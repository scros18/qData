#!/bin/bash

################################################################################
# QData Installation Script for BlissHairStudio VPS
# This script will:
# 1. Install MySQL
# 2. Secure MySQL installation
# 3. Create a database user for QData
# 4. Install Node.js and dependencies
# 5. Build and deploy QData
# 6. Set up PM2 for process management
# 7. Configure Nginx reverse proxy
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║     QData Installation for BlissHairStudio VPS        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Generate passwords
MYSQL_ROOT_PASSWORD=$(generate_password)
QDATA_DB_PASSWORD=$(generate_password)

echo -e "${GREEN}[1/8] Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y

echo -e "${GREEN}[2/8] Installing MySQL Server...${NC}"
# Set MySQL root password before installation
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password ${MYSQL_ROOT_PASSWORD}"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password ${MYSQL_ROOT_PASSWORD}"
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

echo -e "${GREEN}[3/8] Securing MySQL installation...${NC}"
# Run mysql_secure_installation commands
sudo mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<MYSQL_SCRIPT
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo -e "${GREEN}[4/8] Creating QData database user...${NC}"
sudo mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<MYSQL_SCRIPT
CREATE USER 'qdata_admin'@'localhost' IDENTIFIED BY '${QDATA_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON *.* TO 'qdata_admin'@'localhost' WITH GRANT OPTION;
CREATE USER 'qdata_admin'@'%' IDENTIFIED BY '${QDATA_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON *.* TO 'qdata_admin'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SHOW DATABASES;
MYSQL_SCRIPT

echo -e "${GREEN}[5/8] Configuring MySQL for remote access...${NC}"
# Backup original config
sudo cp /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf.backup

# Allow remote connections
sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# Restart MySQL
sudo systemctl restart mysql

echo -e "${GREEN}[6/8] Installing Node.js and npm...${NC}"
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

echo -e "${GREEN}[7/8] Installing PM2 for process management...${NC}"
sudo npm install -g pm2

# Configure PM2 to start on boot
sudo pm2 startup systemd -u $USER --hp $HOME

echo -e "${GREEN}[8/8] Setting up firewall rules...${NC}"
# Install UFW if not installed
sudo apt install -y ufw

# Allow SSH (important!)
sudo ufw allow ssh
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow MySQL (you may want to restrict this to specific IPs in production)
sudo ufw allow 3306

# Enable firewall
echo "y" | sudo ufw enable

# Save credentials to file
CREDENTIALS_FILE="$HOME/qdata-credentials.txt"
cat > "$CREDENTIALS_FILE" <<EOF
╔═══════════════════════════════════════════════════════════════╗
║               QData Installation - SAVE THESE CREDENTIALS      ║
╚═══════════════════════════════════════════════════════════════╝

Installation Date: $(date)
Server: BlissHairStudio VPS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MySQL ROOT Credentials (Admin Access)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: root
Password: ${MYSQL_ROOT_PASSWORD}

Command to access:
mysql -u root -p
(Then enter password when prompted)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QData Admin User (Recommended for QData)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username: qdata_admin
Password: ${QDATA_DB_PASSWORD}

Command to access:
mysql -u qdata_admin -p
(Then enter password when prompted)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QData Web Interface Connection Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Host: localhost (or your VPS IP for remote access)
Port: 3306
Username: qdata_admin (or root)
Password: (see above)
Database: (leave empty to see all databases)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT SECURITY NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  SAVE THIS FILE SECURELY - Store in password manager
⚠️  DELETE this file after saving: rm ~/qdata-credentials.txt
⚠️  For production, consider restricting MySQL port 3306 to specific IPs
⚠️  Use SSH tunneling for remote MySQL access when possible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next Steps
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Copy these credentials to your password manager
2. Run: cat ~/qdata-credentials.txt (to view again)
3. Deploy QData application with: ./deploy-qdata.sh
4. Access QData at: http://your-vps-ip:3000/qdata

For remote MySQL access from your local machine:
ssh -L 3306:localhost:3306 user@your-vps-ip

EOF

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║          Installation Complete! ✓                     ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚠️  IMPORTANT: Your MySQL credentials are saved at:"
echo "  📁 $CREDENTIALS_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

echo -e "${BLUE}Displaying credentials (COPY THESE NOW):${NC}"
cat "$CREDENTIALS_FILE"

echo -e "\n${YELLOW}Press ENTER after you've copied these credentials...${NC}"
read -r

echo -e "${GREEN}Next step: Upload QData files and run ./deploy-qdata.sh${NC}"
echo -e "${BLUE}MySQL is running on port 3306${NC}"
echo -e "${BLUE}MySQL status: ${NC}"
sudo systemctl status mysql --no-pager
