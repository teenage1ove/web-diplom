#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Fitness Platform Setup Script${NC}"
echo -e "${BLUE}=================================${NC}\n"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js 20+: brew install node@20${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION} found${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed.${NC}"
    echo -e "${YELLOW}Please install Docker Desktop: https://www.docker.com/products/docker-desktop/${NC}"
    exit 1
fi
DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
echo -e "${GREEN}✓ Docker ${DOCKER_VERSION} found${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi
COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f4 | tr -d ',')
echo -e "${GREEN}✓ Docker Compose ${COMPOSE_VERSION} found${NC}"

echo ""

# Setup environment files
echo -e "${YELLOW}Setting up environment files...${NC}"

# Root .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating root .env file...${NC}"
    cp .env.example .env

    # Generate JWT secrets
    JWT_ACCESS_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)

    # Update .env with generated secrets (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your_access_secret_min_32_characters_long_here/${JWT_ACCESS_SECRET}/" .env
        sed -i '' "s/your_refresh_secret_min_32_characters_long_here/${JWT_REFRESH_SECRET}/" .env
    else
        sed -i "s/your_access_secret_min_32_characters_long_here/${JWT_ACCESS_SECRET}/" .env
        sed -i "s/your_refresh_secret_min_32_characters_long_here/${JWT_REFRESH_SECRET}/" .env
    fi

    echo -e "${GREEN}✓ Root .env created with auto-generated JWT secrets${NC}"
else
    echo -e "${GREEN}✓ Root .env already exists${NC}"
fi

# Backend .env
cd backend
if [ ! -f .env.development ]; then
    cp .env.example .env.development
    echo -e "${GREEN}✓ Backend .env.development created${NC}"
fi
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Frontend .env
cd frontend
if [ ! -f .env.development ]; then
    cp .env.example .env.development
    echo -e "${GREEN}✓ Frontend .env.development created${NC}"
fi
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}✨ Setup completed successfully!${NC}"
echo -e "${GREEN}=================================${NC}\n"

echo -e "${BLUE}📝 Next steps:${NC}"
echo -e ""
echo -e "1️⃣  ${YELLOW}Update .env file with your actual credentials:${NC}"
echo -e "   - DB_PASSWORD (secure password for PostgreSQL)"
echo -e "   - SMTP_* (email settings - Gmail or SendGrid)"
echo -e "   - GEMINI_API_KEY (get from: ${BLUE}https://ai.google.dev/${NC})"
echo -e "   ${GREEN}nano .env${NC}"
echo -e ""
echo -e "2️⃣  ${YELLOW}Start development environment:${NC}"
echo -e "   ${GREEN}npm run dev:build${NC}"
echo -e ""
echo -e "3️⃣  ${YELLOW}In a new terminal, run database migrations:${NC}"
echo -e "   ${GREEN}npm run migrate${NC}"
echo -e ""
echo -e "4️⃣  ${YELLOW}(Optional) Load seed data:${NC}"
echo -e "   ${GREEN}npm run seed${NC}"
echo -e ""
echo -e "5️⃣  ${YELLOW}Access the application:${NC}"
echo -e "   Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "   Backend:   ${BLUE}http://localhost:5000${NC}"
echo -e "   Health:    ${BLUE}http://localhost:5000/health${NC}"
echo -e "   DB Studio: ${GREEN}npm run db:studio${NC}"
echo -e ""
echo -e "${BLUE}📚 Additional commands:${NC}"
echo -e "   ${GREEN}npm run logs${NC}          - View all service logs"
echo -e "   ${GREEN}npm run logs:backend${NC}  - View backend logs"
echo -e "   ${GREEN}npm run logs:frontend${NC} - View frontend logs"
echo -e "   ${GREEN}npm run stop${NC}          - Stop all services"
echo -e ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "   - JWT secrets have been auto-generated in .env"
echo -e "   - Don't commit .env file to git (already in .gitignore)"
echo -e "   - For production, update all passwords and secrets"
echo -e ""
echo -e "${GREEN}Happy coding! 🚀${NC}\n"
