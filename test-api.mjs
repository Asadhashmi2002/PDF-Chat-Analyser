#!/usr/bin/env node

/**
 * API Testing Script for PDF Chat Analyser
 * Tests the PDF processing and question answering endpoints
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
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

// Read and convert PDF to base64 data URI
function getPdfDataUri() {
  try {
    const pdfPath = path.join(__dirname, 'simple-test.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64 = pdfBuffer.toString('base64');
    return `data:application/pdf;base64,${base64}`;
  } catch (error) {
    logError(`Failed to read PDF file: ${error.message}`);
    process.exit(1);
  }
}

// Test PDF processing
async function testPdfProcessing(pdfDataUri) {
  logSection('TEST 1: PDF Processing');
  
  try {
    logInfo('Processing PDF file...');
    
    // Import vectorization flow directly
    const { vectorizePdfContent } = await import('./src/ai/flows/vectorize-pdf-content.ts');
    
    const startTime = Date.now();
    const result = await vectorizePdfContent({ pdfDataUri });
    const duration = Date.now() - startTime;
    
    if (result?.markdownContent) {
      logSuccess(`PDF processed successfully in ${duration}ms`);
      logInfo(`Extracted text length: ${result.markdownContent.length} characters`);
      
      const preview = result.markdownContent.substring(0, 200);
      console.log('\nExtracted Text Preview:');
      console.log('-'.repeat(60));
      log(preview, colors.cyan);
      console.log('-'.repeat(60));
      
      return result.markdownContent;
    }

    logError('PDF Processing returned no text');
    return null;
  } catch (error) {
    logError(`PDF Processing error: ${error.message}`);
    console.error(error);
    return null;
  }
}

// Test question answering
async function testQuestionAnswering(pdfContent) {
  logSection('TEST 2: Question Answering');
  
  if (!pdfContent) {
    logWarning('Skipping question answering test (no PDF content)');
    return;
  }
  
  const questions = [
    'What is the company name?',
    'What is the revenue?',
    'How many employees are there?',
    'What is this document about?',
  ];
  
  try {
    const { askQuestion } = await import('./src/app/actions.ts');
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n[Question ${i + 1}/${questions.length}]`);
      log(`Q: ${question}`, colors.bright);
      
      const startTime = Date.now();
      const result = await askQuestion({ question, pdfContent });
      const duration = Date.now() - startTime;
      
      if (result.error) {
        logError(`Error: ${result.error}`);
      } else if (result.answer) {
        logSuccess(`Answered in ${duration}ms`);
        log(`A: ${result.answer}`, colors.green);
        
        if (result.citations && result.citations.length > 0) {
          logInfo(`Citations: Page ${result.citations.join(', Page ')}`);
        }
      } else {
        logWarning('No answer received');
      }
      
      // Small delay between requests to avoid rate limiting
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error) {
    logError(`Question answering error: ${error.message}`);
    console.error(error);
  }
}

// Test API response structure
async function testApiResponseStructure(pdfContent) {
  logSection('TEST 3: API Response Structure Validation');
  
  if (!pdfContent) {
    logWarning('Skipping API response structure test (no PDF content)');
    return;
  }
  
  try {
    const { askQuestion } = await import('./src/app/actions.ts');
    
    logInfo('Testing response structure...');
    const result = await askQuestion({ 
      question: 'What is the company name?', 
      pdfContent 
    });
    
    // Validate response structure
    const checks = [
      { name: 'Has answer property', test: () => 'answer' in result || 'error' in result },
      { name: 'Answer is string or error exists', test: () => typeof result.answer === 'string' || typeof result.error === 'string' },
      { name: 'Citations is array or undefined', test: () => result.citations === undefined || Array.isArray(result.citations) },
    ];
    
    console.log('\nResponse Structure Checks:');
    console.log('-'.repeat(60));
    
    let allPassed = true;
    checks.forEach(check => {
      const passed = check.test();
      if (passed) {
        logSuccess(check.name);
      } else {
        logError(check.name);
        allPassed = false;
      }
    });
    
    console.log('-'.repeat(60));
    
    if (allPassed) {
      logSuccess('All structure checks passed!');
    } else {
      logError('Some structure checks failed!');
    }
    
    // Display full response
    console.log('\nFull Response Object:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    logError(`API structure test error: ${error.message}`);
    console.error(error);
  }
}

// Test error handling
async function testErrorHandling() {
  logSection('TEST 4: Error Handling');
  
  try {
    const { askQuestion } = await import('./src/app/actions.ts');
    
    // Test with empty question
    logInfo('Testing with empty question...');
    const result1 = await askQuestion({ question: '', pdfContent: 'test content' });
    if (result1.error) {
      logSuccess(`Empty question handled: ${result1.error}`);
    } else {
      logWarning('Empty question did not produce error');
    }
    
    // Test with empty PDF content
    logInfo('Testing with empty PDF content...');
    const result2 = await askQuestion({ question: 'test', pdfContent: '' });
    if (result2.error) {
      logSuccess(`Empty PDF content handled: ${result2.error}`);
    } else {
      logWarning('Empty PDF content did not produce error');
    }
    
  } catch (error) {
    logError(`Error handling test failed: ${error.message}`);
    console.error(error);
  }
}

// Main test runner
async function runTests() {
  logSection('🚀 PDF Chat Analyser - API Testing Suite');
  
  logInfo('Starting API tests...');
  logInfo('Using simple-test.pdf for testing');
  
  // Get PDF data
  const pdfDataUri = getPdfDataUri();
  logSuccess('PDF file loaded successfully');
  
  // Run tests sequentially
  const pdfContent = await testPdfProcessing(pdfDataUri);
  await testQuestionAnswering(pdfContent);
  await testApiResponseStructure(pdfContent);
  await testErrorHandling();
  
  // Summary
  logSection('✨ Test Suite Complete');
  logInfo('All tests have been executed');
  logInfo('Review the results above for any errors or warnings');
  
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

