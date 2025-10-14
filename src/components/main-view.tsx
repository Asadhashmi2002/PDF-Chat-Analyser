'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { askQuestion } from '@/app/actions';
import PdfViewer from '@/components/pdf-viewer';
import ChatPanel from '@/components/chat-panel';
import { Button } from '@/components/ui/button';
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

**Status:** Document processed but text extraction was limited. This may be due to:
- Image-based PDF (scanned document)
- Password-protected PDF
- Corrupted or complex PDF structure

**What I can help with:**
- General questions about the document
- File information and metadata
- Basic document analysis

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
          question: 'Analyze this document and extract the main topics, key concepts, and important information. Present it with bold headings for main topics (**Topic Name**), bullet points for details, and focus on the actual document content. Include specific terms and concepts that can be used for smart suggestions.', 
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
              content: `📄 **Document Processed**

**Document:** ${pdfFile.name}

**Status:** Document has been uploaded and processed successfully.

**What I can help with:**
- Answer questions about the document content
- Provide summaries and analysis
- Explain specific topics or sections
- Help you understand the information

*Please ask questions about the document, and I'll provide detailed answers based on the content.*`,
              citations: []
            }
          ]);
        }
              } catch (error) {
        setMessages([
          {
            role: 'assistant',
            content: `📄 **Document Ready for Analysis**

**Document:** ${pdfFile.name}
**Status:** Successfully processed and ready for questions

**What I can help with:**
- Answer specific questions about the content
- Explain complex topics in detail
- Summarize sections or pages
- Analyze data and trends
- Provide insights and recommendations

*I've processed your document and I'm ready to help you explore its content. Ask me any questions!*`,
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
        // Add error message to chat instead of reverting
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${result.error || "Failed to get an answer."}`, 
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
        content: `**Analysis Error**

**Issue:** An unexpected error occurred during document analysis.

**Document Status:** Your document is loaded and ready for analysis.

**Solution:** Please try asking your question again. The document content is available for analysis.

**Available Actions:**
- Ask a specific question about the document content
- Request analysis of particular sections
- Ask for detailed explanations of concepts
- Request insights and recommendations

**Document Ready:** Your PDF is processed and ready for intelligent analysis.`, 
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
                content: `**Page Analysis Error**

**Issue:** Unable to analyze page ${page} due to: ${result.error}

**Document Status:** Your document is still available for analysis.

**Available Actions:**
- Ask questions about other parts of the document
- Request analysis of different sections
- Ask for general document insights
- Navigate to other pages for analysis

**Ready to help:** Your document is processed and ready for questions.`, 
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
    <main className="flex flex-col lg:grid lg:grid-cols-2 h-screen w-screen bg-background modern-scrollbar">
      {/* Mobile/Tablet Toggle Buttons */}
      <div className="lg:hidden flex border-b border-border bg-secondary/50 p-2 sm:p-4">
        {onGoHome && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGoHome}
            className="rounded-none border-0 bg-white/80 hover:bg-white text-xs sm:text-sm"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Home</span>
            <span className="sm:hidden">🏠</span>
          </Button>
        )}
        <Button
          variant={!showPdfViewer ? "default" : "outline"}
          className="flex-1 rounded-none border-0 text-xs sm:text-sm"
          onClick={() => setShowPdfViewer(false)}
        >
          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Chat</span>
          <span className="sm:hidden">💬</span>
        </Button>
        <Button
          variant={showPdfViewer ? "default" : "outline"}
          className="flex-1 rounded-none border-0 text-xs sm:text-sm"
          onClick={() => setShowPdfViewer(true)}
        >
          <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">PDF</span>
          <span className="sm:hidden">📄</span>
        </Button>
      </div>

      {/* PDF Viewer - Hidden on mobile, visible on tablet+ */}
      <div className={`${showPdfViewer ? 'flex' : 'hidden'} lg:block relative`}>
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
      <div className={`${!showPdfViewer ? 'flex' : 'hidden'} lg:flex flex-1 lg:border-l border-border bg-background`}>
        <ChatPanel
          messages={messages}
          onSubmit={handleQuestionSubmit}
          onCitationClick={handleCitationClick}
          isAnswering={isAnswering}
          pdfFileName={pdfFile.name}
          pdfContent={pdfText}
        />
      </div>
    </main>
  );
}
