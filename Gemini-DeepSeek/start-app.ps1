# Quick Start Script for Transit Accessibility App
# This script helps you start both frontend and backend servers

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Transit Accessibility App - Quick Start" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$projectRoot = "C:\codes\transit-accessibility-app"

Write-Host "This script will guide you through starting the app.`n" -ForegroundColor Yellow

# Check if backend dependencies are installed
Write-Host "[1/4] Checking backend setup..." -ForegroundColor Green
$venvPath = Join-Path $projectRoot ".venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv $venvPath
    Write-Host "Virtual environment created!`n" -ForegroundColor Green
}

# Check if frontend dependencies are installed
Write-Host "[2/4] Checking frontend setup..." -ForegroundColor Green
$nodeModulesPath = Join-Path $projectRoot "transit_webapp\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Node modules not found. You need to run 'npm install' in transit_webapp folder.`n" -ForegroundColor Yellow
}

Write-Host "[3/4] Ready to start servers!`n" -ForegroundColor Green

Write-Host "To start the app, you need TWO terminal windows:`n" -ForegroundColor Cyan

Write-Host "=== TERMINAL 1 - Backend ===" -ForegroundColor Yellow
Write-Host "cd $projectRoot" -ForegroundColor White
Write-Host "& .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "cd backend" -ForegroundColor White
Write-Host "uvicorn main:app --reload --port 8000`n" -ForegroundColor White

Write-Host "=== TERMINAL 2 - Frontend ===" -ForegroundColor Yellow
Write-Host "cd $projectRoot\transit_webapp" -ForegroundColor White
Write-Host "npm start`n" -ForegroundColor White

Write-Host "[4/4] After starting both servers:" -ForegroundColor Green
Write-Host "  - Backend will be at: http://localhost:8000" -ForegroundColor White
Write-Host "  - Frontend will be at: http://localhost:3000" -ForegroundColor White
Write-Host "  - API Docs will be at: http://localhost:8000/docs`n" -ForegroundColor White

Write-Host "Would you like to:" -ForegroundColor Cyan
Write-Host "  1. Start Backend Server Now" -ForegroundColor White
Write-Host "  2. Start Frontend Server Now" -ForegroundColor White
Write-Host "  3. Exit (I'll start them manually)`n" -ForegroundColor White

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting Backend Server..." -ForegroundColor Green
        Write-Host "Don't forget to start the frontend in another terminal!`n" -ForegroundColor Yellow
        Set-Location $projectRoot
        & .\.venv\Scripts\Activate.ps1
        Set-Location backend
        uvicorn main:app --reload --port 8000
    }
    "2" {
        Write-Host "`nStarting Frontend Server..." -ForegroundColor Green
        Write-Host "Don't forget to start the backend in another terminal!`n" -ForegroundColor Yellow
        Set-Location "$projectRoot\transit_webapp"
        npm start
    }
    "3" {
        Write-Host "`nGood luck with your development! 🚀" -ForegroundColor Cyan
    }
    default {
        Write-Host "`nInvalid choice. Exiting." -ForegroundColor Red
    }
}
