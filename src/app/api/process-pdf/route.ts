import { NextResponse } from 'next/server';
import { vectorizePdfContent } from '@/ai/flows/vectorize-pdf-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const maxRequestBodySize = '50mb';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const clientExtractedText = formData.get('clientExtractedText');

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Invalid or missing PDF file.' }, { status: 400 });
    }

    if (file.type && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF document.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'The uploaded PDF appears to be empty.' }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(arrayBuffer);
    const base64 = pdfBuffer.toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    const { markdownContent } = await vectorizePdfContent({
      pdfDataUri: dataUri,
      clientExtractedText:
        typeof clientExtractedText === 'string' && clientExtractedText.trim().length > 0
          ? clientExtractedText
          : undefined,
    });

    return NextResponse.json({ text: markdownContent });
  } catch (error: any) {
    console.error('API process-pdf error:', error);
    const message =
      error?.message && typeof error.message === 'string'
        ? error.message
        : 'Failed to process PDF document.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
