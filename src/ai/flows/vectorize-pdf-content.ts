'use server';

/**
 * @fileOverview This file defines a Genkit flow to vectorize PDF content.
 *
 * The flow takes a PDF data URI as input, extracts the text content,
 * and returns it.
 *
 * @file Exports:
 *   - `vectorizePdfContent`: An async function that takes a PDF data URI and returns the text content.
 *   - `VectorizePdfContentInput`: The input type for `vectorizePdfContent`, a PDF data URI.
 *   - `VectorizePdfContentOutput`: The output type for `vectorizePdfContent`, the text content of the PDF.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return vectorizePdfContentFlow(input);
}

const vectorizePdfContentPrompt = ai.definePrompt({
  name: 'vectorizePdfContentPrompt',
  input: {schema: VectorizePdfContentInputSchema},
  output: {schema: VectorizePdfContentOutputSchema},
  prompt: `Extract the text content from the following PDF document.

  PDF Data URI: {{media url=pdfDataUri}}`,
});

const vectorizePdfContentFlow = ai.defineFlow(
  {
    name: 'vectorizePdfContentFlow',
    inputSchema: VectorizePdfContentInputSchema,
    outputSchema: VectorizePdfContentOutputSchema,
  },
  async input => {
    const {output} = await vectorizePdfContentPrompt(input);
    return output!;
  }
);
