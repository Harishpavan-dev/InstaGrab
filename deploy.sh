#!/bin/bash

echo "🚀 Starting deployment for Video Downloader..."

# Exit on error
set -e

# Update and install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
npm run build
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

# Restart PM2
echo "🔄 Reloading PM2 processes..."
pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js

# Restart Nginx
echo "🌐 Restarting Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/video-downloader
sudo ln -sf /etc/nginx/sites-available/video-downloader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Deployment completed successfully!"
