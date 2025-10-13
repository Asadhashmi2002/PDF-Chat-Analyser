'use server';

import { z } from 'zod';
import { vectorizePdfContent } from '@/ai/flows/vectorize-pdf-content';
import { answerQuestionsAboutPdf } from '@/ai/flows/answer-questions-about-pdf';

const ProcessPdfInputSchema = z.object({
  pdfDataUri: z.string().startsWith('data:application/pdf;base64,'),
});

export async function processPdf(input: { pdfDataUri: string }): Promise<{ text?: string, error?: string }> {
  const validation = ProcessPdfInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: 'Invalid PDF data URI format.' };
  }

  try {
    const { markdownContent } = await vectorizePdfContent({ pdfDataUri: input.pdfDataUri });
    return { text: markdownContent };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to process PDF.' };
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
    const { answer } = await answerQuestionsAboutPdf({ question: input.question, pdfText: input.pdfContent });
    
    // The current flow doesn't support citations, so we'll adjust the response.
    // We can enhance this later to extract citations.
    const citations = answer.match(/Page \d+/g)?.map(p => p.split(' ')[1]) || [];

    return { answer: answer, citations };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to get an answer.' };
  }
}
