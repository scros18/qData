# 🚀 QData Production Deployment Guide - Maximum Security

## ⚠️ **CRITICAL: Read This Before Deploying**

**This guide ensures your QData installation is secure for e-commerce, digital shops, and sensitive data.**

**Failure to follow these steps could result in data breaches. You are responsible for securing your deployment.**

---

## 📋 **Pre-Deployment Checklist**

### **Required (Must Complete):**

- [ ] ✅ HTTPS certificate obtained (Let's Encrypt, Cloudflare, or commercial)
- [ ] ✅ Firewall configured (only allow trusted IPs)
- [ ] ✅ Database SSL/TLS enabled and tested
- [ ] ✅ Strong passwords generated (admin, database)
- [ ] ✅ Backup system configured and tested
- [ ] ✅ Monitoring tools installed
- [ ] ✅ Incident response plan documented
- [ ] ✅ Security review completed

### **Recommended:**

- [ ] 🟡 VPN configured for remote access
- [ ] 🟡 Intrusion detection system (IDS) installed
- [ ] 🟡 Log aggregation system (ELK, Grafana)
- [ ] 🟡 Automated security scanning
- [ ] 🟡 Database read replicas for reports
- [ ] 🟡 Rate limiting at reverse proxy level

---

## 🔒 **Step 1: Server Hardening**

### **Operating System:**

```bash
# Update all packages
sudo apt update && sudo apt upgrade -y

# Install fail2ban (prevents brute force)
sudo apt install fail2ban -y

# Configure firewall (UFW example)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH (change port recommended)
sudo ufw allow 443/tcp   # HTTPS only
sudo ufw enable

# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable cups
```

### **SSH Hardening:**

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change these settings:
Port 2222                          # Change from default 22
PermitRootLogin no                 # Disable root login
PasswordAuthentication no          # Use SSH keys only
MaxAuthTries 3                     # Limit login attempts
ClientAliveInterval 300            # Timeout after 5 minutes
ClientAliveCountMax 2              

# Restart SSH
sudo systemctl restart sshd
```

---

## 🔐 **Step 2: Database Security (MariaDB/MySQL)**

### **Enable SSL/TLS:**

```bash
# Generate SSL certificates (or use existing)
cd /etc/mysql/ssl
sudo mysql_ssl_rsa_setup --uid=mysql

# Edit MariaDB config
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf

# Add under [mysqld]:
[mysqld]
ssl-ca=/etc/mysql/ssl/ca.pem
ssl-cert=/etc/mysql/ssl/server-cert.pem
ssl-key=/etc/mysql/ssl/server-key.pem
require_secure_transport=ON

# Restart MariaDB
sudo systemctl restart mariadb
```

### **Secure Database:**

```sql
-- Connect to database
sudo mysql -u root -p

-- Create dedicated user for QData (not root!)
CREATE USER 'qdata_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';

-- Grant only necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER 
ON qdata_db.* TO 'qdata_user'@'localhost';

-- Enable audit logging
INSTALL PLUGIN server_audit SONAME 'server_audit.so';
SET GLOBAL server_audit_logging=ON;
SET GLOBAL server_audit_events='CONNECT,QUERY_DDL,QUERY_DML';

-- Flush privileges
FLUSH PRIVILEGES;
```

### **Database Backup:**

```bash
# Create backup script
sudo nano /usr/local/bin/backup-qdata.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/qdata"
mkdir -p $BACKUP_DIR

# Backup with encryption
mysqldump -u qdata_user -p'PASSWORD' \
  --single-transaction \
  --routines \
  --triggers \
  qdata_db | gzip | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -k 'ENCRYPTION_PASSWORD' > \
  $BACKUP_DIR/qdata_$DATE.sql.gz.enc

# Delete backups older than 30 days
find $BACKUP_DIR -name "qdata_*.sql.gz.enc" -mtime +30 -delete

# Make executable
sudo chmod +x /usr/local/bin/backup-qdata.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-qdata.sh
```

---

## 🌐 **Step 3: HTTPS Configuration**

### **Option A: Nginx Reverse Proxy (Recommended)**

```nginx
# /etc/nginx/sites-available/qdata

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration (Mozilla Intermediate)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security Headers (QData middleware also adds these)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate Limiting (prevents DoS)
    limit_req_zone $binary_remote_addr zone=qdata_limit:10m rate=10r/s;
    limit_req zone=qdata_limit burst=20 nodelay;

    # Client body size limit (prevent large uploads)
    client_max_body_size 10M;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # Logging
    access_log /var/log/nginx/qdata_access.log;
    error_log /var/log/nginx/qdata_error.log;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/qdata /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Option B: Cloudflare (Easy Setup)**

1. Point your domain to Cloudflare
2. Enable "Full (strict)" SSL mode
3. Enable "Always Use HTTPS"
4. Enable "HSTS"
5. Enable "Automatic HTTPS Rewrites"
6. Configure firewall rules (block countries, rate limit)

---

## 🔑 **Step 4: Environment Variables**

### **Create Production .env.local:**

```bash
# /var/www/qdata/.env.local

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database (SSL/TLS Required)
DB_HOST=localhost
DB_PORT=3306
DB_USER=qdata_user
DB_PASSWORD=STRONG_DATABASE_PASSWORD_HERE
DB_SSL_ENABLED=true
DB_SSL_CA=/etc/mysql/ssl/ca.pem

# Security
SESSION_SECRET=RANDOM_64_CHARACTER_HEX_STRING_HERE
ENCRYPTION_KEY=RANDOM_64_CHARACTER_HEX_STRING_HERE
SESSION_TIMEOUT=900000              # 15 minutes
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000             # 15 minutes

# Rate Limiting
RATE_LIMIT_WINDOW=60000             # 1 minute
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_SECURITY_ALERTS=true
ALERT_EMAIL=security@yourdomain.com

# Audit Logging
AUDIT_LOG_RETENTION=365             # days
EXPORT_RATE_LIMIT=10                # per hour

# IP Whitelist (comma-separated, optional)
# ALLOWED_IPS=192.168.1.0/24,10.0.0.0/8

# Set proper permissions
chmod 600 .env.local
chown www-data:www-data .env.local
```

---

## 🚀 **Step 5: Deploy QData**

### **Install Node.js & PM2:**

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify
node --version
npm --version
pm2 --version
```

### **Deploy Application:**

```bash
# Clone/upload QData
cd /var/www
git clone https://github.com/yourusername/qdata.git
cd qdata

# Install dependencies
npm ci --production

# Build for production
npm run build

# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'qdata',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/qdata',
    instances: 'max',              // Use all CPU cores
    exec_mode: 'cluster',          // Cluster mode for scaling
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/qdata-error.log',
    out_file: '/var/log/pm2/qdata-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
```

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup script
pm2 startup systemd
# (Run the command it outputs)

# Check status
pm2 status
pm2 logs qdata
```

---

## 📊 **Step 6: Monitoring & Alerts**

### **Install Monitoring:**

```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### **Setup Health Checks:**

```bash
# Create health check script
nano /usr/local/bin/qdata-health.sh

#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/qdata/api/auth/check-setup)

if [ "$RESPONSE" != "200" ]; then
    echo "QData is DOWN! HTTP $RESPONSE"
    # Send alert (email, Slack, etc.)
    echo "QData health check failed" | mail -s "ALERT: QData Down" security@yourdomain.com
else
    echo "QData is UP"
fi

# Make executable
chmod +x /usr/local/bin/qdata-health.sh

# Add to crontab (every 5 minutes)
*/5 * * * * /usr/local/bin/qdata-health.sh
```

---

## 🛡️ **Step 7: Security Monitoring**

### **Audit Log Monitoring:**

```bash
# Create audit monitor script
nano /usr/local/bin/monitor-qdata-security.sh

#!/bin/bash
LOG_FILE="/var/www/qdata/data/audit-logs.json"
ALERT_EMAIL="security@yourdomain.com"

# Check for failed login attempts
FAILED_LOGINS=$(grep -c "login_failed" $LOG_FILE | tail -1)
if [ "$FAILED_LOGINS" -gt 10 ]; then
    echo "WARNING: $FAILED_LOGINS failed login attempts detected!" | \
    mail -s "SECURITY ALERT: Multiple Failed Logins" $ALERT_EMAIL
fi

# Check for dangerous queries
DANGEROUS_QUERIES=$(grep -c "DROP\|TRUNCATE\|DELETE FROM" $LOG_FILE | tail -1)
if [ "$DANGEROUS_QUERIES" -gt 0 ]; then
    echo "WARNING: Dangerous queries detected!" | \
    mail -s "SECURITY ALERT: Dangerous Queries" $ALERT_EMAIL
fi

# Make executable
chmod +x /usr/local/bin/monitor-qdata-security.sh

# Run hourly
0 * * * * /usr/local/bin/monitor-qdata-security.sh
```

---

## 🔐 **Step 8: Final Security Checks**

### **Security Scan:**

```bash
# SSL Test
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
# Target: A+ rating

# Security Headers Test
https://securityheaders.com/?q=yourdomain.com
# Target: A+ rating

# Port Scan (should show only 443 open)
nmap -p- yourdomain.com
```

### **Penetration Testing:**

```bash
# Install OWASP ZAP or use online tools
# Test for:
# - SQL injection
# - XSS
# - CSRF
# - Session hijacking
# - Brute force
```

---

## ✅ **Post-Deployment Checklist**

### **Verify Security:**

- [ ] ✅ HTTPS working (https://yourdomain.com)
- [ ] ✅ HTTP redirects to HTTPS
- [ ] ✅ SSL certificate valid (A+ rating)
- [ ] ✅ Security headers present (check browser dev tools)
- [ ] ✅ Database SSL/TLS enabled
- [ ] ✅ Firewall rules active
- [ ] ✅ Only port 443 open (nmap scan)
- [ ] ✅ Admin password is strong (12+ chars)
- [ ] ✅ Backups working (test restore)
- [ ] ✅ Monitoring alerts working
- [ ] ✅ Audit logs being written
- [ ] ✅ PM2 process running
- [ ] ✅ Rate limiting working (test)
- [ ] ✅ Auto-logout working (wait 15 min)

### **Test Security Features:**

- [ ] ✅ Try weak password (should be rejected)
- [ ] ✅ Try 5 failed logins (should lockout)
- [ ] ✅ Try SQL injection (should fail)
- [ ] ✅ Check audit logs (all actions logged)
- [ ] ✅ Test dangerous query warning
- [ ] ✅ Verify session expires after 15 min

---

## 📚 **Ongoing Maintenance**

### **Daily:**
- Check PM2 status: `pm2 status`
- Review audit logs for suspicious activity
- Monitor failed login attempts

### **Weekly:**
- Check backup integrity
- Review security logs
- Update OS packages: `sudo apt update && sudo apt upgrade`

### **Monthly:**
- Test backup restoration
- Review user access (disable inactive users)
- Security audit
- Update QData: `git pull && npm ci && npm run build && pm2 restart qdata`

### **Quarterly:**
- Penetration testing
- SSL certificate renewal (Let's Encrypt auto-renews)
- Security policy review
- Password rotation

---

## 🚨 **Emergency Response**

### **If Breach Detected:**

1. **Immediate:**
   ```bash
   # Stop application
   pm2 stop qdata
   
   # Block all external traffic
   sudo ufw deny 443/tcp
   
   # Backup evidence
   cp -r /var/www/qdata/data /var/backups/breach-$(date +%Y%m%d)
   ```

2. **Investigation:**
   - Review audit logs: `/var/www/qdata/data/audit-logs.json`
   - Check Nginx logs: `/var/log/nginx/qdata_access.log`
   - Check PM2 logs: `pm2 logs qdata --lines 1000`

3. **Remediation:**
   - Change all passwords
   - Rotate database credentials
   - Update QData to latest version
   - Apply security patches
   - Review user access

4. **Recovery:**
   ```bash
   # Restore from backup if needed
   # Re-enable after fixes
   sudo ufw allow 443/tcp
   pm2 restart qdata
   ```

---

## 📞 **Support & Help**

**Security Issues:**
- GitHub: https://github.com/yourusername/qdata/issues
- Email: security@yourdomain.com

**Documentation:**
- DATA-PROTECTION.md
- SECURITY-IMPLEMENTED.md
- SECURITY-ENHANCEMENTS.md

---

## ⚖️ **Legal Compliance**

### **Required:**
- Privacy Policy (if collecting user data)
- Terms of Service
- Cookie Policy (if using cookies)
- GDPR compliance (if serving EU)
- Data breach notification procedures

**Consult a lawyer for your specific jurisdiction.**

---

## 🎯 **Success Criteria**

Your deployment is secure if:

✅ SSL Labs: A+ rating  
✅ Security Headers: A+ rating  
✅ Only port 443 open  
✅ Database SSL/TLS enabled  
✅ Backups tested and working  
✅ Monitoring alerts functional  
✅ Audit logs comprehensive  
✅ All security features tested  
✅ Incident response plan documented  
✅ Team trained on security procedures  

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Security Review By:** _________________  
**Next Review Date:** _________________  

**Status:** ⬜ Ready for Production  

---

**With this deployment, your QData installation is enterprise-grade secure.** 🔒🚀
