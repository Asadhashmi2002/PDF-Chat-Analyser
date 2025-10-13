'use client';

import { useState, type FormEvent, type DragEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, FileUp, CheckCircle2, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UploadViewProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadView({ onUpload, isProcessing }: UploadViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

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
    setIsDragging(true);
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

  const removeFile = () => {
    setFile(null);
  }

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
        <Card className="shadow-lg border-none bg-white dark:bg-gray-950/50 backdrop-blur-sm">
          <CardContent className="p-8">
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
                     <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" onClick={removeFile}>
                       <X className="w-5 h-5" />
                     </Button>
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

              <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={!file || isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  'Start Chatting'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
