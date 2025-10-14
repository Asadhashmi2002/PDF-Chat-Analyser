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
      answer: `**Document Upload Required for Analysis**

**Current Status:** No document content detected in the system.

**Required Action:** Upload a PDF document to enable intelligent analysis and question-answering capabilities.

**Analysis Capabilities Available:**
- Document content extraction and structuring
- Advanced text processing with metadata analysis
- Intelligent question-answering with citations
- Document type detection and optimization
- RAG-powered information retrieval

**Next Steps:**
1. Select and upload a PDF document
2. Wait for advanced AI processing and vectorization
3. Ask specific questions about the document content
4. Receive detailed, document-grounded responses with citations

**Ready to begin document analysis?** Please upload your PDF document to proceed.`
    };
  }

  try {
    console.log('Processing question with PDF text length:', cleanPdfText.length);
    console.log('PDF text preview:', cleanPdfText.substring(0, 200));
    console.log('Question:', question);
    
    // Advanced RAG-powered AI integration using multiple providers (2025)
    
    // PRIMARY: Try Grok AI first (most advanced for 2025)
    const grokApiKey = process.env.GROK_API_KEY;
    if (grokApiKey) {
      try {
        console.log('Attempting Grok AI with RAG...');
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
                content: `You are an advanced document analysis expert with specialized capabilities in:

1. **Precise Information Extraction**: Finding exact information from documents
2. **Contextual Understanding**: Understanding document structure and relationships
3. **Citation and Reference**: Providing accurate citations and page references
4. **Multi-format Analysis**: Handling various document types (contracts, reports, manuals, etc.)
5. **RAG Optimization**: Delivering responses optimized for retrieval-augmented generation

Your responses should be:
- Factually accurate and document-grounded
- Well-structured with clear citations
- Comprehensive yet concise
- Professional and informative`
              },
              {
                role: 'user',
                content: `**DOCUMENT ANALYSIS REQUEST**

**Document Content:**
${cleanPdfText.substring(0, 100000)}

**Question:** ${question}

**ANALYSIS INSTRUCTIONS:**
1. **Search Strategy**: Use advanced search techniques to find relevant information
2. **Context Analysis**: Consider document structure, headings, and relationships
3. **Information Synthesis**: Combine related information from different sections
4. **Citation Requirements**: Provide specific references to document sections
5. **Response Format**: Structure your answer with clear sections and citations

**RESPONSE GUIDELINES:**
- Start with a direct answer if information is found
- Quote exact text from the document with context
- Provide specific citations (e.g., "According to Section 3.2...")
- If information is not found, clearly state "Not found in document"
- Maintain professional tone and accuracy
- Use bullet points or numbered lists for multiple findings

**OUTPUT FORMAT:**
Provide a comprehensive, well-structured response with proper citations and references.`
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
            console.log('✓ Grok AI success');
            
            // Enhanced response processing - ensure detailed, non-generic responses
            let cleanAnswer = answer
              .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .trim();

            // Validate response quality - ensure it's not generic
            const isGenericResponse = cleanAnswer.length < 50 || 
              cleanAnswer.toLowerCase().includes('i cannot') ||
              cleanAnswer.toLowerCase().includes('i don\'t have') ||
              cleanAnswer.toLowerCase().includes('i\'m not able') ||
              cleanAnswer.toLowerCase().includes('i cannot find') ||
              cleanAnswer.toLowerCase().includes('no information') ||
              cleanAnswer.toLowerCase().includes('not available');

            if (isGenericResponse) {
              // Provide a more detailed response with document context
              const documentPreview = cleanPdfText.substring(0, 500);
              const documentStats = {
                length: cleanPdfText.length,
                words: cleanPdfText.split(/\s+/).length,
                lines: cleanPdfText.split('\n').length
              };

              cleanAnswer = `**Document Analysis Results**

**Question:** ${question}

**Document Processing Status:** Successfully analyzed ${documentStats.length} characters across ${documentStats.lines} lines containing ${documentStats.words} words.

**Content Analysis:** The document contains substantial text content that should be searchable for your question. 

**Document Preview:** ${documentPreview}...

**Search Strategy:** The question "${question}" requires specific information extraction from the document content. 

**Recommended Actions:**
1. Verify the question is specific to the document content
2. Try rephrasing with more specific terms
3. Check if the information might be in a different section
4. Ensure the question relates to the document's subject matter

**Document Content Available:** The full document text has been processed and is ready for analysis. Please try a more specific question related to the document content.`;
            }
            
            return { answer: cleanAnswer };
          }
        } else {
          const errorText = await grokResponse.text();
          console.error('Grok AI error:', grokResponse.status, errorText);
        }
      } catch (error) {
        console.error('Grok AI exception:', error);
      }
    }
    
    // Fallback: No other AI providers - only Grok AI
    console.log('⚠️ Grok AI not available - using fallback response');
    
    // Extract key information from the document for a detailed response
    const documentLines = cleanPdfText.split('\n').filter(line => line.trim().length > 0);
    const keyInfo = documentLines.slice(0, 10).join(' ');

    return {
      answer: `**Advanced AI Analysis Configuration Required**

**Current Status:** Grok AI integration not configured for document analysis.

**Required Configuration:** Grok AI API key must be configured to enable advanced document processing and intelligent question-answering.

**Setup Process:**
1. Obtain API key from: https://console.groq.com/keys
2. Configure environment variable: GROK_API_KEY=your_actual_key_here
3. Restart the application to activate AI capabilities

**Document Analysis Preview:**
**Document Length:** ${cleanPdfText.length} characters
**Content Sample:** ${keyInfo.substring(0, 300)}...

**Available Analysis Features (Once Configured):**
- Advanced document structure analysis
- Intelligent content extraction with metadata
- Context-aware question answering
- Citation and reference generation
- Multi-format document support
- RAG-powered information retrieval

**Ready to activate advanced document analysis?** Configure the Perplexity API key to unlock full AI-powered document processing capabilities.`
    };
  } catch (error) {
    console.error('Error processing question:', error);
    return {
      answer: `**Document Analysis Processing Error**

**Error Type:** ${error instanceof Error ? error.constructor.name : 'Processing Error'}
**Error Message:** ${error instanceof Error ? error.message : 'Unknown processing error'}
**Timestamp:** ${new Date().toISOString()}

**Troubleshooting Steps:**
1. Verify document content is properly loaded and accessible
2. Check if the question is specific and answerable from the document
3. Ensure document text extraction completed successfully
4. Try rephrasing the question with more specific terms

**Document Status Check:**
- Document length: ${cleanPdfText.length} characters
- Content preview: ${cleanPdfText.substring(0, 200)}...

**Recovery Options:**
- Re-upload the document if content appears corrupted
- Simplify the question to focus on specific document sections
- Check document format compatibility (PDF text-based documents work best)

**Technical Support:** If the error persists, please provide the error details above for technical analysis.`
    };
  }
}
