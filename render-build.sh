#!/usr/bin/env bash
set -o errexit

echo "Installing system packages required for OCR..."
apt-get update
apt-get install -y --no-install-recommends \
  graphicsmagick \
  ghostscript \
  poppler-utils \
  tesseract-ocr \
  tesseract-ocr-eng

rm -rf /var/lib/apt/lists/*

echo "Installing project dependencies..."
npm install

echo "Building application..."
npm run build

echo "Preparing temp directory for OCR artifacts..."
mkdir -p temp
