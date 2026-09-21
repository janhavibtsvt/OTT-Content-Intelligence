import { jsPDF } from 'jspdf';
import { ContentRecord, ExecutiveKPIs } from '../types/content';
import { BusinessInsightItem } from '../components/common/InsightCard';
import { calculateTrendForecast, TrendForecastResult, calculateGenreAnalytics, calculateCountryAnalytics } from '../calculations/analytics';

export interface ReportDataPayload {
  records: ContentRecord[];
  insights: BusinessInsightItem[];
  kpis: ExecutiveKPIs;
  selectedCategory: string;
  forecastModel?: TrendForecastResult | null;
}

type RGB = [number, number, number];

/**
 * Escapes values for standard RFC 4180 CSV compatibility
 */
function escapeCSV(val: string | number | undefined | null): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates and downloads a comprehensive CSV report containing:
 * 1. Executive Summary KPIs
 * 2. Predictive Trend Analysis & Quality Forecast Data
 * 3. Categorized Business Insights (Finding, Impact, Recommendation)
 * 4. Genre & Geographic Breakdown Summary
 */
export function generateBusinessInsightsCSV(payload: ReportDataPayload, filename?: string) {
  const { records, insights, kpis, selectedCategory } = payload;
  const forecast = payload.forecastModel || calculateTrendForecast(records, 'All', 2000, 4);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const targetFilename = filename || `streamscope_business_insights_and_trend_forecast_${dateStr}.csv`;

  const rows: string[] = [];

  // Title & Metadata
  rows.push('"================================================================================"');
  rows.push('"STREAMSCOPE — OTT CONTENT INTELLIGENCE EXECUTIVE STRATEGY REPORT"');
  rows.push('"================================================================================"');
  rows.push(`"Report Generated",${escapeCSV(now.toLocaleString())}`);
  rows.push(`"Active Category Scope",${escapeCSV(selectedCategory)}`);
  rows.push(`"Catalog Records Sampled",${escapeCSV(records.length)}`);
  rows.push('""');

  // Section 1: Executive KPIs
  rows.push('"--- SECTION 1: EXECUTIVE OTT PORTFOLIO KPIS ---"');
  rows.push('"Metric","Value","Unit / Context"');
  rows.push(`"Total Catalog Titles",${escapeCSV(kpis.totalTitles)},"titles"`);
  rows.push(`"Feature Movies",${escapeCSV(kpis.totalMovies)},"${kpis.movieRatio}% of catalog"`);
  rows.push(`"TV Episodic Shows",${escapeCSV(kpis.totalTVShows)},"${kpis.tvRatio}% of catalog"`);
  rows.push(`"Mean Viewer Rating",${escapeCSV(kpis.avgViewerRating)},"stars (1-10)"`);
  rows.push(`"Average Release Year",${escapeCSV(kpis.avgReleaseYear)},"vintage"`);
  rows.push(`"Unique Producing Countries",${escapeCSV(kpis.uniqueCountries)},"global territories"`);
  rows.push(`"Estimated Portfolio Production Budget",${escapeCSV(`$${(kpis.totalSyntheticBudget / 1e9).toFixed(2)}B`)},"synthetic USD"`);
  rows.push(`"Estimated Portfolio Revenue",${escapeCSV(`$${(kpis.totalSyntheticRevenue / 1e9).toFixed(2)}B`)},"synthetic USD"`);
  rows.push(`"Portfolio Return on Investment (ROI)",${escapeCSV(`${kpis.syntheticROI}%`)},"weighted"`);
  rows.push('""');

  // Section 2: Predictive Trend Analysis & Forecast
  if (forecast) {
    rows.push('"--- SECTION 2: CONTENT PERFORMANCE & TREND FORECAST MODEL ---"');
    rows.push(`"Model Type",${escapeCSV('Ordinary Least Squares (OLS) Linear Regression')}`);
    rows.push(`"Sample Size",${escapeCSV(`${forecast.totalTitlesSampled} titles across historical vintages`)}`);
    rows.push(`"Model Fit (R-Squared)",${escapeCSV(`${(forecast.rSquared * 100).toFixed(2)}% (R²=${forecast.rSquared.toFixed(3)})`)}`);
    rows.push(`"Annual Quality Drift (Slope)",${escapeCSV(`${forecast.slope >= 0 ? '+' : ''}${forecast.slope.toFixed(4)} stars per year`)}`);
    rows.push(`"Target Forecast Year",${escapeCSV(forecast.targetForecastYear)}`);
    rows.push(`"Target Projected Rating",${escapeCSV(`${forecast.targetRating.toFixed(2)} stars (Range: ${forecast.targetLower.toFixed(2)} - ${forecast.targetUpper.toFixed(2)})`)}`);
    rows.push('""');

    rows.push('"Vintage Year","Data Point Type","Observed / Forecast Rating","Linear OLS Trendline","80% Confidence Lower","80% Confidence Upper","Sample Count"');
    
    // Historical points
    for (const hp of forecast.historicalPoints) {
      rows.push(`${hp.year},"Historical Actual",${hp.avgRating},${hp.trendLine},"N/A","N/A",${hp.count}`);
    }

    // Forecast points
    for (const fp of forecast.forecastPoints) {
      rows.push(`${fp.year},"Predictive Projection",${fp.forecastRating},${fp.forecastRating},${fp.lowerBound},${fp.upperBound},"Projected"`);
    }
    rows.push('""');
  }

  // Section 3: Strategic Business Insights (Finding, Impact, Recommendation)
  rows.push('"--- SECTION 3: STRATEGIC BUSINESS INTELLIGENCE INSIGHTS ---"');
  rows.push('"ID","Category","Title","Strategic Tag","Statistical Confidence","Finding","Business Impact","Actionable Recommendation"');

  for (const item of insights) {
    rows.push([
      escapeCSV(item.id),
      escapeCSV(item.category),
      escapeCSV(item.title),
      escapeCSV(item.tag),
      escapeCSV(item.confidence || 'Observational'),
      escapeCSV(item.finding),
      escapeCSV(item.impact),
      escapeCSV(item.recommendation),
    ].join(','));
  }
  rows.push('""');

  // Section 4: Genre & Regional Summary
  const genres = calculateGenreAnalytics(records).slice(0, 10);
  const countries = calculateCountryAnalytics(records).slice(0, 10);

  rows.push('"--- SECTION 4: TOP GENRES BY SHARE & QUALITY ---"');
  rows.push('"Genre","Title Count","Catalog Share Pct","Average Rating","Total Votes"');
  for (const g of genres) {
    rows.push(`${escapeCSV(g.genre)},${g.titles},${g.sharePct}%,${g.avgRating},${g.totalVotes}`);
  }
  rows.push('""');

  rows.push('"--- SECTION 5: TOP PRODUCTION TERRITORIES ---"');
  rows.push('"Country","Title Count","Catalog Share Pct","Average Rating"');
  for (const c of countries) {
    rows.push(`${escapeCSV(c.country)},${c.titles},${c.sharePct}%,${c.avgRating}`);
  }

  // Trigger Download
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', targetFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a beautifully formatted, multi-page executive PDF dossier
 * using jsPDF with vector-sharp typography, branded color palettes, and structured sections.
 */
export function generateBusinessInsightsPDF(payload: ReportDataPayload, filename?: string) {
  const { records, insights, kpis, selectedCategory } = payload;
  const forecast = payload.forecastModel || calculateTrendForecast(records, 'All', 2000, 4);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const targetFilename = filename || `streamscope_business_insights_report_${dateStr}.pdf`;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let currentY = 16;

  // Colors as strict 3-tuple numbers
  const darkNavy: RGB = [15, 23, 42]; // #0f172a
  const indigo: RGB = [79, 70, 229]; // #4f46e5
  const emerald: RGB = [5, 150, 105]; // #059669
  const textDark: RGB = [30, 41, 59]; // #1e293b
  const textMuted: RGB = [100, 116, 139]; // #64748b
  const cardBg: RGB = [248, 250, 252]; // #f8fafc
  const cardBorder: RGB = [226, 232, 240]; // #e2e8f0

  const drawPageDecorations = (pageNum: number) => {
    // Header rule & micro-branding
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, 11, pageWidth - marginX, 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(indigo[0], indigo[1], indigo[2]);
    doc.text('STREAMSCOPE', marginX, 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('•  OTT Content Intelligence & Trend Forecasting Dossier', marginX + 26, 9);

    // Footer
    doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Confidential • Prepared for Executive Programming & Strategy Review', marginX, pageHeight - 7);
    doc.text(`Page ${pageNum}`, pageWidth - marginX - 12, pageHeight - 7);
  };

  let pageNumber = 1;
  drawPageDecorations(pageNumber);

  // ----------------------------------------------------
  // HERO BANNER / HEADER BLOCK
  // ----------------------------------------------------
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(marginX, currentY, contentWidth, 34, 3, 3, 'F');

  // Accent line on left edge of banner
  doc.setFillColor(indigo[0], indigo[1], indigo[2]);
  doc.roundedRect(marginX, currentY, 3, 34, 1.5, 1.5, 'F');

  // Banner Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('StreamScope — Executive Content Intelligence', marginX + 8, currentY + 10);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Business Insights, Predictive Quality Forecasting & Strategic Decision Matrix', marginX + 8, currentY + 16);

  // Metadata Pill row inside banner
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const metadataText = `Date: ${now.toLocaleDateString()}  |  Scope: ${selectedCategory}  |  Sampled Titles: ${records.length.toLocaleString()}  |  Model: OLS Linear Extrapolation`;
  doc.text(metadataText, marginX + 8, currentY + 26);

  currentY += 40;

  // ----------------------------------------------------
  // SECTION 1: EXECUTIVE KPI SCORECARDS
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('1. Executive Portfolio Scorecard', marginX, currentY);
  currentY += 4;

  const cardW = (contentWidth - 9) / 4; // 4 cards across
  const cardH = 18;

  const kpiCards = [
    { label: 'CATALOG SIZE', val: `${kpis.totalTitles.toLocaleString()}`, sub: `${kpis.movieRatio}% Mov / ${kpis.tvRatio}% TV` },
    { label: 'MEAN RATING', val: `${kpis.avgViewerRating}★`, sub: `Vintage Avg: ${kpis.avgReleaseYear}` },
    {
      label: 'QUALITY DRIFT',
      val: `${forecast ? (forecast.slope >= 0 ? '+' : '') + (forecast.slope * 10).toFixed(2) + '★' : 'N/A'}`,
      sub: 'Projected per decade',
    },
    {
      label: `${forecast ? forecast.targetForecastYear : '2028'} FORECAST`,
      val: `${forecast ? forecast.targetRating.toFixed(2) + '★' : 'N/A'}`,
      sub: forecast ? `[${forecast.targetLower.toFixed(1)}–${forecast.targetUpper.toFixed(1)}★ band]` : '80% CI target',
    },
  ];

  kpiCards.forEach((c, idx) => {
    const x = marginX + idx * (cardW + 3);
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, currentY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(c.label, x + 3, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const color = idx === 2 ? emerald : idx === 3 ? indigo : darkNavy;
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(c.val, x + 3, currentY + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(c.sub, x + 3, currentY + 15.5);
  });

  currentY += cardH + 7;

  // ----------------------------------------------------
  // SECTION 2: PREDICTIVE QUALITY FORECAST TABLE & STATS
  // ----------------------------------------------------
  if (forecast) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('2. Historical Content Performance & Trendline Forecast', marginX, currentY);
    currentY += 4;

    // Model explanation banner
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, currentY, contentWidth, 11, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const modelSummary = `Ordinary Least Squares Regression Fit (R² = ${(forecast.rSquared * 100).toFixed(1)}%, Std Error = ${forecast.standardError.toFixed(2)}★). Target Quality Threshold for Year ${forecast.targetForecastYear} is projected at ${forecast.targetRating.toFixed(2)}★ with an 80% confidence interval band of ${forecast.targetLower.toFixed(2)}★ – ${forecast.targetUpper.toFixed(2)}★.`;
    const wrappedSummary = doc.splitTextToSize(modelSummary, contentWidth - 6);
    doc.text(wrappedSummary, marginX + 3, currentY + 4.5);

    currentY += 14;

    // Trend Forecast Data Table Header
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(marginX, currentY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);

    const colX = {
      year: marginX + 3,
      type: marginX + 22,
      obsRating: marginX + 62,
      trend: marginX + 97,
      interval: marginX + 132,
      count: marginX + 165,
    };

    doc.text('VINTAGE', colX.year, currentY + 4.2);
    doc.text('DATA STATUS', colX.type, currentY + 4.2);
    doc.text('AVG RATING', colX.obsRating, currentY + 4.2);
    doc.text('OLS TRENDLINE', colX.trend, currentY + 4.2);
    doc.text('80% CONFIDENCE BAND', colX.interval, currentY + 4.2);
    doc.text('SAMPLE', colX.count, currentY + 4.2);

    currentY += 6;

    // Render Recent Historical + All Forecast Points
    const recentHistorical = forecast.historicalPoints.slice(-5);
    const tableRows = [
      ...recentHistorical.map((h) => ({
        year: `${h.year}`,
        type: 'Historical Actual',
        rating: `${h.avgRating.toFixed(2)}★`,
        trend: `${h.trendLine.toFixed(2)}★`,
        ci: 'Observed Baseline',
        count: `${h.count} titles`,
        isForecast: false,
      })),
      ...forecast.forecastPoints.map((f) => ({
        year: `${f.year}`,
        type: 'Predictive Projection',
        rating: `${f.forecastRating.toFixed(2)}★`,
        trend: `${f.forecastRating.toFixed(2)}★`,
        ci: `${f.lowerBound.toFixed(2)}★ – ${f.upperBound.toFixed(2)}★`,
        count: 'Extrapolated',
        isForecast: true,
      })),
    ];

    tableRows.forEach((r, idx) => {
      const isAlt = idx % 2 === 1;
      const isForecast = r.isForecast;

      if (isForecast) {
        doc.setFillColor(236, 253, 245); // light emerald
      } else if (isAlt) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }

      doc.rect(marginX, currentY, contentWidth, 5.2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(marginX, currentY + 5.2, marginX + contentWidth, currentY + 5.2);

      doc.setFont('helvetica', isForecast ? 'bold' : 'normal');
      doc.setFontSize(7);
      const rowColor = isForecast ? emerald : textDark;
      doc.setTextColor(rowColor[0], rowColor[1], rowColor[2]);

      doc.text(r.year, colX.year, currentY + 3.7);
      doc.text(r.type, colX.type, currentY + 3.7);
      doc.text(r.rating, colX.obsRating, currentY + 3.7);
      doc.text(r.trend, colX.trend, currentY + 3.7);
      doc.text(r.ci, colX.interval, currentY + 3.7);
      doc.text(r.count, colX.count, currentY + 3.7);

      currentY += 5.2;
    });

    currentY += 7;
  }

  // ----------------------------------------------------
  // SECTION 3: STRATEGIC BUSINESS INSIGHTS (FINDINGS / IMPACTS / RECOMMENDATIONS)
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('3. Strategic Business Intelligence & Commissioning Insights', marginX, currentY);
  currentY += 5;

  const renderInsightBox = (item: BusinessInsightItem) => {
    // Advance to new page if remaining vertical space is tight
    const estimatedHeight = 36;
    if (currentY + estimatedHeight > pageHeight - 16) {
      doc.addPage();
      pageNumber += 1;
      drawPageDecorations(pageNumber);
      currentY = 16;
    }

    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);

    // Box Container
    doc.roundedRect(marginX, currentY, contentWidth, 32, 2, 2, 'FD');

    // Accent line
    doc.setFillColor(indigo[0], indigo[1], indigo[2]);
    doc.rect(marginX, currentY + 2, 1.8, 8, 'F');

    // Category + Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    const titleLine = `[${item.category.toUpperCase()}] ${item.title}`;
    const truncatedTitle = doc.splitTextToSize(titleLine, contentWidth - 48);
    doc.text(truncatedTitle[0] || titleLine, marginX + 4, currentY + 5);

    // Tag and Confidence Badges
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(indigo[0], indigo[1], indigo[2]);
    doc.text(`${item.tag} • ${item.confidence || 'Observational'}`, pageWidth - marginX - 44, currentY + 5);

    let innerY = currentY + 10;

    // Finding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text('FINDING:', marginX + 4, innerY);
    doc.setFont('helvetica', 'normal');
    const findingWrapped = doc.splitTextToSize(item.finding, contentWidth - 28);
    doc.text(findingWrapped.slice(0, 2), marginX + 22, innerY);
    innerY += (Math.min(findingWrapped.length, 2) * 3.3) + 1.2;

    // Impact
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // amber
    doc.text('IMPACT:', marginX + 4, innerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const impactWrapped = doc.splitTextToSize(item.impact, contentWidth - 28);
    doc.text(impactWrapped.slice(0, 2), marginX + 22, innerY);
    innerY += (Math.min(impactWrapped.length, 2) * 3.3) + 1.2;

    // Recommendation
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text('ACTION:', marginX + 4, innerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const recWrapped = doc.splitTextToSize(item.recommendation, contentWidth - 28);
    doc.text(recWrapped.slice(0, 2), marginX + 22, innerY);

    currentY += 35;
  };

  // Render insights
  insights.forEach((item) => {
    renderInsightBox(item);
  });

  // Save the document
  doc.save(targetFilename);
}
