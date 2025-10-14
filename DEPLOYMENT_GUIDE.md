# Google NotebookLM Clone - Deployment Guide

## 🚀 **Quick Deployment Options**

### **Option 1: Vercel (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add GOOGLE_API_KEY
   # Enter your Google Gemini API key
   ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

### **Option 2: Netlify**

1. **Build the project:**
   ```bash
   npm run build
   npm run export
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repository

3. **Set Environment Variables:**
   - Go to Site Settings > Environment Variables
   - Add `GOOGLE_API_KEY` with your API key

### **Option 3: Render**

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
           sync: false
   ```

2. **Deploy:**
   - Connect your repository
   - Set environment variables
   - Deploy

## 🔧 **Environment Variables**

### **Required for AI Integration:**
```bash
# Google Gemini (Recommended - Like NotebookLM)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# OR Groq API (Get your key from https://console.groq.com/keys)
GROQ_API_KEY=your_groq_api_key_here

# OR OpenAI (Optional)
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### **Get API Keys:**

#### **Google Gemini (Free)**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project
3. Generate API key
4. Add to environment variables

#### **Groq API (Free)**
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for free account
3. Generate API key
4. Already configured in the app

## 📱 **Mobile Deployment**

### **Responsive Design:**
- ✅ Mobile-first approach
- ✅ Touch-optimized controls
- ✅ Toggle interface for mobile
- ✅ Responsive PDF viewer

### **Mobile Features:**
- ✅ Chat/PDF toggle buttons
- ✅ Touch-friendly citations
- ✅ Optimized input fields
- ✅ Mobile-optimized suggestions

## 🎯 **Performance Optimization**

### **Build Optimization:**
```bash
# Production build
npm run build

# Analyze bundle
npm run analyze

# Export static files
npm run export
```

### **Runtime Optimization:**
- ✅ Efficient PDF processing
- ✅ Minimal memory usage
- ✅ Fast AI responses
- ✅ Optimized images and assets

## 🔒 **Security Considerations**

### **API Key Security:**
- ✅ Environment variables only
- ✅ No hardcoded keys
- ✅ Secure API calls
- ✅ Error handling

### **File Upload Security:**
- ✅ PDF validation only
- ✅ File size limits
- ✅ Secure processing
- ✅ No file storage

## 📊 **Monitoring & Analytics**

### **Performance Monitoring:**
- ✅ Build time optimization
- ✅ Runtime performance
- ✅ AI response times
- ✅ Error tracking

### **User Analytics:**
- ✅ Document upload tracking
- ✅ Chat interaction metrics
- ✅ Mobile usage statistics
- ✅ Performance monitoring

## 🚀 **Production Checklist**

### **Before Deployment:**
- ✅ Environment variables set
- ✅ API keys configured
- ✅ Build optimization
- ✅ Error handling tested
- ✅ Mobile responsiveness verified

### **After Deployment:**
- ✅ Test PDF upload
- ✅ Test AI responses
- ✅ Test mobile interface
- ✅ Test citation navigation
- ✅ Monitor performance

## 📱 **Mobile Testing**

### **Test on Different Devices:**
- ✅ iPhone (Safari)
- ✅ Android (Chrome)
- ✅ iPad (Safari)
- ✅ Desktop (Chrome, Firefox, Safari)

### **Mobile Features to Test:**
- ✅ PDF upload
- ✅ Chat interface
- ✅ Toggle functionality
- ✅ Citation navigation
- ✅ Smart suggestions

## 🎯 **Final Deployment Steps**

1. **Choose deployment platform**
2. **Set up environment variables**
3. **Deploy the application**
4. **Test all features**
5. **Monitor performance**
6. **Share the URL**

**Your Google NotebookLM clone is ready for deployment!** 🎉