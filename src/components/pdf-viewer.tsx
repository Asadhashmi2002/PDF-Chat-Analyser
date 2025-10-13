'use client';

import { forwardRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PdfViewerProps {
  fileUrl: string | null;
}

const PdfViewer = forwardRef<HTMLIFrameElement, PdfViewerProps>(({ fileUrl }, ref) => {
  if (!fileUrl) {
    return (
      <div className="w-full h-full p-4">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 p-2">
      <iframe
        ref={ref}
        src={fileUrl}
        className="w-full h-full border-0 rounded-md"
        title="PDF Viewer"
      />
    </div>
  );
});

PdfViewer.displayName = 'PdfViewer';
export default PdfViewer;
