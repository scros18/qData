# ✅ Pre-Deployment Checklist

## Before Deploying to BlissHairStudio VPS

### ✓ Local Testing
- [ ] QData runs locally: `npm run dev`
- [ ] Accessed at: http://localhost:3000/qdata
- [ ] MySQL connection works (if you have local MySQL)
- [ ] Can see databases list
- [ ] Can browse tables
- [ ] Connection details saved on page reload

### ✓ VPS Access
- [ ] Have SSH access to BlissHairStudio VPS
- [ ] Know VPS IP address
- [ ] Have root or sudo user credentials
- [ ] Can SSH into VPS: `ssh user@vps-ip`

### ✓ Files Ready
- [ ] All files in qData folder
- [ ] Scripts present:
  - install-mysql.sh
  - deploy-qdata.sh
  - upload-to-vps.ps1 (or .sh)
- [ ] README and docs present

---

## Deployment Steps

### Step 1: Upload Files ⬆️
```powershell
# Windows
cd "c:\Users\scros\New folder\qData"
.\upload-to-vps.ps1 -VpsUser "root" -VpsIp "YOUR_VPS_IP"

# Or manually
scp -r . root@YOUR_VPS_IP:~/qData
```

- [ ] Files uploaded successfully
- [ ] No errors during upload

### Step 2: Install MySQL 🗄️
```bash
ssh root@YOUR_VPS_IP
cd qData
chmod +x install-mysql.sh deploy-qdata.sh
./install-mysql.sh
```

- [ ] Script ran successfully
- [ ] MySQL root password displayed
- [ ] qdata_admin password displayed
- [ ] Passwords saved to ~/qdata-credentials.txt
- [ ] **COPIED PASSWORDS TO SAFE LOCATION** ⚠️

### Step 3: Deploy QData 🚀
```bash
./deploy-qdata.sh
```

- [ ] Dependencies installed
- [ ] Build completed successfully
- [ ] PM2 started QData
- [ ] Nginx configured (if chosen)
- [ ] SSL setup (if chosen)

### Step 4: Test Access 🧪
```
http://YOUR_VPS_IP:3000/qdata
```

- [ ] QData loads in browser
- [ ] No console errors
- [ ] Can click "Connect to Database"
- [ ] Can enter MySQL credentials
- [ ] Connection succeeds
- [ ] Databases list appears
- [ ] Can click on a database
- [ ] Tables load correctly

### Step 5: Security 🔒
- [ ] Saved MySQL passwords securely (password manager)
- [ ] Deleted ~/qdata-credentials.txt from VPS
- [ ] Considered restricting MySQL port 3306
- [ ] Set up SSH tunnel for remote access (optional)
- [ ] Configured firewall rules

---

## Post-Deployment

### Verify Everything Works
```bash
# Check QData is running
pm2 status

# Check MySQL is running
sudo systemctl status mysql

# View QData logs
pm2 logs qdata --lines 50

# Test MySQL connection
mysql -u qdata_admin -p
```

### Bookmark These URLs
- [ ] QData Admin Panel: `http://YOUR_VPS_IP:3000/qdata`
- [ ] Or with domain: `https://admin.blisshairstudio.com/qdata`

### Save These Commands
```bash
# Restart QData
pm2 restart qdata

# View logs
pm2 logs qdata

# Stop QData
pm2 stop qdata

# Start QData
pm2 start qdata

# Update QData
cd ~/qData
git pull  # if using git
npm install
npm run build
pm2 restart qdata
```

---

## Troubleshooting Checklist

### QData Won't Load
- [ ] Check PM2: `pm2 status`
- [ ] Check logs: `pm2 logs qdata`
- [ ] Check port: `sudo netstat -tlnp | grep 3000`
- [ ] Check firewall: `sudo ufw status`

### Can't Connect to MySQL
- [ ] MySQL running: `sudo systemctl status mysql`
- [ ] Test connection: `mysql -u qdata_admin -p`
- [ ] Check port: `sudo netstat -tlnp | grep 3306`
- [ ] Verify credentials: `cat ~/qdata-credentials.txt` (if not deleted)

### 404 Errors on API Calls
- [ ] Verify basePath in next.config.mjs
- [ ] Check API routes exist in app/api/
- [ ] View browser console for exact error
- [ ] Check PM2 logs for backend errors

---

## Success Indicators ✓

You'll know it's working when:
- ✅ QData loads at http://YOUR_VPS_IP:3000/qdata
- ✅ No errors in browser console (F12)
- ✅ Can connect to MySQL
- ✅ See list of databases
- ✅ Can browse into databases and see tables
- ✅ Connection details save when you reload
- ✅ PM2 shows QData as "online"
- ✅ Can disconnect and reconnect

---

## Emergency Rollback

If something goes wrong:
```bash
# Stop QData
pm2 delete qdata

# Stop MySQL (if needed)
sudo systemctl stop mysql

# Remove installation
rm -rf ~/qData
sudo apt remove --purge mysql-server
```

Then start over with fresh upload and installation.

---

## Support Resources

- 📖 READY-TO-DEPLOY.md - Complete overview
- 🚀 QUICK-START.md - Fast deployment
- 📚 DEPLOYMENT.md - Detailed guide
- ⚙️ SETUP_GUIDE.md - VPS configuration
- 🧪 TESTING.md - Testing instructions
- 📘 README.md - Full documentation

---

**Ready?** Start with Step 1: Upload Files! 🎉

Good luck deploying to BlissHairStudio! 🚀
