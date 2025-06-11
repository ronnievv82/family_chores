#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Family Chore Tracker - Installation Script for Raspberry Pi${NC}\n"

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo; then
    echo -e "${RED}This script is intended for Raspberry Pi. Please refer to README.md for manual installation.${NC}"
    exit 1
fi

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        exit 1
    fi
}

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
check_status

# Install dependencies
echo -e "\n${YELLOW}Installing required packages...${NC}"
sudo apt install -y git curl build-essential
check_status

# Install Node.js using NVM
echo -e "\n${YELLOW}Installing Node Version Manager (NVM)...${NC}"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
check_status

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js LTS
echo -e "\n${YELLOW}Installing Node.js LTS...${NC}"
nvm install --lts
check_status

# Install project dependencies
echo -e "\n${YELLOW}Installing project dependencies...${NC}"
npm install
check_status

# Build the project
echo -e "\n${YELLOW}Building the project...${NC}"
npm run build
check_status

# Create systemd service
echo -e "\n${YELLOW}Creating systemd service...${NC}"
sudo tee /etc/systemd/system/chore-tracker.service > /dev/null << EOL
[Unit]
Description=Family Chore Tracker
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
Environment=PORT=8000
Environment=NODE_ENV=production
ExecStart=$(which npm) start
Restart=always

[Install]
WantedBy=multi-user.target
EOL
check_status

# Enable and start service
echo -e "\n${YELLOW}Enabling and starting service...${NC}"
sudo systemctl enable chore-tracker
sudo systemctl start chore-tracker
check_status

# Configure firewall
echo -e "\n${YELLOW}Configuring firewall...${NC}"
sudo apt install -y ufw
sudo ufw allow 8000
sudo ufw --force enable
check_status

# Get IP address
IP_ADDRESS=$(hostname -I | cut -d' ' -f1)

echo -e "\n${GREEN}Installation completed successfully!${NC}"
echo -e "\nYou can access the application at: ${GREEN}http://$IP_ADDRESS:8000${NC}"
echo -e "\nTo view application logs: ${YELLOW}sudo journalctl -u chore-tracker -f${NC}"
echo -e "To restart the application: ${YELLOW}sudo systemctl restart chore-tracker${NC}"
echo -e "To stop the application: ${YELLOW}sudo systemctl stop chore-tracker${NC}\n"
