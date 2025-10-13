'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { askQuestion } from '@/app/actions';
import PdfViewer from '@/components/pdf-viewer';
import ChatPanel from '@/components/chat-panel';

interface MainViewProps {
  pdfFile: File;
  pdfText: string;
  pdfDataUri: string;
  stopProcessing: () => void;
}

export default function MainView({ pdfFile, pdfText, pdfDataUri, stopProcessing }: MainViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Add initial message after a short delay for better UX
    const timer = setTimeout(() => {
        setMessages([
            {
                role: 'assistant',
                content: `I've finished processing "${pdfFile.name}". Ask me anything about its content.`,
            },
        ]);
        stopProcessing();
    }, 500);

    return () => {
        clearTimeout(timer);
    };
  }, [pdfFile.name, stopProcessing]);

  const handleQuestionSubmit = async (question: string) => {
    if (isAnswering || !pdfText) return;

    setIsAnswering(true);
    const newMessages: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);

    try {
      const result = await askQuestion({ question, pdfContent: pdfText });
      if (result.error || !result.answer) {
        toast({ title: 'Error', description: result.error || "Failed to get an answer.", variant: 'destructive' });
        setMessages(newMessages); // Revert to messages before AI error
      } else {
        setMessages([...newMessages, { role: 'assistant', content: result.answer, citations: result.citations }]);
      }
    } catch (e) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      setMessages(newMessages);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCitationClick = (page: string) => {
    if (pdfViewerRef.current) {
        const baseUrl = pdfDataUri.split('#')[0];
        const newUrl = `${baseUrl}#page=${page}`;
        // The URL needs to be re-assigned to trigger navigation in the iframe
        pdfViewerRef.current.src = newUrl;
        toast({
            title: `Navigating to Page ${page}`,
            description: 'The PDF viewer has been updated.',
        });
    }
  };

  return (
    <main className="flex h-screen w-screen bg-neutral-100 dark:bg-neutral-900">
      <div className="flex-1">
        <PdfViewer fileUrl={pdfDataUri} ref={pdfViewerRef} />
      </div>
      <div className="w-full md:w-[45%] md:max-w-[650px] lg:w-[35%] lg:max-w-[550px] border-l border-border bg-background shadow-lg">
        <ChatPanel
          messages={messages}
          onSubmit={handleQuestionSubmit}
          onCitationClick={handleCitationClick}
          isAnswering={isAnswering}
          pdfFileName={pdfFile.name}
        />
      </div>
    </main>
  );
}
