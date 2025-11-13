'use client';

import { useEffect, useState, useRef } from 'react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { cn } from '@/lib/utils';

interface TypewriterMessageProps {
  content: string;
  speed?: number; // characters per second
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
}

export function TypewriterMessage({
  content,
  speed = 50,
  onComplete,
  className,
  showCursor = true,
}: TypewriterMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setDisplayedContent('');
    setIsComplete(false);
    indexRef.current = 0;

    const delay = 1000 / speed;

    intervalRef.current = setInterval(() => {
      if (indexRef.current < content.length) {
        setDisplayedContent(content.slice(0, indexRef.current + 1));
        indexRef.current += 1;
      } else {
        setIsComplete(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onComplete?.();
      }
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content, speed, onComplete]);

  return (
    <div className={cn('relative', className)}>
      <div className="inline">
        <MarkdownRenderer>{displayedContent}</MarkdownRenderer>
        {!isComplete && showCursor && (
          <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// Smooth streaming component (more natural than typewriter)
interface StreamingMessageProps {
  chunks: string[];
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export function StreamingMessage({
  chunks,
  delay = 50,
  onComplete,
  className,
}: StreamingMessageProps) {
  const [displayedChunks, setDisplayedChunks] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayedChunks >= chunks.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedChunks(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [displayedChunks, chunks.length, delay, onComplete]);

  const content = chunks.slice(0, displayedChunks).join('');

  return (
    <div className={cn('relative', className)}>
      <div className="inline">
        <MarkdownRenderer>{content}</MarkdownRenderer>
        {!isComplete && (
          <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// Word-by-word animation (more dramatic)
export function WordByWordMessage({
  content,
  wordsPerSecond = 10,
  onComplete,
  className,
}: {
  content: string;
  wordsPerSecond?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const words = content.split(' ');
  const [displayedWords, setDisplayedWords] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayedWords >= words.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const delay = 1000 / wordsPerSecond;
    const timeout = setTimeout(() => {
      setDisplayedWords(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [displayedWords, words.length, wordsPerSecond, onComplete]);

  return (
    <div className={cn('relative', className)}>
      <div className="text-sm text-foreground leading-relaxed">
        {words.slice(0, displayedWords).map((word, index) => (
          <span
            key={index}
            className="inline animate-in fade-in duration-200"
          >
            {word}{' '}
          </span>
        ))}
        {!isComplete && (
          <span className="inline-block w-1.5 h-4 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}
