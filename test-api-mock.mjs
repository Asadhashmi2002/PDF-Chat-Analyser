#!/usr/bin/env node

/**
 * Mock API Testing Script for PDF Chat Analyser
 * Demonstrates API response structure without requiring API keys
 */

// Colors for console output
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
  console.log('\n' + '='.repeat(70));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

// Mock PDF content
const mockPdfContent = `Test Document

This is a simple test PDF for the Chat Navigator.

Company: TechCorp
Revenue: $5 million
Employees: 100`;

// Mock answer generation function (simulates AI response)
function generateMockAnswer(question, pdfContent) {
  const lowerQuestion = question.toLowerCase();
  const lowerContent = pdfContent.toLowerCase();
  
  // Simple pattern matching for mock responses
  if (lowerQuestion.includes('company') || lowerQuestion.includes('name')) {
    if (pdfContent.includes('TechCorp')) {
      return {
        answer: 'TechCorp',
        citations: ['1'],
        responseTime: Math.floor(Math.random() * 2000) + 500,
        tokensUsed: 150,
        provider: 'Mock AI (Simulated)'
      };
    }
  }
  
  if (lowerQuestion.includes('revenue')) {
    if (pdfContent.includes('$5 million')) {
      return {
        answer: '$5 million',
        citations: ['1'],
        responseTime: Math.floor(Math.random() * 2000) + 500,
        tokensUsed: 120,
        provider: 'Mock AI (Simulated)'
      };
    }
  }
  
  if (lowerQuestion.includes('employee')) {
    if (pdfContent.includes('100')) {
      return {
        answer: '100',
        citations: ['1'],
        responseTime: Math.floor(Math.random() * 2000) + 500,
        tokensUsed: 130,
        provider: 'Mock AI (Simulated)'
      };
    }
  }
  
  if (lowerQuestion.includes('about') || lowerQuestion.includes('document')) {
    return {
      answer: 'This is a simple test PDF for the Chat Navigator.',
      citations: ['1'],
      responseTime: Math.floor(Math.random() * 2000) + 500,
      tokensUsed: 180,
      provider: 'Mock AI (Simulated)'
    };
  }
  
  // Default response for questions not found in document
  return {
    answer: 'Not found in document',
    citations: [],
    responseTime: Math.floor(Math.random() * 1000) + 300,
    tokensUsed: 100,
    provider: 'Mock AI (Simulated)'
  };
}

// Test API Response Structure
async function testApiResponseStructure() {
  logSection('📦 API Response Structure Test');
  
  const questions = [
    'What is the company name?',
    'What is the revenue?',
    'How many employees are there?',
    'What is this document about?',
    'What is the CEO name?', // Not in document
  ];
  
  logInfo('Mock PDF Content:');
  console.log('-'.repeat(70));
  log(mockPdfContent, colors.cyan);
  console.log('-'.repeat(70));
  
  const responses = [];
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n[${'='.repeat(3)} Test ${i + 1}/${questions.length} ${'='.repeat(3)}]`);
    log(`Question: ${question}`, colors.bright + colors.yellow);
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get mock response
    const response = generateMockAnswer(question, mockPdfContent);
    responses.push({ question, response });
    
    // Display response
    logSuccess(`Response received in ${response.responseTime}ms`);
    log(`Answer: ${response.answer}`, colors.green);
    
    if (response.citations && response.citations.length > 0) {
      logInfo(`Citations: Page ${response.citations.join(', Page ')}`);
    }
    
    logInfo(`Tokens: ${response.tokensUsed}`);
    logInfo(`Provider: ${response.provider}`);
  }
  
  return responses;
}

// Validate API Response Format
function validateApiResponseFormat(responses) {
  logSection('✅ API Response Format Validation');
  
  const validationChecks = [];
  
  responses.forEach((item, index) => {
    const { question, response } = item;
    
    console.log(`\nValidating Response ${index + 1}:`);
    log(`Q: ${question}`, colors.yellow);
    
    const checks = [
      {
        name: 'Has answer property',
        test: () => 'answer' in response,
        required: true
      },
      {
        name: 'Answer is non-empty string',
        test: () => typeof response.answer === 'string' && response.answer.trim().length > 0,
        required: true
      },
      {
        name: 'Has citations property',
        test: () => 'citations' in response,
        required: false
      },
      {
        name: 'Citations is array',
        test: () => Array.isArray(response.citations),
        required: false
      },
      {
        name: 'Has response time',
        test: () => typeof response.responseTime === 'number' && response.responseTime > 0,
        required: false
      },
      {
        name: 'Has tokens used',
        test: () => typeof response.tokensUsed === 'number' && response.tokensUsed > 0,
        required: false
      },
      {
        name: 'Has provider info',
        test: () => typeof response.provider === 'string' && response.provider.length > 0,
        required: false
      },
    ];
    
    checks.forEach(check => {
      const passed = check.test();
      if (passed) {
        logSuccess(`${check.name}`);
      } else {
        if (check.required) {
          log(`✗ ${check.name} (REQUIRED)`, colors.red);
        } else {
          log(`⚠ ${check.name} (optional)`, colors.yellow);
        }
      }
      validationChecks.push({ ...check, passed, question });
    });
  });
  
  return validationChecks;
}

// Generate API Response Examples
function displayApiResponseExamples(responses) {
  logSection('📄 API Response Examples');
  
  responses.forEach((item, index) => {
    console.log(`\n[Example ${index + 1}]`);
    log(`Question: "${item.question}"`, colors.magenta);
    console.log('\nResponse Object:');
    console.log(JSON.stringify(item.response, null, 2));
  });
}

// Display API Endpoint Documentation
function displayApiDocumentation() {
  logSection('📖 API Endpoint Documentation');
  
  console.log(`
${colors.bright}Endpoint: POST /api/ask-question${colors.reset}

${colors.blue}Request Format:${colors.reset}
{
  "question": string,      // The question to ask
  "pdfContent": string     // The PDF text content
}

${colors.blue}Response Format (Success):${colors.reset}
{
  "answer": string,        // The AI-generated answer
  "citations": string[],   // Array of page numbers (optional)
  "metadata": {            // Additional info (optional)
    "provider": string,    // AI provider used
    "tokens": number,      // Token count
    "processingTime": number // Response time in ms
  }
}

${colors.blue}Response Format (Error):${colors.reset}
{
  "error": string,         // Error message
  "code": string          // Error code (optional)
}

${colors.bright}Supported AI Providers:${colors.reset}
1. Google Gemini Pro Latest (Primary)
   - Best for NotebookLM-like experience
   - Rate: 2 requests/minute (free tier)

2. Groq API with Llama 3.1 8B (Fallback)
   - Fast and reliable
   - Rate: 30 requests/minute (free tier)

3. OpenAI GPT (Optional)
   - Premium quality
   - Requires API key and payment
  `);
}

// Generate Test Summary
function generateTestSummary(validationChecks, responses) {
  logSection('📊 Test Summary');
  
  const totalTests = validationChecks.length;
  const passedTests = validationChecks.filter(c => c.passed).length;
  const failedTests = totalTests - passedTests;
  
  const requiredTests = validationChecks.filter(c => c.required).length;
  const passedRequired = validationChecks.filter(c => c.required && c.passed).length;
  
  console.log(`Total Validation Checks: ${totalTests}`);
  logSuccess(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    log(`Failed: ${failedTests}`, colors.red);
  }
  
  console.log(`\nRequired Checks: ${requiredTests}`);
  if (passedRequired === requiredTests) {
    logSuccess(`All required checks passed! ✨`);
  } else {
    log(`Failed required checks: ${requiredTests - passedRequired}`, colors.red);
  }
  
  console.log(`\nTotal Questions Tested: ${responses.length}`);
  const answeredQuestions = responses.filter(r => r.response.answer !== 'Not found in document').length;
  const notFoundQuestions = responses.length - answeredQuestions;
  
  logSuccess(`Answered: ${answeredQuestions}`);
  logInfo(`Not found in document: ${notFoundQuestions}`);
  
  // Performance metrics
  const avgResponseTime = responses.reduce((sum, r) => sum + r.response.responseTime, 0) / responses.length;
  const avgTokens = responses.reduce((sum, r) => sum + r.response.tokensUsed, 0) / responses.length;
  
  console.log(`\n${colors.bright}Performance Metrics:${colors.reset}`);
  logInfo(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  logInfo(`Average Tokens Used: ${avgTokens.toFixed(0)}`);
  
  // Overall status
  console.log('\n' + '='.repeat(70));
  if (passedRequired === requiredTests) {
    log('✨ API RESPONSE STRUCTURE: VALID ✨', colors.bright + colors.green);
  } else {
    log('❌ API RESPONSE STRUCTURE: INVALID ❌', colors.bright + colors.red);
  }
  console.log('='.repeat(70));
}

// Main test runner
async function runTests() {
  logSection('🚀 PDF Chat Analyser - Mock API Testing');
  
  logInfo('Testing API response structure with mock data');
  logInfo('No API keys required for this test\n');
  
  // Run tests
  const responses = await testApiResponseStructure();
  
  // Validate responses
  const validationResults = validateApiResponseFormat(responses);
  
  // Display examples
  displayApiResponseExamples(responses);
  
  // Display documentation
  displayApiDocumentation();
  
  // Generate summary
  generateTestSummary(validationResults, responses);
  
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  log(`Test suite failed: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

