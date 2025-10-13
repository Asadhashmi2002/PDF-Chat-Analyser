'use server';

/**
 * @fileOverview Optimizes token usage during AI interactions by summarizing PDF content and answering user questions efficiently.
 *
 * - `optimizeTokenUsage` - A function that optimizes token usage when interacting with PDF content.
 * - `OptimizeTokenUsageInput` - The input type for the `optimizeTokenUsage` function, including the PDF content and user question.
 * - `OptimizeTokenUsageOutput` - The return type for the `optimizeTokenUsage` function, providing an answer to the user question with citations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeTokenUsageInputSchema = z.object({
  pdfContent: z.string().describe('The content of the PDF document.'),
  question: z.string().describe('The user question about the PDF content.'),
});
export type OptimizeTokenUsageInput = z.infer<typeof OptimizeTokenUsageInputSchema>;

const OptimizeTokenUsageOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
  citations: z.array(z.string()).describe('Citations for the answer.'),
});
export type OptimizeTokenUsageOutput = z.infer<typeof OptimizeTokenUsageOutputSchema>;

export async function optimizeTokenUsage(input: OptimizeTokenUsageInput): Promise<OptimizeTokenUsageOutput> {
  return optimizeTokenUsageFlow(input);
}

const summarizePdfPrompt = ai.definePrompt({
  name: 'summarizePdfPrompt',
  input: {schema: z.object({pdfContent: z.string()})},
  output: {schema: z.string()},
  prompt: `Summarize the following PDF content to reduce the number of tokens used in subsequent interactions:\n\n{{{pdfContent}}}`,
});

const answerQuestionPrompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {
    schema: z.object({
      summary: z.string().describe('The summarized PDF content.'),
      question: z.string().describe('The user question.'),
    }),
  },
  output: {schema: OptimizeTokenUsageOutputSchema},
  prompt: `Answer the following question using the summarized PDF content. Provide citations to the relevant sections of the PDF.\n\nSummary:\n{{{summary}}}\n\nQuestion:\n{{{question}}}`,
});

const optimizeTokenUsageFlow = ai.defineFlow(
  {
    name: 'optimizeTokenUsageFlow',
    inputSchema: OptimizeTokenUsageInputSchema,
    outputSchema: OptimizeTokenUsageOutputSchema,
  },
  async input => {
    const {output: summaryOutput} = await summarizePdfPrompt({
      pdfContent: input.pdfContent,
    });

    const summary = summaryOutput!;

    const {output: answerOutput} = await answerQuestionPrompt({
      summary: summary,
      question: input.question,
    });

    return answerOutput!;
  }
);
