#!/bin/bash
# Quick upload script for Linux/Mac users

if [ $# -ne 2 ]; then
    echo "Usage: ./upload-to-vps.sh USER VPS_IP"
    echo "Example: ./upload-to-vps.sh root 123.45.67.89"
    exit 1
fi

VPS_USER=$1
VPS_IP=$2

echo "╔═══════════════════════════════════════════════════════╗"
echo "║     Uploading QData to BlissHairStudio VPS            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Use rsync if available, otherwise fall back to scp
if command -v rsync &> /dev/null; then
    echo "🚀 Uploading with rsync..."
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude 'out' \
        --exclude 'build' \
        --exclude '.git' \
        --exclude '.vscode' \
        . ${VPS_USER}@${VPS_IP}:~/qData/
else
    echo "🚀 Uploading with scp..."
    scp -r \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude 'out' \
        --exclude 'build' \
        --exclude '.git' \
        --exclude '.vscode' \
        . ${VPS_USER}@${VPS_IP}:~/qData/
fi

echo ""
echo "✅ Upload complete!"
echo ""
echo "Next steps:"
echo "1. SSH into your VPS:"
echo "   ssh ${VPS_USER}@${VPS_IP}"
echo ""
echo "2. cd qData"
echo "3. chmod +x install-mysql.sh deploy-qdata.sh"
echo "4. ./install-mysql.sh"
echo "5. ./deploy-qdata.sh"
