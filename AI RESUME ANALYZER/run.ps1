# AI Resume Analyzer - PowerShell Launcher
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  AI RESUME ANALYZER - Multi-Service Launcher" -ForegroundColor Cyan
Write-Host "======================================================`n"

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

# Check for stale processes on target ports (5000, 8000, 5173)
Write-Host "[1/3] Checking ports 5000, 8000, 5173..." -ForegroundColor Yellow
$ports = @(5000, 8000, 5173)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $procId = $conn.OwningProcess | Select-Object -First 1
        Write-Host "  Found process $procId occupying port $port. Stopping it..." -ForegroundColor DarkYellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

# Check Python in ai-service
Write-Host "[2/3] Checking Python virtual environment..." -ForegroundColor Yellow
$venvPython = Join-Path $rootDir "ai-service\.venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "  Creating virtualenv in ai-service..." -ForegroundColor DarkYellow
    Set-Location (Join-Path $rootDir "ai-service")
    python -m venv .venv
    & ".\.venv\Scripts\pip.exe" install -r requirements.txt
    Set-Location $rootDir
}

# Start node dev.js orchestrator
Write-Host "[3/3] Starting AI Service, Express Backend, and React Frontend..." -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  AI Service: http://localhost:8000`n" -ForegroundColor White
Write-Host "Press Ctrl+C to stop all services.`n" -ForegroundColor DarkGray

node dev.js
