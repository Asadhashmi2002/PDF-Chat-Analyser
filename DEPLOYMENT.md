# Deployment Guide - Google NotebookLM Clone

This guide provides step-by-step instructions for deploying the Google NotebookLM Clone to various cloud platforms.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `GOOGLE_API_KEY=your_key_here`
   - Add: `GROQ_API_KEY=your_key_here` (optional)

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables in Netlify dashboard

3. **Environment Variables:**
   ```
   GOOGLE_API_KEY=your_google_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

### Option 3: Render

1. **Create render.yaml:**
   ```yaml
   services:
     - type: web
       name: notebooklm-clone
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: GOOGLE_API_KEY
           value: your_google_api_key
         - key: GROQ_API_KEY
           value: your_groq_api_key
   ```

2. **Deploy:**
   - Connect your repository
   - Render will automatically deploy

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.local` file:

```bash
# Primary AI Provider (Google Gemini - Like NotebookLM)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Fallback AI Provider (Groq - Fast and Free)
GROQ_API_KEY=your_groq_api_key_here

# Optional AI Provider (OpenAI)
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### Getting API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your environment variables

#### Groq API Key
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Copy the key to your environment variables

#### OpenAI API Key (Optional)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to your environment variables

## 📦 Build Instructions

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Domain Configuration

### Custom Domain (Vercel)
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Custom Domain (Netlify)
1. Go to Netlify Dashboard → Site Settings → Domain Management
2. Add your custom domain
3. Configure DNS records

## 🔒 Security Considerations

### Environment Variables
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly

### CORS Configuration
- Configure CORS for your domain
- Restrict API access to your domain only

### Rate Limiting
- Implement rate limiting for API calls
- Monitor usage to avoid exceeding limits

## 📊 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

### Image Optimization
- Use Next.js Image component
- Optimize images before upload
- Use appropriate formats (WebP, AVIF)

### Caching
- Implement proper caching headers
- Use CDN for static assets
- Cache API responses appropriately

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

#### Environment Variables Not Working
- Check variable names (case-sensitive)
- Ensure variables are set in deployment platform
- Restart the application after adding variables

#### PDF Processing Issues
- Check file size limits
- Verify PDF format compatibility
- Monitor memory usage

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run dev
```

## 📈 Monitoring

### Performance Monitoring
- Use Vercel Analytics (if using Vercel)
- Monitor Core Web Vitals
- Track API response times

### Error Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor API failures
- Track user interactions

## 🔄 Updates and Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Database Maintenance
- Monitor storage usage
- Clean up old files
- Optimize database queries

## 📞 Support

### Getting Help
- Check the README.md for setup instructions
- Review the troubleshooting section
- Open an issue in the repository

### Common Solutions
- Clear browser cache
- Check API key validity
- Verify environment variables
- Restart the application

---

**Ready to deploy your Google NotebookLM Clone! 🚀**
