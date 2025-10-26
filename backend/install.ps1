# Script tự động cài đặt Backend Dependencies
# Run this in PowerShell: .\install.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  LibAI Backend Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Python
Write-Host "🔍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Kiểm tra pip
Write-Host ""
Write-Host "🔍 Checking pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ pip found: $pipVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ pip not found!" -ForegroundColor Red
    exit 1
}

# Tạo virtual environment
Write-Host ""
Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists. Skipping..." -ForegroundColor Yellow
}
else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Kích hoạt virtual environment
Write-Host ""
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host ""
Write-Host "⬆️  Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Cài đặt dependencies
Write-Host ""
Write-Host "📥 Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Verify installation
Write-Host ""
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow

$packages = @(
    "flask",
    "flask_sqlalchemy",
    "flask_migrate",
    "flask_cors",
    "flask_jwt_extended",
    "bcrypt",
    "jwt",
    "dotenv",
    "marshmallow"
)

$allOk = $true
foreach ($package in $packages) {
    try {
        python -c "import $package" 2>$null
        Write-Host "  ✅ $package" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ $package" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  ✅ Setup completed successfully!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Copy .env.example to .env and configure" -ForegroundColor White
    Write-Host "  2. Run: flask db init" -ForegroundColor White
    Write-Host "  3. Run: flask db migrate -m 'Initial migration'" -ForegroundColor White
    Write-Host "  4. Run: flask db upgrade" -ForegroundColor White
    Write-Host "  5. Run: python scripts/create_users.py" -ForegroundColor White
    Write-Host "  6. Run: python run.py" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "  ⚠️  Some packages failed to install" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the errors above and try:" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor White
}
