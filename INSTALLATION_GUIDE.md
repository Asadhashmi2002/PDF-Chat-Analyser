# 📦 Installation Guide - PDF Chat Navigator

## Prerequisites

Before installing the PDF Chat Navigator, ensure you have the following:

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### API Requirements
- **Google AI API Key**: Required for AI functionality
- **Firebase Project**: Optional for advanced features

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pdf-chat-navigator.git
cd pdf-chat-navigator
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Required: Google AI API Key
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Optional: Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 4. Start Development Server
```bash
# Start the main application
npm run dev

# In a separate terminal, start the AI development server
npm run genkit:dev
```

### 5. Open Your Browser
Navigate to `http://localhost:9002` to see your application!

## 🔧 Detailed Setup

### Google AI API Setup

1. **Create Google AI Studio Account**
   - Go to [Google AI Studio](https://aistudio.google.com)
   - Sign in with your Google account
   - Create a new project

2. **Generate API Key**
   - Navigate to "Get API Key" section
   - Click "Create API Key"
   - Copy the generated key
   - Add it to your `.env.local` file

3. **Enable Required APIs**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable "Generative AI API"
   - Set up billing if required

### Firebase Setup (Optional)

1. **Create Firebase Project**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

2. **Configure Firebase**
   - Select "Hosting" and "Functions"
   - Choose your project directory
   - Follow the setup prompts

3. **Update Configuration**
   ```typescript
   // src/lib/firebase.ts
   import { initializeApp } from 'firebase/app';
   
   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
     projectId: process.env.FIREBASE_PROJECT_ID,
     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
   };
   
   const app = initializeApp(firebaseConfig);
   export default app;
   ```

## 🛠️ Development Setup

### Code Quality Tools

1. **ESLint Configuration**
   ```bash
   npm run lint
   npm run lint:fix
   ```

2. **TypeScript Checking**
   ```bash
   npm run typecheck
   ```

3. **Code Formatting**
   ```bash
   npm run format
   npm run format:check
   ```

### Testing Setup

1. **Install Testing Dependencies**
   ```bash
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom
   ```

2. **Configure Jest**
   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     moduleNameMapping: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   };
   ```

3. **Run Tests**
   ```bash
   npm run test
   npm run test:watch
   npm run test:coverage
   ```

## 🚀 Production Build

### Build Process
```bash
# Create production build
npm run build

# Start production server
npm start

# Export static files (if needed)
npm run export
```

### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Clean build artifacts
npm run clean
```

## 🔍 Troubleshooting

### Common Installation Issues

#### 1. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

#### 2. Dependency Installation Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Install latest TypeScript
npm install --save-dev typescript@latest
```

#### 4. AI API Connection Issues
```bash
# Test API connection
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://generativelanguage.googleapis.com/v1beta/models
```

### Environment Variable Issues

#### Missing Environment Variables
```bash
# Check if .env.local exists
ls -la .env.local

# Verify environment variables are loaded
node -e "console.log(process.env.GOOGLE_AI_API_KEY)"
```

#### API Key Validation
```typescript
// Test API key in browser console
fetch('https://generativelanguage.googleapis.com/v1beta/models', {
  headers: {
    'Authorization': `Bearer ${process.env.GOOGLE_AI_API_KEY}`
  }
}).then(response => console.log(response.status));
```

## 📱 Platform-Specific Setup

### Windows
```bash
# Install Windows Build Tools
npm install --global windows-build-tools

# Use PowerShell for better compatibility
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Use Homebrew for Node.js
brew install node
```

### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🔒 Security Considerations

### Environment Security
```bash
# Never commit .env files
echo ".env*" >> .gitignore

# Use different keys for development/production
# .env.local for development
# Environment variables for production
```

### API Key Security
```typescript
// Validate API key format
const validateApiKey = (key: string) => {
  return key && key.length > 20 && key.startsWith('AIza');
};
```

## 📊 Performance Optimization

### Development Performance
```bash
# Use turbo mode for faster builds
npm run dev -- --turbo

# Enable hot reload
npm run dev -- --fast-refresh
```

### Production Performance
```bash
# Analyze bundle size
npm run analyze

# Optimize images
npm install --save-dev @next/bundle-analyzer
```

## 🧪 Testing Your Installation

### Basic Functionality Test
1. **Start the application**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:9002`
3. **Upload a PDF**: Test file upload functionality
4. **Ask a question**: Verify AI chat responses
5. **Test citations**: Click citation buttons

### API Integration Test
```typescript
// Test AI API connection
const testAI = async () => {
  try {
    const response = await fetch('/api/test-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    console.log('AI API working:', response.ok);
  } catch (error) {
    console.error('AI API error:', error);
  }
};
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Google AI Studio](https://aistudio.google.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community Support
- [GitHub Issues](https://github.com/yourusername/pdf-chat-navigator/issues)
- [Discord Community](https://discord.gg/your-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/pdf-chat-navigator)

---

**Follow this guide step-by-step to successfully install and run the PDF Chat Navigator application!**
