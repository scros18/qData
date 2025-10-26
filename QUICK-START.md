# 🚀 Deploy QData to BlissHairStudio VPS - Quick Guide

## Option 1: PowerShell Upload (Easiest for Windows)

```powershell
# From your qData directory in PowerShell
.\upload-to-vps.ps1 -VpsUser "YOUR_USERNAME" -VpsIp "YOUR_VPS_IP"

# Example:
.\upload-to-vps.ps1 -VpsUser "root" -VpsIp "123.45.67.89"
```

## Option 2: Manual SCP Upload

```powershell
# Zip the folder first
Compress-Archive -Path "c:\Users\scros\New folder\qData" -DestinationPath qData.zip

# Upload to VPS
scp qData.zip your_user@your_vps_ip:~/

# Then SSH in and extract
ssh your_user@your_vps_ip
unzip qData.zip
cd qData
```

## After Upload - Run These Commands on VPS:

```bash
# 1. Make scripts executable
chmod +x install-mysql.sh deploy-qdata.sh

# 2. Install MySQL (generates passwords automatically)
./install-mysql.sh

# 🚨 IMPORTANT: Copy the MySQL passwords shown on screen!
# They are also saved in ~/qdata-credentials.txt

# 3. Deploy QData
./deploy-qdata.sh

# Done! Access at http://YOUR_VPS_IP:3000/qdata
```

## What You'll Get:

✅ MySQL 8.0 installed with secure passwords
✅ QData running on port 3000
✅ Automatic startup on boot (PM2)
✅ All databases visible after connecting
✅ Login credentials saved automatically

## Connect to MySQL in QData:

After deployment, open `http://YOUR_VPS_IP:3000/qdata` and enter:

- **Host**: `localhost` (or your VPS IP for remote)
- **Port**: `3306`
- **Username**: `qdata_admin` (recommended) or `root`
- **Password**: (from the credentials file on VPS)
- **Database**: Leave empty to see all databases

Your login will be saved automatically!

## Troubleshooting:

**Can't connect?**
```bash
# Check if QData is running
pm2 status

# View logs
pm2 logs qdata

# Restart
pm2 restart qdata
```

**MySQL issues?**
```bash
# Check MySQL status
sudo systemctl status mysql

# View credentials
cat ~/qdata-credentials.txt
```

## Files You Need:

📁 On your VPS after running scripts:
- `~/qdata-credentials.txt` - Your MySQL passwords (SAVE THIS!)
- `~/qData/` - The application

📝 Scripts:
- `install-mysql.sh` - Installs MySQL, generates passwords
- `deploy-qdata.sh` - Builds and deploys QData
- `upload-to-vps.ps1` - Windows upload helper

---

**Ready to deploy?** Run the PowerShell upload script above! 🎉
