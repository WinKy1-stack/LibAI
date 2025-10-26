#!/bin/bash
# Script tự động cài đặt Backend Dependencies
# Run this: chmod +x install.sh && ./install.sh

echo "====================================="
echo "  LibAI Backend Setup Script"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Kiểm tra Python
echo -e "${YELLOW}🔍 Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"
    PYTHON_CMD=python
else
    echo -e "${RED}❌ Python not found! Please install Python 3.8+${NC}"
    exit 1
fi

# Kiểm tra pip
echo ""
echo -e "${YELLOW}🔍 Checking pip...${NC}"
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version)
    echo -e "${GREEN}✅ pip found: $PIP_VERSION${NC}"
    PIP_CMD=pip3
elif command -v pip &> /dev/null; then
    PIP_VERSION=$(pip --version)
    echo -e "${GREEN}✅ pip found: $PIP_VERSION${NC}"
    PIP_CMD=pip
else
    echo -e "${RED}❌ pip not found!${NC}"
    exit 1
fi

# Tạo virtual environment
echo ""
echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
if [ -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment already exists. Skipping...${NC}"
else
    $PYTHON_CMD -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Kích hoạt virtual environment
echo ""
echo -e "${YELLOW}🔌 Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo ""
echo -e "${YELLOW}⬆️  Upgrading pip...${NC}"
$PYTHON_CMD -m pip install --upgrade pip

# Cài đặt dependencies
echo ""
echo -e "${YELLOW}📥 Installing dependencies from requirements.txt...${NC}"
$PIP_CMD install -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Verify installation
echo ""
echo -e "${YELLOW}🔍 Verifying installation...${NC}"

packages=("flask" "flask_sqlalchemy" "flask_migrate" "flask_cors" "flask_jwt_extended" "bcrypt" "jwt" "dotenv" "marshmallow")

all_ok=true
for package in "${packages[@]}"; do
    if $PYTHON_CMD -c "import $package" 2>/dev/null; then
        echo -e "  ${GREEN}✅ $package${NC}"
    else
        echo -e "  ${RED}❌ $package${NC}"
        all_ok=false
    fi
done

echo ""
if [ "$all_ok" = true ]; then
    echo -e "${CYAN}=====================================${NC}"
    echo -e "${GREEN}  ✅ Setup completed successfully!${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Copy .env.example to .env and configure"
    echo "  2. Run: flask db init"
    echo "  3. Run: flask db migrate -m 'Initial migration'"
    echo "  4. Run: flask db upgrade"
    echo "  5. Run: python scripts/create_users.py"
    echo "  6. Run: python run.py"
    echo ""
else
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}  ⚠️  Some packages failed to install${NC}"
    echo -e "${RED}=====================================${NC}"
    echo ""
    echo -e "${YELLOW}Please check the errors above and try:${NC}"
    echo "  pip install -r requirements.txt"
fi
