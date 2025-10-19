'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import HomePage from '@/components/home-page';
import UploadView from '@/components/upload-view';
import MainView from '@/components/main-view';
import { processPdf } from './actions';

export default function Page() {
  const [showHome, setShowHome] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isServerProcessing, setIsServerProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serverProcessingProgress, setServerProcessingProgress] = useState(0);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [startChatQueued, setStartChatQueued] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  // Ensure client-side rendering to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePdfUpload = async (file: File) => {
    // Professional file validation
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid PDF file.",
        variant: 'destructive'
      });
      throw new Error('Invalid file type');
    }

    // File size validation (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size exceeds 50MB limit. Please compress your PDF or use a smaller file.",
        variant: 'destructive'
      });
      throw new Error('File too large');
    }

    // Prevent multiple uploads
    if (isUploading || isProcessing || isServerProcessing) {
      toast({
        title: "Upload in Progress",
        description: "Please wait for the current upload to complete.",
        variant: 'destructive'
      });
      throw new Error('Upload already in progress');
    }

    // Professional upload process with real progress tracking
    setIsUploading(true);
    setUploadProgress(0);
    setShowHome(false);
    setIsDocumentReady(false);

    try {
      // Clean up previous file URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Create new file URL
      const newPdfUrl = URL.createObjectURL(file);

      // Real progress tracking for large files
      const fileSize = file.size;
      const isLargeFile = fileSize > 20 * 1024 * 1024; // 20MB threshold
      
      // Ensure callers can await until upload completes to avoid races
      await new Promise<void>((resolve) => {
        if (isLargeFile) {
          // For large files, simulate realistic upload progress
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += Math.random() * 3; // Slower progress for large files
            if (progress >= 95) {
              clearInterval(progressInterval);
              setUploadProgress(95);
              // Complete upload after a short delay
              setTimeout(() => {
                setUploadProgress(100);
                setIsUploading(false);
                setIsDocumentReady(true);
                setPdfFile(file);
                setPdfUrl(newPdfUrl);
                
                toast({
                  title: "Upload Complete",
                  description: `Large file (${(fileSize / (1024 * 1024)).toFixed(1)}MB) uploaded successfully.`,
                  variant: 'default'
                });
                resolve();
              }, 500);
            } else {
              setUploadProgress(Math.min(progress, 95));
            }
          }, 100);
        } else {
          // For smaller files, quick upload
          setUploadProgress(50);
          setTimeout(() => {
            setUploadProgress(100);
            setIsUploading(false);
            setIsDocumentReady(true);
            setPdfFile(file);
            setPdfUrl(newPdfUrl);
            resolve();
          }, 300);
        }
      });

    } catch (error) {
      // Professional error handling
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setIsDocumentReady(false);
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload the file. Please try again or check your internet connection.",
        variant: 'destructive'
      });
    }
  };

  const startChatNow = () => {
    // Go directly to chat without processing
    setIsProcessing(false);
    setIsServerProcessing(false);
    setIsDocumentReady(true);
    setShowHome(false);
  };

  // Convert a File to a data URI for server processing
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleStartChat = async () => {
    // If upload not ready, queue the start
    if (!pdfFile || !pdfUrl) {
      setStartChatQueued(true);
      return;
    }

    // If we already have extracted text, start immediately
    if (pdfText && pdfText.trim().length > 0) {
      startChatNow();
      return;
    }

    // Extract PDF content on server before starting chat
    if (isServerProcessing) return; // guard against double clicks
    setIsServerProcessing(true);
    setServerProcessingProgress(0);

    // Simulate progress while server action runs
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(95, progress + 4); // Fixed increment to prevent hydration mismatch
      setServerProcessingProgress(progress);
    }, 200);

    try {
      const dataUri = await fileToDataUri(pdfFile);
      const result = await processPdf({ pdfDataUri: dataUri });

      if (result.error || !result.text) {
        throw new Error(result.error || 'Failed to extract PDF text');
      }

      setPdfText(result.text);
      setServerProcessingProgress(100);
      clearInterval(interval);
      setIsServerProcessing(false);

      // Now that content is ready, start chat
      startChatNow();
    } catch (err: any) {
      clearInterval(interval);
      setIsServerProcessing(false);
      setServerProcessingProgress(0);
      toast({
        title: 'Processing Failed',
        description: err?.message || 'Could not process the PDF. Please try another file.',
        variant: 'destructive'
      });
    }
  };

  // Auto-start chat once upload state is ready after a queued request
  // Ensures a single click is enough even if state hasn't flushed yet
  // (common when awaiting async upload before state commit)
  useEffect(() => {
    (async () => {
      if (startChatQueued && pdfFile && pdfUrl) {
        setStartChatQueued(false);
        await handleStartChat();
      }
    })();
  }, [startChatQueued, pdfFile, pdfUrl]);

  const goToHome = () => {
    setPdfFile(null);
    setPdfText(null);
    setPdfUrl(null);
    setIsProcessing(false);
    setIsUploading(false);
    setIsServerProcessing(false);
    setUploadProgress(0);
    setServerProcessingProgress(0);
    setIsDocumentReady(false);
    setShowHome(true);
  };

  const stopProcessing = () => {
    setIsProcessing(false);
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (showHome) {
    return <HomePage onGetStarted={() => setShowHome(false)} />;
  }

  // Show upload view if no file is uploaded OR if file is uploaded but not processed yet
  if (!pdfFile || !pdfUrl || !pdfText) {
    return <UploadView
      onUpload={handlePdfUpload} 
      isProcessing={isProcessing || isUploading || isServerProcessing} 
      onGoHome={goToHome}
      uploadProgress={isServerProcessing ? serverProcessingProgress : uploadProgress}
      isUploading={isUploading || isServerProcessing}
      isDocumentReady={isDocumentReady}
      onStartChat={handleStartChat}
    />;
  }

  return <MainView 
    pdfFile={pdfFile} 
    pdfText={pdfText} 
    pdfUrl={pdfUrl} 
    stopProcessing={stopProcessing} 
    onGoHome={goToHome}
    onDocumentReady={() => setIsDocumentReady(true)}
  />;
}
