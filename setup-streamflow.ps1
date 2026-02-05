# ===========================
# StreamFlow + Podman + WSL Installer (Auto Git + Node.js + Python 3.12)
# ===========================

# Ensure script is running as admin
if (-not ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
    [Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[ERROR] Please run PowerShell as Administrator!" -ForegroundColor Red
    exit 1
}
Write-Host "[START] Starting setup..." -ForegroundColor Cyan

# --------------------------- 
# 0. Auto-Install Git if missing
# ---------------------------
Write-Host "[CHECK] Checking Git..." -ForegroundColor Yellow
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if ($gitPath) {
    Write-Host "[OK] Git already installed: $($gitPath.Source)" -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Git not found. Installing Git for Windows..." -ForegroundColor Yellow
    $gitVersion = "2.53.0.windows.1"
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v$gitVersion/Git-$gitVersion-64-bit.exe"
    $gitInstaller = "$env:TEMP\Git-$gitVersion-64-bit.exe"
    Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller -UseBasicParsing
    Start-Process -FilePath $gitInstaller -ArgumentList "/VERYSILENT", "/NORESTART", "/COMPONENTS=""icons,ext\reg\shellhere,assoc,assoc_sh""" -Wait
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
    Write-Host "[OK] Git installed successfully!" -ForegroundColor Green
}

# --------------------------- 
# 0.5 Auto-Install Node.js if missing
# ---------------------------
Write-Host "[CHECK] Checking Node.js..." -ForegroundColor Yellow
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if ($nodePath) {
    $nodeVer = & node --version
    Write-Host "[OK] Node.js already installed: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Node.js not found. Installing Node.js 24 LTS..." -ForegroundColor Yellow
    $nodeVersion = "24.13.0"
    $nodeUrl = "https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi"
    $nodeInstaller = "$env:TEMP\node-v$nodeVersion-x64.msi"
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
    Start-Process msiexec.exe -ArgumentList "/i", $nodeInstaller, "/quiet", "/norestart" -Wait
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
    Write-Host "[OK] Node.js installed successfully!" -ForegroundColor Green
}

# --------------------------- 
# 0.75 Auto-Install Python 3.12 if missing (required for backend)
# ---------------------------
Write-Host "[CHECK] Checking Python..." -ForegroundColor Yellow
$pythonPath = Get-Command python -ErrorAction SilentlyContinue
if ($pythonPath) {
    $pyVer = & python --version
    Write-Host "[OK] Python already installed: $pyVer" -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Python not found. Installing Python 3.12.9 (recommended for StreamFlow)..." -ForegroundColor Yellow
    $pyVersion = "3.12.9"
    $pyUrl = "https://www.python.org/ftp/python/$pyVersion/python-$pyVersion-amd64.exe"
    $pyInstaller = "$env:TEMP\python-$pyVersion-amd64.exe"

    Invoke-WebRequest -Uri $pyUrl -OutFile $pyInstaller -UseBasicParsing
    Start-Process -FilePath $pyInstaller -ArgumentList "/quiet", "InstallAllUsers=1", "PrependPath=1", "Include_test=0" -Wait

    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
    Write-Host "[OK] Python 3.12.9 installed successfully!" -ForegroundColor Green
    Write-Host "[NOTE] You may need to restart PowerShell for 'python' command to be recognized" -ForegroundColor Magenta
}

# --------------------------- 
# 1. Check / Install WSL
# ---------------------------
Write-Host "[CHECK] Checking WSL status..." -ForegroundColor Yellow
$wslStatus = wsl -l -v 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] WSL is already installed." -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Installing WSL..." -ForegroundColor Yellow
    wsl --install --no-distribution
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    wsl --set-default-version 2
    Write-Host "[WARN] WSL installed. Reboot required." -ForegroundColor Magenta
    $rebootNow = Read-Host "Reboot now? (yes/no)"
    if ($rebootNow -match "^(y|yes)$") {
        Restart-Computer -Force
        exit 0
    }
}

# --------------------------- 
# 2. Check / Install Podman CLI
# ---------------------------
Write-Host "[CHECK] Checking Podman..." -ForegroundColor Yellow
$podmanPath = Get-Command podman -ErrorAction SilentlyContinue
if ($podmanPath) {
    Write-Host "[OK] Podman is already installed: $($podmanPath.Source)" -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Installing Podman 5.7.1..." -ForegroundColor Yellow
    $podmanUrl = "https://github.com/containers/podman/releases/download/v5.7.1/podman-5.7.1-setup.exe"
    $installerPath = "$env:TEMP\podman-5.7.1-setup.exe"
    Invoke-WebRequest -Uri $podmanUrl -OutFile $installerPath
    Start-Process -FilePath $installerPath -ArgumentList "/quiet" -Wait
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH","User")
}
podman --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Podman verification failed." -ForegroundColor Red
    exit 1
}

# (The rest of the script remains exactly the same from ngrok check onward)
# --------------------------- 
# 3. Check / Offer ngrok
# ---------------------------
Write-Host "[CHECK] Checking ngrok..." -ForegroundColor Yellow
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if ($ngrokPath) {
    Write-Host "[OK] ngrok is already installed." -ForegroundColor Green
} else {
    Write-Host "[WARN] ngrok is NOT installed." -ForegroundColor Red
    $installNgrok = Read-Host "Do you want to install ngrok for compatibility? (yes/no)"
    if ($installNgrok -match "^(y|yes)$") {
        Write-Host "[INSTALL] Downloading ngrok..." -ForegroundColor Yellow
        $ngrokZip = "$env:TEMP\ngrok.zip"
        $ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
        Invoke-WebRequest -Uri $ngrokUrl -OutFile $ngrokZip
        $ngrokDir = "$env:USERPROFILE\ngrok"
        New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
        Expand-Archive -Path $ngrokZip -DestinationPath $ngrokDir -Force
        $env:PATH += ";$ngrokDir"
        Write-Host "[OK] ngrok installed." -ForegroundColor Green
    } else {
        Write-Host "[WARN] Continuing without ngrok..." -ForegroundColor Yellow
    }
}

# --------------------------- 
# 4. Clone StreamFlow Repo
# ---------------------------
Write-Host "[CLONE] Cloning StreamFlow repo into 'StreamFlow' subdirectory..." -ForegroundColor Yellow
$workdir = Join-Path (Get-Location) "StreamFlow"
if (Test-Path $workdir) {
    Write-Host "[WARN] 'StreamFlow' folder already exists." -ForegroundColor Yellow
    Set-Location $workdir
    if (Test-Path ".git") {
        git pull
    } else {
        $confirm = Read-Host "Delete and re-clone? (yes/no)"
        if ($confirm -match "^(y|yes)$") {
            Set-Location ..
            Remove-Item -Path $workdir -Recurse -Force
            New-Item -ItemType Directory -Path $workdir | Out-Null
            Set-Location $workdir
            git clone https://github.com/DohmBoy64Bit/StreamFlow.git .
        } else { exit 1 }
    }
} else {
    New-Item -ItemType Directory -Path $workdir | Out-Null
    Set-Location $workdir
    git clone https://github.com/DohmBoy64Bit/StreamFlow.git .
}
Write-Host "[OK] Working in: $(Get-Location)" -ForegroundColor Green

# .env creation, Build, Run, Open browser sections (unchanged)
$envPath = "streamflow-backend/.env"
if (-not (Test-Path $envPath)) {
    $tmdbKey = Read-Host "Enter your TMDB API Key"
    if ([string]::IsNullOrWhiteSpace($tmdbKey)) { exit 1 }
    $envContent = @"
DATABASE_URL=sqlite:///./streamflow.db
SECRET_KEY=test-secret-key-for-development-only
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
TMDB_API_KEY=$tmdbKey
TMDB_BASE_URL=https://api.themoviedb.org/3
VIDSRC_PRIMARY_DOMAIN=https://vidsrc.me/embed
VIDSRC_FALLBACK_DOMAINS=https://vidsrc.xyz/embed,https://vidsrc.to/embed
REDIS_URL=redis://localhost:6379/0
REDIS_ENABLED=false
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=true
"@
    Set-Content -Path $envPath -Value $envContent
}

Write-Host "[BUILD] Building container image..." -ForegroundColor Yellow
if (Test-Path "Dockerfile") {
    podman build -t streamflow:latest .
} else {
    Write-Host "[ERROR] No Dockerfile found." -ForegroundColor Red
    exit 1
}

podman rm -f streamflow 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Do you want to start with ngrok CORS?" -ForegroundColor Yellow
$useNgrok = Read-Host "Type YES to use ngrok"
if ($useNgrok -match "^(y|yes)$") {
    $ngrokUrl = Read-Host "Enter your ngrok URL"
    podman run -d -p 8000:8000 --env-file streamflow-backend/.env -e "CORS_ORIGINS=$ngrokUrl" --name streamflow streamflow:latest
    $appUrl = $ngrokUrl
} else {
    podman run -d -p 8000:8000 --env-file streamflow-backend/.env --name streamflow streamflow:latest
    $appUrl = "http://localhost:8000"
}

Start-Process "https://github.com/DohmBoy64Bit/StreamFlow"
$openApp = Read-Host "Open app in browser? (yes/no)"
if ($openApp -match "^(y|yes)$") { Start-Process $appUrl }

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "Tip: podman logs streamflow" -ForegroundColor Cyan