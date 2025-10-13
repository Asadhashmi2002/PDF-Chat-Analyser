'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processPdf } from '@/app/actions';
import UploadView from '@/components/upload-view';
import MainView from '@/components/main-view';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
    // The AI flow requires a data URI
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = async () => {
      try {
        const dataUri = fileReader.result as string;
        const result = await processPdf({ pdfDataUri: dataUri });

        if (result.error || !result.text) {
          toast({ title: "Error Processing PDF", description: result.error || "Could not extract text from PDF.", variant: 'destructive' });
          setIsProcessing(false);
        } else {
          setPdfText(result.text);
          setPdfFile(file);
          setPdfDataUri(dataUri);
          // isProcessing will be set to false inside MainView after the PDF is rendered
        }
      } catch (e) {
        toast({ title: "Error", description: "An unexpected error occurred while processing the PDF.", variant: 'destructive' });
        setIsProcessing(false);
      }
    };

    fileReader.onerror = () => {
        toast({ title: "Error", description: "Failed to read the PDF file.", variant: 'destructive' });
        setIsProcessing(false);
    };
  };

  if (!pdfFile || !pdfText || !pdfDataUri) {
    return <UploadView onUpload={handlePdfUpload} isProcessing={isProcessing} />;
  }

  return <MainView pdfFile={pdfFile} pdfText={pdfText} pdfDataUri={pdfDataUri} stopProcessing={() => setIsProcessing(false)} />;
}
