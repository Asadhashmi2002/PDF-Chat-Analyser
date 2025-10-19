'use server';

import { z } from 'zod';
import { vectorizePdfContent, answerQuestionWithRAG } from '../ai/flows/vectorize-pdf-content';
import { answerQuestionsAboutPdf } from '../ai/flows/answer-questions-about-pdf';

const ProcessPdfInputSchema = z.object({
  pdfDataUri: z.string().startsWith('data:application/pdf;base64,'),
  clientExtractedText: z.string().min(1).optional(),
});

export async function processPdf(input: { pdfDataUri: string; clientExtractedText?: string }): Promise<{ text?: string, error?: string }> {
  const validation = ProcessPdfInputSchema.safeParse(input);
  if (!validation.success) {
    console.error('PDF validation failed:', validation.error);
    return { error: 'Invalid PDF data URI format.' };
  }

  try {
    const cleanClientText = input.clientExtractedText
      ? input.clientExtractedText.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim()
      : undefined;
    const { markdownContent } = await vectorizePdfContent({ pdfDataUri: input.pdfDataUri, clientExtractedText: cleanClientText });
    return { text: markdownContent };
  } catch (e: any) {
    console.error('PDF processing error:', e);
    
    // Provide more specific error messages
    let errorMessage = 'An unexpected error occurred while processing the PDF.';
    if (e.message) {
      if (e.message.includes('password')) {
        errorMessage = 'PDF is password-protected. Please remove password protection and try again.';
      } else if (e.message.includes('corrupted')) {
        errorMessage = 'PDF appears to be corrupted. Please try a different file.';
      } else if (e.message.includes('image-only') || e.message.includes('image-based')) {
        errorMessage = 'PDF contains only images. Text extraction not possible. Please use a PDF with selectable text.';
      } else if (e.message.includes('text extraction failed')) {
        errorMessage = 'Unable to extract text from this PDF. The PDF may be image-based, password-protected, or corrupted. Please try a different PDF file.';
      } else if (e.message.includes('Invalid PDF')) {
        errorMessage = 'Invalid PDF file format. Please ensure you uploaded a valid PDF document.';
      } else if (e.message.includes('Empty PDF')) {
        errorMessage = 'The PDF file appears to be empty. Please try a different file.';
      } else {
        errorMessage = `PDF processing failed: ${e.message}`;
      }
    }
    
    return { error: errorMessage };
  }
}


const AskQuestionInputSchema = z.object({
  question: z.string().min(1),
  pdfContent: z.string().min(1),
});

export async function askQuestion(input: { question: string; pdfContent: string }): Promise<{ answer?: string, citations?: string[], error?: string }> {
  const validation = AskQuestionInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: 'Invalid question or PDF content.' };
  }

  try {
    // Prefer RAG-based answering to minimize tokens and focus context
    let answer: string | undefined;

    try {
      const ragAnswer = await answerQuestionWithRAG(input.question);
      if (
        ragAnswer &&
        !ragAnswer.startsWith('RAG system not available') &&
        !ragAnswer.startsWith('No relevant information found')
      ) {
        answer = ragAnswer;
      }
    } catch {}

    // Fallback to provider-based QA over full text if RAG unavailable/insufficient
    if (!answer) {
      const direct = await answerQuestionsAboutPdf({ question: input.question, pdfText: input.pdfContent });
      answer = direct.answer;
    }
    
    if (!answer || answer.trim() === '') {
      return { error: 'AI returned an empty response.' };
    }
    
    // The current flow doesn't support citations, so we'll adjust the response.
    // We can enhance this later to extract citations.
    const citations = answer.match(/Page \d+/g)?.map(p => p.split(' ')[1]) || [];

    return { answer: answer, citations };
  } catch (e: any) {
    return { error: e.message || 'Failed to get an answer.' };
  }
}
