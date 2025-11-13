'use client';

import React, { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanTrigger,
  PlanContent,
  PlanFooter,
  PlanAction,
} from '@/components/ui/plan';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { DeepBriefingPdfGenerator } from '@/lib/briefing/deep-briefing-pdf-generator';

interface BriefingRendererProps {
  content: string;
}

/**
 * Extract title from briefing markdown
 */
function extractTitle(markdown: string): string {
  const titleMatch = markdown.match(/# FLIGHT OPERATIONS BRIEFING\n\*\*(.+?)\*\*/);
  return titleMatch ? titleMatch[1] : 'Flight Operations Briefing';
}

/**
 * Extract route from briefing markdown
 */
function extractRoute(markdown: string): string {
  const routeMatch = markdown.match(/\| Route \| (.+?) \|/);
  return routeMatch ? routeMatch[1] : '';
}

/**
 * Extract flight number from briefing markdown
 */
function extractFlightNumber(markdown: string): string | undefined {
  // Check title line for flight number pattern
  const titleMatch = markdown.match(/\*\*([A-Z0-9]{2,3}\s?[0-9]{1,4})\s*\|/);
  return titleMatch ? titleMatch[1] : undefined;
}

/**
 * Extract aircraft type from briefing markdown
 */
function extractAircraft(markdown: string): string | undefined {
  const aircraftMatch = markdown.match(/\| Aircraft \| (.+?) \|/);
  return aircraftMatch ? aircraftMatch[1] : undefined;
}

/**
 * Estimate read time based on word count
 */
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200); // Average reading speed
  return `${minutes} min`;
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Render deep briefing document in collapsible Plan UI
 */
export function BriefingRenderer({ content }: BriefingRendererProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const title = extractTitle(content);
  const route = extractRoute(content);
  const readTime = estimateReadTime(content);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
      console.error('Copy error:', error);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const generator = new DeepBriefingPdfGenerator();
      const blob = await generator.generateFromMarkdown(content, {
        route: route || 'Flight Briefing',
        date: new Date().toISOString(),
        flightNumber: extractFlightNumber(content),
        aircraft: extractAircraft(content),
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `briefing-${route.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.pdf`;
      downloadBlob(blob, filename);
      toast.success('PDF briefing downloaded');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <Plan defaultOpen={false} isStreaming={false}>
        <PlanHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <PlanTitle>{title}</PlanTitle>
              <PlanDescription>
                Comprehensive document generated with deep analysis {route && `• ${route}`}
              </PlanDescription>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <PlanAction onClick={handleCopyMarkdown} title="Copy markdown">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </PlanAction>
              <PlanAction 
                onClick={handleDownloadPDF} 
                disabled={downloading}
                title="Download briefing"
              >
                <Download className="h-4 w-4" />
              </PlanAction>
            </div>
          </div>
          <PlanTrigger />
        </PlanHeader>

        <PlanContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer>{content}</MarkdownRenderer>
          </div>
        </PlanContent>

        <PlanFooter>
          <div className="text-xs text-muted-foreground">
            Generated with extended thinking • {readTime} read
          </div>
          <div className="text-xs text-muted-foreground">
            {copied ? 'Copied!' : 'Click actions above to copy or download'}
          </div>
        </PlanFooter>
      </Plan>
    </div>
  );
}
