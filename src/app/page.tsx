'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { processPdf } from './actions';
import UploadView from '../components/upload-view';
import MainView from '../components/main-view';
import HomePage from '../components/home-page';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showHome, setShowHome] = useState(true);
  const [isServerProcessing, setIsServerProcessing] = useState(false);
  const [serverProcessingProgress, setServerProcessingProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up the object URL when the component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handlePdfUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid PDF file.",
        variant: 'destructive'
      });
      return;
    }
    
    // Start upload process
    setIsUploading(true);
    setUploadProgress(0);
    setShowHome(false);
    
    // Simulate upload progress for large files
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
    
    // Add timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      clearInterval(progressInterval);
      toast({
        title: "Processing Timeout",
        description: "PDF processing is taking longer than expected. Please try again.",
        variant: 'destructive'
      });
      setPdfFile(null);
      setPdfText(null);
      setPdfUrl(null);
      setIsProcessing(false);
      setIsUploading(false);
      setUploadProgress(0);
      setShowHome(true);
    }, 120000); // 2 minutes timeout for large files

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    const newPdfUrl = URL.createObjectURL(file);

    // The AI flow requires a data URI, so we still need this part
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = async () => {
      try {
        const dataUri = fileReader.result as string;
        
        // Complete upload progress
        setUploadProgress(100);
        clearInterval(progressInterval);
        
        // Now start server processing
        setIsUploading(false);
        setIsServerProcessing(true);
        setServerProcessingProgress(0);
        
        // Simulate server processing progress
        const serverProgressInterval = setInterval(() => {
          setServerProcessingProgress(prev => {
            if (prev >= 90) {
              clearInterval(serverProgressInterval);
              return 90;
            }
            return prev + Math.random() * 15;
          });
        }, 500);
        
        const result = await processPdf({ pdfDataUri: dataUri });
        
        // Complete server processing
        clearInterval(serverProgressInterval);
        setServerProcessingProgress(100);
        setIsServerProcessing(false);
        setIsProcessing(true);

        clearTimeout(timeoutId); // Clear timeout
        
        if (result.error || !result.text) {
          toast({ title: "Error Processing PDF", description: result.error || "Could not extract text from PDF.", variant: 'destructive' });
          // Reset all states properly
          setPdfFile(null);
          setPdfText(null);
          setPdfUrl(null);
          setIsProcessing(false);
          setIsUploading(false);
          setIsServerProcessing(false);
          setUploadProgress(0);
          setServerProcessingProgress(0);
          setShowHome(true);
          URL.revokeObjectURL(newPdfUrl);
        } else {
          setPdfText(result.text);
          setPdfFile(file);
          setPdfUrl(newPdfUrl);
          // isProcessing will be set to false inside MainView after the PDF is rendered
        }
      } catch (e) {
        clearTimeout(timeoutId); // Clear timeout
        clearInterval(progressInterval);
        // Clear server processing interval if it exists
        if (typeof window !== 'undefined') {
          const intervals = (window as any).__serverProgressIntervals || [];
          intervals.forEach((interval: any) => clearInterval(interval));
        }
        toast({ title: "Error", description: "An unexpected error occurred while processing the PDF.", variant: 'destructive' });
        // Reset all states properly
        setPdfFile(null);
        setPdfText(null);
        setPdfUrl(null);
        setIsProcessing(false);
        setIsUploading(false);
        setIsServerProcessing(false);
        setUploadProgress(0);
        setServerProcessingProgress(0);
        setShowHome(true);
        URL.revokeObjectURL(newPdfUrl);
      }
    };

    fileReader.onerror = () => {
        clearTimeout(timeoutId); // Clear timeout
        clearInterval(progressInterval);
        toast({ title: "Error", description: "Failed to read the PDF file.", variant: 'destructive' });
        // Reset all states properly
        setPdfFile(null);
        setPdfText(null);
        setPdfUrl(null);
        setIsProcessing(false);
        setIsUploading(false);
        setIsServerProcessing(false);
        setUploadProgress(0);
        setServerProcessingProgress(0);
        setShowHome(true);
        URL.revokeObjectURL(newPdfUrl);
    };
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
    setShowHome(true);
  };

  if (showHome) {
    return <HomePage onGetStarted={() => setShowHome(false)} />;
  }

  if (!pdfFile || !pdfText || !pdfUrl) {
    return <UploadView 
      onUpload={handlePdfUpload} 
      isProcessing={isProcessing || isUploading || isServerProcessing} 
      onGoHome={goToHome}
      uploadProgress={isServerProcessing ? serverProcessingProgress : uploadProgress}
      isUploading={isUploading || isServerProcessing}
    />;
  }

  return <MainView pdfFile={pdfFile} pdfText={pdfText} pdfUrl={pdfUrl} stopProcessing={() => setIsProcessing(false)} onGoHome={goToHome} />;
}
