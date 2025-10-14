#!/usr/bin/env node

/**
 * Direct API Testing Script for PDF Chat Analyser
 * Tests the core AI functions directly
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
  console.log('\n' + '='.repeat(70));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');
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

// Test data - simulating PDF content
const testPdfContent = `Test Document

This is a simple test PDF for the Chat Navigator.

Company: TechCorp
Revenue: $5 million
Employees: 100`;

// Test the answer questions function with mock data
async function testAnswerQuestions() {
  logSection('🧪 Testing Answer Questions API');
  
  const questions = [
    'What is the company name?',
    'What is the revenue?',
    'How many employees are there?',
    'What is this document about?',
    'What is the CEO name?', // This should not be in the document
  ];
  
  logInfo('Test PDF Content:');
  console.log('-'.repeat(70));
  log(testPdfContent, colors.cyan);
  console.log('-'.repeat(70));
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`\n[${'='.repeat(5)} Question ${i + 1}/${questions.length} ${'='.repeat(5)}]`);
    log(`Q: ${question}`, colors.bright + colors.yellow);
    
    try {
      logInfo('Calling AI API...');
      const startTime = Date.now();
      
      // Make a direct API call to test
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY || 'gsk_demo_key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a document extractor. Extract and present ONLY the exact information from the document. Do not add any generic words, explanations, or context. If information is not in the document, respond with "Not found in document".'
            },
            {
              role: 'user',
              content: `Extract information to answer this question using ONLY the document below:

DOCUMENT:
${testPdfContent}

QUESTION: ${question}

RULES:
- Use ONLY exact text from the document
- Quote the relevant parts directly
- If not found, respond: "Not found in document"
- Do not add generic phrases or explanations
- Do not use words like "based on", "according to", "the document shows" etc.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        const errorText = await response.text();
        logError(`API Error (${response.status}): ${errorText}`);
        
        // Check if it's a rate limit error
        if (response.status === 429) {
          logWarning('Rate limit hit - please wait and try again');
        } else if (response.status === 401) {
          logError('Authentication failed - please check your GROQ_API_KEY');
        }
        continue;
      }
      
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content;
      
      if (answer) {
        logSuccess(`Answered in ${duration}ms`);
        
        // Clean the answer
        const cleanAnswer = answer
          .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .trim();
        
        log(`A: ${cleanAnswer}`, colors.green);
        
        // Show token usage if available
        if (data.usage) {
          logInfo(`Tokens: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
        }
      } else {
        logWarning('No answer received from API');
      }
      
    } catch (error) {
      logError(`Error: ${error.message}`);
    }
    
    // Delay between requests to avoid rate limiting
    if (i < questions.length - 1) {
      logInfo('Waiting 3 seconds before next question...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// Test Google Gemini API
async function testGeminiAPI() {
  logSection('🧪 Testing Google Gemini API');
  
  const question = 'What is the company name in this document?';
  
  logInfo('Test Question: ' + question);
  
  try {
    const geminiApiKey = process.env.GOOGLE_API_KEY;
    
    if (!geminiApiKey) {
      logWarning('GOOGLE_API_KEY not found in environment variables');
      logInfo('Skipping Gemini API test');
      return;
    }
    
    logInfo('Calling Google Gemini API...');
    const startTime = Date.now();
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Answer this question using ONLY the exact information from the document below.

DOCUMENT:
${testPdfContent}

QUESTION: ${question}

RULES:
- Use ONLY information that appears in the document above
- Quote exact text from the document
- If the answer is not in the document, respond with: "Not found in document"
- Do not add any generic phrases`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
          topP: 0.8,
          topK: 10
        }
      })
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      logError(`Gemini API Error (${response.status}): ${errorText}`);
      
      if (response.status === 429) {
        logWarning('Rate limit exceeded - Google Gemini free tier allows 2 requests/minute');
      }
      return;
    }
    
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (answer) {
      logSuccess(`Gemini responded in ${duration}ms`);
      log(`A: ${answer}`, colors.green);
    } else {
      logWarning('No answer received from Gemini');
    }
    
  } catch (error) {
    logError(`Gemini API error: ${error.message}`);
  }
}

// Test API keys
function testApiKeys() {
  logSection('🔑 API Key Configuration');
  
  const groqKey = process.env.GROQ_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  
  if (groqKey) {
    logSuccess(`GROQ_API_KEY configured: ${groqKey.substring(0, 10)}...`);
  } else {
    logWarning('GROQ_API_KEY not found in environment variables');
  }
  
  if (googleKey) {
    logSuccess(`GOOGLE_API_KEY configured: ${googleKey.substring(0, 10)}...`);
  } else {
    logWarning('GOOGLE_API_KEY not found in environment variables');
  }
  
  if (!groqKey && !googleKey) {
    logError('No API keys configured!');
    logInfo('Please set GROQ_API_KEY or GOOGLE_API_KEY in your environment');
    return false;
  }
  
  return true;
}

// Main test runner
async function runTests() {
  logSection('🚀 PDF Chat Analyser - Direct API Testing Suite');
  
  // Check API keys
  const hasKeys = testApiKeys();
  
  if (!hasKeys) {
    logWarning('Continuing with limited testing...');
  }
  
  // Test Groq API
  await testAnswerQuestions();
  
  // Test Gemini API
  await testGeminiAPI();
  
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

