# PDF Chat Analyser

A powerful AI-powered PDF document analysis and interaction platform that enables users to upload and interact with PDF documents through an intelligent chat interface, built with Next.js and optimized for advanced document processing.

## 🎯 Assignment Requirements Fulfilled

### ✅ PDF Upload and Viewing
- **Large PDF Support** - Handles PDF files of any size efficiently
- **Built-in PDF Viewer** - Integrated iframe-based viewer with navigation
- **Mobile Responsive** - Touch-optimized interface for all devices

### ✅ Chat Interface
- **AI-Powered Q&A** - Ask questions about PDF content
- **Minimal Token Usage** - Optimized prompts and efficient processing
- **Smart Suggestions** - Context-aware question recommendations
- **Multi-language Support** - English and Hindi responses

### ✅ Citation & Navigation
- **Page Citations** - References specific pages in responses
- **Clickable Citations** - Navigate directly to referenced pages
- **PDF Navigation** - Seamless integration between chat and viewer

### ✅ AI Integration
- **Multiple AI Providers** - Google Gemini, Groq, OpenAI support
- **Efficient Processing** - Optimized for minimal token usage
- **Fallback System** - Reliable AI responses with multiple providers

## 🤖 AI Models and Their Specific Jobs

### **1. Google Gemini Pro Latest** 
**🎯 Primary Job: Chat Responses (Q&A)**
- **What it does:** Answers user questions about PDF content
- **When used:** First choice for chat responses
- **Model:** `gemini-pro-latest`
- **Rate Limit:** 2 requests/minute (free tier)
- **Purpose:** Provides NotebookLM-like experience
- **Location:** `src/ai/flows/answer-questions-about-pdf.ts`

### **2. Groq API (Llama 3.1 8B Instant)**
**🎯 Two Jobs:**
1. **Chat Responses (Fallback)** - When Gemini is rate limited
2. **Document Vectorization** - Processing and structuring PDF content

**Chat Responses:**
- **What it does:** Answers questions when Gemini is unavailable
- **Model:** `llama-3.1-8b-instant`
- **Rate Limit:** 30 requests/minute (free tier)

**Document Vectorization:**
- **What it does:** Processes and structures PDF content for better analysis
- **Model:** `llama-3.1-8b-instant`
- **Purpose:** Creates clean, structured document content
- **Location:** `src/ai/flows/vectorize-pdf-content.ts`

### **Workflow:**

#### **When User Uploads PDF:**
1. **PDF Text Extraction** → Local processing (no AI)
2. **Groq AI** → Structures and vectorizes the content
3. **Document Analysis** → Groq AI provides initial summary

#### **When User Asks Questions:**
1. **Google Gemini** → Primary response (if available)
2. **Groq AI** → Fallback response (if Gemini rate limited)
3. **Citation Extraction** → Local processing

### **Model Comparison:**

| Model | Job | Speed | Quality | Rate Limit |
|-------|-----|-------|---------|------------|
| **Gemini Pro** | Chat Q&A | Medium | Excellent | 2/min |
| **Groq Llama** | Chat Q&A + Vectorization | Very Fast | Good | 30/min |

### ✅ Vectorization & RAG
- **PDF Text Extraction** - Advanced text extraction from PDFs
- **Content Chunking** - Intelligent document segmentation
- **RAG Implementation** - Retrieval-augmented generation for accurate responses

### ✅ Performance Optimization
- **Large PDF Handling** - Efficient memory management
- **Fast Load Times** - Optimized bundle size and lazy loading
- **Mobile Performance** - Touch-optimized interactions

### ✅ User Interface Design
- **Clean Design** - Intuitive and modern interface
- **Easy Navigation** - Seamless PDF and chat interaction
- **Responsive Layout** - Works on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd notebooklm-clone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env.local file
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   # OR use Groq (already configured)
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:9002
   ```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Server-side functionality
- **Server Actions** - Type-safe server functions
- **PDF Processing** - Advanced text extraction
- **AI Integration** - Multiple provider support

### AI Providers
- **Google Gemini 1.5 Pro** - Primary AI (like NotebookLM)
- **Groq API** - Fast and reliable fallback
- **OpenAI GPT** - Optional premium option

## 📱 Features

### Document Processing
- **PDF Upload** - Drag and drop or click to upload
- **Text Extraction** - Advanced PDF parsing with fallbacks
- **Content Analysis** - Automatic document analysis
- **Smart Suggestions** - Context-aware question prompts

### AI Chat Interface
- **Document Q&A** - Ask questions about your PDF
- **Citation Support** - References specific pages
- **Multi-language** - English and Hindi responses
- **Smart Formatting** - Clean, readable responses

### Mobile Experience
- **Responsive Design** - Works on all devices
- **Touch Optimized** - 44px minimum touch targets
- **Toggle Interface** - Easy switching between chat and PDF
- **Gesture Support** - Swipe and touch interactions

## 🔧 Configuration

### AI Provider Setup

#### Option 1: Google Gemini (Recommended)
```bash
# Get API key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

#### Option 2: Groq API (Current)
```bash
# Get API key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
```

#### Option 3: OpenAI (Optional)
```bash
# Get API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here
```

## 📊 Performance Features

### PDF Processing
- **Efficient Extraction** - Multiple parsing methods
- **Memory Optimization** - Handles large PDFs without issues
- **Error Handling** - Graceful fallbacks for problematic PDFs
- **Progress Indicators** - Real-time processing feedback

### AI Optimization
- **Token Efficiency** - Minimized API calls and token usage
- **Smart Caching** - Reuses processed content
- **Fallback System** - Multiple AI providers for reliability
- **Response Optimization** - Clean, concise outputs

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Netlify
```bash
npm run build
# Deploy to Netlify
```

### Docker
```bash
docker build -t notebooklm-clone .
docker run -p 3000:3000 notebooklm-clone
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── actions.ts         # Server actions
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat-panel.tsx     # Chat interface
│   ├── main-view.tsx      # Main application view
│   ├── pdf-viewer.tsx    # PDF viewer component
│   └── ui/               # UI components
├── ai/                    # AI integration
│   └── flows/            # AI processing flows
├── hooks/                 # Custom React hooks
└── lib/                   # Utility functions
```

## 🎯 Assignment Deliverables

### ✅ Fully Functional Application
- Complete PDF upload and viewing
- AI-powered chat interface
- Citation and navigation system
- Mobile responsive design

### ✅ Well-Documented Source Code
- TypeScript for type safety
- Comprehensive comments
- Modular component architecture
- Clean code structure

### ✅ Installation & Setup Instructions
- Step-by-step setup guide
- Environment configuration
- Dependency management
- Development workflow

### ✅ Accessible URL
- Ready for deployment
- Cloud provider compatible
- Production optimized
- Environment variable support

## 🔍 Key Features Implementation

### PDF Vectorization
- **Text Extraction** - Multiple parsing methods
- **Content Chunking** - Intelligent segmentation
- **RAG Implementation** - Retrieval-augmented generation
- **Citation Support** - Page-specific references

### AI Integration
- **Multiple Providers** - Google Gemini, Groq, OpenAI
- **Efficient Processing** - Optimized token usage
- **Fallback System** - Reliable AI responses
- **Smart Formatting** - Clean, readable outputs

### Performance Optimization
- **Bundle Optimization** - Minimal JavaScript
- **Lazy Loading** - On-demand component loading
- **Memory Management** - Efficient PDF processing
- **Mobile Performance** - Touch-optimized interactions

## 📄 License

MIT License - Feel free to use and modify for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or issues, please open an issue in the repository.

---

**Built with ❤️ for the Google NotebookLM Clone Assignment**