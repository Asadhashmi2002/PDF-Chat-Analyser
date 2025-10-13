'use server';

/**
 * @fileOverview A flow that answers questions about a PDF document.
 *
 * - answerQuestionsAboutPdf - A function that answers questions about a PDF document.
 * - AnswerQuestionsAboutPdfInput - The input type for the answerQuestionsAboutPdf function.
 * - AnswerQuestionsAboutPdfOutput - The return type for the answerQuestionsAboutPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutPdfInputSchema = z.object({
  question: z.string().describe('The question to answer about the PDF document.'),
  pdfText: z.string().describe('The text content of the PDF document.'),
});
export type AnswerQuestionsAboutPdfInput = z.infer<typeof AnswerQuestionsAboutPdfInputSchema>;

const AnswerQuestionsAboutPdfOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the PDF document.'),
});
export type AnswerQuestionsAboutPdfOutput = z.infer<typeof AnswerQuestionsAboutPdfOutputSchema>;

export async function answerQuestionsAboutPdf(input: AnswerQuestionsAboutPdfInput): Promise<AnswerQuestionsAboutPdfOutput> {
  return answerQuestionsAboutPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutPdfPrompt',
  input: {schema: AnswerQuestionsAboutPdfInputSchema},
  output: {schema: AnswerQuestionsAboutPdfOutputSchema},
  prompt: `You are an AI assistant that answers questions about PDF documents.

  Use the following PDF text to answer the user's question. If the answer is not contained in the text below, respond with "I am sorry, I cannot answer this question based on the provided text".

  PDF Text: {{{pdfText}}}

  Question: {{{question}}}`,
});

const answerQuestionsAboutPdfFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutPdfFlow',
    inputSchema: AnswerQuestionsAboutPdfInputSchema,
    outputSchema: AnswerQuestionsAboutPdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
