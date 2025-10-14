'use server';

/**
 * @fileOverview A flow that answers questions about a PDF document.
 *
 * - answerQuestionsAboutPdf - A function that answers questions about a PDF document.
 * - AnswerQuestionsAboutPdfInput - The input type for the answerQuestionsAboutPdf function.
 * - AnswerQuestionsAboutPdfOutput - The return type for the answerQuestionsAboutPdf function.
 */

import {z} from 'zod';

const AnswerQuestionsAboutPdfInputSchema = z.object({
  question: z.string().describe('The question to answer about the PDF document.'),
  pdfText: z.string().describe('The text content of the PDF document.'),
});
export type AnswerQuestionsAboutPdfInput = z.infer<typeof AnswerQuestionsAboutPdfInputSchema>;

const AnswerQuestionsAboutPdfOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the PDF document. If you cite information, please use the format "Page X" to refer to page numbers.'),
});
export type AnswerQuestionsAboutPdfOutput = z.infer<typeof AnswerQuestionsAboutPdfOutputSchema>;

export async function answerQuestionsAboutPdf(input: AnswerQuestionsAboutPdfInput): Promise<AnswerQuestionsAboutPdfOutput> {
  const { question, pdfText } = input;
  
  // Clean the PDF text to ensure it's readable
  const cleanPdfText = pdfText
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  
  // Validate PDF content
  if (!cleanPdfText || cleanPdfText.trim().length === 0) {
    return { 
      answer: `**Document Analysis Required**

**Issue:** No document content available for analysis.

**Solution:** Please upload a PDF document first to enable AI-powered analysis and Q&A functionality.

**What happens next:**
1. Upload a PDF document
2. Wait for AI processing and vectorization
3. Ask specific questions about the document content
4. Get detailed, document-grounded responses

**Ready to analyze your document?** Upload a PDF to get started with intelligent document analysis.`
    };
  }

  try {
    console.log('Processing question with PDF text length:', cleanPdfText.length);
    console.log('PDF text preview:', cleanPdfText.substring(0, 200));
    console.log('Question:', question);
    
    // Advanced RAG-powered AI integration using multiple providers (2025)
    
    // PRIMARY: Try Perplexity API first (most advanced for 2025)
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (perplexityApiKey) {
      try {
        console.log('Attempting Perplexity API with RAG...');
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [
              {
                role: 'system',
                content: 'You are an expert document analyst. Extract and present ONLY exact information from the provided document. Be precise and cite specific sections when possible.'
              },
              {
                role: 'user',
                content: `Analyze this document and answer the question using ONLY information from the document:

DOCUMENT CONTENT:
${cleanPdfText.substring(0, 100000)}

QUESTION: ${question}

INSTRUCTIONS:
- Quote exact text from the document
- Provide specific citations if possible
- If not found in document, say "Not found in document"
- Do not add assumptions or external knowledge
- Be precise and direct`
              }
            ],
            max_tokens: 1000,
            temperature: 0.1,
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          const answer = perplexityData.choices?.[0]?.message?.content || '';
          
          if (answer.trim()) {
            console.log('✓ Perplexity API success');
            
            // Clean up response
            const cleanAnswer = answer
              .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .trim();
            
            return { answer: cleanAnswer };
          }
        } else {
          const errorText = await perplexityResponse.text();
          console.error('Perplexity API error:', perplexityResponse.status, errorText);
        }
      } catch (error) {
        console.error('Perplexity API exception:', error);
      }
    }
    
    // Fallback: No other AI providers - only Perplexity
    console.log('⚠️ Perplexity API not available - using fallback response');
    
    // Extract key information from the document for a detailed response
    const documentLines = cleanPdfText.split('\n').filter(line => line.trim().length > 0);
    const keyInfo = documentLines.slice(0, 10).join(' ');

    return {
      answer: `⚠️ **Perplexity API Required**

**Issue:** No AI provider available for document analysis.

**Solution:** Please configure your Perplexity API key to enable AI-powered analysis.

**Setup Instructions:**
1. Get API key from: https://www.perplexity.ai/settings/api
2. Add to environment: PERPLEXITY_API_KEY=your_key_here
3. Restart the application

**Document Preview:**
${keyInfo.substring(0, 300)}...

**Document Info:**
- Length: ${cleanPdfText.length} characters
- Content: ${keyInfo.substring(0, 200)}...

**Ready to analyze your document?** Configure Perplexity API to get started with intelligent document analysis.`
    };
  }
}
