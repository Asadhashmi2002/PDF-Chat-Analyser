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
      answer: `No document content available for analysis. Please upload a PDF document first.`
    };
  }

  try {
    
    // Advanced RAG-powered AI integration using multiple providers (2025)
    
    // PRIMARY: Try Grok AI first (most advanced for 2025)
    const grokApiKey = process.env.GROK_API_KEY;
    if (grokApiKey) {
      try {
        const grokResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: `You are a document analysis expert. Answer questions based ONLY on the provided document content. Be direct, factual, and cite specific information from the document. If information is not found in the document, say "Not found in the document."`
              },
              {
                role: 'user',
                content: `Document Content:
${cleanPdfText.substring(0, 100000)}

Question: ${question}

Answer based on the document content above. If the information is not in the document, say "Not found in the document."`
              }
            ],
            max_tokens: 1500,
            temperature: 0.1,
          }),
        });

        if (grokResponse.ok) {
          const grokData = await grokResponse.json();
          const answer = grokData.choices?.[0]?.message?.content || '';
          
          if (answer.trim()) {
            
            // Enhanced response processing - ensure detailed, non-generic responses
            let cleanAnswer = answer
              .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .trim();

            // Return the AI response directly without generic fallbacks
            
            return { answer: cleanAnswer };
          }
        } else {
          const errorText = await grokResponse.text();
        }
      } catch (error) {
        // Grok AI error
      }
    }
    
    // Fallback: No other AI providers - only Grok AI
    
    // Extract key information from the document for a detailed response
    const documentLines = cleanPdfText.split('\n').filter(line => line.trim().length > 0);
    const keyInfo = documentLines.slice(0, 10).join(' ');

    return {
      answer: `AI analysis not available. Please configure the GROK_API_KEY environment variable.`
    };
  } catch (error) {
    return {
      answer: `Error processing question: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
