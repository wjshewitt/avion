import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DecodedMetar, DecodedTaf, StationData } from '@/types/checkwx';
import type { WeatherConcern } from '@/lib/weather/weatherConcerns';

interface AirportWeatherData {
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  station?: StationData;
}

interface FlightInfo {
  flightNumber?: string;
  route?: string;
  departureIcao?: string;
  arrivalIcao?: string;
}

interface BriefingData {
  departureData: AirportWeatherData;
  arrivalData: AirportWeatherData;
  concerns: WeatherConcern[];
  flightInfo: FlightInfo;
  briefingTime: string;
}

/**
 * Professional Weather Briefing PDF Generator
 * Optimized for 1-2 page output with clean, readable layout
 */
export class WeatherBriefingPdfGenerator {
  protected doc: jsPDF;
  protected pageWidth: number;
  protected pageHeight: number;
  protected margin: number = 12;
  protected currentY: number = 15;
  protected fontSize: {
    title: number;
    header: number;
    subheader: number;
    body: number;
    small: number;
  };
  protected colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    border: [number, number, number];
    lightGray: [number, number, number];
    text: [number, number, number];
  };

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter' // US Letter for better compatibility
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();

    this.fontSize = {
      title: 16,
      header: 11,
      subheader: 9,
      body: 8,
      small: 7
    };

    this.colors = {
      primary: [41, 128, 185],
      secondary: [52, 73, 94],
      border: [189, 195, 199],
      lightGray: [236, 240, 241],
      text: [44, 62, 80]
    };
  }

  async generateBriefing(data: BriefingData): Promise<Blob> {
    // Reset for new generation
    this.currentY = 15;

    // Set document properties
    this.doc.setProperties({
      title: `Weather Briefing - ${data.flightInfo.flightNumber || data.flightInfo.route || 'Flight'}`,
      subject: 'Aviation Weather Briefing',
      author: 'Flight Operations',
      keywords: 'weather, aviation, metar, taf, briefing',
      creator: 'FlightOps Weather System'
    });

    // Generate compact content
    this.addCompactHeader(data);
    this.addExecutiveSummary(data);
    this.addConcernsSummary(data);
    this.addAirportComparison(data);
    this.addCompactFooter(data);

    // Return the PDF as blob
    return this.doc.output('blob');
  }

  /**
   * Add compact header with flight info
   */
  private addCompactHeader(data: BriefingData): void {
    // Header background
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(0, 0, this.pageWidth, 25, 'F');

    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(this.fontSize.title);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PRE-FLIGHT WEATHER BRIEFING', this.pageWidth / 2, 10, { align: 'center' });

    // Flight info line
    this.doc.setFontSize(this.fontSize.body);
    this.doc.setFont('helvetica', 'normal');
    const route = data.flightInfo.route || `${data.flightInfo.departureIcao} → ${data.flightInfo.arrivalIcao}`;
    const flightInfo = data.flightInfo.flightNumber ? `${data.flightInfo.flightNumber}  |  ${route}` : route;
    this.doc.text(flightInfo, this.pageWidth / 2, 16, { align: 'center' });

    // Briefing time
    this.doc.setFontSize(this.fontSize.small);
    const timeStr = new Date(data.briefingTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    this.doc.text(`Briefing Time: ${timeStr}`, this.pageWidth / 2, 21, { align: 'center' });

    this.currentY = 30;
    this.doc.setTextColor(...this.colors.text);
  }

  /**
   * Add executive summary with status indicators
   */
  private addExecutiveSummary(data: BriefingData): void {
    const depMetar = data.departureData.metar;
    const arrMetar = data.arrivalData.metar;

    // Calculate overall status
    const hasExtreme = data.concerns.some(c => c.severity === 'extreme');
    const hasHigh = data.concerns.some(c => c.severity === 'high');
    const status = hasExtreme ? '✗ NOT RECOMMENDED' : hasHigh ? '⚠ CAUTION' : '✓ ACCEPTABLE';
    const statusColor: [number, number, number] = hasExtreme ? [231, 76, 60] : hasHigh ? [243, 156, 18] : [46, 204, 113];

    // Status box
    this.doc.setFillColor(...statusColor);
    this.doc.setDrawColor(...statusColor);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 12, 2, 2, 'FD');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(this.fontSize.header);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FLIGHT STATUS:', this.margin + 3, this.currentY + 5);
    this.doc.text(status, this.pageWidth - this.margin - 3, this.currentY + 5, { align: 'right' });

    this.doc.setFontSize(this.fontSize.small);
    this.doc.setFont('helvetica', 'normal');
    const concernCount = `${data.concerns.length} weather concern${data.concerns.length !== 1 ? 's' : ''} identified`;
    this.doc.text(concernCount, this.margin + 3, this.currentY + 9.5);

    this.currentY += 16;
    this.doc.setTextColor(...this.colors.text);

    // Quick comparison table
    const comparisonData = [
      [
        data.flightInfo.departureIcao?.toUpperCase() || 'DEP',
        depMetar?.flight_category || 'N/A',
        depMetar?.wind ? `${depMetar.wind.speed_kts || 0}kt` : 'N/A',
        depMetar?.visibility?.miles_float !== undefined ? `${depMetar.visibility.miles_float}SM` : 'N/A',
        depMetar?.temperature?.celsius !== undefined ? `${Math.round(depMetar.temperature.celsius)}°C` : 'N/A'
      ],
      [
        data.flightInfo.arrivalIcao?.toUpperCase() || 'ARR',
        arrMetar?.flight_category || 'N/A',
        arrMetar?.wind ? `${arrMetar.wind.speed_kts || 0}kt` : 'N/A',
        arrMetar?.visibility?.miles_float !== undefined ? `${arrMetar.visibility.miles_float}SM` : 'N/A',
        arrMetar?.temperature?.celsius !== undefined ? `${Math.round(arrMetar.temperature.celsius)}°C` : 'N/A'
      ]
    ];

    autoTable(this.doc, {
      head: [['Airport', 'Category', 'Wind', 'Visibility', 'Temp']],
      body: comparisonData,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      theme: 'grid',
      headStyles: {
        fillColor: [...this.colors.secondary],
        textColor: [255, 255, 255],
        fontSize: this.fontSize.subheader,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: this.fontSize.body,
        cellPadding: 2,
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 4;
  }

  /**
   * Add weather concerns summary
   */
  private addConcernsSummary(data: BriefingData): void {
    if (data.concerns.length === 0) {
      this.doc.setFillColor(...this.colors.lightGray);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 10, 1, 1, 'F');
      
      this.doc.setFontSize(this.fontSize.body);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text('✓ No significant weather concerns identified', this.margin + 3, this.currentY + 6);
      
      this.currentY += 12;
      return;
    }

    // Section header
    this.doc.setFontSize(this.fontSize.header);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('WEATHER CONCERNS', this.margin, this.currentY);
    this.currentY += 5;

    // Group by severity
    const extreme = data.concerns.filter(c => c.severity === 'extreme');
    const high = data.concerns.filter(c => c.severity === 'high');
    const moderate = data.concerns.filter(c => c.severity === 'moderate');

    const sortedConcerns = [...extreme, ...high, ...moderate].slice(0, 8); // Limit to 8 most critical

    sortedConcerns.forEach((concern, index) => {
      const icon = concern.severity === 'extreme' ? '✗' : concern.severity === 'high' ? '⚠' : '●';
      const bgColor: [number, number, number] = 
        concern.severity === 'extreme' ? [255, 235, 235] : 
        concern.severity === 'high' ? [255, 247, 230] : 
        [240, 240, 240];

      // Concern box
      this.doc.setFillColor(...bgColor);
      this.doc.setDrawColor(...this.colors.border);
      this.doc.setLineWidth(0.2);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 11, 1, 1, 'FD');

      // Icon and severity
      this.doc.setFontSize(this.fontSize.body);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${icon} ${concern.severity.toUpperCase()}`, this.margin + 2, this.currentY + 4);

      // Airport
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(this.fontSize.small);
      this.doc.text(concern.airport, this.margin + 35, this.currentY + 4);

      // Description
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(this.fontSize.body);
      const descLines = this.doc.splitTextToSize(concern.description, this.pageWidth - (this.margin * 2) - 4);
      this.doc.text(descLines[0], this.margin + 2, this.currentY + 8);

      this.currentY += 12;

      // Page break if needed
      if (this.currentY > this.pageHeight - 50 && index < sortedConcerns.length - 1) {
        this.doc.addPage();
        this.currentY = 15;
      }
    });

    if (data.concerns.length > 8) {
      this.doc.setFontSize(this.fontSize.small);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`+ ${data.concerns.length - 8} additional concern(s) - see full briefing`, this.margin, this.currentY);
      this.currentY += 5;
    }

    this.currentY += 2;
  }

  /**
   * Add side-by-side airport details
   */
  private addAirportComparison(data: BriefingData): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = 15;
    }

    // Section header
    this.doc.setFontSize(this.fontSize.header);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DETAILED CONDITIONS', this.margin, this.currentY);
    this.currentY += 5;

    const colWidth = (this.pageWidth - (this.margin * 2) - 3) / 2;

    // Departure column
    this.drawAirportDetails(
      data.departureData,
      data.flightInfo.departureIcao || 'DEP',
      'DEPARTURE',
      this.margin,
      colWidth
    );

    // Arrival column
    this.drawAirportDetails(
      data.arrivalData,
      data.flightInfo.arrivalIcao || 'ARR',
      'ARRIVAL',
      this.margin + colWidth + 3,
      colWidth
    );
  }

  /**
   * Draw airport details in a column
   */
  private drawAirportDetails(
    data: AirportWeatherData,
    icao: string,
    label: string,
    x: number,
    width: number
  ): void {
    const startY = this.currentY;
    let y = startY;

    // Header
    this.doc.setFillColor(...this.colors.lightGray);
    this.doc.rect(x, y, width, 8, 'F');
    
    this.doc.setFontSize(this.fontSize.subheader);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${label}  (${icao.toUpperCase()})`, x + 2, y + 5);

    y += 10;

    const metar = data.metar;
    if (!metar) {
      this.doc.setFontSize(this.fontSize.small);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text('No current weather data', x + 2, y);
      return;
    }

    // Current conditions
    this.doc.setFontSize(this.fontSize.small);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('METAR:', x + 2, y);
    y += 4;

    const items = [
      ['Category:', metar.flight_category || 'N/A'],
      ['Wind:', metar.wind ? `${metar.wind.degrees || 'VRB'}° @ ${metar.wind.speed_kts || 0}kt${metar.wind.gust_kts ? ` G${metar.wind.gust_kts}` : ''}` : 'Calm'],
      ['Visibility:', metar.visibility?.miles_float !== undefined ? `${metar.visibility.miles_float} SM` : 'N/A'],
      ['Ceiling:', metar.clouds && metar.clouds.length > 0 ? `${metar.clouds[0].code} ${metar.clouds[0].feet || 'N/A'}ft` : 'Clear'],
      ['Temp/Dew:', metar.temperature?.celsius !== undefined && metar.dewpoint?.celsius !== undefined ? `${Math.round(metar.temperature.celsius)}°/${Math.round(metar.dewpoint.celsius)}°C` : 'N/A'],
      ['Altimeter:', metar.barometer?.hg !== undefined ? `${metar.barometer.hg.toFixed(2)}"` : 'N/A']
    ];

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(this.fontSize.body);

    items.forEach(([key, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(key, x + 2, y);
      this.doc.setFont('helvetica', 'normal');
      const valueLines = this.doc.splitTextToSize(value, width - 25);
      this.doc.text(valueLines, x + 20, y);
      y += 4;
    });

    // Raw METAR
    if (metar.raw_text) {
      y += 2;
      this.doc.setFontSize(this.fontSize.small);
      this.doc.setFont('courier', 'normal');
      const rawLines = this.doc.splitTextToSize(metar.raw_text, width - 4);
      this.doc.text(rawLines.slice(0, 3), x + 2, y); // Limit to 3 lines
    }

    // Update currentY to the maximum of both columns
    if (x === this.margin) {
      this.currentY = y + 4;
    } else {
      this.currentY = Math.max(this.currentY, y + 4);
    }
  }

  /**
   * Add compact footer
   */
  private addCompactFooter(data: BriefingData): void {
    const pageCount = (this.doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      const footerY = this.pageHeight - 10;

      // Footer line
      this.doc.setDrawColor(...this.colors.border);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, footerY - 3, this.pageWidth - this.margin, footerY - 3);

      // Footer text
      this.doc.setTextColor(128, 128, 128);
      this.doc.setFontSize(this.fontSize.small);
      this.doc.setFont('helvetica', 'normal');

      this.doc.text(
        'FlightOps Weather System  |  For planning purposes only',
        this.margin,
        footerY
      );

      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth - this.margin,
        footerY,
        { align: 'right' }
      );
    }
  }

}

export default WeatherBriefingPdfGenerator;