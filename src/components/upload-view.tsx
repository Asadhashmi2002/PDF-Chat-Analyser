'use client';

import { useState, type FormEvent, type DragEvent, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, FileUp, CheckCircle2, Bot, ScanText, BrainCircuit, Sparkles, ArrowRight, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/use-toast';

interface UploadViewProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
  onGoHome?: () => void;
}

const processingSteps = [
  { text: 'Analyzing document structure...', icon: ScanText },
  { text: 'Extracting content and visuals...', icon: Sparkles },
  { text: 'Building semantic understanding...', icon: BrainCircuit },
  { text: 'Preparing the interactive session...', icon: Bot },
];

export default function UploadView({ onUpload, isProcessing, onGoHome }: UploadViewProps) {
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
      }, 1500); // Faster step change
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
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]"></div>
      
      {/* Home Button */}
      {onGoHome && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onGoHome}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      )}
      
      <div className="w-full max-w-2xl px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-gray-200 to-gray-500">
              PDF Chat Navigator
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-400 max-w-xl mx-auto">
              Unlock the knowledge within your documents. Upload a PDF and start an intelligent conversation.
            </p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-blue-500/10 rounded-2xl">
          <CardContent className="p-4 sm:p-8">
            {isProcessing ? (
               <div className="flex flex-col items-center justify-center h-48 sm:h-64 space-y-4 sm:space-y-6 transition-all duration-500">
                <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Bot className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400 animate-pulse" />
                    </div>
                </div>
                 <div className="w-full max-w-md text-center">
                    <div className="h-5 sm:h-6 overflow-hidden">
                        {processingSteps.map((step, index) => (
                           <div key={step.text} className={cn("transition-transform duration-500 ease-in-out", currentStep === index ? 'translate-y-0' : '-translate-y-full')}>
                             {currentStep === index && <p className="text-sm sm:text-lg text-gray-300 flex items-center justify-center gap-2"><step.icon className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> {step.text}</p>}
                           </div>
                        ))}
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 sm:h-1.5 mt-3 sm:mt-4">
                      <div className="bg-blue-500 h-1 sm:h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}></div>
                    </div>
                 </div>
               </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out",
                    isDragging ? "border-blue-400 bg-blue-500/10 scale-105" : "border-white/10 hover:border-blue-400/50",
                    {"bg-blue-500/5 border-blue-400": file}
                  )}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {!file ? (
                    <div className="text-center transition-opacity duration-300">
                      <FileUp className="mx-auto w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mb-2 sm:mb-3" />
                      <p className="text-sm sm:text-base text-gray-400">
                        <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF only (max. 50MB)</p>
                    </div>
                  ) : (
                    <div className="text-center p-3 sm:p-4 transition-opacity duration-300">
                       <CheckCircle2 className="mx-auto w-8 h-8 sm:w-12 sm:h-12 text-green-400 mb-2 sm:mb-3" />
                       <p className="font-semibold text-gray-200 text-sm sm:text-base">{file.name}</p>
                       <p className="text-xs sm:text-sm text-gray-400">{Math.round(file.size / 1024)} KB</p>
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

                <Button type="submit" size="lg" className="w-full text-sm sm:text-base font-semibold group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100" disabled={!file || isProcessing}>
                    Start Chatting
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <footer className="text-center mt-6 sm:mt-10">
          <p className="text-gray-500 text-xs sm:text-sm">Powered by AI Analysis</p>
        </footer>
      </div>
    </main>
  );
}
