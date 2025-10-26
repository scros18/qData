# Quick Setup Guide for BlissHairStudio VPS

This guide will help you connect QData to your VPS MySQL server.

## Step 1: Ensure MySQL is Running

On your VPS, check if MySQL is running:

```bash
sudo systemctl status mysql
# or
sudo systemctl status mariadb
```

If not running, start it:

```bash
sudo systemctl start mysql
```

## Step 2: Allow Remote Connections (if needed)

Edit MySQL configuration:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Find and comment out or change:

```
# bind-address = 127.0.0.1
bind-address = 0.0.0.0
```

Restart MySQL:

```bash
sudo systemctl restart mysql
```

## Step 3: Create MySQL User (Optional but Recommended)

Instead of using root, create a dedicated user:

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create a user for QData
CREATE USER 'qdata_admin'@'%' IDENTIFIED BY 'your_secure_password';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON *.* TO 'qdata_admin'@'%' WITH GRANT OPTION;

-- For read-only access (safer for browsing):
-- CREATE USER 'qdata_readonly'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT ON *.* TO 'qdata_readonly'@'%';

-- Apply changes
FLUSH PRIVILEGES;
EXIT;
```

## Step 4: Configure Firewall

Allow MySQL port (be careful with security):

```bash
# For UFW (Ubuntu)
sudo ufw allow 3306/tcp

# Or allow only from specific IP
sudo ufw allow from YOUR_LOCAL_IP to any port 3306
```

## Step 5: Test Connection from Local Machine

Before using QData, test the connection:

```bash
mysql -h YOUR_VPS_IP -u root -p
# or
mysql -h YOUR_VPS_IP -u qdata_admin -p
```

## Step 6: Connect via QData

1. Open QData: `http://localhost:3000/qdata`
2. Click "Connect to Database"
3. Enter details:
   - **Host**: `your_vps_ip_address` (e.g., `123.45.67.89`)
   - **Port**: `3306`
   - **Username**: `root` or `qdata_admin`
   - **Password**: Your MySQL password
   - **Database**: Leave empty to see all databases

## Security Best Practices

### 1. SSH Tunnel (Most Secure)

Instead of opening MySQL to the internet, use SSH tunneling:

```bash
# On your local machine
ssh -L 3306:localhost:3306 your_user@your_vps_ip
```

Then in QData, connect to:
- **Host**: `localhost`
- **Port**: `3306`
- **Username**: `root`
- **Password**: Your password

### 2. Restrict by IP

Only allow connections from your IP:

```sql
CREATE USER 'qdata_admin'@'YOUR_LOCAL_IP' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'qdata_admin'@'YOUR_LOCAL_IP';
```

### 3. Use Strong Passwords

Always use strong, unique passwords for database users.

## Troubleshooting

### Can't Connect?

1. **Check firewall**: Ensure port 3306 is open
2. **Check MySQL bind address**: Should be `0.0.0.0` for remote connections
3. **Check user permissions**: User must be allowed from your IP (`%` or specific IP)
4. **Test with mysql CLI**: Try connecting from your local machine first

### Connection Refused?

```bash
# Check if MySQL is listening on the right interface
sudo netstat -tlnp | grep 3306

# Should show 0.0.0.0:3306 or your VPS IP
```

### Access Denied?

```sql
-- Check user permissions
SELECT user, host FROM mysql.user;
SELECT * FROM mysql.user WHERE user='your_username'\G
```

## Production Deployment

To deploy QData on your VPS:

```bash
# Build the application
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start npm --name "qdata" -- start

# Or with systemd service
sudo nano /etc/systemd/system/qdata.service
```

Example systemd service:

```ini
[Unit]
Description=QData MySQL Admin
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/qData
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable qdata
sudo systemctl start qdata
```

## Access via Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name admin.blisshairstudio.com;

    location /qdata {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

**Need Help?** Check the main README.md for more information!
