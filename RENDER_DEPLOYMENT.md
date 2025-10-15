# Render Deployment Guide

## Prerequisites
- GitHub repository with the code
- Render account (free tier available)
- API keys for Grok AI and OpenAI

## Deployment Steps

### 1. Connect to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### 2. Configure Build Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x or higher

### 3. Environment Variables
Add these environment variables in Render dashboard:
- `GROK_API_KEY`: Your Grok AI API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: `production`

### 4. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy
- Your app will be available at `https://your-app-name.onrender.com`

## Features Included
✅ PDF Upload and Processing
✅ AI-powered Document Analysis
✅ Chat Interface
✅ RAG (Retrieval-Augmented Generation)
✅ OCR Support for Image-based PDFs
✅ Responsive Design
✅ Mobile-friendly Interface

## API Keys Setup
1. Get Grok AI API key from [console.groq.com](https://console.groq.com)
2. Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
3. Add both keys in Render environment variables

## Troubleshooting
- If build fails, check Node.js version (use 18.x+)
- Ensure all environment variables are set
- Check build logs for specific errors
- Make sure all dependencies are in package.json

## Cost
- Free tier available with limitations
- Paid plans start at $7/month for better performance
