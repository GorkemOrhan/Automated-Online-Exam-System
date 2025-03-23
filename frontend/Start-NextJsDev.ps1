# PowerShell script to run Next.js in development mode
Write-Host "Starting Next.js Development Server..." -ForegroundColor Green

# Clear .next directory
if (Test-Path .\.next) {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .\.next
    Write-Host ".next directory removed." -ForegroundColor Yellow
}

# Set environment variables
$env:NODE_ENV = "development"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Run Next.js in dev mode
Write-Host "Running Next.js..." -ForegroundColor Green
npx next dev 