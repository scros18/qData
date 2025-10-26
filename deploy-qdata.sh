#!/bin/bash

################################################################################
# QData Deployment Script for BlissHairStudio VPS
# Run this script after install-mysql.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║          QData Application Deployment                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get current directory
QDATA_DIR=$(pwd)

echo -e "${GREEN}[1/6] Installing dependencies...${NC}"
npm install

echo -e "${GREEN}[2/6] Building QData for production...${NC}"
npm run build

echo -e "${GREEN}[3/6] Stopping any existing QData processes...${NC}"
pm2 delete qdata 2>/dev/null || true

echo -e "${GREEN}[4/6] Starting QData with PM2...${NC}"
pm2 start npm --name "qdata" -- start

echo -e "${GREEN}[5/6] Saving PM2 configuration...${NC}"
pm2 save

echo -e "${GREEN}[6/6] Setting up Nginx reverse proxy (optional)...${NC}"
read -p "Do you want to set up Nginx reverse proxy? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Install Nginx if not installed
    sudo apt install -y nginx

    # Create Nginx configuration
    NGINX_CONF="/etc/nginx/sites-available/qdata"
    
    echo "Enter your domain name (e.g., admin.blisshairstudio.com) or press ENTER to skip:"
    read -r DOMAIN_NAME
    
    if [ -z "$DOMAIN_NAME" ]; then
        echo -e "${YELLOW}Skipping domain configuration. Access QData at http://YOUR_IP:3000/qdata${NC}"
    else
        sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    location /qdata {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

        # Enable the site
        sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
        
        # Test Nginx configuration
        sudo nginx -t
        
        # Restart Nginx
        sudo systemctl restart nginx
        
        echo -e "${GREEN}Nginx configured successfully!${NC}"
        echo -e "${BLUE}Access QData at: http://${DOMAIN_NAME}/qdata${NC}"
        
        # Ask about SSL
        read -p "Do you want to set up SSL with Let's Encrypt? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            sudo apt install -y certbot python3-certbot-nginx
            sudo certbot --nginx -d "${DOMAIN_NAME}"
            echo -e "${GREEN}SSL configured! Access at: https://${DOMAIN_NAME}/qdata${NC}"
        fi
    fi
else
    echo -e "${YELLOW}Skipping Nginx setup. Access QData at http://YOUR_IP:3000/qdata${NC}"
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║          QData Deployed Successfully! ✓               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Access URLs:"
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "  🌐 https://${DOMAIN_NAME}/qdata"
fi
echo "  🌐 http://${SERVER_IP}:3000/qdata"
echo "  🌐 http://localhost:3000/qdata (from VPS)"
echo ""
echo "  MySQL Connection:"
echo "  🗄️  Host: localhost (from VPS) or ${SERVER_IP} (remote)"
echo "  🗄️  Port: 3306"
echo "  🗄️  User: qdata_admin or root"
echo "  🗄️  Password: (check ~/qdata-credentials.txt)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

echo -e "${GREEN}Useful PM2 commands:${NC}"
echo "  pm2 status          - Check QData status"
echo "  pm2 logs qdata      - View QData logs"
echo "  pm2 restart qdata   - Restart QData"
echo "  pm2 stop qdata      - Stop QData"
echo "  pm2 start qdata     - Start QData"

echo -e "\n${YELLOW}Remember to:${NC}"
echo "  1. Copy MySQL credentials from ~/qdata-credentials.txt"
echo "  2. Delete credentials file: rm ~/qdata-credentials.txt"
echo "  3. Configure your domain DNS if using Nginx"
echo "  4. Set up firewall rules for production"
