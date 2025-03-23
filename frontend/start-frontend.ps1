# PowerShell script to start the frontend

# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "Cleaning Next.js build cache..."
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host ".next directory removed"
}

# Set development environment variable
$env:NODE_ENV = "development"

Write-Host "Installing dependencies if needed..."
npm install --if-present

Write-Host "Starting Next.js development server..."
npx next dev

# This line will only execute if the server exits normally
Write-Host "Server stopped" 