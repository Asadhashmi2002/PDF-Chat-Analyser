'use server';

/**
 * @fileOverview A flow that vectorizes PDF content for AI analysis.
 *
 * - vectorizePdfContent - A function that extracts and structures PDF content.
 * - VectorizePdfContentInput - The input type for the vectorizePdfContent function.
 * - VectorizePdfContentOutput - The return type for the vectorizePdfContent function.
 */

import {z} from 'zod';
import { OpenAI } from 'openai';

// Dual AI System for optimal results (2025)
const GROK_API_KEY = process.env.GROK_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// RAG System with OpenAI embeddings for enhanced context
let openai: OpenAI | null = null;
let documentChunks: Array<{text: string, embedding: number[], metadata: any}> = [];

// Initialize OpenAI for embeddings
async function initializeOpenAI() {
  if (!openai && OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }
}

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}




// Calculate cosine similarity for RAG
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Store document chunks with embeddings for RAG
async function storeDocumentChunks(chunks: string[], metadata: any) {
  await initializeOpenAI();
  
  if (!openai) {
    return;
  }
  
  try {
    // Clear existing chunks
    documentChunks = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);
      
      documentChunks.push({
        text: chunk,
        embedding: embedding,
        metadata: {
          ...metadata,
          chunkIndex: i,
          chunkId: `${metadata.title || 'document'}_chunk_${i}`
        }
      });
    }
  } catch (error) {
    // Error storing document chunks
  }
}

// Retrieve relevant chunks using RAG
async function retrieveRelevantChunks(query: string, topK: number = 5): Promise<string[]> {
  await initializeOpenAI();
  
  if (!openai || documentChunks.length === 0) {
    return [];
  }
  
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Calculate similarities and sort
    const similarities = documentChunks.map(chunk => ({
      text: chunk.text,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
      metadata: chunk.metadata
    })).sort((a, b) => b.similarity - a.similarity);
    
    // Return top K most relevant chunks
    return similarities.slice(0, topK).map(item => item.text);
  } catch (error) {
    return [];
  }
}


// Advanced text chunking for RAG (Retrieval-Augmented Generation) - 2025 Enhanced
function createVectorChunks(text: string, chunkSize: number = 512, overlap: number = 128): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) {
      chunks.push(chunk.trim());
    }
  }
  
  return chunks;
}

// Advanced PDF text extraction using LlamaParse (2025 Enhanced)
async function extractTextAdvanced(pdfBuffer: Buffer): Promise<{
  text: string;
  metadata: {
    pages: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  structure: {
    headings: string[];
    paragraphs: string[];
    lists: string[];
    tables: string[];
  };
}> {
  let extractedText = '';
  let metadata: any = {};
  let structure: any = {
    headings: [],
    paragraphs: [],
    lists: [],
    tables: []
  };

  try {
    // Universal PDF parsing - handles all PDF types including image-based PDFs
   
    // Method 1: Try pdfjs-dist first (most reliable for text extraction)
    try {
      
      // @ts-ignore - pdfjs-dist module types
      const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
      const uint8Array = new Uint8Array(pdfBuffer);
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      if (fullText.trim().length > 0) {
        extractedText = fullText.trim();
        metadata = {
          pages: pdf.numPages,
          title: 'Document',
          author: 'Unknown',
          subject: 'Unknown',
          creator: 'Unknown',
          producer: 'Unknown',
          creationDate: new Date().toISOString(),
          modificationDate: new Date().toISOString()
        };
        console.log('✅ pdfjs-dist successful - extracted', extractedText.length, 'characters');
      } else {
        throw new Error('No text content extracted with pdfjs-dist - likely image-based PDF');
      }
    } catch (pdfjsError) {
      console.warn('⚠️ pdfjs-dist failed, trying OCR for image-based PDFs:', pdfjsError);
      
      // Method 2: OCR for image-based PDFs using pdf2pic + tesseract.js
      try {
        console.log('🔄 Attempting OCR extraction for image-based PDF...');
        const pdf2pic = require('pdf2pic');
        const { createWorker } = require('tesseract.js');
        
        // Convert PDF to images
        const convert = pdf2pic.fromBuffer(pdfBuffer, {
          density: 300,           // Higher DPI for better OCR
          saveFilename: "page",
          savePath: "./temp",
          format: "png",
          width: 2000,
          height: 2000
        });
        
        const results = await convert.bulk(-1); // Convert all pages
        console.log(`📸 Converted ${results.length} pages to images`);
        
        // Initialize Tesseract OCR worker
        const worker = await createWorker('eng', 1, {
          logger: (m: any) => console.log('OCR:', m)
        });
        
        let ocrText = '';
        for (let i = 0; i < results.length; i++) {
          console.log(`🔍 Processing page ${i + 1} with OCR...`);
          const { data: { text } } = await worker.recognize(results[i].path);
          ocrText += text + '\n';
        }
        
        await worker.terminate();
        
        if (ocrText.trim().length > 0) {
          extractedText = ocrText.trim();
          metadata = {
            pages: results.length,
            title: 'Document (OCR)',
            author: 'Unknown',
            subject: 'Unknown',
            creator: 'Unknown',
            producer: 'Unknown',
            creationDate: new Date().toISOString(),
            modificationDate: new Date().toISOString()
          };
          console.log('✅ OCR successful - extracted', extractedText.length, 'characters from images');
        } else {
          throw new Error('OCR failed to extract text from images');
        }
      } catch (ocrError) {
        console.warn('⚠️ OCR failed, trying pdf-lib metadata extraction:', ocrError);
        
        // Method 3: Try pdf-lib for metadata at minimum
        try {
          console.log('🔄 Attempting pdf-lib metadata extraction...');
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.load(pdfBuffer);
          
          const pageCount = pdfDoc.getPageCount();
          const title = pdfDoc.getTitle() || 'Document';
          const author = pdfDoc.getAuthor() || 'Unknown';
          const subject = pdfDoc.getSubject() || 'Unknown';
          const creator = pdfDoc.getCreator() || 'Unknown';
          const producer = pdfDoc.getProducer() || 'Unknown';
          
          extractedText = `Document processed with pdf-lib. Title: ${title}, Author: ${author}, Pages: ${pageCount}. This appears to be an image-based PDF. For better text extraction, please use a text-based PDF or ensure the document has selectable text.`;
          metadata = {
            pages: pageCount,
            title: title,
            author: author,
            subject: subject,
            creator: creator,
            producer: producer,
            creationDate: new Date().toISOString(),
            modificationDate: new Date().toISOString()
          };
          console.log('✅ pdf-lib successful - extracted metadata and basic info');
        } catch (pdfLibError) {
          console.error('❌ All PDF extraction methods failed:', pdfLibError);
          extractedText = 'PDF content extraction failed. The document may be corrupted, password-protected, or in an unsupported format. Please try with a different PDF file.';
          metadata = {
            pages: 1,
            title: 'Document',
            author: 'Unknown',
            subject: 'Unknown',
            creator: 'Unknown',
            producer: 'Unknown',
            creationDate: new Date().toISOString(),
            modificationDate: new Date().toISOString()
          };
        }
      }
    }

    // Advanced text structure analysis
    if (extractedText) {
      // Extract headings (lines that are short and likely titles)
      const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      structure.headings = lines.filter(line => 
        line.length < 100 && 
        (line.match(/^[A-Z][A-Z\s]+$/) || 
         line.match(/^\d+\.?\s+[A-Z]/) ||
         line.match(/^[A-Z][a-z]+.*:$/))
      );

      // Extract paragraphs (longer text blocks)
      structure.paragraphs = lines.filter(line => 
        line.length > 100 && 
        line.includes('.') && 
        !line.match(/^\d+\.?\s*$/)
      );

      // Extract lists (lines with bullets or numbers)
      structure.lists = lines.filter(line => 
        line.match(/^[\s]*[•\-\*\d+\.]\s/) ||
        line.match(/^\d+\.\s/) ||
        line.match(/^[a-z]\.\s/)
      );

      // Extract tables (lines with multiple columns/spaces)
      structure.tables = lines.filter(line => 
        line.includes('  ') && 
        line.split(/\s{2,}/).length > 2 &&
        line.length > 50
      );
    }

  } catch (error) {
    console.error('Advanced PDF extraction error:', error);
    throw new Error(`Advanced PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    text: extractedText,
    metadata,
    structure
  };
}

// Enhanced content analysis and optimization
function analyzeContentStructure(text: string, structure: any): {
  documentType: string;
  keyTopics: string[];
  importantSections: string[];
  readabilityScore: number;
} {
  // Document type detection
  let documentType = 'General Document';
  if (text.toLowerCase().includes('contract') || text.toLowerCase().includes('agreement')) {
    documentType = 'Contract/Agreement';
  } else if (text.toLowerCase().includes('resume') || text.toLowerCase().includes('cv')) {
    documentType = 'Resume/CV';
  } else if (text.toLowerCase().includes('invoice') || text.toLowerCase().includes('bill')) {
    documentType = 'Invoice/Bill';
  } else if (text.toLowerCase().includes('report') || text.toLowerCase().includes('analysis')) {
    documentType = 'Report/Analysis';
  } else if (text.toLowerCase().includes('manual') || text.toLowerCase().includes('guide')) {
    documentType = 'Manual/Guide';
  }

  // Extract key topics from headings and important text
  const keyTopics = [
    ...structure.headings.slice(0, 10),
    ...text.split('\n')
      .filter(line => line.length > 20 && line.length < 100)
      .slice(0, 5)
  ].filter(topic => topic && topic.trim().length > 0);

  // Important sections (headings + first paragraph)
  const importantSections = [
    ...structure.headings.slice(0, 5),
    ...structure.paragraphs.slice(0, 3)
  ].filter(section => section && section.trim().length > 0);

  // Simple readability score (0-100)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 10) * 2));

  return {
    documentType,
    keyTopics,
    importantSections,
    readabilityScore
  };
}

// RAG-powered question answering
export async function answerQuestionWithRAG(question: string): Promise<string> {
  try {
    console.log(`🤔 Processing question with RAG: "${question}"`);
    
    // Initialize RAG system
    await initializeOpenAI();
    
    if (!openai || documentChunks.length === 0) {
      return "RAG system not available. Please ensure OpenAI API key is configured and document is processed.";
    }
    
    // Retrieve relevant chunks using RAG
    const relevantChunks = await retrieveRelevantChunks(question, 5);
    
    if (relevantChunks.length === 0) {
      return "No relevant information found in the document for this question.";
    }
    
    // Create context from relevant chunks
    const context = relevantChunks.join('\n\n');
    
    // Generate answer using Grok AI with RAG context
    if (GROK_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are an expert document analyst with access to a comprehensive knowledge base. Answer questions based on the provided document context. Be accurate, helpful, and cite specific information when possible.`
            },
            {
              role: 'user',
              content: `Based on the following document context, please answer this question: "${question}"\n\nDocument Context:\n${context}`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    }
    
    // Fallback to basic context-based answer
    return `Based on the document content, here's what I found related to your question: "${question}"\n\nRelevant information:\n${context}`;
    
  } catch (error) {
    console.error('Error in RAG question answering:', error);
    return `Sorry, I encountered an error while processing your question: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Dual AI System for optimal document processing (2025)
async function vectorizeWithDualAI(
  text: string, 
  metadata: any, 
  structure: any, 
  analysis: any
): Promise<string> {
  try {
    const grokApiKey = process.env.GROK_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!grokApiKey && !openaiApiKey) {
      return text;
    }
    
    const cleanText = text
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanText.length < 10) {
      return text;
    }
    
    // Enhanced system prompt for better document understanding
    const systemPrompt = `You are an advanced document analysis and structuring expert with expertise in:

1. **Document Intelligence**: Understanding document types, structures, and content patterns
2. **Content Optimization**: Improving readability while preserving all factual information
3. **RAG Enhancement**: Structuring content for optimal retrieval-augmented generation
4. **Metadata Integration**: Incorporating document metadata and structural analysis

Your task is to analyze and restructure document content for maximum clarity, searchability, and AI comprehension while preserving 100% of the original information.`;

    // Enhanced user prompt with context
    const userPrompt = `Analyze and restructure this document for optimal AI processing:

**DOCUMENT METADATA:**
- Type: ${analysis.documentType}
- Pages: ${metadata.pages}
- Title: ${metadata.title || 'Not specified'}
- Author: ${metadata.author || 'Not specified'}
- Readability Score: ${analysis.readabilityScore}/100

**DOCUMENT STRUCTURE:**
- Headings: ${structure.headings.slice(0, 5).join(', ')}
- Key Topics: ${analysis.keyTopics.slice(0, 5).join(', ')}
- Important Sections: ${analysis.importantSections.slice(0, 3).join(' | ')}

**DOCUMENT CONTENT:**
${cleanText.substring(0, 45000)}

**INSTRUCTIONS:**
1. Preserve ALL factual information and data
2. Improve structure and organization for better searchability
3. Maintain document hierarchy and relationships
4. Optimize for AI question-answering and retrieval
5. Format as clean, well-organized text without markdown symbols
6. Focus on clarity, coherence, and logical flow

**OUTPUT FORMAT:**
Provide a restructured version that enhances readability while maintaining all original content.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const structured = data.choices?.[0]?.message?.content || cleanText;
      
      const cleanStructured = structured
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('✓ Advanced Perplexity AI vectorization success');
      return cleanStructured;
    } else {
      console.warn('Perplexity AI vectorization error:', response.status);
      return cleanText;
    }
  } catch (error) {
    console.error('Perplexity AI error:', error);
    return text.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
  }
}

// Local text cleaning (fallback when no AI available)
function cleanTextLocally(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

async function getPdfMetadataOnly(pdfBuffer: Buffer): Promise<{
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const toIso = (date: any) => (date instanceof Date ? date.toISOString() : undefined);

    return {
      pages: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle() || undefined,
      author: pdfDoc.getAuthor() || undefined,
      subject: pdfDoc.getSubject() || undefined,
      creator: pdfDoc.getCreator() || undefined,
      producer: pdfDoc.getProducer() || undefined,
      creationDate: toIso(pdfDoc.getCreationDate?.()),
      modificationDate: toIso(pdfDoc.getModificationDate?.()),
    };
  } catch (error) {
    console.warn('Failed to read PDF metadata via pdf-lib:', error);
    return {
      pages: 0,
    };
  }
}

function buildStructureFromPlainText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const headings = lines
    .filter(line => line.length <= 80 && /^[A-Z0-9][A-Z0-9\s:'",/&()-]*$/.test(line))
    .slice(0, 20);

  const paragraphs = text
    .split(/\n\s*\n/)
    .map(section => section.trim())
    .filter(section => section.length > 40)
    .slice(0, 20);

  const lists = lines
    .filter(line => /^[-*]\s+/.test(line) || /^\d+[\.)]\s+/.test(line))
    .slice(0, 20);

  return {
    headings,
    paragraphs,
    lists,
    tables: [] as string[],
  };
}

const VectorizePdfContentInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'A PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'  
    ),
  clientExtractedText: z.string().optional(),
});
export type VectorizePdfContentInput = z.infer<typeof VectorizePdfContentInputSchema>;

const VectorizePdfContentOutputSchema = z.object({
  markdownContent: z.string().describe('The text content of the PDF document.'),
});
export type VectorizePdfContentOutput = z.infer<typeof VectorizePdfContentOutputSchema>;

export async function vectorizePdfContent(input: VectorizePdfContentInput): Promise<VectorizePdfContentOutput> {
        try {
    console.log('🚀 Starting advanced PDF processing...');

    // Extract base64 data from data URI
    const base64Data = input.pdfDataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid PDF data URI format');
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    if (pdfBuffer.length === 0) {
      throw new Error('Empty PDF file');
    }
    
    // Check if it's actually a PDF file
    const pdfHeader = pdfBuffer.subarray(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      throw new Error('Invalid PDF file format');
    }

    console.log('📄 PDF validation passed, starting advanced extraction...');

    const providedClientText = typeof input.clientExtractedText === 'string'
      ? input.clientExtractedText.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim()
      : '';

    // Step 1: Advanced PDF text extraction with metadata and structure analysis
    const extractionResult = providedClientText
      ? {
          text: providedClientText,
          metadata: await getPdfMetadataOnly(pdfBuffer),
          structure: buildStructureFromPlainText(providedClientText),
        }
      : await extractTextAdvanced(pdfBuffer);
    const { text: extractedText, metadata, structure } = extractionResult;
    
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error(`PDF text extraction failed. Document analysis indicates: ${extractedText.length} characters extracted, which is insufficient for processing. This PDF may be image-based (requiring OCR), password-protected, or contain corrupted text streams. Please try a different PDF file or use a text-based PDF document.`);
    }

    if (!metadata || typeof metadata !== 'object') {
      metadata = await getPdfMetadataOnly(pdfBuffer);
    }
    if (!metadata.pages || metadata.pages < 1) {
      metadata.pages = Math.max(1, providedClientText ? Math.round(extractedText.length / 1500) : 1);
    }

    console.log(`✅ Extracted ${extractedText.length} characters from ${metadata.pages} pages`);
    console.log(`📊 Document metadata:`, {
      title: metadata.title,
      author: metadata.author,
      pages: metadata.pages
    });

    // Step 2: Advanced content analysis
    const analysis = analyzeContentStructure(extractedText, structure);
    console.log(`🔍 Document analysis:`, {
      type: analysis.documentType,
      topics: analysis.keyTopics.slice(0, 3),
      readability: analysis.readabilityScore
    });

    // Step 3: Create enhanced vector chunks for RAG
    const vectorChunks = createVectorChunks(extractedText);
    console.log(`🧠 Created ${vectorChunks.length} RAG chunks for vectorization`);

    // Step 3.5: Store chunks in vector database for RAG
    await storeDocumentChunks(vectorChunks, metadata);

    // Step 4: Advanced AI vectorization with RAG context
    let vectorizedContent = extractedText;
    
    if (GROK_API_KEY) {
      console.log('🤖 Attempting advanced Grok AI vectorization with RAG...');
      try {
        // Retrieve relevant context using RAG
        const relevantChunks = await retrieveRelevantChunks(extractedText.substring(0, 200), 3);
        console.log(`🔍 Retrieved ${relevantChunks.length} relevant chunks for context`);
        
        vectorizedContent = await vectorizeWithDualAI(extractedText, metadata, structure, analysis);
        console.log('✅ Advanced AI vectorization with RAG completed');
      } catch (aiError) {
        console.warn('⚠️ AI vectorization failed, using fallback:', aiError);
        vectorizedContent = cleanTextLocally(extractedText);
      }
    } else {
      console.log('⚠️ No Grok API key - using enhanced local processing with RAG');
      vectorizedContent = cleanTextLocally(extractedText);
    }

    // Step 5: Final optimization and validation
    const finalContent = vectorizedContent
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E]/g, '')
          .trim();

    console.log(`🎯 Final vectorized content: ${finalContent.length} characters`);
    console.log('✅ Advanced PDF processing completed successfully');

    // Return enhanced vectorized content ready for RAG-powered Q&A
    return {
      markdownContent: finalContent
    };
  } catch (error) {
    console.error('❌ Advanced PDF processing failed:', error);
    throw error;
  }
}
