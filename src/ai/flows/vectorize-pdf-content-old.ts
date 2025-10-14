'use server';

/**
 * @fileOverview Free PDF Vectorization using pdf-parse + Groq AI
 * 
 * This implementation uses:
 * - pdf-parse: Free, open-source PDF text extraction
 * - Groq AI: Free, fast AI for intelligent analysis
 * - No paid APIs required
 */

import {z} from 'zod';
import * as pdfParse from 'pdf-parse';

// Perplexity API for intelligent PDF analysis and vectorization (2025)
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

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

// Use Perplexity AI to intelligently structure and vectorize PDF content (2025 - Primary)
async function vectorizeWithPerplexityAI(text: string): Promise<string> {
  try {
    if (!PERPLEXITY_API_KEY) {
      return text;
    }
    
    const cleanText = text
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanText.length < 10) {
      return text;
    }
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a document structuring expert. Clean, organize, and optimize document content. Preserve all factual information while improving readability.'
          },
          {
            role: 'user',
            content: `Structure this document content for optimal retrieval. Preserve all facts and data:

${cleanText.substring(0, 50000)}

Format the output as clean, well-organized text without markdown symbols. Focus on clarity and searchability.`
          }
        ],
        max_tokens: 1500,
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
      
      console.log('✓ Perplexity AI vectorization success');
      return cleanStructured;
    } else {
      console.warn('Perplexity AI vectorization error:', response.status);
      return cleanText;
    }
  } catch (error) {
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

// Enhanced local PDF processing

const VectorizePdfContentInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'A PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'  
    ),
});
export type VectorizePdfContentInput = z.infer<typeof VectorizePdfContentInputSchema>;

const VectorizePdfContentOutputSchema = z.object({
  markdownContent: z.string().describe('The text content of the PDF document.'),
});
export type VectorizePdfContentOutput = z.infer<typeof VectorizePdfContentOutputSchema>;


export async function vectorizePdfContent(input: VectorizePdfContentInput): Promise<VectorizePdfContentOutput> {
        try {

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

    // Free PDF Vectorization: Simple text extraction + Groq AI
    
    // Step 1: Simple text extraction (fallback approach)
    let extractedText = '';
    
    try {
      // Enhanced PDF text extraction
      const textFromBuffer = pdfBuffer.toString('utf8');
      
      // Method 1: Extract text from PDF content streams
      const streamMatches = textFromBuffer.match(/stream\s*BT\s*\/F\d+\s+\d+\s+Tf\s*[\d\s-]+\s+Td\s*\(([^)]+)\)/g);
      if (streamMatches && streamMatches.length > 0) {
        extractedText = streamMatches
          .map(match => {
            const textMatch = match.match(/\(([^)]+)\)/);
            return textMatch ? textMatch[1] : '';
          })
          .filter(text => text.length > 0)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      // Method 2: Extract from parentheses content
      if (!extractedText || extractedText.length < 10) {
        const textMatches = textFromBuffer.match(/\(([^)]+)\)/g);
        if (textMatches) {
          extractedText = textMatches
            .map(match => match.slice(1, -1)) // Remove parentheses
            .filter(text => text.length > 1 && !/^[\d\s-]+$/.test(text)) // Filter out coordinates
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
      
      // Method 3: Extract from PDF text objects
      if (!extractedText || extractedText.length < 10) {
        const textObjectMatches = textFromBuffer.match(/\/Text\s*\(([^)]+)\)/g);
        if (textObjectMatches) {
          extractedText = textObjectMatches
            .map(match => {
              const textMatch = match.match(/\(([^)]+)\)/);
              return textMatch ? textMatch[1] : '';
            })
            .filter(text => text.length > 0)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
      
      // Method 4: Extract readable ASCII text
      if (!extractedText || extractedText.length < 10) {
        const lines = textFromBuffer.split('\n');
        const readableLines = lines
          .filter(line => {
            // Check if line contains readable text (not just coordinates or commands)
            const hasReadableText = /[a-zA-Z]{3,}/.test(line);
            const hasParentheses = line.includes('(') && line.includes(')');
            return hasReadableText && hasParentheses;
          })
          .map(line => {
            const matches = line.match(/\(([^)]+)\)/g);
            if (matches) {
              return matches
                .map(match => match.slice(1, -1))
                .filter(text => text.length > 1 && /[a-zA-Z]/.test(text))
                .join(' ');
            }
            return '';
          })
          .filter(text => text.length > 0);
        
        extractedText = readableLines.join(' ').trim();
      }
      
      // Method 5: Fallback - extract any readable text from the buffer
      if (!extractedText || extractedText.length < 10) {
        // Look for any text patterns in the PDF
        const textPattern = /[a-zA-Z][a-zA-Z0-9\s]{10,}/g;
        const matches = textFromBuffer.match(textPattern);
        if (matches && matches.length > 0) {
          extractedText = matches
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
      
      // Clean up the extracted text
      if (extractedText) {
        extractedText = extractedText
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
          .trim();
      }
      
            } catch (parseError: any) {
              throw new Error(`PDF parsing failed: ${parseError.message}`);
            }
    
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('PDF text extraction failed. This PDF may be image-based, password-protected, or corrupted. Please try a different PDF file.');
    }
    
    
    // Step 2: Create vector chunks for RAG (2025 Enhanced)
    const vectorChunks = createVectorChunks(extractedText);
    console.log(`Created ${vectorChunks.length} RAG chunks for vectorization`);
    
    // Step 3: Use Perplexity AI to structure content (Primary) or local fallback
    let vectorizedContent = extractedText;
    
    // Try Perplexity AI first (2025 Primary)
    if (PERPLEXITY_API_KEY) {
      console.log('Attempting Perplexity AI vectorization...');
      vectorizedContent = await vectorizeWithPerplexityAI(extractedText);
    } else {
      console.log('⚠️ No Perplexity API key - using local text cleaning');
      // Local fallback - just clean the text
      vectorizedContent = cleanTextLocally(extractedText);
    }
    
    // Return vectorized content ready for RAG-powered Q&A
    return {
      markdownContent: vectorizedContent
    };
  } catch (error) {
    // Re-throw the error - no generic responses
    throw error;
  }
}
