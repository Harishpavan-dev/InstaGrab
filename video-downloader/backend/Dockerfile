FROM node:20-alpine

# Install Python, pip, and ffmpeg for yt-dlp
RUN apk add --no-cache python3 py3-pip ffmpeg \
    && python3 -m pip install --break-system-packages yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Create temp and cookies directories
RUN mkdir -p /app/temp /app/cookies

EXPOSE 3001

CMD ["npm", "start"]
