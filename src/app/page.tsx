'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processPdf } from '@/app/actions';
import UploadView from '@/components/upload-view';
import MainView from '@/components/main-view';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

        if (result.error || !result.text) {
          toast({ title: "Error Processing PDF", description: result.error || "Could not extract text from PDF.", variant: 'destructive' });
          setIsProcessing(false);
          URL.revokeObjectURL(newPdfUrl);
        } else {
          setPdfText(result.text);
          setPdfFile(file);
          setPdfUrl(newPdfUrl);
          // isProcessing will be set to false inside MainView after the PDF is rendered
        }
      } catch (e) {
        toast({ title: "Error", description: "An unexpected error occurred while processing the PDF.", variant: 'destructive' });
        setIsProcessing(false);
        URL.revokeObjectURL(newPdfUrl);
      }
    };

    fileReader.onerror = () => {
        toast({ title: "Error", description: "Failed to read the PDF file.", variant: 'destructive' });
        setIsProcessing(false);
        URL.revokeObjectURL(newPdfUrl);
    };
  };

  if (!pdfFile || !pdfText || !pdfUrl) {
    return <UploadView onUpload={handlePdfUpload} isProcessing={isProcessing} />;
  }

  return <MainView pdfFile={pdfFile} pdfText={pdfText} pdfUrl={pdfUrl} stopProcessing={() => setIsProcessing(false)} />;
}
