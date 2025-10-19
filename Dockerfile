FROM node:20-bullseye

WORKDIR /app

# Install system dependencies required for OCR (pdf2pic + tesseract)
RUN apt-get update && apt-get install -y --no-install-recommends \
    graphicsmagick \
    ghostscript \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-eng && \
    rm -rf /var/lib/apt/lists/*

# Install project dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Build the Next.js application
RUN npm run build

# Ensure OCR temp directory exists at runtime
RUN mkdir -p temp

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
