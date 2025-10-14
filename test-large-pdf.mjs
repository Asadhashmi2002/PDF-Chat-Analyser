#!/usr/bin/env node

/**
 * Large PDF Testing Script
 * Tests handling of large PDF files (up to 50 MB)
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
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

// Format bytes to human-readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format time duration
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

// Generate a large PDF with substantial text content
function generateLargePDF(targetSizeMB = 50) {
  logSection(`📄 Generating ${targetSizeMB}MB PDF`);
  
  const targetBytes = targetSizeMB * 1024 * 1024;
  
  // Generate substantial text content
  const paragraphs = [
    'This is a comprehensive business analysis document containing detailed information about market trends and financial performance.',
    'The company has demonstrated exceptional growth across multiple sectors with strategic investments in technology and innovation.',
    'Annual revenue has increased by 45 percent year over year with strong customer acquisition and retention rates.',
    'Our product portfolio includes enterprise software solutions, cloud services, and AI-powered analytics platforms.',
    'The leadership team comprises industry veterans with decades of combined experience in technology and business management.',
    'Market analysis indicates continued growth potential in emerging markets with expanding digital transformation initiatives.',
    'Financial projections show sustainable profitability with diversified revenue streams and controlled operational costs.',
    'Customer satisfaction scores remain high at 92 percent with industry-leading support and service delivery.',
    'Research and development investments focus on next-generation technologies including machine learning and automation.',
    'Strategic partnerships with Fortune 500 companies strengthen market position and expand distribution channels.',
  ];
  
  // PDF header
  let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [`;
  
  // Calculate pages needed
  const bytesPerPage = 2000; // Approximate bytes per page
  const pagesNeeded = Math.ceil(targetBytes / bytesPerPage);
  
  logInfo(`Generating ${pagesNeeded} pages...`);
  
  // Add page references
  for (let i = 0; i < pagesNeeded; i++) {
    pdfContent += `${3 + (i * 2)} 0 R `;
  }
  
  pdfContent += `]
/Count ${pagesNeeded}
>>
endobj

`;
  
  // Generate pages with content
  let objNum = 3;
  
  for (let pageNum = 0; pageNum < pagesNeeded; pageNum++) {
    // Page object
    pdfContent += `${objNum} 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents ${objNum + 1} 0 R
/Resources <<
/Font <<
/F1 ${objNum + 2} 0 R
>>
>>
>>
endobj

`;
    
    // Content stream
    let pageContent = 'BT\n/F1 11 Tf\n72 720 Td\n';
    
    // Add title
    pageContent += `(Page ${pageNum + 1} of ${pagesNeeded} - Business Analysis Report) Tj\n0 -20 Td\n`;
    pageContent += `(Generated for Large File Testing) Tj\n0 -30 Td\n`;
    
    // Add multiple paragraphs
    const linesPerPage = 30;
    for (let line = 0; line < linesPerPage; line++) {
      const paragraph = paragraphs[line % paragraphs.length];
      const lineText = `Line ${line + 1}: ${paragraph}`;
      pageContent += `(${lineText}) Tj\n0 -18 Td\n`;
    }
    
    pageContent += 'ET';
    
    pdfContent += `${objNum + 1} 0 obj
<<
/Length ${pageContent.length}
>>
stream
${pageContent}
endstream
endobj

`;
    
    // Font object (shared for efficiency)
    if (pageNum === 0) {
      pdfContent += `${objNum + 2} 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

`;
    }
    
    objNum += 2;
    
    // Progress indicator
    if (pageNum % 100 === 0 && pageNum > 0) {
      process.stdout.write(`\r  Progress: ${pageNum}/${pagesNeeded} pages (${formatBytes(pdfContent.length)})`);
    }
  }
  
  console.log(''); // New line after progress
  
  // Cross-reference table and trailer
  pdfContent += `xref
0 ${objNum}
0000000000 65535 f 
`;
  
  for (let i = 1; i < objNum; i++) {
    pdfContent += `0000000${String(i * 100).padStart(3, '0')} 00000 n \n`;
  }
  
  pdfContent += `trailer
<<
/Size ${objNum}
/Root 1 0 R
>>
startxref
${pdfContent.length}
%%EOF`;
  
  const finalSize = pdfContent.length;
  logSuccess(`Generated PDF: ${formatBytes(finalSize)}`);
  
  if (finalSize < targetBytes * 0.8) {
    logWarning(`PDF is smaller than target (${Math.round((finalSize / targetBytes) * 100)}% of ${targetSizeMB}MB)`);
  }
  
  return pdfContent;
}

// Save PDF to file
function savePDF(content, filename) {
  const pdfDir = path.join(__dirname, 'test-pdfs');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
  }
  
  const filePath = path.join(pdfDir, filename);
  fs.writeFileSync(filePath, content);
  
  const stats = fs.statSync(filePath);
  logSuccess(`Saved: ${filename} (${formatBytes(stats.size)})`);
  
  return filePath;
}

// Convert PDF to base64 data URI
function pdfToDataUri(filePath) {
  const pdfBuffer = fs.readFileSync(filePath);
  const base64 = pdfBuffer.toString('base64');
  return `data:application/pdf;base64,${base64}`;
}

// Test PDF processing with size limits
async function testPdfWithSizeLimit(filePath, filename) {
  logSection(`🔬 Testing: ${filename}`);
  
  const stats = fs.statSync(filePath);
  const fileSizeBytes = stats.size;
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  logInfo(`File size: ${formatBytes(fileSizeBytes)} (${fileSizeMB.toFixed(2)} MB)`);
  
  // Check configured limits
  const maxPdfSize = parseInt(process.env.MAX_PDF_SIZE || '10485760'); // Default 10MB
  const maxPdfSizeMB = maxPdfSize / (1024 * 1024);
  
  logInfo(`Configured limit: ${formatBytes(maxPdfSize)} (${maxPdfSizeMB.toFixed(2)} MB)`);
  
  if (fileSizeBytes > maxPdfSize) {
    logWarning(`File exceeds configured limit by ${formatBytes(fileSizeBytes - maxPdfSize)}`);
  }
  
  try {
    logInfo('Converting to data URI...');
    const startConvert = Date.now();
    const pdfDataUri = pdfToDataUri(filePath);
    const convertDuration = Date.now() - startConvert;
    
    logSuccess(`Converted in ${formatDuration(convertDuration)}`);
    logInfo(`Data URI size: ${formatBytes(pdfDataUri.length)}`);
    
    // Test vectorization
    logInfo('Starting vectorization...');
    const { vectorizePdfContent } = await import('./src/ai/flows/vectorize-pdf-content.ts');
    
    const startTime = Date.now();
    const memBefore = process.memoryUsage();
    
    const result = await vectorizePdfContent({ pdfDataUri });
    
    const duration = Date.now() - startTime;
    const memAfter = process.memoryUsage();
    
    if (result.markdownContent) {
      logSuccess(`Vectorization completed in ${formatDuration(duration)}`);
      logInfo(`Extracted text: ${formatBytes(result.markdownContent.length)}`);
      logInfo(`Text preview: "${result.markdownContent.substring(0, 100)}..."`);
      
      // Memory usage
      const memUsed = memAfter.heapUsed - memBefore.heapUsed;
      logInfo(`Memory used: ${formatBytes(memUsed)}`);
      logInfo(`Peak memory: ${formatBytes(memAfter.heapUsed)}`);
      
      // Performance metrics
      const bytesPerSecond = fileSizeBytes / (duration / 1000);
      logInfo(`Processing speed: ${formatBytes(bytesPerSecond)}/s`);
      
      return {
        success: true,
        fileSize: fileSizeBytes,
        duration,
        memoryUsed: memUsed,
        content: result.markdownContent,
        name: filename
      };
    }
  } catch (error) {
    logError(`Processing failed: ${error.message}`);
    
    // Check if it's a size-related error
    if (error.message.includes('size') || error.message.includes('large') || error.message.includes('memory')) {
      logWarning('This appears to be a size-related limitation');
    }
    
    return {
      success: false,
      error: error.message,
      fileSize: fileSizeBytes,
      name: filename
    };
  }
}

// Test with progressively larger PDFs
async function testProgressiveSizes() {
  logSection('📊 Progressive Size Testing');
  
  const sizes = [1, 5, 10, 25, 50]; // MB
  const results = [];
  
  for (const sizeMB of sizes) {
    console.log(`\n${'─'.repeat(75)}`);
    log(`Testing ${sizeMB}MB PDF`, colors.bright + colors.magenta);
    console.log('─'.repeat(75));
    
    try {
      // Generate PDF
      const pdfContent = generateLargePDF(sizeMB);
      const filename = `large-${sizeMB}mb.pdf`;
      const filePath = savePDF(pdfContent, filename);
      
      // Test processing
      const result = await testPdfWithSizeLimit(filePath, filename);
      results.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logError(`Test failed for ${sizeMB}MB: ${error.message}`);
      results.push({
        success: false,
        error: error.message,
        name: `large-${sizeMB}mb.pdf`,
        fileSize: sizeMB * 1024 * 1024
      });
    }
  }
  
  return results;
}

// Generate test report
function generateReport(results) {
  logSection('📈 Test Report - Large PDF Handling');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`${colors.bright}Summary:${colors.reset}`);
  logSuccess(`Successful: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    logError(`Failed: ${failed.length}/${results.length}`);
  }
  
  // Successful tests table
  if (successful.length > 0) {
    console.log(`\n${colors.bright}${colors.green}Successful Tests:${colors.reset}`);
    console.log('┌' + '─'.repeat(73) + '┐');
    console.log('│ File Name          │ Size      │ Time      │ Memory     │ Speed     │');
    console.log('├' + '─'.repeat(73) + '┤');
    
    successful.forEach(result => {
      const name = result.name.padEnd(18);
      const size = formatBytes(result.fileSize).padEnd(9);
      const time = formatDuration(result.duration).padEnd(9);
      const memory = formatBytes(result.memoryUsed).padEnd(10);
      const speed = formatBytes(result.fileSize / (result.duration / 1000) || 0).padEnd(9);
      
      console.log(`│ ${name} │ ${size} │ ${time} │ ${memory} │ ${speed} │`);
    });
    
    console.log('└' + '─'.repeat(73) + '┘');
  }
  
  // Failed tests
  if (failed.length > 0) {
    console.log(`\n${colors.bright}${colors.red}Failed Tests:${colors.reset}`);
    failed.forEach(result => {
      logError(`${result.name} (${formatBytes(result.fileSize)})`);
      log(`  Error: ${result.error}`, colors.yellow);
    });
  }
  
  // Performance analysis
  if (successful.length > 1) {
    console.log(`\n${colors.bright}Performance Analysis:${colors.reset}`);
    
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const avgMemory = successful.reduce((sum, r) => sum + r.memoryUsed, 0) / successful.length;
    const avgSpeed = successful.reduce((sum, r) => sum + (r.fileSize / (r.duration / 1000)), 0) / successful.length;
    
    logInfo(`Average processing time: ${formatDuration(avgDuration)}`);
    logInfo(`Average memory usage: ${formatBytes(avgMemory)}`);
    logInfo(`Average processing speed: ${formatBytes(avgSpeed)}/s`);
    
    // Find max successful size
    const maxSuccessful = Math.max(...successful.map(r => r.fileSize));
    logSuccess(`Maximum successfully processed: ${formatBytes(maxSuccessful)}`);
  }
  
  // Recommendations
  console.log(`\n${colors.bright}Recommendations:${colors.reset}`);
  
  if (failed.length > 0) {
    const smallestFailed = Math.min(...failed.map(r => r.fileSize));
    logWarning(`Consider setting MAX_PDF_SIZE to ${formatBytes(smallestFailed * 0.9)}`);
  }
  
  if (successful.length > 0) {
    const maxMemory = Math.max(...successful.map(r => r.memoryUsed));
    logInfo(`Recommended minimum heap size: ${formatBytes(maxMemory * 2)}`);
  }
}

// Main test runner
async function runTests() {
  logSection('🚀 Large PDF Testing Suite');
  logInfo('Testing PDF processing with files up to 50MB');
  
  // Display system info
  console.log(`\n${colors.bright}System Information:${colors.reset}`);
  logInfo(`Node.js version: ${process.version}`);
  logInfo(`Platform: ${process.platform}`);
  logInfo(`Architecture: ${process.arch}`);
  logInfo(`Total memory: ${formatBytes(os.totalmem())}`);
  logInfo(`Free memory: ${formatBytes(os.freemem())}`);
  
  // Check environment
  const maxPdfSize = process.env.MAX_PDF_SIZE || '10485760';
  logInfo(`MAX_PDF_SIZE: ${formatBytes(parseInt(maxPdfSize))}`);
  
  // Run progressive size tests
  const results = await testProgressiveSizes();
  
  // Generate report
  generateReport(results);
  
  // Cleanup info
  logSection('🧹 Cleanup');
  const pdfDir = path.join(__dirname, 'test-pdfs');
  logInfo(`Test PDFs stored in: ${pdfDir}`);
  
  // Calculate total size
  const files = fs.readdirSync(pdfDir);
  let totalSize = 0;
  files.forEach(file => {
    const stats = fs.statSync(path.join(pdfDir, file));
    totalSize += stats.size;
  });
  
  logInfo(`Total size of test files: ${formatBytes(totalSize)}`);
  logWarning('Consider deleting large test files to free up disk space');
  
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

