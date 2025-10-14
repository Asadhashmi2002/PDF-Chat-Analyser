'use client';

import { type FormEvent, useRef, useEffect, useMemo, useState } from 'react';
import type { Message } from '../lib/types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, ArrowUp, Bot, User, FileText, Bookmark, Sparkles, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';

interface ChatPanelProps {
  messages: Message[];
  onSubmit: (question: string) => void;
  onCitationClick: (page: string) => void;
  isAnswering: boolean;
  pdfFileName: string;
  pdfContent?: string; // Add PDF content to detect document type
}

export default function ChatPanel({
  messages,
  onSubmit,
  onCitationClick,
  isAnswering,
  pdfFileName,
  pdfContent,
}: ChatPanelProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    // Auto-scroll to bottom when messages change or when answering
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current;
        
        // Smooth scroll with better timing
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    // Scroll with delay for better UX
    const timeout1 = setTimeout(scrollToBottom, 100);
    const timeout2 = setTimeout(scrollToBottom, 300);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [messages, isAnswering]);

  // Add scroll detection to show/hide scroll button
  useEffect(() => {
    const scrollElement = scrollAreaRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setShowScrollButton(!isAtBottom && messages.length > 2);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    
    // Check initial position
    handleScroll();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [messages.length]);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (input?.value) {
      onSubmit(input.value);
      input.value = '';
      input.style.height = 'auto';
      
      // Force scroll to bottom after submitting with better timing
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 150);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      
      // Hide button immediately when clicking
      setShowScrollButton(false);
      
      // Smooth scroll with delay for better UX
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth',
      });
      
      // Add a subtle delay for better visual feedback
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 200);
    }
  };

  // Generate dynamic suggestions based on actual document content analysis
  const generateDynamicSuggestions = useMemo(() => {
    // Only show suggestions if we have messages (document has been analyzed)
    if (!pdfContent || messages.length === 0) return [];
    
    const content = pdfContent.toLowerCase();
    const suggestions = [];
    
    // Extract key topics and concepts from the document
    const keyTopics = [];
    
    // Look for bold headings and key terms
    const boldMatches = content.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches) {
      keyTopics.push(...boldMatches.map(match => match.replace(/\*\*/g, '').trim()));
    }
    
    // More accurate document pattern detection
    const hasResumeContent = (content.includes('resume') || content.includes('cv')) && 
                           (content.includes('experience') || content.includes('education') || 
                            content.includes('skills') || content.includes('objective'));
    
    const hasChartData = (content.includes('chart') || content.includes('graph')) && 
                        (content.includes('data') || content.includes('percentage') ||
                         content.includes('statistics') || content.includes('quarterly'));
    
    const hasFinancialContent = content.includes('financial') && 
                               (content.includes('budget') || content.includes('profit') ||
                                content.includes('expense') || content.includes('revenue'));
    
    const hasTechnicalContent = content.includes('technical') && 
                               (content.includes('specification') || content.includes('manual') ||
                                content.includes('api') || content.includes('programming'));
    
    const hasAcademicContent = (content.includes('research') || content.includes('study')) && 
                              (content.includes('thesis') || content.includes('paper') ||
                               content.includes('abstract') || content.includes('methodology'));
    
    
    // Generate document-specific suggestions based on actual content
    if (hasResumeContent) {
      suggestions.push(
        { text: 'What is the ATS score of this resume?', label: '📋 ATS Score' },
        { text: 'Analyze the strengths and weaknesses of this resume', label: '💪 Strengths/Weaknesses' },
        { text: 'What improvements can be made to this resume?', label: '💡 Improvements' },
        { text: 'Summarize the key qualifications and experience', label: '📄 Key Qualifications' }
      );
    }
    
    if (hasChartData) {
      suggestions.push(
        { text: 'Explain this chart in detail', label: '📊 Chart Analysis' },
        { text: 'What does this data show?', label: '📈 Data Insights' },
        { text: 'Analyze the trends in this data', label: '📉 Trend Analysis' },
        { text: 'What are the key findings from this data?', label: '🔍 Key Findings' }
      );
    }
    
    if (hasFinancialContent) {
      suggestions.push(
        { text: 'Analyze the financial performance', label: '💰 Financial Analysis' },
        { text: 'What are the key financial metrics?', label: '📊 Key Metrics' },
        { text: 'Explain the budget breakdown', label: '📈 Budget Analysis' },
        { text: 'What are the financial trends?', label: '📉 Financial Trends' }
      );
    }
    
    if (hasTechnicalContent) {
      suggestions.push(
        { text: 'Explain this technical document', label: '🔧 Technical Analysis' },
        { text: 'What are the main technical points?', label: '📚 Key Points' },
        { text: 'How to use this guide?', label: '💡 Usage Guide' },
        { text: 'What are the technical specifications?', label: '⚙️ Specifications' }
      );
    }
    
    if (hasAcademicContent) {
      suggestions.push(
        { text: 'What is the main research question?', label: '🔬 Research Question' },
        { text: 'What are the key findings?', label: '📊 Key Findings' },
        { text: 'What methodology was used?', label: '🧪 Methodology' },
        { text: 'What are the conclusions?', label: '📝 Conclusions' }
      );
    }
    
    // Add suggestions based on key topics found in the document
    if (keyTopics.length > 0) {
      keyTopics.slice(0, 3).forEach(topic => {
        suggestions.push({
          text: `Explain ${topic} in detail`,
          label: `📖 ${topic.substring(0, 15)}${topic.length > 15 ? '...' : ''}`
        });
      });
    }
    
    // Only add general suggestions if no specific document type was detected
    if (suggestions.length === 0) {
      suggestions.push(
        { text: 'Summarize the main points of this document', label: '📝 Summary' },
        { text: 'What are the key insights from this document?', label: '💡 Key Insights' },
        { text: 'Explain the most important concepts', label: '📚 Main Concepts' }
      );
    }
    
    // Remove duplicates and limit to 6 suggestions for better focus
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );
    
    return uniqueSuggestions.slice(0, 6);
  }, [pdfContent, messages]);


  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-3 sm:p-4 border-b shrink-0 bg-secondary/50">
        <div className="flex items-center min-w-0 flex-1">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-primary flex-shrink-0" />
          <h2 className="text-sm sm:text-lg font-semibold truncate" title={pdfFileName}>
            {pdfFileName}
          </h2>
        </div>
        {pdfContent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
            <span className="hidden sm:inline">📄 {Math.ceil(pdfContent.length / 1000)}k chars</span>
            <span className="hidden sm:inline">•</span>
            <span>🤖 AI Ready</span>
          </div>
        )}
      </header>
      
      <div className="flex-1 relative overflow-y-auto chat-scrollbar modern-scrollbar" ref={scrollAreaRef}>
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-2 sm:gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 border-2 border-primary/50">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Sparkles className="w-3 h-3 sm:w-5 sm:h-5" style={{
                      animation: 'sparkle 3s ease-in-out infinite, sparkle-glow 2s ease-in-out infinite'
                    }} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 rounded-xl text-sm sm:text-base',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary rounded-bl-none'
                )}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
                    {message.citations.map((citation, i) => (
                      <Button
                        key={i}
                        variant="default"
                        size="sm"
                        className="h-auto px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-primary/20 text-primary-foreground hover:bg-primary/30 transition-all duration-200 hover:scale-105 active:scale-95"
                        onClick={() => {
                          onCitationClick(citation);
                          // Add visual feedback
                          const button = document.activeElement as HTMLElement;
                          if (button) {
                            button.style.transform = 'scale(0.95)';
                            setTimeout(() => {
                              button.style.transform = '';
                            }, 150);
                          }
                        }}
                        title={`Click to navigate to page ${citation} in the PDF viewer`}
                      >
                        <Bookmark className="w-2 h-2 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                        <span className="text-xs">Page {citation}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="w-7 h-7 sm:w-9 sm:h-9 shrink-0">
                  <AvatarFallback>
                    <User className="w-3 h-3 sm:w-5 sm:h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isAnswering && (
            <div className="flex items-start gap-2 sm:gap-4 justify-start">
              <Avatar className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 border-2 border-primary/50">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Sparkles className="w-3 h-3 sm:w-5 sm:h-5" style={{
                      animation: 'sparkle 3s ease-in-out infinite, sparkle-glow 2s ease-in-out infinite'
                    }} />
                  </AvatarFallback>
                </Avatar>
              <div className="bg-secondary p-3 sm:p-4 rounded-xl rounded-bl-none">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
        
        {/* Floating scroll to bottom button - only show when not at bottom */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="fixed bottom-20 right-4 z-50 h-9 w-9 bg-secondary/90 hover:bg-secondary border border-border/50 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-2 fade-in-0"
            title="Scroll to bottom"
          >
            <ChevronDown className="h-4 w-4 text-foreground transition-transform duration-200" />
          </Button>
        )}
      </div>
      
      <footer className="p-2 sm:p-4 border-t shrink-0 bg-secondary/50">

        {/* Dynamic Content-Based Suggestions - Only show after analysis */}
        {generateDynamicSuggestions.length > 0 && (
          <div className="mb-2 sm:mb-3">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                Smart suggestions based on your document:
              </span>
              <span className="text-xs text-muted-foreground font-medium sm:hidden">
                Suggestions:
              </span>
              {generateDynamicSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-6 sm:h-7 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.value = suggestion.text;
                      inputRef.current.focus();
                      // Add visual feedback
                      const button = document.activeElement as HTMLElement;
                      if (button) {
                        button.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                          button.style.transform = '';
                        }, 150);
                      }
                    }
                  }}
                  title={`Click to ask: ${suggestion.text}`}
                >
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <form ref={formRef} onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={inputRef}
            placeholder="Ask a question..."
            className="pr-10 sm:pr-12 min-h-[40px] sm:min-h-[48px] max-h-[150px] sm:max-h-[200px] resize-none bg-background text-sm sm:text-base"
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
            disabled={isAnswering}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-primary hover:bg-primary/90"
            disabled={isAnswering}
            aria-label="Send message"
          >
            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}