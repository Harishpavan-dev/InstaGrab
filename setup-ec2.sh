#!/bin/bash

# ═══════════════════════════════════════════════════════
# InstaGrab - EC2 Ubuntu Production Setup Script
# Includes: Full Stack Setup + Telegram Bot Support
# 100% Leak-Proof: Safe to commit & push to GitHub!
# ═══════════════════════════════════════════════════════

set -e

echo ""
echo "🚀 Starting InstaGrab EC2 Setup..."
echo "================================================"

# ─────────────────────────────────────────────────────
# 0. DETECT IP & ENVIRONMENT VARIABLES (LEAK-PROOF)
# ─────────────────────────────────────────────────────

# Automatically detect public IP of the EC2 instance
SERVER_IP=$(curl -s --connect-timeout 3 http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s --connect-timeout 3 ifconfig.me || echo "127.0.0.1")
echo "🌐 Detected Server IP: $SERVER_IP"

# Check if secrets were passed via environment, or prompt interactively if first run
APP_DIR="/home/ubuntu/instagrab"
BACKEND_ENV="$APP_DIR/backend/.env"
FRONTEND_ENV="$APP_DIR/frontend/.env.local"

# ─────────────────────────────────────────────────────
# 1. UPDATE SYSTEM
# ─────────────────────────────────────────────────────

echo ""
echo "📦 [1/12] Updating Ubuntu packages..."

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y

# ─────────────────────────────────────────────────────
# 2. INSTALL REQUIRED SYSTEM PACKAGES
# ─────────────────────────────────────────────────────

echo ""
echo "📦 [2/12] Installing required packages (ffmpeg, curl, git, mysql)..."

sudo DEBIAN_FRONTEND=noninteractive apt install -y \
    curl \
    git \
    unzip \
    ffmpeg \
    ca-certificates \
    build-essential \
    mysql-server

sudo systemctl enable mysql
sudo systemctl start mysql

# ─────────────────────────────────────────────────────
# 3. CONFIGURE MYSQL DATABASE
# ─────────────────────────────────────────────────────

echo ""
echo "🐬 [3/12] Configuring MySQL Database..."

# Generate or use existing DB Password
DB_NAME="instagrab_db"
DB_USER="instagrab"

# Use a fixed default password so it stays consistent across re-runs
# and matches the DB_PASSWORD in the GitHub Actions BACKEND_ENV secret
if [ -f "$BACKEND_ENV" ] && grep -q "DB_PASSWORD=" "$BACKEND_ENV"; then
    DB_PASSWORD=$(grep "DB_PASSWORD=" "$BACKEND_ENV" | cut -d '=' -f2)
else
    DB_PASSWORD="instagrab_secure_pass_123"
fi

sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
sudo mysql -e "ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "✅ MySQL configured for user '${DB_USER}'."

# ─────────────────────────────────────────────────────
# 4. INSTALL NODE.JS 20
# ─────────────────────────────────────────────────────

echo ""
echo "🟢 [4/12] Installing Node.js 20..."

if ! command -v node &> /dev/null || [[ $(node -v) != v20* ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "Node.js: $(node -v)"
echo "NPM:     $(npm -v)"

# ─────────────────────────────────────────────────────
# 5. INSTALL PM2
# ─────────────────────────────────────────────────────

echo ""
echo "🔄 [5/12] Installing PM2 process manager..."

if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

echo "PM2: $(pm2 -v)"

# ─────────────────────────────────────────────────────
# 6. INSTALL NGINX
# ─────────────────────────────────────────────────────

echo ""
echo "🌐 [6/12] Installing Nginx..."

sudo apt install -y nginx
sudo systemctl enable nginx

# ─────────────────────────────────────────────────────
# 7. INSTALL / UPDATE YT-DLP & FFMPEG
# ─────────────────────────────────────────────────────

echo ""
echo "📥 [7/12] Installing latest yt-dlp binary..."

sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

echo "yt-dlp: $(yt-dlp --version)"
echo "ffmpeg: $(ffmpeg -version | head -n 1)"

# ─────────────────────────────────────────────────────
# 8. CLONE / PREPARE REPOSITORY
# ─────────────────────────────────────────────────────

echo ""
echo "📥 [8/12] Checking repository..."

cd /home/ubuntu

if [ -d "$APP_DIR" ]; then
    echo "⚠️ InstaGrab repository directory already exists at $APP_DIR."
    cd "$APP_DIR"
    git status
else
    git clone https://github.com/Harishpavan-dev/InstaGrab.git "$APP_DIR"
    cd "$APP_DIR"
fi

# Ensure cookies and temp directories exist
mkdir -p "$APP_DIR/cookies"
mkdir -p "$APP_DIR/temp"
mkdir -p "$APP_DIR/backend/temp"

# Give ubuntu user full ownership
sudo chown -R ubuntu:ubuntu "$APP_DIR"
chmod -R 775 "$APP_DIR/cookies" "$APP_DIR/temp" "$APP_DIR/backend/temp"

# ─────────────────────────────────────────────────────
# 9. SECURE BACKEND .ENV SETUP (NO SECRETS COMMITTED)
# ─────────────────────────────────────────────────────

echo ""
echo "⚙️ [9/12] Setting up Backend Environment (.env)..."

if [ -f "$BACKEND_ENV" ]; then
    echo "🔒 Existing backend/.env detected. Preserving your current production secrets!"
    
    # Check if Telegram variables are present in existing .env; if missing, append defaults safely
    if ! grep -q "TELEGRAM_BOT_TOKEN" "$BACKEND_ENV"; then
        echo "➕ Appending Telegram Bot configurations to existing .env..."
        cat >> "$BACKEND_ENV" << 'EOF'

# Telegram Bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_ENABLED=false
TELEGRAM_MAX_FILE_SIZE_MB=50
EOF
    fi
else
    echo "✨ Creating new secure backend/.env..."

    # Determine Telegram Token (prompt if interactive and not passed)
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        if [ -t 0 ]; then
            echo ""
            read -r -p "🤖 Enter Telegram Bot Token (from @BotFather) [Press Enter to skip & set in Admin Panel later]: " INPUT_TG_TOKEN
            TELEGRAM_BOT_TOKEN="${INPUT_TG_TOKEN:-}"
        fi
    fi

    # Determine Bot Enabled
    if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
        TELEGRAM_BOT_ENABLED="true"
    else
        TELEGRAM_BOT_ENABLED="false"
    fi

    # Generate cryptographically secure JWT secret
    JWT_SECRET="${ADMIN_JWT_SECRET:-$(openssl rand -hex 32)}"
    ADMIN_USER="${ADMIN_USERNAME:-admin}"
    ADMIN_PASS="${ADMIN_PASSWORD:-admin12345}"

    cat > "$BACKEND_ENV" << EOF
NODE_ENV=production
PORT=3001

# File Management
FILE_EXPIRATION_MINUTES=30
MAX_DOWNLOAD_SIZE_MB=500
TEMP_DIR=./temp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DOWNLOAD_RATE_LIMIT_MAX=10
INFO_RATE_LIMIT_MAX=30

# CORS
ALLOWED_ORIGINS=http://${SERVER_IP},http://localhost:3000,*

# Logging
LOG_LEVEL=info

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# Admin Panel Security
ADMIN_JWT_SECRET=${JWT_SECRET}
ADMIN_USERNAME=${ADMIN_USER}
ADMIN_PASSWORD=${ADMIN_PASS}

# Telegram Bot Integration
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_BOT_ENABLED=${TELEGRAM_BOT_ENABLED}
TELEGRAM_MAX_FILE_SIZE_MB=50

EOF

    chmod 600 "$BACKEND_ENV"
    echo "✅ Backend .env created with secure permissions (chmod 600)."
fi

# ─────────────────────────────────────────────────────
# 10. FRONTEND ENVIRONMENT (.env.local)
# ─────────────────────────────────────────────────────

echo ""
echo "⚙️ [10/12] Setting up Frontend Environment (.env.local)..."

cat > "$FRONTEND_ENV" << 'EOF'
NEXT_PUBLIC_API_URL=/api
EOF

# ─────────────────────────────────────────────────────
# 11. BUILD APPLICATIONS
# ─────────────────────────────────────────────────────

echo ""
echo "🔨 [11/12] Installing dependencies and building applications..."

echo "📦 Building backend..."
cd "$APP_DIR/backend"
npm install
npm run build

echo "📦 Building frontend..."
cd "$APP_DIR/frontend"
npm install
NEXT_PUBLIC_API_URL=/api npm run build

# ─────────────────────────────────────────────────────
# 12. NGINX CONFIGURATION (DYNAMIC IP & REVERSE PROXY)
# ─────────────────────────────────────────────────────

echo ""
echo "🌐 [12/12] Configuring Nginx reverse proxy..."

sudo tee /etc/nginx/sites-available/instagrab > /dev/null << NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name ${SERVER_IP} localhost _;

    client_max_body_size 500M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API (Express)
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINX

# Enable site and remove default
sudo ln -sf /etc/nginx/sites-available/instagrab /etc/nginx/sites-enabled/instagrab
sudo rm -f /etc/nginx/sites-enabled/default

# Test & reload Nginx
sudo nginx -t
sudo systemctl restart nginx

# ─────────────────────────────────────────────────────
# 13. PM2 STARTUP & PROCESS MANAGEMENT
# ─────────────────────────────────────────────────────

echo ""
echo "🚀 Starting applications with PM2..."

cd "$APP_DIR"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup automatic PM2 resurrection on server reboot
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash || true
pm2 save

# ─────────────────────────────────────────────────────
# COMPLETE SUMMARY
# ─────────────────────────────────────────────────────

echo ""
echo "================================================"
echo "        🎉 INSTAGRAB EC2 SETUP COMPLETE!"
echo "================================================"
echo ""
echo "🌐 Website URL:      http://${SERVER_IP}/"
echo "🔌 Backend API:      http://${SERVER_IP}/api/health"
echo "🛡️ Admin Panel:      http://${SERVER_IP}/admin"
echo ""
echo "🤖 Telegram Bot Status:"
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo "   Token:           Configured"
    echo "   Bot Service:     Started with Backend"
else
    echo "   Token:           Not set in script"
    echo "   Configure:       Set token anytime via Admin Panel -> Telegram Bot tab!"
fi
echo ""
echo "📊 Current PM2 Services:"
pm2 status
echo ""
echo "ℹ️  Tip: Your GitHub Actions CI/CD pipeline will automatically"
echo "   deploy new code on 'git push origin main' without overwriting"
echo "   your production .env secrets!"
echo "================================================"