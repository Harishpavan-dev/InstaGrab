#!/bin/bash

# ═══════════════════════════════════════════════════════
# InstaGrab - EC2 Ubuntu Production
# Server IP: 13.202.85.161
# Run this ONCE on your Ubuntu EC2 instance
# ═══════════════════════════════════════════════════════

set -e

echo ""
echo "🚀 Starting InstaGrab EC2 setup..."
echo "================================================"

# ─────────────────────────────────────────────────────
# 1. UPDATE SYSTEM
# ─────────────────────────────────────────────────────

echo ""
echo "📦 [1/12] Updating Ubuntu..."

sudo apt update
sudo apt upgrade -y


# ─────────────────────────────────────────────────────
# 2. INSTALL REQUIRED SYSTEM PACKAGES
# ─────────────────────────────────────────────────────

echo ""
echo "📦 [2/12] Installing required packages..."

sudo apt install -y \
    curl \
    git \
    unzip \
    ffmpeg \
    ca-certificates \
    build-essential


# ─────────────────────────────────────────────────────
# 3. INSTALL NODE.JS 20
# ─────────────────────────────────────────────────────

echo ""
echo "🟢 [3/12] Installing Node.js 20..."

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs

echo ""
echo "Node.js: $(node -v)"
echo "NPM:     $(npm -v)"


# ─────────────────────────────────────────────────────
# 4. INSTALL PM2
# ─────────────────────────────────────────────────────

echo ""
echo "🔄 [4/12] Installing PM2..."

sudo npm install -g pm2

echo "PM2: $(pm2 -v)"


# ─────────────────────────────────────────────────────
# 5. INSTALL NGINX
# ─────────────────────────────────────────────────────

echo ""
echo "🌐 [5/12] Installing Nginx..."

sudo apt install -y nginx

sudo systemctl enable nginx


# ─────────────────────────────────────────────────────
# 6. INSTALL YT-DLP
# ─────────────────────────────────────────────────────

echo ""
echo "📥 [6/12] Installing yt-dlp..."

sudo curl \
    -L \
    https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp

sudo chmod a+rx /usr/local/bin/yt-dlp

echo "yt-dlp: $(yt-dlp --version)"

echo "ffmpeg: $(ffmpeg -version | head -n 1)"


# ─────────────────────────────────────────────────────
# 7. CLONE INSTAGRAB
# ─────────────────────────────────────────────────────

echo ""
echo "📥 [7/12] Downloading InstaGrab..."

cd /home/ubuntu

if [ -d "/home/ubuntu/instagrab" ]; then
    echo "⚠️ InstaGrab directory already exists."
    echo "Skipping git clone..."
else
    git clone https://github.com/Harishpavan-dev/InstaGrab.git instagrab
fi

cd /home/ubuntu/instagrab

echo ""
echo "Repository:"
pwd


# ─────────────────────────────────────────────────────
# 8. CREATE DIRECTORIES
# ─────────────────────────────────────────────────────

echo ""
echo "📁 [8/12] Creating required directories..."

mkdir -p cookies
mkdir -p temp

# Give ubuntu ownership
sudo chown -R ubuntu:ubuntu /home/ubuntu/instagrab

echo "Created:"
echo "  /home/ubuntu/instagrab/cookies"
echo "  /home/ubuntu/instagrab/temp"


# ─────────────────────────────────────────────────────
# 9. BACKEND ENVIRONMENT
# ─────────────────────────────────────────────────────

echo ""
echo "⚙️ [9/12] Creating backend environment..."

cat > /home/ubuntu/instagrab/backend/.env << 'EOF'

NODE_ENV=production

PORT=3001

FILE_EXPIRATION_MINUTES=30

MAX_DOWNLOAD_SIZE_MB=500

TEMP_DIR=./temp

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

DOWNLOAD_RATE_LIMIT_MAX=10

INFO_RATE_LIMIT_MAX=30

ALLOWED_ORIGINS=http://13.202.85.161,http://localhost:3000,*

LOG_LEVEL=info

EOF


# ─────────────────────────────────────────────────────
# 10. FRONTEND ENVIRONMENT
# ─────────────────────────────────────────────────────

echo ""
echo "⚙️ Creating frontend environment..."

cat > /home/ubuntu/instagrab/frontend/.env.local << 'EOF'

NEXT_PUBLIC_API_URL=/api

EOF


# ─────────────────────────────────────────────────────
# 11. INSTALL & BUILD APPLICATIONS
# ─────────────────────────────────────────────────────

echo ""
echo "🔧 [10/12] Installing backend..."

cd /home/ubuntu/instagrab/backend

npm install

echo ""
echo "🔨 Building backend..."

npm run build


echo ""
echo "🔧 Installing frontend..."

cd /home/ubuntu/instagrab/frontend

npm install

echo ""
echo "🔨 Building frontend..."

npm run build


# ─────────────────────────────────────────────────────
# 12. NGINX CONFIGURATION
# ─────────────────────────────────────────────────────

echo ""
echo "🌐 [11/12] Configuring Nginx..."

sudo tee /etc/nginx/sites-available/instagrab > /dev/null << 'NGINX'

server {

    listen 80;
    listen [::]:80;

    server_name 13.202.85.161;

    client_max_body_size 500M;


    # ─────────────────────────────────────────────
    # Frontend
    # ─────────────────────────────────────────────

    location / {

        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;

    }


    # ─────────────────────────────────────────────
    # Backend API
    # ─────────────────────────────────────────────

    location /api/ {

        proxy_pass http://127.0.0.1:3001/api/;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300s;
        proxy_send_timeout 300s;

        proxy_connect_timeout 75s;

    }

}

NGINX


# Enable InstaGrab site

sudo ln -sf \
    /etc/nginx/sites-available/instagrab \
    /etc/nginx/sites-enabled/instagrab


# Remove default Nginx site

sudo rm -f /etc/nginx/sites-enabled/default


# Test Nginx

echo ""
echo "🧪 Testing Nginx configuration..."

sudo nginx -t


# Restart Nginx

sudo systemctl restart nginx

sudo systemctl enable nginx


# ─────────────────────────────────────────────────────
# 13. START APPLICATION WITH PM2
# ─────────────────────────────────────────────────────

echo ""
echo "🚀 [12/12] Starting InstaGrab with PM2..."

cd /home/ubuntu/instagrab

# Remove old PM2 processes if they exist
pm2 delete all 2>/dev/null || true


# Start ecosystem
pm2 start ecosystem.config.js


# Save PM2 process list
pm2 save


# Setup PM2 startup
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash


# Restart to make sure startup works
pm2 restart all


# Save again
pm2 save


# ─────────────────────────────────────────────────────
# FINAL CHECK
# ─────────────────────────────────────────────────────

echo ""
echo "================================================"
echo "        ✅ INSTAGRAB SETUP COMPLETE"
echo "================================================"
echo ""

echo "🌐 Website:"
echo "   http://13.202.85.161/"
echo ""

echo "🔌 Backend:"
echo "   http://13.202.85.161/api/"
echo ""

echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager | head -15

echo ""
echo "================================================"
echo "Useful commands"
echo "================================================"
echo ""

echo "PM2 status:"
echo "  pm2 status"

echo ""
echo "PM2 logs:"
echo "  pm2 logs"

echo ""
echo "Backend logs:"
echo "  pm2 logs backend"

echo ""
echo "Restart application:"
echo "  pm2 restart all"

echo ""
echo "Restart Nginx:"
echo "  sudo systemctl restart nginx"

echo ""
echo "Test Nginx:"
echo "  sudo nginx -t"

echo ""
echo "Check yt-dlp:"
echo "  yt-dlp --version"

echo ""
echo "Check ffmpeg:"
echo "  ffmpeg -version"

echo ""
echo "================================================"
echo "🎉 InstaGrab is ready!"
echo "================================================"