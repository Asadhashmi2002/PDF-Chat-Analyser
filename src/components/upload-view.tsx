'use client';

import { useState, useEffect, type FormEvent, type DragEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, FileUp, CheckCircle2, Bot, ScanText, BrainCircuit, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UploadViewProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

const processingSteps = [
  { text: 'Analyzing document structure...', icon: ScanText },
  { text: 'Extracting content and visuals...', icon: Sparkles },
  { text: 'Building semantic understanding...', icon: BrainCircuit },
  { text: 'Finalizing...', icon: Bot },
];

export default function UploadView({ onUpload, isProcessing }: UploadViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setCurrentStep(0); // Reset on new upload
      interval = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep < processingSteps.length - 1) {
            return prevStep + 1;
          }
          clearInterval(interval);
          return prevStep;
        });
      }, 2000); // Change step every 2 seconds
    }
    return () => clearInterval(interval);
  }, [isProcessing]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid PDF file.",
          variant: 'destructive'
        });
        setFile(null);
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please drop a valid PDF file.",
          variant: 'destructive'
        });
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (file) {
      onUpload(file);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-50">
              PDF Chat Navigator
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Your personal AI assistant for PDF documents.
            </p>
        </div>
        <Card className="shadow-lg border-none bg-white dark:bg-gray-950/50 backdrop-blur-sm transition-all duration-500">
          <CardContent className="p-8">
            {isProcessing ? (
               <div className="flex flex-col items-center justify-center h-64 space-y-6">
                <div className="relative">
                    <Bot className="w-16 h-16 text-primary animate-pulse" />
                    <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-ping" />
                </div>
                 <div className="w-full max-w-sm">
                    <div className="flex justify-between mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                      <span>{processingSteps[currentStep].text}</span>
                      <span>{Math.round(((currentStep + 1) / processingSteps.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}></div>
                    </div>
                 </div>
               </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out",
                    isDragging ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50",
                    {"bg-primary/5 dark:bg-primary/10": file}
                  )}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!file ? (
                    <div className="text-center">
                      <FileUp className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF only (max. 50MB)</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                       <CheckCircle2 className="mx-auto w-12 h-12 text-green-500 mb-3" />
                       <p className="font-semibold text-gray-700 dark:text-gray-200">{file.name}</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round(file.size / 1024)} KB</p>
                    </div>
                  )}
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={!file}>
                    Start Chatting
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
