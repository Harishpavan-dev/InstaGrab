#!/bin/bash
# ═══════════════════════════════════════════════
#  InstaGrab - EC2 Ubuntu Setup Script
#  Run this ONCE after creating your EC2 instance
# ═══════════════════════════════════════════════

set -e

echo "🚀 Setting up InstaGrab on EC2..."

# ─── 1. Update System ───
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# ─── 2. Install Node.js 20 ───
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "   Node version: $(node -v)"
echo "   NPM version: $(npm -v)"

# ─── 3. Install PM2 ───
echo "📦 Installing PM2..."
sudo npm install -g pm2

# ─── 4. Install Nginx ───
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# ─── 5. Install Git ───
echo "📦 Installing Git..."
sudo apt install -y git

# ─── 6. Clone the repo ───
echo "📥 Cloning InstaGrab repository..."
cd ~
git clone https://github.com/Harishpavan-dev/InstaGrab.git instagrab
cd instagrab

# ─── 7. Setup Backend ───
echo "🔧 Setting up backend..."
cd backend
npm install
npm run build
cd ..

# ─── 8. Setup Frontend ───
echo "🔧 Setting up frontend..."
cd frontend
npm install
NEXT_PUBLIC_API_URL=/api npm run build
cd ..

# ─── 9. Create .env for backend ───
echo "🔧 Creating backend .env..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
FILE_EXPIRATION_MINUTES=30
MAX_DOWNLOAD_SIZE_MB=500
TEMP_DIR=./temp
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DOWNLOAD_RATE_LIMIT_MAX=10
INFO_RATE_LIMIT_MAX=30
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=info
EOF

# ─── 10. Create frontend .env.local ───
echo "🔧 Creating frontend .env.local..."
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=/api
EOF

# ─── 11. Setup Nginx ───
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/instagrab > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 500M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/instagrab /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# ─── 12. Start with PM2 ───
echo "🔄 Starting services with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash

# ─── 13. Create cookies directory ───
mkdir -p cookies

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ InstaGrab setup complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "  🌐 Open http://$(curl -s ifconfig.me) in your browser"
echo ""
echo "  Useful commands:"
echo "    pm2 status          - Check app status"
echo "    pm2 logs            - View logs"
echo "    pm2 restart all     - Restart apps"
echo ""
