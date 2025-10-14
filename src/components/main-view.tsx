'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '../lib/types';
import { useToast } from '../hooks/use-toast';
import { askQuestion } from '../app/actions';
import PdfViewer from './pdf-viewer';
import ChatPanel from './chat-panel';
import { Button } from './ui/button';
import { FileText, MessageSquare, Home } from 'lucide-react';

interface MainViewProps {
  pdfFile: File;
  pdfText: string;
  pdfUrl: string;
  stopProcessing: () => void;
  onGoHome?: () => void;
}

export default function MainView({ pdfFile, pdfText, pdfUrl, stopProcessing, onGoHome }: MainViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Automatically analyze and summarize the document when uploaded
    const analyzeDocument = async () => {
      try {
                // Check if we have meaningful content to analyze
                if (!pdfText || pdfText.trim().length < 10) {
          setMessages([
            {
              role: 'assistant',
              content: `📄 **Document Uploaded Successfully**

**Document:** ${pdfFile.name}



*Please ask questions about the document, and I'll do my best to help based on the available information.*`,
              citations: []
            }
          ]);
          stopProcessing();
          return;
        }

                setIsAnswering(true);

        // Get document summary and key content (like NotebookLM)
        const analysisResult = await askQuestion({ 
          question: 'Summarize this document. Include main topics and key information.', 
          pdfContent: pdfText 
        });
        
        if (analysisResult.answer) {
          setMessages([
            {
              role: 'assistant',
              content: analysisResult.answer,
              citations: analysisResult.citations || []
            }
          ]);
        } else {
          setMessages([
            {
              role: 'assistant',
              content: `Document analysis failed. Please try uploading again.`,
              citations: []
            }
          ]);
        }
              } catch (error) {
        setMessages([
          {
            role: 'assistant',
            content: `Document processing error. Please try again.`,
            citations: []
          }
        ]);
      } finally {
        setIsAnswering(false);
        stopProcessing();
      }
    };

    // Start analysis after a short delay
    const timer = setTimeout(analyzeDocument, 1000);
    return () => clearTimeout(timer);
  }, [pdfFile.name, pdfText, stopProcessing]);

  const handleQuestionSubmit = async (question: string) => {
    if (isAnswering || !pdfText) return;

    setIsAnswering(true);
    const newMessages: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);

            try {
              const result = await askQuestion({ question, pdfContent: pdfText });
              if (result.error || !result.answer) {
        toast({ title: 'Error', description: result.error || "Failed to get an answer.", variant: 'destructive' });
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: result.error || "Failed to get an answer.", 
          citations: [] 
        }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: result.answer, citations: result.citations || [] }]);
      }
            } catch (e) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      // Add error message to chat instead of reverting
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, 
        citations: [] 
      }]);
    } finally {
      setIsAnswering(false);
    }
  };


  const handleCitationClick = async (page: string) => {
    if (pdfViewerRef.current) {
        const baseUrl = pdfUrl.split('#')[0];
        const newUrl = `${baseUrl}#page=${page}`;
        
        try {
          // Navigate to the page
          pdfViewerRef.current.src = newUrl;
          
          // Show immediate feedback
          toast({
            title: `Page ${page} Analysis`,
            description: `Analyzing content on page ${page}...`,
            duration: 3000,
          });
          
          // Generate AI response about the specific page
          setIsAnswering(true);
          const pageQuestion = `Tell me about the content on page ${page} of this document. What information is on this page?`;
          
          try {
            const result = await askQuestion({ question: pageQuestion, pdfContent: pdfText });
            
            if (result.error) {
              toast({ 
                title: 'Error', 
                description: result.error, 
                variant: 'destructive',
                duration: 5000 
              });
              // Add error message to chat
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Page ${page} analysis error: ${result.error}`, 
                citations: []
              }]);
            } else if (!result.answer) {
              toast({ 
                title: 'Error', 
                description: "No response received from AI.", 
                variant: 'destructive',
                duration: 5000 
              });
              // Add error message to chat
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, I couldn't get a response for page ${page}. Please try again.`, 
                citations: []
              }]);
            } else {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: result.answer || 'No response received', 
                citations: result.citations || []
              }]);
              toast({
                title: `Page ${page} Analysis Complete`,
                description: `AI has analyzed page ${page} content.`,
                duration: 2000,
              });
            }
          } catch (e) {
            toast({ 
              title: 'Error', 
              description: `Failed to get page information: ${e instanceof Error ? e.message : 'Unknown error'}`, 
              variant: 'destructive',
              duration: 5000 
            });
          } finally {
            setIsAnswering(false);
          }
        } catch (error) {
          toast({
            title: `Page ${page} Reference`,
            description: `This refers to page ${page} of the document. Please navigate manually in the PDF viewer.`,
            duration: 5000,
          });
        }
    } else {
      toast({
        title: `Page ${page} Reference`,
        description: `This refers to page ${page} of the document. Please check the PDF viewer on the left.`,
        duration: 5000,
      });
    }
  };

  return (
    <main className="flex flex-col xl:grid xl:grid-cols-2 h-screen w-full bg-background modern-scrollbar overflow-hidden max-h-screen">
      {/* Modern Mobile/Tablet Toggle Buttons */}
      <div className="mobile-tab-container block xl:hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 p-3 sm:p-4 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          {onGoHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoHome}
              className="rounded-xl bg-slate-700/50 hover:bg-slate-600/70 text-slate-200 hover:text-white transition-all duration-300 hover:scale-105 shadow-md border border-slate-600/30 backdrop-blur-sm relative overflow-hidden"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="font-medium">Home</span>
            </Button>
          )}
          
          <div className="flex-1 flex bg-slate-800/50 rounded-2xl p-1 shadow-inner border border-slate-700/50">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 rounded-xl transition-all duration-300 font-medium relative overflow-hidden ${
                !showPdfViewer 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setShowPdfViewer(false)}
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>Chat</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 rounded-xl transition-all duration-300 font-medium relative overflow-hidden ${
                showPdfViewer 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setShowPdfViewer(true)}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span>PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer - Hidden on mobile, visible on tablet+ */}
      <div className={`${showPdfViewer ? 'flex' : 'hidden'} xl:block relative`}>
        {/* Desktop Home Button */}
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
        <PdfViewer fileUrl={pdfUrl} ref={pdfViewerRef} />
      </div>
      
      {/* Chat Panel - Always visible, full width on mobile */}
      <div className={`${!showPdfViewer ? 'flex' : 'hidden'} xl:flex flex-1 xl:border-l border-border bg-background h-full max-h-screen`}>
        <div className="flex flex-col w-full h-full min-h-0">
          {/* Chat Header */}
          <div className="flex border-b border-border bg-muted/30 flex-shrink-0">
            <div className="flex-1 p-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat
              </h3>
              <p className="text-sm text-muted-foreground">Ask questions about your document</p>
            </div>
          </div>
          
          {/* Chat Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ChatPanel
              messages={messages}
              onSubmit={handleQuestionSubmit}
              onCitationClick={handleCitationClick}
              isAnswering={isAnswering}
              pdfFileName={pdfFile.name}
              pdfContent={pdfText}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
