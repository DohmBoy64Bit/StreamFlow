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

# Helper function for downloads with progress
function Download-File {
    param([string]$Url, [string]$OutFile, [string]$Description)
    Write-Host "[DOWNLOAD] $Description..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] Download complete: $(Split-Path $OutFile -Leaf)" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Download failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
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
    Write-Host "[INSTALL] Git not found. Installing Git for Windows 2.53.0..." -ForegroundColor Yellow
    
    $gitTag = "v2.53.0.windows.1"
    $gitFile = "Git-2.53.0-64-bit.exe"
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/$gitTag/$gitFile"
    $gitInstaller = "$env:TEMP\$gitFile"

    Download-File -Url $gitUrl -OutFile $gitInstaller -Description "Git installer"

    Write-Host "[INSTALL] Launching Git installer (watch the progress window)..." -ForegroundColor Yellow
    try {
        $process = Start-Process -FilePath $gitInstaller `
            -ArgumentList "/SILENT", "/NORESTART", "/COMPONENTS=""icons,ext\reg\shellhere,assoc,assoc_sh""" `
            -Wait -PassThru -ErrorAction Stop

        if ($process.ExitCode -ne 0) {
            Write-Host "[ERROR] Git installation failed (exit code: $($process.ExitCode))" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Git installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Git installation error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
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

    Download-File -Url $nodeUrl -OutFile $nodeInstaller -Description "Node.js installer"

    Write-Host "[INSTALL] Launching Node.js installer (watch the progress window)..." -ForegroundColor Yellow
    try {
        $process = Start-Process msiexec.exe `
            -ArgumentList "/i", $nodeInstaller, "/passive", "/norestart" `
            -Wait -PassThru -ErrorAction Stop

        if ($process.ExitCode -ne 0 -and $process.ExitCode -ne 3010) {
            Write-Host "[ERROR] Node.js installation failed (exit code: $($process.ExitCode))" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Node.js installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Node.js installation error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

# --------------------------- 
# 0.75 Auto-Install Python 3.12 if missing
# ---------------------------
Write-Host "[CHECK] Checking Python..." -ForegroundColor Yellow
$pythonPath = Get-Command python -ErrorAction SilentlyContinue
if ($pythonPath) {
    $pyVer = & python --version
    Write-Host "[OK] Python already installed: $pyVer" -ForegroundColor Green
} else {
    Write-Host "[INSTALL] Python not found. Installing Python 3.12.9..." -ForegroundColor Yellow
    $pyVersion = "3.12.9"
    $pyUrl = "https://www.python.org/ftp/python/$pyVersion/python-$pyVersion-amd64.exe"
    $pyInstaller = "$env:TEMP\python-$pyVersion-amd64.exe"

    Download-File -Url $pyUrl -OutFile $pyInstaller -Description "Python installer"

    Write-Host "[INSTALL] Launching Python installer (watch the progress window)..." -ForegroundColor Yellow
    try {
        $process = Start-Process -FilePath $pyInstaller `
            -ArgumentList "/passive", "InstallAllUsers=1", "PrependPath=1", "Include_test=0" `
            -Wait -PassThru -ErrorAction Stop

        if ($process.ExitCode -ne 0 -and $process.ExitCode -ne 3010) {
            Write-Host "[ERROR] Python installation failed (exit code: $($process.ExitCode))" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Python 3.12.9 installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Python installation error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
    Write-Host "[NOTE] If 'python' command not found, restart PowerShell." -ForegroundColor Magenta
}

# --------------------------- 
# 1. Check / Install WSL
# ---------------------------
Write-Host "[CHECK] Checking WSL status..." -ForegroundColor Yellow
try {
    $wslStatus = wsl -l -v 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] WSL is already installed." -ForegroundColor Green
    } else {
        throw "WSL not detected"
    }
} catch {
    Write-Host "[INSTALL] Installing WSL..." -ForegroundColor Yellow
    try {
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
    } catch {
        Write-Host "[ERROR] WSL installation failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
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
    Download-File -Url $podmanUrl -OutFile $installerPath -Description "Podman installer"

    Write-Host "[INSTALL] Launching Podman installer (watch the progress window)..." -ForegroundColor Yellow
    try {
        $process = Start-Process -FilePath $installerPath -ArgumentList "/SILENT" -Wait -PassThru -ErrorAction Stop
        if ($process.ExitCode -ne 0) {
            Write-Host "[ERROR] Podman installation failed (exit code: $($process.ExitCode))" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Podman installed successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Podman installation error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + `
                [System.Environment]::GetEnvironmentVariable("PATH","User")
}

podman --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Podman verification failed." -ForegroundColor Red
    exit 1
}

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
        Download-File -Url $ngrokUrl -OutFile $ngrokZip -Description "ngrok zip"

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

# --------------------------- 
# Create .env file if missing
# ---------------------------
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

# --------------------------- 
# Build container image
# ---------------------------
Write-Host "[BUILD] Building container image..." -ForegroundColor Yellow
if (Test-Path "Dockerfile") {
    podman build -t streamflow:latest .
} else {
    Write-Host "[ERROR] No Dockerfile found." -ForegroundColor Red
    exit 1
}

podman rm -f streamflow 2>$null

# --------------------------- 
# Run container
# ---------------------------
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