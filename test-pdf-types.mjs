#!/usr/bin/env node

/**
 * Comprehensive PDF Testing Suite
 * Tests different PDF types and advanced vectorization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(75));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(75) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

// Generate different types of test PDFs
function generateTestPDFs() {
  logSection('📄 Generating Test PDFs');
  
  const testPDFs = {
    // 1. Simple text-based PDF
    'simple-text.pdf': `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
72 720 Td
(Simple Text Document) Tj
0 -20 Td
(This is a basic text-based PDF) Tj
0 -20 Td
(Company: TechCorp) Tj
0 -20 Td
(Revenue: $5 million) Tj
0 -20 Td
(Employees: 100) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000054 00000 n 
0000000109 00000 n 
0000000174 00000 n 
0000000249 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
400
%%EOF`,

    // 2. Multi-page document
    'multi-page.pdf': `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R 4 0 R]
/Count 2
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 5 0 R
/Resources <<
/Font <<
/F1 6 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 7 0 R
/Resources <<
/Font <<
/F1 6 0 R
>>
>>
>>
endobj

5 0 obj
<<
/Length 150
>>
stream
BT
/F1 12 Tf
72 720 Td
(Page 1: Executive Summary) Tj
0 -20 Td
(Company Overview) Tj
0 -20 Td
(Founded: 2020) Tj
0 -20 Td
(Industry: Technology) Tj
ET
endstream
endobj

6 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

7 0 obj
<<
/Length 150
>>
stream
BT
/F1 12 Tf
72 720 Td
(Page 2: Financial Details) Tj
0 -20 Td
(Annual Revenue: $10M) Tj
0 -20 Td
(Growth Rate: 50 percent) Tj
0 -20 Td
(Profit Margin: 25 percent) Tj
ET
endstream
endobj

xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000054 00000 n 
0000000115 00000 n 
0000000220 00000 n 
0000000325 00000 n 
0000000524 00000 n 
0000000599 00000 n 
trailer
<<
/Size 8
/Root 1 0 R
>>
startxref
798
%%EOF`,

    // 3. Complex structured document
    'structured.pdf': `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 400
>>
stream
BT
/F1 14 Tf
72 720 Td
(ANNUAL REPORT 2024) Tj
0 -30 Td
/F1 12 Tf
(Executive Summary) Tj
0 -20 Td
(Our company achieved significant milestones this year) Tj
0 -30 Td
(Key Metrics:) Tj
0 -20 Td
(Total Revenue: $15 million) Tj
0 -20 Td
(Customer Base: 5000 clients) Tj
0 -20 Td
(Employee Count: 150 staff members) Tj
0 -20 Td
(Market Share: 12 percent) Tj
0 -30 Td
(Future Outlook:) Tj
0 -20 Td
(Expected growth of 75 percent next year) Tj
0 -20 Td
(Expansion into 3 new markets planned) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000054 00000 n 
0000000109 00000 n 
0000000174 00000 n 
0000000624 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
699
%%EOF`,
  };
  
  const pdfDir = path.join(__dirname, 'test-pdfs');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
  }
  
  Object.entries(testPDFs).forEach(([filename, content]) => {
    const filePath = path.join(pdfDir, filename);
    fs.writeFileSync(filePath, content);
    logSuccess(`Created: ${filename}`);
  });
  
  // Create an invalid PDF (for testing error handling)
  const invalidPDF = 'This is not a PDF file, just plain text';
  fs.writeFileSync(path.join(pdfDir, 'invalid.pdf'), invalidPDF);
  logSuccess(`Created: invalid.pdf (for error testing)`);
  
  // Create an empty PDF (for testing edge cases)
  fs.writeFileSync(path.join(pdfDir, 'empty.pdf'), '');
  logSuccess(`Created: empty.pdf (for edge case testing)`);
  
  return pdfDir;
}

// Convert PDF to base64 data URI
function pdfToDataUri(filePath) {
  const pdfBuffer = fs.readFileSync(filePath);
  const base64 = pdfBuffer.toString('base64');
  return `data:application/pdf;base64,${base64}`;
}

// Test PDF vectorization
async function testPdfVectorization(pdfPath, pdfName) {
  console.log(`\n${'─'.repeat(75)}`);
  log(`Testing: ${pdfName}`, colors.bright + colors.magenta);
  console.log('─'.repeat(75));
  
  try {
    const pdfDataUri = pdfToDataUri(pdfPath);
    logInfo(`PDF size: ${Math.round(pdfDataUri.length / 1024)} KB`);
    
    // Import vectorization function
    const { vectorizePdfContent } = await import('./src/ai/flows/vectorize-pdf-content.ts');
    
    logInfo('Starting vectorization...');
    const startTime = Date.now();
    
    const result = await vectorizePdfContent({ pdfDataUri });
    const duration = Date.now() - startTime;
    
    if (result.markdownContent) {
      logSuccess(`Vectorization completed in ${duration}ms`);
      logInfo(`Extracted text length: ${result.markdownContent.length} characters`);
      
      // Display preview
      console.log('\n' + colors.cyan + 'Content Preview:' + colors.reset);
      console.log('┌' + '─'.repeat(73) + '┐');
      const preview = result.markdownContent.substring(0, 300);
      const lines = preview.split('\n');
      lines.forEach(line => {
        const truncated = line.substring(0, 70);
        console.log(`│ ${truncated}${' '.repeat(71 - truncated.length)}│`);
      });
      if (result.markdownContent.length > 300) {
        console.log(`│ ... (${result.markdownContent.length - 300} more characters)${' '.repeat(30)}│`);
      }
      console.log('└' + '─'.repeat(73) + '┘');
      
      return {
        success: true,
        content: result.markdownContent,
        duration,
        name: pdfName
      };
    }
  } catch (error) {
    logError(`Vectorization failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      name: pdfName
    };
  }
}

// Test RAG chunking
function testRAGChunking(text, chunkSize = 512, overlap = 128) {
  logSection('🔍 RAG Chunking Analysis');
  
  logInfo(`Chunk size: ${chunkSize} words`);
  logInfo(`Overlap: ${overlap} words`);
  
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) {
      chunks.push(chunk.trim());
    }
  }
  
  logSuccess(`Created ${chunks.length} chunks from ${words.length} words`);
  
  // Display chunk statistics
  console.log('\nChunk Statistics:');
  chunks.forEach((chunk, index) => {
    const wordCount = chunk.split(/\s+/).length;
    const charCount = chunk.length;
    log(`  Chunk ${index + 1}: ${wordCount} words, ${charCount} characters`, colors.cyan);
  });
  
  // Display sample chunks
  console.log('\nSample Chunks:');
  chunks.slice(0, 2).forEach((chunk, index) => {
    console.log(`\n${colors.yellow}Chunk ${index + 1}:${colors.reset}`);
    console.log('┌' + '─'.repeat(73) + '┐');
    const preview = chunk.substring(0, 150);
    console.log(`│ ${preview}${' '.repeat(72 - preview.length)}│`);
    console.log('└' + '─'.repeat(73) + '┘');
  });
  
  return chunks;
}

// Test question answering with vectorized content
async function testQuestionAnswering(content, pdfName) {
  logSection(`💬 Question Answering Test: ${pdfName}`);
  
  const questions = [
    'What is the company name?',
    'What is the revenue?',
    'How many employees?',
  ];
  
  try {
    const { answerQuestionsAboutPdf } = await import('./src/ai/flows/answer-questions-about-pdf.ts');
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n[Q${i + 1}] ${question}`);
      
      try {
        const startTime = Date.now();
        const result = await answerQuestionsAboutPdf({
          question,
          pdfText: content
        });
        const duration = Date.now() - startTime;
        
        if (result.answer) {
          logSuccess(`Answered in ${duration}ms`);
          log(`Answer: ${result.answer}`, colors.green);
        }
      } catch (error) {
        logError(`Error: ${error.message}`);
      }
      
      // Delay to avoid rate limiting
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  } catch (error) {
    logError(`Question answering test failed: ${error.message}`);
  }
}

// Test advanced vectorization features
async function testAdvancedVectorization() {
  logSection('🚀 Advanced Vectorization Features');
  
  const features = [
    {
      name: 'Multi-method Text Extraction',
      description: 'Uses 5 different extraction methods for maximum accuracy',
      methods: [
        '1. PDF content streams (BT/ET blocks)',
        '2. Parentheses content extraction',
        '3. PDF text objects',
        '4. Readable ASCII text patterns',
        '5. Fallback pattern matching'
      ]
    },
    {
      name: 'AI-Powered Structuring',
      description: 'Uses Groq AI to intelligently structure extracted content',
      features: [
        '• Cleans up formatting issues',
        '• Organizes information logically',
        '• Removes redundant data',
        '• Optimizes for Q&A retrieval'
      ]
    },
    {
      name: 'RAG Chunking',
      description: 'Creates optimized chunks for Retrieval-Augmented Generation',
      specs: [
        '• Chunk size: 512 words',
        '• Overlap: 128 words',
        '• Minimum chunk size: 50 characters',
        '• Context preservation'
      ]
    },
    {
      name: 'Error Handling',
      description: 'Comprehensive error detection and handling',
      cases: [
        '✓ Invalid PDF format detection',
        '✓ Empty file handling',
        '✓ Image-only PDF detection',
        '✓ Password-protected PDF detection',
        '✓ Corrupted file handling'
      ]
    }
  ];
  
  features.forEach(feature => {
    console.log(`\n${colors.bright}${colors.cyan}${feature.name}${colors.reset}`);
    log(feature.description, colors.yellow);
    console.log('');
    
    const items = feature.methods || feature.features || feature.specs || feature.cases;
    items.forEach(item => {
      console.log(`  ${item}`);
    });
  });
}

// Generate test report
function generateTestReport(results) {
  logSection('📊 Test Report');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`${colors.bright}Summary:${colors.reset}`);
  logSuccess(`Successful: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    logError(`Failed: ${failed.length}/${results.length}`);
  }
  
  if (successful.length > 0) {
    console.log(`\n${colors.bright}${colors.green}Successful Tests:${colors.reset}`);
    successful.forEach(result => {
      logSuccess(`${result.name} - ${result.duration}ms`);
      logInfo(`  Content length: ${result.content.length} characters`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n${colors.bright}${colors.red}Failed Tests:${colors.reset}`);
    failed.forEach(result => {
      logError(`${result.name}`);
      log(`  Error: ${result.error}`, colors.yellow);
    });
  }
  
  // Performance metrics
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const avgLength = successful.reduce((sum, r) => sum + r.content.length, 0) / successful.length;
    
    console.log(`\n${colors.bright}Performance Metrics:${colors.reset}`);
    logInfo(`Average processing time: ${avgDuration.toFixed(2)}ms`);
    logInfo(`Average content length: ${avgLength.toFixed(0)} characters`);
  }
}

// Main test runner
async function runTests() {
  logSection('🧪 Comprehensive PDF Testing Suite');
  logInfo('Testing different PDF types and advanced vectorization');
  
  // Generate test PDFs
  const pdfDir = generateTestPDFs();
  
  // Display advanced features
  await testAdvancedVectorization();
  
  // Test each PDF type
  logSection('🔬 PDF Type Testing');
  
  const testFiles = [
    'simple-text.pdf',
    'multi-page.pdf',
    'structured.pdf',
    'invalid.pdf',
    'empty.pdf'
  ];
  
  const results = [];
  
  for (const filename of testFiles) {
    const filePath = path.join(pdfDir, filename);
    const result = await testPdfVectorization(filePath, filename);
    results.push(result);
    
    // Test RAG chunking on successful extractions
    if (result.success && result.content.length > 100) {
      testRAGChunking(result.content);
    }
    
    // Test Q&A on first successful PDF
    if (result.success && results.filter(r => r.success).length === 1) {
      await testQuestionAnswering(result.content, filename);
    }
  }
  
  // Generate report
  generateTestReport(results);
  
  // Cleanup info
  logSection('🧹 Cleanup');
  logInfo(`Test PDFs stored in: ${pdfDir}`);
  logInfo('You can safely delete the test-pdfs folder after reviewing results');
  
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

