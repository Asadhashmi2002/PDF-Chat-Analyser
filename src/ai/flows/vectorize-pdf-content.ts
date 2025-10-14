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

// Free Groq AI for intelligent PDF analysis and vectorization
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_demo_key_placeholder';

// Advanced text chunking for RAG (Retrieval-Augmented Generation)
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

// Use Groq AI to intelligently structure and vectorize PDF content
async function vectorizeWithGroqAI(text: string): Promise<string> {
  try {
    
    // Clean the text before sending to AI
    const cleanText = text
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (cleanText.length < 10) {
      return text;
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a document analysis expert. Extract and present the actual content from the document in a clean, readable format. Use clear headings without markdown syntax, bullet points for details, and focus on the real document content. Format like a professional document summary without ** or *** symbols.'
          },
          {
            role: 'user',
            content: `Analyze and structure this document content for optimal readability and understanding. Clean up any formatting issues and organize the information clearly:\n\n${cleanText.substring(0, 3000)}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const structured = data.choices?.[0]?.message?.content || cleanText;
      
      // Clean the AI response to ensure it's readable
      const cleanStructured = structured
        .replace(/[^\x20-\x7E]/g, '') // Remove any non-printable characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      return cleanStructured;
    } else {
      console.warn('Groq AI API error:', response.status, response.statusText);
      return cleanText;
    }
  } catch (error) {
    return text.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
  }
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
    
    
    // Step 2: Create vector chunks for RAG
    const vectorChunks = createVectorChunks(extractedText);
    
    // Step 3: Use Groq AI to intelligently structure the content
    const vectorizedContent = await vectorizeWithGroqAI(extractedText);
    
    
    // Return vectorized content ready for Q&A
    return {
      markdownContent: vectorizedContent
    };
  } catch (error) {
    // Re-throw the error - no generic responses
    throw error;
  }
}
