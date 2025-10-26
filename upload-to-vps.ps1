# Quick Upload to BlissHairStudio VPS
# Run this from PowerShell on Windows

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$true)]
    [string]$VpsUser
)

Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║     Uploading QData to BlissHairStudio VPS            ║" -ForegroundColor Blue
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Check if scp is available
if (!(Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SCP not found. Please install OpenSSH Client:" -ForegroundColor Red
    Write-Host "   Settings > Apps > Optional Features > Add OpenSSH Client" -ForegroundColor Yellow
    exit 1
}

$CurrentDir = Get-Location
$DestPath = "${VpsUser}@${VpsIp}:~/qData"

Write-Host "📁 Source: $CurrentDir" -ForegroundColor Cyan
Write-Host "🎯 Destination: $DestPath" -ForegroundColor Cyan
Write-Host ""

# Exclude node_modules and build files
$ExcludePatterns = @(
    "node_modules",
    ".next",
    "out",
    "build",
    ".git",
    ".vscode"
)

Write-Host "🚀 Starting upload..." -ForegroundColor Green
Write-Host "⏳ This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Create exclude file
$ExcludeFile = Join-Path $env:TEMP "qdata-exclude.txt"
$ExcludePatterns | Out-File -FilePath $ExcludeFile -Encoding ASCII

try {
    # Upload files using scp
    scp -r -o "ControlMaster=auto" `
        $(Get-ChildItem -Path $CurrentDir -File | Select-Object -ExpandProperty FullName) `
        $(Get-ChildItem -Path $CurrentDir -Directory -Exclude $ExcludePatterns | Select-Object -ExpandProperty FullName) `
        $DestPath

    Write-Host ""
    Write-Host "✅ Upload complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. SSH into your VPS:" -ForegroundColor White
    Write-Host "   ssh ${VpsUser}@${VpsIp}" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "2. Navigate to qData directory:" -ForegroundColor White
    Write-Host "   cd qData" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Make scripts executable:" -ForegroundColor White
    Write-Host "   chmod +x install-mysql.sh deploy-qdata.sh" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Run installation:" -ForegroundColor White
    Write-Host "   ./install-mysql.sh" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "5. Deploy QData:" -ForegroundColor White
    Write-Host "   ./deploy-qdata.sh" -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host "❌ Upload failed: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Cleanup
    Remove-Item -Path $ExcludeFile -ErrorAction SilentlyContinue
}
