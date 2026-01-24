// Commercial PDF Generator
// ONE stunning page: Headline, Side-by-side scenarios, Chart, Waterfall, Quote, Closing line

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { UnifiedResults } from '@/types/scenarios';
import { ScenarioComparison } from '@/types/commercialModel';
import { 
  generateAllScenarios, 
  generateWaterfall,
  formatCommercialCurrency,
  getProofPoint 
} from '@/utils/commercialCalculations';
import type { LeadData } from '@/types';

// Initialize pdfmake fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// Brand colors (matching design system)
const COLORS = {
  primary: '#0066CC',
  success: '#22c55e',
  warning: '#f97316',
  destructive: '#ef4444',
  muted: '#64748b',
  dark: '#0F172A',
  light: '#f1f5f9',
  white: '#ffffff',
};

// PDF Styles
const styles: Record<string, any> = {
  headline: {
    fontSize: 20,
    bold: true,
    color: COLORS.dark,
    alignment: 'center',
    margin: [0, 0, 0, 8],
  },
  subheadline: {
    fontSize: 10,
    color: COLORS.muted,
    alignment: 'center',
    margin: [0, 0, 0, 20],
  },
  sectionTitle: {
    fontSize: 11,
    bold: true,
    color: COLORS.dark,
    margin: [0, 16, 0, 8],
  },
  scenarioTitle: {
    fontSize: 10,
    bold: true,
    color: COLORS.dark,
    margin: [0, 0, 0, 4],
  },
  metricLabel: {
    fontSize: 7,
    color: COLORS.muted,
  },
  metricValue: {
    fontSize: 12,
    bold: true,
    color: COLORS.dark,
  },
  metricValueSuccess: {
    fontSize: 12,
    bold: true,
    color: COLORS.success,
  },
  metricValueWarning: {
    fontSize: 12,
    bold: true,
    color: COLORS.warning,
  },
  metricValueDanger: {
    fontSize: 12,
    bold: true,
    color: COLORS.destructive,
  },
  quote: {
    fontSize: 9,
    italics: true,
    color: COLORS.dark,
    margin: [20, 8, 20, 4],
  },
  quoteAttribution: {
    fontSize: 8,
    color: COLORS.muted,
    margin: [20, 0, 20, 0],
  },
  closingLine: {
    fontSize: 9,
    bold: true,
    italics: true,
    color: COLORS.dark,
    alignment: 'center',
    margin: [0, 16, 0, 0],
  },
  footer: {
    fontSize: 7,
    color: COLORS.muted,
    alignment: 'center',
  },
  tableHeader: {
    fontSize: 8,
    bold: true,
    color: COLORS.white,
    fillColor: COLORS.primary,
    alignment: 'center',
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.dark,
    alignment: 'center',
  },
  tableCellSuccess: {
    fontSize: 8,
    bold: true,
    color: COLORS.success,
    alignment: 'center',
  },
  tableCellDanger: {
    fontSize: 8,
    bold: true,
    color: COLORS.destructive,
    alignment: 'center',
  },
};

/**
 * Generate the one-page commercial PDF
 */
export const generateCommercialPDF = async (
  results: UnifiedResults,
  leadData?: LeadData
): Promise<void> => {
  // Generate all scenarios
  const scenarios = generateAllScenarios(results);
  const proofPoint = getProofPoint();
  
  // Build the document
  const docDefinition: any = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 40, 40, 40],
    
    content: [
      // Headline
      {
        text: 'Incremental Revenue vs Commercial Alignment',
        style: 'headline',
      },
      {
        text: `Prepared for ${leadData?.company || 'Vox Media'} • ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        style: 'subheadline',
      },
      
      // Revenue Isolation Bar
      buildRevenueIsolationBar(scenarios[0]),
      
      // Three Scenario Comparison Table
      {
        text: 'COMMERCIAL ALIGNMENT MODELS',
        style: 'sectionTitle',
        alignment: 'center',
      },
      buildScenarioComparisonTable(scenarios),
      
      // Value Flow Waterfall (compact)
      {
        columns: scenarios.map(scenario => ({
          width: '*',
          stack: buildCompactWaterfall(scenario),
        })),
        columnGap: 10,
        margin: [0, 12, 0, 12],
      },
      
      // Proof Point
      buildProofPointSection(proofPoint),
      
      // Closing Line
      {
        text: '"Flat and capped models optimise for vendor risk. Revenue share optimises for publisher growth."',
        style: 'closingLine',
      },
    ],
    
    footer: () => ({
      columns: [
        {
          text: 'AdFixus × Vox Media • Commercial Scenario Analysis',
          style: 'footer',
          alignment: 'left',
          margin: [40, 0, 0, 0],
        },
        {
          text: 'CONFIDENTIAL • Modeled projections only',
          style: 'footer',
          alignment: 'right',
          margin: [0, 0, 40, 0],
        },
      ],
    }),
    
    styles,
  };
  
  // Generate and download
  const fileName = `AdFixus-Commercial-Analysis-${leadData?.company || 'Vox'}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
};

/**
 * Build the revenue isolation bar
 */
function buildRevenueIsolationBar(scenario: ScenarioComparison): any {
  const total = scenario.baseRevenue + scenario.incrementalRevenue;
  const basePercent = Math.round((scenario.baseRevenue / total) * 100);
  const incrementalPercent = 100 - basePercent;
  
  return {
    margin: [0, 0, 0, 12],
    stack: [
      {
        canvas: [
          // Base revenue (gray)
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: (basePercent / 100) * 680,
            h: 24,
            color: COLORS.light,
          },
          // Incremental revenue (green)
          {
            type: 'rect',
            x: (basePercent / 100) * 680,
            y: 0,
            w: (incrementalPercent / 100) * 680,
            h: 24,
            color: COLORS.success,
          },
        ],
      },
      {
        columns: [
          {
            text: `Base Revenue: ${formatCommercialCurrency(scenario.baseRevenue)} (Untouched)`,
            fontSize: 7,
            color: COLORS.muted,
            width: '*',
          },
          {
            text: `Incremental Revenue: ${formatCommercialCurrency(scenario.incrementalRevenue)} (Net-new)`,
            fontSize: 7,
            color: COLORS.success,
            bold: true,
            alignment: 'right',
            width: '*',
          },
        ],
        margin: [0, 4, 0, 0],
      },
      {
        text: 'Alignment model applies ONLY to incremental revenue. Base revenue remains untouched.',
        fontSize: 7,
        color: COLORS.muted,
        italics: true,
        alignment: 'center',
        margin: [0, 4, 0, 0],
      },
    ],
  };
}

/**
 * Build the scenario comparison table
 */
function buildScenarioComparisonTable(scenarios: ScenarioComparison[]): any {
  const tableBody = [
    // Header row
    [
      { text: 'Metric', style: 'tableHeader' },
      ...scenarios.map(s => ({
        text: s.model.isRecommended ? `${s.model.label} ✓` : s.model.label,
        style: 'tableHeader',
        fillColor: s.model.isRecommended ? COLORS.success : 
                   s.model.type === 'flat-fee' ? COLORS.destructive : COLORS.warning,
      })),
    ],
    // Incremental Revenue
    [
      { text: 'Incremental Revenue (36mo)', style: 'tableCell' },
      ...scenarios.map(s => ({
        text: formatCommercialCurrency(s.incrementalRevenue),
        style: 'tableCell',
      })),
    ],
    // Publisher Keeps
    [
      { text: 'Publisher Keeps', style: 'tableCell' },
      ...scenarios.map(s => ({
        text: formatCommercialCurrency(s.publisherNetGain),
        style: s.model.isRecommended ? 'tableCellSuccess' : 'tableCell',
      })),
    ],
    // Share of Upside
    [
      { text: 'Share of Upside (AdFixus)', style: 'tableCell' },
      ...scenarios.map(s => ({
        text: formatCommercialCurrency(s.adfixusShare),
        style: 'tableCell',
      })),
    ],
    // Value Suppressed
    [
      { text: 'Value Suppressed', style: 'tableCell' },
      ...scenarios.map(s => ({
        text: s.valueSuppressed > 0 ? formatCommercialCurrency(s.valueSuppressed) : '—',
        style: s.valueSuppressed > 0 ? 'tableCellDanger' : 'tableCell',
      })),
    ],
    // Publisher % of Total
    [
      { text: 'Publisher % of Incremental', style: 'tableCell' },
      ...scenarios.map(s => ({
        text: `${s.netPublisherGainPercentage.toFixed(0)}%`,
        style: s.model.isRecommended ? 'tableCellSuccess' : 'tableCell',
      })),
    ],
    // ROI Multiple
    [
      { text: 'ROI Multiple', style: 'tableCell' },
      ...scenarios.map(s => ({
        text: `${s.roiMultiple.toFixed(1)}x`,
        style: s.model.isRecommended ? 'tableCellSuccess' : 'tableCell',
      })),
    ],
  ];
  
  return {
    table: {
      headerRows: 1,
      widths: [140, '*', '*', '*'],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.light,
      vLineColor: () => COLORS.light,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
  };
}

/**
 * Build compact waterfall for a scenario
 */
function buildCompactWaterfall(scenario: ScenarioComparison): any[] {
  const waterfall = generateWaterfall(scenario);
  const maxValue = Math.max(...waterfall.map(w => w.value));
  
  const content: any[] = [
    {
      text: scenario.model.label,
      fontSize: 8,
      bold: true,
      color: scenario.model.isRecommended ? COLORS.success : 
             scenario.model.type === 'flat-fee' ? COLORS.destructive : COLORS.warning,
      margin: [0, 0, 0, 4],
    },
  ];
  
  waterfall.forEach(step => {
    const widthPercent = (step.value / maxValue) * 100;
    content.push({
      columns: [
        {
          width: 60,
          text: step.label,
          fontSize: 6,
          color: COLORS.muted,
        },
        {
          width: '*',
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: (widthPercent / 100) * 120,
                  h: 10,
                  color: step.color,
                },
              ],
            },
          ],
        },
        {
          width: 40,
          text: formatCommercialCurrency(step.value),
          fontSize: 6,
          bold: true,
          color: step.type === 'negative' ? COLORS.destructive : COLORS.dark,
          alignment: 'right',
        },
      ],
      margin: [0, 2, 0, 0],
    });
  });
  
  return content;
}

/**
 * Build proof point section
 */
function buildProofPointSection(proofPoint: ReturnType<typeof getProofPoint>): any {
  return {
    margin: [0, 8, 0, 0],
    table: {
      widths: ['*'],
      body: [
        [
          {
            stack: [
              {
                text: `"${proofPoint.quote}"`,
                style: 'quote',
              },
              {
                text: `— ${proofPoint.author}, ${proofPoint.title}, ${proofPoint.company}`,
                style: 'quoteAttribution',
              },
            ],
            fillColor: '#f0fdf4',
            margin: [12, 8, 12, 8],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => COLORS.success,
      vLineColor: () => COLORS.success,
    },
  };
}

/**
 * Export default for backward compatibility
 */
export default generateCommercialPDF;
