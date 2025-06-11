#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Starting the application...${NC}"
npm run start:prod

echo -e "${GREEN}The application should now be running at http://localhost:8000${NC}"
