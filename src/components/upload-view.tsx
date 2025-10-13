'use client';

import { useState, type FormEvent, type DragEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadViewProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadView({ onUpload, isProcessing }: UploadViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
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
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">PDF Chat Navigator</CardTitle>
          <CardDescription className="pt-2">
            Upload a PDF document to start a conversation with your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200",
                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              )}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileUp className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF files up to 50MB</p>
              <Input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            {file && !isProcessing && (
              <div className="text-center text-sm text-muted-foreground">
                Selected file: <span className="font-medium text-foreground">{file.name}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!file || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Chat'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
