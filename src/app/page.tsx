'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processPdf } from '@/app/actions';
import UploadView from '@/components/upload-view';
import MainView from '@/components/main-view';
import HomePage from '@/components/home-page';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHome, setShowHome] = useState(true);
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
    
    setIsProcessing(true);
    setShowHome(false);
    
    // Add timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      toast({
        title: "Processing Timeout",
        description: "PDF processing is taking longer than expected. Please try again.",
        variant: 'destructive'
      });
      setPdfFile(null);
      setPdfText(null);
      setPdfUrl(null);
      setIsProcessing(false);
      setShowHome(true);
    }, 60000); // 60 seconds timeout

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
        const result = await processPdf({ pdfDataUri: dataUri });

        clearTimeout(timeoutId); // Clear timeout
        
        if (result.error || !result.text) {
          toast({ title: "Error Processing PDF", description: result.error || "Could not extract text from PDF.", variant: 'destructive' });
          // Reset all states properly
          setPdfFile(null);
          setPdfText(null);
          setPdfUrl(null);
          setIsProcessing(false);
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
        toast({ title: "Error", description: "An unexpected error occurred while processing the PDF.", variant: 'destructive' });
        // Reset all states properly
        setPdfFile(null);
        setPdfText(null);
        setPdfUrl(null);
        setIsProcessing(false);
        setShowHome(true);
        URL.revokeObjectURL(newPdfUrl);
      }
    };

    fileReader.onerror = () => {
        clearTimeout(timeoutId); // Clear timeout
        toast({ title: "Error", description: "Failed to read the PDF file.", variant: 'destructive' });
        // Reset all states properly
        setPdfFile(null);
        setPdfText(null);
        setPdfUrl(null);
        setIsProcessing(false);
        setShowHome(true);
        URL.revokeObjectURL(newPdfUrl);
    };
  };

  const goToHome = () => {
    setPdfFile(null);
    setPdfText(null);
    setPdfUrl(null);
    setIsProcessing(false);
    setShowHome(true);
  };

  if (showHome) {
    return <HomePage onGetStarted={() => setShowHome(false)} />;
  }

  if (!pdfFile || !pdfText || !pdfUrl) {
    return <UploadView onUpload={handlePdfUpload} isProcessing={isProcessing} onGoHome={goToHome} />;
  }

  return <MainView pdfFile={pdfFile} pdfText={pdfText} pdfUrl={pdfUrl} stopProcessing={() => setIsProcessing(false)} onGoHome={goToHome} />;
}
