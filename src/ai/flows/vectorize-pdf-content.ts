'use server';

/**
 * @fileOverview This file defines a Genkit flow to vectorize PDF content using LlamaParse.
 *
 * The flow takes a PDF data URI as input, converts it to Markdown using LlamaParse,
 * and returns the Markdown content.
 *
 * @file Exports:
 *   - `vectorizePdfContent`: An async function that takes a PDF data URI and returns the vectorized Markdown content.
 *   - `VectorizePdfContentInput`: The input type for `vectorizePdfContent`, a PDF data URI.
 *   - `VectorizePdfContentOutput`: The output type for `vectorizePdfContent`, the Markdown content of the PDF.
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
  markdownContent: z.string().describe('The Markdown content of the PDF document.'),
});
export type VectorizePdfContentOutput = z.infer<typeof VectorizePdfContentOutputSchema>;

export async function vectorizePdfContent(input: VectorizePdfContentInput): Promise<VectorizePdfContentOutput> {
  return vectorizePdfContentFlow(input);
}

const vectorizePdfContentPrompt = ai.definePrompt({
  name: 'vectorizePdfContentPrompt',
  input: {schema: VectorizePdfContentInputSchema},
  output: {schema: VectorizePdfContentOutputSchema},
  prompt: `You are an expert in processing PDF documents and extracting their content into Markdown format using LlamaParse.

  Convert the PDF document provided as a data URI into a well-structured Markdown format suitable for vectorization.

  PDF Data URI: {{pdfDataUri}}`,
});

const vectorizePdfContentFlow = ai.defineFlow(
  {
    name: 'vectorizePdfContentFlow',
    inputSchema: VectorizePdfContentInputSchema,
    outputSchema: VectorizePdfContentOutputSchema,
  },
  async input => {
    // TODO: Integrate LlamaParse to convert PDF to Markdown
    // Currently, the flow returns a placeholder Markdown content. Replace this with actual LlamaParse conversion.
    //throw new Error('LlamaParse integration not implemented yet');
    const {output} = await vectorizePdfContentPrompt(input);
    return output!;
  }
);
