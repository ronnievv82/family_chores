# Family Chore Tracker - Raspberry Pi 4B Installation Guide

This guide will help you install and run the Family Chore Tracker application on your Raspberry Pi 4B.

## Prerequisites

1. Raspberry Pi 4B with Raspberry Pi OS (64-bit recommended)
2. Node.js 18.17 or later
3. Git

### Installing Prerequisites

1. Update your Raspberry Pi:
```bash
sudo apt update
sudo apt upgrade -y
```

2. Install Node.js (using Node Version Manager):
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js LTS
nvm install --lts

# Verify installation
node --version
npm --version
```

3. Install Git:
```bash
sudo apt install git -y
```

## Quick Start (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/ronnievv82/family_chores.git
cd family_chores
```

2. Run the quick-start script:
```bash
./quick-start.sh
```

The application will be available at `http://localhost:8000`

## Manual Installation Steps

1. Install dependencies:
```bash
npm install
```

3. Create a production build:
```bash
npm run build
```

4. Start the application:
```bash
# Development mode
PORT=8000 npm run dev

# Production mode
PORT=8000 npm run start
```

The application will be available at `http://localhost:8000`

## Running on Boot (Optional)

To make the application start automatically when your Raspberry Pi boots:

1. Create a systemd service file:
```bash
sudo nano /etc/systemd/system/chore-tracker.service
```

2. Add the following content (adjust paths as needed):
```ini
[Unit]
Description=Family Chore Tracker
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/family_chores
Environment=PORT=8000
Environment=NODE_ENV=production
ExecStart=/home/pi/.nvm/versions/node/v20.x.x/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:
```bash
sudo systemctl enable chore-tracker
sudo systemctl start chore-tracker
```

## Troubleshooting

1. If you get "next: not found" error:
   ```bash
   # Make sure you're in the project directory and dependencies are installed
   cd family_chores
   npm install
   ```

2. If you encounter memory issues:
   - Increase swap space:
   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile
   # Set CONF_SWAPSIZE=2048
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

2. If the application is slow:
   - Consider running in production mode
   - Ensure your Raspberry Pi has adequate cooling
   - Monitor resource usage with `top` or `htop`

3. Port issues:
   - Check if port 8000 is available:
   ```bash
   sudo lsof -i :8000
   ```
   - Kill any process using the port:
   ```bash
   sudo kill $(sudo lsof -t -i:8000)
   ```

## Performance Tips

1. Use production mode for better performance:
```bash
NODE_ENV=production PORT=8000 npm run start
```

2. Monitor temperature:
```bash
vcgencmd measure_temp
```

3. Monitor memory usage:
```bash
free -h
```

## Accessing from Other Devices

To access the application from other devices on your network:

1. Find your Raspberry Pi's IP address:
```bash
hostname -I
```

2. Access the application using:
```
http://<raspberry-pi-ip>:8000
```

## Security Considerations

1. Change default passwords
2. Keep system updated
3. Use a firewall:
```bash
sudo apt install ufw
sudo ufw allow 8000
sudo ufw enable
```

For additional support or issues, please refer to the project's issue tracker.
