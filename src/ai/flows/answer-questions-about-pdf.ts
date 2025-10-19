'use server';

/**
 * @fileOverview A flow that answers questions about a PDF document.
 *
 * - answerQuestionsAboutPdf - A function that answers questions about a PDF document.
 * - AnswerQuestionsAboutPdfInput - The input type for the answerQuestionsAboutPdf function.
 * - AnswerQuestionsAboutPdfOutput - The return type for the answerQuestionsAboutPdf function.
 */

export type AnswerQuestionsAboutPdfInput = {
  question: string;
  pdfText: string;
};

export type AnswerQuestionsAboutPdfOutput = {
  answer: string;
};

type EnvRecord = Record<string, string | undefined>;

// Access env through globalThis to avoid relying on Node type declarations.
const env: EnvRecord =
  (typeof globalThis !== 'undefined' &&
    (globalThis as { process?: { env?: EnvRecord } }).process?.env) ||
  {};

export async function answerQuestionsAboutPdf(input: AnswerQuestionsAboutPdfInput): Promise<AnswerQuestionsAboutPdfOutput> {
  if (!input || typeof input.question !== 'string' || typeof input.pdfText !== 'string') {
    return { answer: 'Invalid input provided. Please ask a question about a valid PDF document.' };
  }

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
    const googleApiKey = env.GOOGLE_API_KEY || env.GOOGLE_AI_API_KEY;
    if (googleApiKey) {
      try {
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: [
                      'You are a concise and factual document analysis assistant. Answer the question using only information present in the document.',
                      'If the answer is not in the document, reply exactly with "Not found in document."',
                      '',
                      'Document Content:',
                      cleanPdfText.substring(0, 120000),
                      '',
                      `Question: ${question}`,
                    ].join('\n'),
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          const parts = googleData.candidates?.[0]?.content?.parts ?? [];
          const answer = parts
            .map((part: { text?: string }) => part?.text ?? '')
            .join('')
            .trim();

          if (answer) {
            return { answer };
          }
        } else {
          const errorText = await googleResponse.text();
          console.error('Google Gemini API error:', googleResponse.status, errorText);
        }
      } catch (error) {
        console.error('Google Gemini API request failed:', error);
      }
    }
    
    // Advanced RAG-powered AI integration using multiple providers (2025)
    
    // PRIMARY: Try Grok AI first (most advanced for 2025)
    const grokApiKey = env.GROK_API_KEY;
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
                content: `You are a document analysis assistant. Answer questions based on the provided document content. Be direct and factual. If information is not in the document, say "Not found in document."`
              },
              {
                role: 'user',
                content: `Document Content:
${cleanPdfText.substring(0, 100000)}

Question: ${question}

Answer based on the document content. If information is not in the document, say "Not found in document."`
              }
            ],
            max_tokens: 2000,
            temperature: 0.3,
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
    
    // SECONDARY: Try OpenAI for enhanced analysis (more detailed)
    const openaiApiKey = env.OPENAI_API_KEY;
    if (openaiApiKey) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an expert document analysis assistant. Provide detailed, comprehensive answers based on the document content. Be thorough and analytical. If information is not in the document, say "Not found in document."`
              },
              {
                role: 'user',
                content: `Document Content:
${cleanPdfText.substring(0, 100000)}

Question: ${question}

Provide a detailed analysis based on the document content. If information is not in the document, say "Not found in document."`
              }
            ],
            max_tokens: 2500,
            temperature: 0.2,
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const answer = openaiData.choices?.[0]?.message?.content || '';
          
          if (answer.trim()) {
            let cleanAnswer = answer
              .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .trim();

            return { answer: cleanAnswer };
          }
        }
      } catch (error) {
        // Both AIs failed
      }
    }
    
    // Fallback: No AI providers available
    return {
      answer: `API connection failed. Please check GOOGLE_API_KEY, GROK_API_KEY, or OPENAI_API_KEY configuration.`
    };
  } catch (error) {
    return {
      answer: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
