# Netlify Deployment Setup Guide

## Environment Variables Configuration

### Required Environment Variables

Add these environment variables in your Netlify dashboard:

1. **Go to Netlify Dashboard** → Your Site → Site Settings → Environment Variables

2. **Add the following variables:**

```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key_here
NODE_ENV=production
```

### API Keys Setup

#### 1. Perplexity API Key
- **Get your key from:** https://www.perplexity.ai/settings/api
- **Variable name:** `PERPLEXITY_API_KEY`
- **Purpose:** AI-powered document analysis and chat functionality

#### 2. LlamaCloud API Key  
- **Get your key from:** https://cloud.llamaindex.ai/
- **Variable name:** `LLAMA_CLOUD_API_KEY`
- **Purpose:** Advanced PDF parsing and text extraction

### Deployment Steps

1. **Connect Repository:**
   - Connect your GitHub repository to Netlify
   - Enable automatic deployments

2. **Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18.x or higher

3. **Environment Variables:**
   - Add all required environment variables in Netlify dashboard
   - Ensure they are marked as "Sensitive" for security

4. **Deploy:**
   - Trigger deployment manually or push to main branch
   - Monitor build logs for any issues

### Verification

After deployment, test the following:

1. **PDF Upload:** Upload a test PDF file
2. **LlamaCloud Integration:** Check if advanced PDF parsing works
3. **AI Chat:** Test the chat functionality with questions about the PDF
4. **Error Handling:** Verify fallback mechanisms work properly

### Troubleshooting

**Common Issues:**

1. **Build Failures:**
   - Check Node.js version (use 18.x or higher)
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Environment Variables:**
   - Ensure all required variables are set
   - Check variable names match exactly (case-sensitive)
   - Verify API keys are valid and active

3. **PDF Processing Issues:**
   - LlamaCloud API may have rate limits
   - Fallback to pdf-parse should work automatically
   - Check browser console for specific error messages

### Security Notes

- Never commit API keys to the repository
- Use Netlify's environment variables for all sensitive data
- Regularly rotate API keys for security
- Monitor API usage to avoid unexpected charges

### Support

If you encounter issues:
1. Check Netlify build logs
2. Verify environment variables are set correctly
3. Test locally with the same environment variables
4. Check API key validity and quotas
