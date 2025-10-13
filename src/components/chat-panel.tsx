'use client';

import { type FormEvent, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowUp, Bot, User, FileText, Bookmark, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface ChatPanelProps {
  messages: Message[];
  onSubmit: (question: string) => void;
  onCitationClick: (page: string) => void;
  isAnswering: boolean;
  pdfFileName: string;
}

export default function ChatPanel({
  messages,
  onSubmit,
  onCitationClick,
  isAnswering,
  pdfFileName,
}: ChatPanelProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isAnswering]);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (input?.value) {
      onSubmit(input.value);
      input.value = '';
      input.style.height = 'auto';
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b shrink-0 bg-secondary/50">
        <FileText className="w-5 h-5 mr-3 text-primary" />
        <h2 className="text-lg font-semibold truncate" title={pdfFileName}>
          {pdfFileName}
        </h2>
      </header>
      
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-6 space-y-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-9 h-9 shrink-0 border-2 border-primary/50">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[85%] p-4 rounded-xl',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary rounded-bl-none'
                )}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.citations.map((citation, i) => (
                      <Button
                        key={i}
                        variant="default"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs bg-primary/20 text-primary-foreground hover:bg-primary/30"
                        onClick={() => onCitationClick(citation)}
                      >
                        <Bookmark className="w-3 h-3 mr-1.5" />
                        Page {citation}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isAnswering && (
            <div className="flex items-start gap-4 justify-start">
              <Avatar className="w-9 h-9 shrink-0 border-2 border-primary/50">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Sparkles className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              <div className="bg-secondary p-4 rounded-xl rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <footer className="p-4 border-t shrink-0 bg-secondary/50">
        <form ref={formRef} onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={inputRef}
            placeholder="Ask a question..."
            className="pr-12 min-h-[48px] max-h-[200px] resize-none bg-background"
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
            disabled={isAnswering}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary hover:bg-primary/90"
            disabled={isAnswering}
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}