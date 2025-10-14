# Netlify Deployment Guide for PDF Chat Analyser

## 🚀 Quick Deploy to Netlify

### Option 1: Deploy from GitHub (Recommended)

1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Choose "GitHub" and select your repository: `Asadhashmi2002/PDF-Chat-Analyser`

2. **Configure Build Settings:**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add the following variables:
   ```
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   NODE_ENV=production
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 2: Manual Deploy

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Install Netlify CLI: `npm install -g netlify-cli`
   - Login: `netlify login`
   - Deploy: `netlify deploy --prod --dir=out`

## 🔧 Configuration Files

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "out"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### _redirects
```
/*    /index.html   200
```

### public/_headers
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block

/static/*
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Cache-Control: no-cache, no-store, must-revalidate
```

## 🌐 Environment Variables

### Required Variables:
- `GOOGLE_API_KEY` - Google Gemini API key
- `GROQ_API_KEY` - Groq API key (fallback)

### Optional Variables:
- `OPENAI_API_KEY` - OpenAI API key
- `NODE_ENV` - Set to "production"

## 📱 Features After Deployment

✅ **Static Site Generation** - Fast loading times
✅ **CDN Distribution** - Global content delivery
✅ **Automatic HTTPS** - Secure connections
✅ **Custom Domain** - Use your own domain
✅ **Form Handling** - Built-in form processing
✅ **Serverless Functions** - API routes work as serverless functions

## 🔒 Security Features

✅ **Security Headers** - XSS protection, content type sniffing prevention
✅ **HTTPS Enforcement** - Automatic SSL certificates
✅ **Environment Variables** - Secure API key storage
✅ **CORS Protection** - Cross-origin request security

## 🚀 Performance Optimizations

✅ **Static Export** - Pre-built pages for faster loading
✅ **Image Optimization** - Optimized images for web
✅ **Caching Headers** - Proper cache control for static assets
✅ **CDN Distribution** - Global content delivery network

## 📊 Monitoring & Analytics

✅ **Build Logs** - Detailed deployment logs
✅ **Performance Metrics** - Core Web Vitals tracking
✅ **Error Tracking** - Automatic error monitoring
✅ **Uptime Monitoring** - Site availability tracking

## 🔄 Continuous Deployment

✅ **Auto Deploy** - Automatic deployments on git push
✅ **Branch Deploys** - Deploy preview branches
✅ **Rollback** - Easy rollback to previous versions
✅ **Build Hooks** - Custom deployment triggers

## 🛠️ Troubleshooting

### Build Failures:
1. Check Node.js version (should be 18+)
2. Verify all dependencies are installed
3. Check for TypeScript errors
4. Ensure environment variables are set

### Runtime Issues:
1. Check browser console for errors
2. Verify API keys are correctly set
3. Check network tab for failed requests
4. Test with different browsers

### Performance Issues:
1. Enable gzip compression
2. Optimize images
3. Check bundle size
4. Use Netlify's performance insights

## 📞 Support

- **Netlify Docs:** https://docs.netlify.com/
- **Next.js Static Export:** https://nextjs.org/docs/advanced-features/static-html-export
- **GitHub Repository:** https://github.com/Asadhashmi2002/PDF-Chat-Analyser

## 🎯 Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure analytics** (Google Analytics, etc.)
3. **Set up monitoring** (Uptime monitoring, error tracking)
4. **Optimize performance** (Image optimization, caching)
5. **Test all features** (PDF upload, chat, AI responses)

---

**Your PDF Chat Analyser is now ready for production! 🎉**
