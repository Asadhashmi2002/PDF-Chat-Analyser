'use client';

/**
 * Client-side PDF text extraction with optional OCR fallback.
 *
 * Uses pdfjs-dist for text-based PDFs and tesseract.js for image-based PDFs.
 * The OCR worker/core assets are loaded from public CDNs to avoid bundling
 * large binaries into the app bundle and to work without server-side system packages.
 */

type ExtractionProgressMode = 'text' | 'ocr';

export interface ExtractionProgress {
  page: number;
  totalPages: number;
  mode: ExtractionProgressMode;
}

export interface ExtractionResult {
  text: string;
  usedOcr: boolean;
}

const TESSERACT_VERSION = '5.0.4';
const PDFJS_FALLBACK_VERSION = '4.0.379';

const getPdfWorkerSrc = (pdfjsVersion: string | undefined) =>
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion || PDFJS_FALLBACK_VERSION}/pdf.worker.min.js`;

const OCR_WORKER_PATH = `https://unpkg.com/tesseract.js@${TESSERACT_VERSION}/dist/worker.min.js`;
const OCR_CORE_PATH = `https://unpkg.com/tesseract.js-core@${TESSERACT_VERSION}/tesseract-core.wasm.js`;
const OCR_LANG_PATH = 'https://tessdata.projectnaptha.com/4.0.0_fast';

const CLEAN_TEXT_REGEX = /[^\x09\x0A\x0D\x20-\x7E]/g; // printable ASCII incl. whitespace

function cleanExtractedText(text: string): string {
  return text
    .replace(CLEAN_TEXT_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function renderPageToCanvas(page: any, scale = 2): Promise<string> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Failed to acquire canvas rendering context for OCR.');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;
  const dataUrl = canvas.toDataURL('image/png');

  // Clean up DOM to avoid leaks
  canvas.width = 0;
  canvas.height = 0;

  return dataUrl;
}

/**
 * Extract text from a PDF File in the browser.
 * Falls back to OCR (tesseract.js) when no meaningful text is discovered.
 */
export async function extractPdfTextClient(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractionResult> {
  if (typeof window === 'undefined') {
    throw new Error('Client-side PDF extraction is only available in the browser.');
  }

  const arrayBuffer = await file.arrayBuffer();

  const pdfjs = (await import('pdfjs-dist')) as any;
  const pdfjsVersion: string | undefined = pdfjs?.version;

  if (pdfjs?.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = getPdfWorkerSrc(pdfjsVersion);
  }

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let combinedText = '';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    combinedText += `${pageText}\n`;
    onProgress?.({ page: pageNumber, totalPages: pdf.numPages, mode: 'text' });
  }

  const cleanedText = cleanExtractedText(combinedText);
  if (cleanedText.length > 120) {
    return { text: cleanedText, usedOcr: false };
  }

  // OCR fallback
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    workerPath: OCR_WORKER_PATH,
    corePath: OCR_CORE_PATH,
    langPath: OCR_LANG_PATH,
  });

  try {
    let ocrCombined = '';

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const imageDataUrl = await renderPageToCanvas(page, 2);
      const { data } = await worker.recognize(imageDataUrl);
      ocrCombined += `${data.text}\n`;
      onProgress?.({ page: pageNumber, totalPages: pdf.numPages, mode: 'ocr' });
    }

    const cleanedOcr = cleanExtractedText(ocrCombined);
    if (!cleanedOcr) {
      throw new Error('OCR produced no readable text.');
    }

    return { text: cleanedOcr, usedOcr: true };
  } finally {
    await worker.terminate();
  }
}
