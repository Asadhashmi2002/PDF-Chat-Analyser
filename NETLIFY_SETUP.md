# Netlify Deployment Setup

## Environment Variables Required

Add these environment variables in your Netlify dashboard:

### Required Variables:
- `GROK_API_KEY` - Get from https://console.groq.com/keys
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
- `NODE_ENV` - Set to `production`

### Setup Steps:
1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add the three variables above
3. Redeploy your site

## API Keys Setup:

### Grok AI (Primary):
- Visit: https://console.groq.com/keys
- Create new API key
- Copy and paste into `GROK_API_KEY`

### OpenAI (Secondary):
- Visit: https://platform.openai.com/api-keys
- Create new API key
- Copy and paste into `OPENAI_API_KEY`

## Deployment:
- Connect your GitHub repository to Netlify
- Build command: `npm run build`
- Publish directory: `.next`
- Deploy automatically on push to main branch
