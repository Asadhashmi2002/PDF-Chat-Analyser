# Netlify Deployment Guide

## 🚀 Deploy PDF Chat Analyser to Netlify

This guide will help you deploy your PDF Chat Analyser to Netlify with Perplexity API integration.

---

## 📋 Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Perplexity API Key**: Get from [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)

---

## 🔧 Step 1: Configure Environment Variables

### In Netlify Dashboard:

1. Go to your site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```bash
# Required: Perplexity API Key
PERPLEXITY_API_KEY=pplx-your_actual_api_key_here

# Optional: Application settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Environment Variables Explained:

| Variable | Required | Description |
|----------|----------|-------------|
| `PERPLEXITY_API_KEY` | ✅ Yes | Your Perplexity API key for AI processing |
| `NODE_ENV` | ❌ No | Set to "production" for optimization |
| `NEXT_TELEMETRY_DISABLED` | ❌ No | Disables Next.js telemetry |

---

## 🏗️ Step 2: Build Configuration

The project includes these Netlify configuration files:

### `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NEXT_TELEMETRY_DISABLED = "1"
```

### `_redirects`
```
/*    /index.html   200
```

### `public/_headers`
```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
```

---

## 🚀 Step 3: Deploy to Netlify

### Option A: Connect GitHub Repository

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with your account

2. **New Site from Git**
   - Click "New site from Git"
   - Choose "GitHub" as provider
   - Select your repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

4. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add `PERPLEXITY_API_KEY=your_key_here`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Option B: Manual Deploy

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Deploy Folder**
   - Drag and drop the `.next` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod`

---

## 🔍 Step 4: Verify Deployment

### Check These URLs:

1. **Main Site**: `https://your-site-name.netlify.app`
2. **API Health**: `https://your-site-name.netlify.app/api/health` (if implemented)

### Test Features:

1. **PDF Upload**: Upload a test PDF
2. **AI Processing**: Ask questions about the PDF
3. **Error Handling**: Test without API key

---

## 🛠️ Step 5: Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to Site settings → Domain management
   - Add your custom domain
   - Configure DNS records

2. **SSL Certificate**
   - Netlify provides free SSL
   - Automatically configured

---

## 📊 Step 6: Monitor Performance

### Netlify Analytics:

1. **Site Analytics**
   - View visitor statistics
   - Monitor page performance
   - Track form submissions

2. **Build Logs**
   - Check build status
   - Debug deployment issues
   - Monitor build times

---

## 🔧 Troubleshooting

### Common Issues:

#### Build Fails
```bash
# Check Node version
NODE_VERSION = "18"

# Clear cache and rebuild
npm run clean
npm run build
```

#### API Not Working
```bash
# Verify environment variables
PERPLEXITY_API_KEY=pplx-your_key_here

# Check API key format
# Should start with "pplx-"
```

#### PDF Upload Issues
```bash
# Check file size limits
# Netlify: 100MB max
# Consider file size optimization
```

---

## 🎯 Production Optimizations

### Performance:

1. **Image Optimization**
   - Use Next.js Image component
   - Optimize PDF thumbnails
   - Enable WebP format

2. **Caching**
   - Static assets cached
   - API responses optimized
   - CDN distribution

3. **Security**
   - HTTPS enforced
   - Security headers configured
   - API key protection

---

## 📈 Monitoring & Analytics

### Netlify Features:

1. **Build Analytics**
   - Build success rate
   - Build duration
   - Error tracking

2. **Performance Monitoring**
   - Core Web Vitals
   - Page load times
   - User experience metrics

3. **Function Logs**
   - API call logs
   - Error debugging
   - Performance metrics

---

## 🔄 Continuous Deployment

### Automatic Deploys:

1. **Git Integration**
   - Push to main branch
   - Automatic build trigger
   - Preview deployments

2. **Branch Deploys**
   - Feature branch previews
   - Staging environment
   - Production deployment

---

## 💰 Cost Considerations

### Netlify Pricing:

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | Free | 100GB bandwidth, 300 build minutes |
| **Pro** | $19/month | 1TB bandwidth, 1000 build minutes |
| **Business** | $99/month | 2TB bandwidth, 2000 build minutes |

### Perplexity API Costs:

- **sonar model**: ~$0.001 per query
- **sonar-pro model**: ~$0.002 per query
- **sonar-deep-research**: ~$0.01 per query

---

## 🎉 Success Checklist

- [ ] Repository connected to Netlify
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Site accessible
- [ ] PDF upload working
- [ ] AI Q&A functional
- [ ] Custom domain (optional)
- [ ] SSL certificate active
- [ ] Performance optimized

---

## 📞 Support

### If You Need Help:

1. **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
2. **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
3. **Perplexity API**: [docs.perplexity.ai](https://docs.perplexity.ai)

### Common Commands:

```bash
# Local development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Deploy to Netlify
netlify deploy --prod
```

---

## 🎯 Final Notes

Your PDF Chat Analyser is now ready for production deployment on Netlify with:

- ✅ **Perplexity API Integration**
- ✅ **Advanced RAG Capabilities**
- ✅ **Large PDF Support** (up to 115MB)
- ✅ **Secure Environment**
- ✅ **Optimized Performance**
- ✅ **Automatic Deployments**

**Deploy URL**: `https://your-site-name.netlify.app`

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0 (Netlify Ready)  
**Status**: Ready for Production 🚀