import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WeatherBriefingPdfGenerator } from '@/lib/weather/pdf-generator';

interface MarkdownSection {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'table' | 'list' | 'hr' | 'checkbox';
  content: string;
  data?: any;
}

/**
 * Professional Deep Briefing PDF Generator
 * Extends WeatherBriefingPdfGenerator with full markdown parsing
 */
export class DeepBriefingPdfGenerator extends WeatherBriefingPdfGenerator {
  /**
   * Generate PDF from markdown briefing
   */
  async generateFromMarkdown(
    markdown: string,
    metadata: {
      route: string;
      date: string;
      flightNumber?: string;
      aircraft?: string;
    }
  ): Promise<Blob> {
    // Reset state
    this.currentY = 15;
    
    // Parse markdown into sections
    const sections = this.parseMarkdown(markdown);
    
    // Generate professional PDF
    this.addBriefingHeader(metadata);
    this.renderSections(sections);
    this.addBriefingFooter(metadata);
    
    return this.doc.output('blob');
  }

  /**
   * Parse markdown into structured sections
   */
  private parseMarkdown(markdown: string): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    const lines = markdown.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // H1 Header
      if (line.startsWith('# ')) {
        sections.push({
          type: 'h1',
          content: line.replace(/^# /, '').replace(/\*\*/g, '')
        });
        i++;
      }
      // H2 Header
      else if (line.startsWith('## ')) {
        sections.push({
          type: 'h2',
          content: line.replace(/^## /, '')
        });
        i++;
      }
      // H3 Header
      else if (line.startsWith('### ')) {
        sections.push({
          type: 'h3',
          content: line.replace(/^### /, '')
        });
        i++;
      }
      // Horizontal rule
      else if (line === '---') {
        sections.push({ type: 'hr', content: '' });
        i++;
      }
      // Table
      else if (line.startsWith('|')) {
        const { tableData, nextIndex } = this.parseTable(lines, i);
        sections.push({
          type: 'table',
          content: '',
          data: tableData
        });
        i = nextIndex;
      }
      // List item (but not checkbox)
      else if (line.startsWith('- ') && !line.startsWith('- [')) {
        const { items, nextIndex } = this.parseList(lines, i);
        sections.push({
          type: 'list',
          content: '',
          data: items
        });
        i = nextIndex;
      }
      // Checkbox
      else if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
        const { items, nextIndex } = this.parseCheckboxList(lines, i);
        sections.push({
          type: 'checkbox',
          content: '',
          data: items
        });
        i = nextIndex;
      }
      // Paragraph
      else if (line.length > 0) {
        let paragraph = line;
        i++;
        // Collect multi-line paragraphs
        while (i < lines.length && lines[i].trim().length > 0 && 
               !lines[i].startsWith('#') && !lines[i].startsWith('|') && 
               !lines[i].startsWith('-')) {
          paragraph += ' ' + lines[i].trim();
          i++;
        }
        sections.push({
          type: 'p',
          content: this.cleanMarkdown(paragraph)
        });
      }
      else {
        i++;
      }
    }
    
    return sections;
  }

  /**
   * Clean markdown formatting from text
   */
  private cleanMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/`(.*?)`/g, '$1')       // Code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
  }

  /**
   * Parse markdown table
   */
  private parseTable(lines: string[], startIndex: number): {
    tableData: { headers: string[]; rows: string[][] };
    nextIndex: number;
  } {
    const headers: string[] = [];
    const rows: string[][] = [];
    
    // Header row
    const headerLine = lines[startIndex].split('|').filter(s => s.trim());
    headers.push(...headerLine.map(h => h.trim()));
    
    // Skip separator line (|----|-----|)
    let i = startIndex + 2;
    
    // Data rows
    while (i < lines.length && lines[i].trim().startsWith('|')) {
      const cells = lines[i].split('|').filter(s => s.trim());
      rows.push(cells.map(c => this.cleanMarkdown(c.trim())));
      i++;
    }
    
    return { tableData: { headers, rows }, nextIndex: i };
  }

  /**
   * Parse markdown list
   */
  private parseList(lines: string[], startIndex: number): {
    items: string[];
    nextIndex: number;
  } {
    const items: string[] = [];
    let i = startIndex;
    
    while (i < lines.length && lines[i].trim().startsWith('- ') && 
           !lines[i].trim().startsWith('- [')) {
      items.push(this.cleanMarkdown(lines[i].trim().replace(/^- /, '')));
      i++;
    }
    
    return { items, nextIndex: i };
  }

  /**
   * Parse checkbox list
   */
  private parseCheckboxList(lines: string[], startIndex: number): {
    items: Array<{ checked: boolean; text: string }>;
    nextIndex: number;
  } {
    const items: Array<{ checked: boolean; text: string }> = [];
    let i = startIndex;
    
    while (i < lines.length && (lines[i].includes('- [ ]') || lines[i].includes('- [x]'))) {
      const checked = lines[i].includes('[x]');
      const text = lines[i].replace(/^- \[[ x]\] /, '').trim();
      items.push({ checked, text: this.cleanMarkdown(text) });
      i++;
    }
    
    return { items, nextIndex: i };
  }

  /**
   * Render sections to PDF
   */
  private renderSections(sections: MarkdownSection[]): void {
    sections.forEach(section => {
      switch (section.type) {
        case 'h1':
          this.addH1(section.content);
          break;
        case 'h2':
          this.addH2(section.content);
          break;
        case 'h3':
          this.addH3(section.content);
          break;
        case 'p':
          this.addParagraph(section.content);
          break;
        case 'table':
          this.addTable(section.data);
          break;
        case 'list':
          this.addList(section.data);
          break;
        case 'checkbox':
          this.addCheckboxList(section.data);
          break;
        case 'hr':
          this.addHorizontalRule();
          break;
      }
    });
  }

  // Typography methods with aviation aesthetic
  private addH1(text: string): void {
    this.checkPageBreak(15);
    this.doc.setFontSize(this.fontSize.title);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addH2(text: string): void {
    this.checkPageBreak(12);
    this.doc.setFontSize(this.fontSize.header);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 6;
  }

  private addH3(text: string): void {
    this.checkPageBreak(10);
    this.doc.setFontSize(this.fontSize.subheader);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.text);
    this.doc.text(text, this.margin + 2, this.currentY);
    this.currentY += 5;
  }

  private addParagraph(text: string): void {
    this.checkPageBreak(8);
    this.doc.setFontSize(this.fontSize.body);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - (this.margin * 2));
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += (lines.length * 4) + 2;
  }

  private addTable(tableData: { headers: string[]; rows: string[][] }): void {
    this.checkPageBreak(20);
    
    autoTable(this.doc, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.secondary,
        textColor: [255, 255, 255],
        fontSize: this.fontSize.subheader,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: this.fontSize.body,
        cellPadding: 2
      }
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 4;
  }

  private addList(items: string[]): void {
    items.forEach(item => {
      this.checkPageBreak(6);
      this.doc.setFontSize(this.fontSize.body);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.text);
      
      // Bullet
      this.doc.text('•', this.margin + 2, this.currentY);
      
      // Text
      const lines = this.doc.splitTextToSize(item, this.pageWidth - (this.margin * 2) - 6);
      this.doc.text(lines, this.margin + 6, this.currentY);
      this.currentY += (lines.length * 4) + 1;
    });
    this.currentY += 2;
  }

  private addCheckboxList(items: Array<{ checked: boolean; text: string }>): void {
    items.forEach(item => {
      this.checkPageBreak(6);
      this.doc.setFontSize(this.fontSize.body);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.text);
      
      // Checkbox
      const boxSize = 3;
      this.doc.setDrawColor(...this.colors.border);
      this.doc.rect(this.margin + 2, this.currentY - 2.5, boxSize, boxSize);
      
      if (item.checked) {
        this.doc.setDrawColor(...this.colors.primary);
        this.doc.setLineWidth(0.5);
        this.doc.line(
          this.margin + 2.5, this.currentY - 0.5,
          this.margin + 3.5, this.currentY + 0.5
        );
        this.doc.line(
          this.margin + 3.5, this.currentY + 0.5,
          this.margin + 5.5, this.currentY - 1.5
        );
      }
      
      // Text
      const lines = this.doc.splitTextToSize(item.text, this.pageWidth - (this.margin * 2) - 10);
      this.doc.text(lines, this.margin + 8, this.currentY);
      this.currentY += (lines.length * 4) + 1;
    });
    this.currentY += 2;
  }

  private addHorizontalRule(): void {
    this.checkPageBreak(5);
    this.doc.setDrawColor(...this.colors.border);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 4;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = 15;
    }
  }

  private addBriefingHeader(metadata: {
    route: string;
    date: string;
    flightNumber?: string;
    aircraft?: string;
  }): void {
    // Navy header background
    this.doc.setFillColor(30, 58, 138); // Navy blue
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FLIGHT OPERATIONS BRIEFING', this.pageWidth / 2, 12, { align: 'center' });
    
    // Route and details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const subtitle = metadata.flightNumber 
      ? `${metadata.flightNumber} | ${metadata.route}`
      : metadata.route;
    this.doc.text(subtitle, this.pageWidth / 2, 18, { align: 'center' });
    
    // Date and aircraft
    this.doc.setFontSize(8);
    const details = [
      new Date(metadata.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      metadata.aircraft
    ].filter(Boolean).join(' | ');
    this.doc.text(details, this.pageWidth / 2, 24, { align: 'center' });
    
    this.currentY = 35;
    this.doc.setTextColor(...this.colors.text);
  }

  private addBriefingFooter(metadata: any): void {
    const pageCount = (this.doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      const footerY = this.pageHeight - 10;
      
      // Footer line
      this.doc.setDrawColor(189, 195, 199);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, footerY - 3, this.pageWidth - this.margin, footerY - 3);
      
      // Footer text
      this.doc.setTextColor(128, 128, 128);
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      
      // Left: System info
      this.doc.text(
        'FlightOps Briefing System | For planning purposes only',
        this.margin,
        footerY
      );
      
      // Right: Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        footerY,
        { align: 'right' }
      );
    }
  }
}
