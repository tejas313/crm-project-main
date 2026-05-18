# Build Stage: Use Node.js slim image to build the application
FROM node:20-slim AS builder
 
WORKDIR /app
 
COPY package*.json ./
RUN npm install --force --verbose
 
COPY . .
RUN npm run build
 
# Production Stage: Use Puppeteer + Playwright Chromium (combined)
FROM node:20-slim
 
# Install OS dependencies required for Puppeteer and Playwright Chromium
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget curl gnupg unzip fonts-liberation libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    fonts-dejavu-core fonts-noto-core fonts-noto-mono fonts-noto-cjk fonts-noto-color-emoji \
    lsb-release xdg-utils libu2f-udev libvulkan1 libcurl3-gnutls libdrm2 libgbm1 \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*
 
# Install Chrome for Puppeteer
RUN wget --quiet --output-document=/tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i /tmp/google-chrome.deb || apt-get install -f -y && \
    rm /tmp/google-chrome.deb
 
# Set env for Puppeteer to use installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
 
# Set working dir for app
WORKDIR /app
 
# Copy built app from builder
COPY --from=builder /app /app
 
# Install only production deps + Playwright
RUN npm install --production --force --verbose && \
    npm install playwright && \
    npx playwright install chromium --with-deps
 
# Optional: Install NestJS CLI globally
RUN npm i -g @nestjs/cli
 
# Expose app port
EXPOSE 3000
 
# Start app
CMD ["npm", "run", "start:prod"]

# Expose port 3000 for the app
EXPOSE 3000

# Install Nest CLI globally
# RUN npm i -g @nestjs/cli

# Start the app
CMD ["npm", "run", "start:prod"]

