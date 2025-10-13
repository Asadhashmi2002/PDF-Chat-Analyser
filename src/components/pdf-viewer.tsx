'use client';

import { forwardRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PdfViewerProps {
  fileUrl: string | null;
}

const PdfViewer = forwardRef<HTMLIFrameElement, PdfViewerProps>(({ fileUrl }, ref) => {
  if (!fileUrl) {
    return (
      <div className="w-full h-full p-4 bg-secondary/20">
        <Skeleton className="w-full h-full rounded-lg bg-secondary/50" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-secondary/20 p-4">
      <iframe
        ref={ref}
        src={fileUrl}
        className="w-full h-full border-2 border-border rounded-lg"
        title="PDF Viewer"
      />
    </div>
  );
});

PdfViewer.displayName = 'PdfViewer';
export default PdfViewer;
