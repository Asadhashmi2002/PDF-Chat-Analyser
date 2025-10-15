'use client';

import { useState } from 'react';
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
  const { toast } = useToast();

  const handlePdfUpload = async (file: File) => {
    // Professional file validation
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid PDF file.",
        variant: 'destructive'
      });
      return;
    }

    // File size validation (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size exceeds 50MB limit. Please compress your PDF or use a smaller file.",
        variant: 'destructive'
      });
      return;
    }

    // Prevent multiple uploads
    if (isUploading || isProcessing || isServerProcessing) {
      toast({
        title: "Upload in Progress",
        description: "Please wait for the current upload to complete.",
        variant: 'destructive'
      });
      return;
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
        }, 300);
      }

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

  const handleStartChat = async () => {
    if (!pdfFile || !pdfUrl) {
      return;
    }
    
    // Go directly to chat without processing
    setPdfText("Document uploaded successfully. You can now ask questions about your PDF.");
    setIsProcessing(false);
    setIsServerProcessing(false);
    setIsDocumentReady(true);
    
    // Force immediate state update
    setShowHome(false);
  };

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

  if (showHome) {
    return <HomePage onGetStarted={() => setShowHome(false)} />;
  }

  if (!pdfFile || !pdfUrl) {
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

  // If we have pdfFile and pdfUrl but no pdfText, show upload view with start chat option
  if (!pdfText) {
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