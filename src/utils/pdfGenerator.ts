import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { formatCurrency, formatNumber, formatPercentage } from './formatting';
import { supabase } from '@/integrations/supabase/client';
import { VOX_MEDIA_DOMAINS, CONTRACT_PRICING, PORTFOLIO_TOTALS } from '@/constants/voxMediaDomains';
import type { UnifiedResults } from '@/types/scenarios';
import type { CalculatorResults } from '@/types';

// Initialize pdfMake fonts with correct VFS structure
pdfMake.vfs = pdfFonts.vfs;

// Type guard to check if results are UnifiedResults
const isUnifiedResults = (results: any): results is UnifiedResults => {
  return results && 'idInfrastructure' in results && 'pricing' in results && 'roiAnalysis' in results;
};

// Legacy PDF builder for CalculatorResults (original calculator)
const buildLegacyPdf = async (
  quizResults: any,
  calculatorResults: CalculatorResults,
  leadData: any,
  logoDataUrl: string
) => {
  const monthlyUplift = calculatorResults.uplift?.totalMonthlyUplift || 0;
  const annualUplift = calculatorResults.uplift?.totalAnnualUplift || 0;

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    header: () => ({
      columns: [
        {
          image: logoDataUrl,
          fit: [100, 28],
          margin: [40, 20, 0, 0]
        },
        {
          text: 'Identity ROI Analysis',
          style: 'headerTitle',
          alignment: 'right',
          margin: [0, 25, 40, 0]
        }
      ]
    }),

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: 'CONFIDENTIAL',
          style: 'footerText',
          margin: [40, 0, 0, 0]
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          style: 'footerText',
          alignment: 'right',
          margin: [0, 0, 40, 0]
        }
      ]
    }),

    content: [
      {
        text: 'Executive Summary',
        style: 'h1',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Revenue Impact Projection',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Monthly Uplift', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Annual Projection', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Current Revenue', style: 'metricHeader', fillColor: '#F1F5F9' }
            ],
            [
              { text: formatCurrency(monthlyUplift), style: 'metricValue', alignment: 'center' },
              { text: formatCurrency(annualUplift), style: 'metricValue', alignment: 'center' },
              { text: formatCurrency(calculatorResults.currentRevenue || 0), style: 'metricValue', alignment: 'center' }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CBD5E1',
          vLineColor: () => '#CBD5E1',
          paddingTop: () => 8,
          paddingBottom: () => 8
        },
        margin: [0, 0, 0, 20]
      },
      {
        text: 'This analysis was generated using the AdFixus Identity ROI Calculator.',
        style: 'body',
        margin: [0, 0, 0, 0]
      }
    ],

    styles: {
      headerTitle: { fontSize: 10, bold: true, color: '#1E293B' },
      footerText: { fontSize: 7, color: '#64748B', italics: true },
      h1: { fontSize: 18, bold: true, color: '#0F172A' },
      h3: { fontSize: 12, bold: true, color: '#1E293B' },
      body: { fontSize: 10, color: '#475569', lineHeight: 1.4 },
      metricHeader: { fontSize: 9, bold: true, color: '#1E293B', alignment: 'center' },
      metricValue: { fontSize: 14, bold: true, color: '#1E293B' }
    }
  };

  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBase64(async (base64Data) => {
      try {
        pdfMake.createPdf(docDefinition).download('AdFixus_Identity_ROI_Analysis.pdf');
        
        try {
          await sendPDFByEmail(base64Data, quizResults, calculatorResults, leadData);
          resolve({ pdfBase64: base64Data, emailSent: true });
        } catch (emailError: any) {
          resolve({ pdfBase64: base64Data, emailSent: false, emailError: emailError.message });
        }
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Convert image to base64
const convertImageToBase64 = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '';
  }
};

// Get domain display name from ID
const getDomainName = (domainId: string): string => {
  const domain = VOX_MEDIA_DOMAINS.find(d => d.id === domainId);
  return domain?.name || domainId;
};

// Get domain data from ID
const getDomainData = (domainId: string) => {
  return VOX_MEDIA_DOMAINS.find(d => d.id === domainId);
};

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Risk scenario descriptions
const RISK_SCENARIO_CONFIG = {
  conservative: {
    label: 'Conservative',
    description: '60% adoption rate, 18-month ramp-up period',
    rampMonths: 18,
    adoptionRate: 0.6
  },
  moderate: {
    label: 'Moderate',
    description: '80% adoption rate, 12-month ramp-up period',
    rampMonths: 12,
    adoptionRate: 0.8
  },
  optimistic: {
    label: 'Optimistic',
    description: '100% adoption rate, 6-month ramp-up period',
    rampMonths: 6,
    adoptionRate: 1.0
  }
};

export const buildAdfixusProposalPdf = async (
  quizResults: any,
  calculatorResults: UnifiedResults | CalculatorResults,
  leadData?: any
) => {
  // Load both logos
  const adfixusLogoDataUrl = await convertImageToBase64('/lovable-uploads/e51c9dd5-2c62-4f48-83ea-2b4cb61eed6c.png');
  const voxLogoDataUrl = await convertImageToBase64('/lovable-uploads/vox-media-logo.png');
  
  // Handle both UnifiedResults (new) and CalculatorResults (legacy)
  if (!isUnifiedResults(calculatorResults)) {
    // Legacy CalculatorResults - use simplified PDF generation
    return buildLegacyPdf(quizResults, calculatorResults, leadData, adfixusLogoDataUrl);
  }
  
  const results = calculatorResults;
  const generatedDate = formatDate(new Date());
  
  // Extract core data
  const monthlyUplift = results?.totals?.totalMonthlyUplift || 0;
  const annualUplift = results?.totals?.totalAnnualUplift || 0;
  const currentMonthlyRevenue = results?.totals?.currentMonthlyRevenue || 0;
  
  // Component uplifts
  const idInfra = results?.idInfrastructure;
  const capi = results?.capiCapabilities;
  const mediaPerf = results?.mediaPerformance;
  
  // Pricing & ROI
  const pricing = results?.pricing;
  const roiAnalysis = results?.roiAnalysis;
  const riskScenario = results?.riskScenario || 'moderate';
  const riskConfig = RISK_SCENARIO_CONFIG[riskScenario];
  const riskAdjustment = results?.riskAdjustmentSummary;
  
  // Breakdown percentages
  const breakdown = results?.breakdown || { idInfrastructurePercent: 0, capiPercent: 0, performancePercent: 0 };
  
  // Selected domains
  const selectedDomains = results?.inputs?.selectedDomains || [];
  const domainDataRows = selectedDomains.map((domainId: string) => {
    const domain = getDomainData(domainId);
    if (!domain) return null;
    const impressions = domain.monthlyPageviews * domain.adsPerPage;
    return {
      name: domain.name,
      pageviews: domain.monthlyPageviews,
      impressions,
      safariShare: domain.audienceProfile.safariShare,
      inPoc: domain.inPoc || false
    };
  }).filter(Boolean);
  
  // Calculate portfolio totals from selected domains
  const totalSelectedPageviews = domainDataRows.reduce((sum: number, d: any) => sum + d.pageviews, 0);
  const totalSelectedImpressions = domainDataRows.reduce((sum: number, d: any) => sum + d.impressions, 0);
  const weightedSafariShare = domainDataRows.reduce((sum: number, d: any) => sum + (d.safariShare * d.impressions), 0) / totalSelectedImpressions;
  
  // ID Infrastructure details
  const currentAddressability = idInfra?.details?.currentAddressability || 0;
  const improvedAddressability = idInfra?.details?.improvedAddressability || 0;
  const newlyAddressableImpressions = idInfra?.details?.newlyAddressableImpressions || 0;
  
  // Contract costs
  const pocMonthly = pricing?.pocMonthlyEquivalent || CONTRACT_PRICING.POC_MONTHLY_EQUIVALENT;
  const fullContractMonthly = pricing?.fullContractMonthly || CONTRACT_PRICING.FULL_CONTRACT_MONTHLY;
  const capiServiceFees = pricing?.monthlyCapiServiceFees || 0;
  
  // ROI metrics
  const netMonthlyROI = roiAnalysis?.netMonthlyROI?.fullContract || 0;
  const roiMultiple = roiAnalysis?.roiMultiple?.fullContract || 0;
  const paybackMonths = roiAnalysis?.paybackMonths?.fullContract || 0;
  
  // Table layout helper
  const tableLayout = {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#CBD5E1',
    vLineColor: () => '#CBD5E1',
    paddingTop: () => 6,
    paddingBottom: () => 6,
    paddingLeft: () => 8,
    paddingRight: () => 8
  };

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 60],
    
    info: {
      title: 'Vox Media × AdFixus Revenue Impact Analysis',
      author: 'AdFixus ROI Simulator',
      subject: 'Executive ROI Analysis for AdFixus Implementation',
      keywords: 'AdFixus, Vox Media, ROI, Identity, Addressability'
    },

    header: (currentPage: number) => ({
      columns: [
        {
          image: adfixusLogoDataUrl,
          fit: [90, 24],
          margin: [40, 25, 0, 0]
        },
        {
          text: 'Revenue Impact Analysis',
          style: 'headerTitle',
          alignment: 'center',
          margin: [0, 28, 0, 0],
          width: '*'
        },
        {
          image: voxLogoDataUrl,
          fit: [60, 22],
          alignment: 'right',
          margin: [0, 24, 40, 0]
        }
      ]
    }),

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: 'CONFIDENTIAL — Prepared for Vox Media Executive Team',
          style: 'footerText',
          margin: [40, 0, 0, 0]
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          style: 'footerText',
          alignment: 'right',
          margin: [0, 0, 40, 0]
        }
      ]
    }),

    content: [
      // ==================== PAGE 1: EXECUTIVE SUMMARY ====================
      {
        text: 'Executive Summary',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        columns: [
          { text: `Generated: ${generatedDate}`, style: 'metadata' },
          { text: `Effective Date: January 1, 2026`, style: 'metadata', alignment: 'right' }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Scenario Configuration',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        table: {
          widths: ['auto', '*'],
          body: [
            [
              { text: 'Risk Scenario', style: 'tableLabel' },
              { text: `${riskConfig.label} — ${riskConfig.description}`, style: 'tableValue' }
            ],
            [
              { text: 'Domains Selected', style: 'tableLabel' },
              { text: `${selectedDomains.length} of ${VOX_MEDIA_DOMAINS.length} portfolio domains`, style: 'tableValue' }
            ],
            [
              { text: 'Scope', style: 'tableLabel' },
              { text: results?.scenario?.scope === 'id-capi-performance' ? 'ID + CAPI + Media Performance' : 
                       results?.scenario?.scope === 'id-capi' ? 'ID + CAPI' : 'ID Infrastructure Only', style: 'tableValue' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Key Financial Metrics',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Monthly Revenue Uplift', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Annual Revenue Opportunity', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Contract Cost (Year 1)', style: 'metricHeader', fillColor: '#F1F5F9' }
            ],
            [
              { text: formatCurrency(monthlyUplift), style: 'metricValue', alignment: 'center' },
              { text: formatCurrency(annualUplift), style: 'metricValue', alignment: 'center' },
              { text: formatCurrency((fullContractMonthly + capiServiceFees) * 12), style: 'metricValue', alignment: 'center' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Net Annual ROI', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Payback Period', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'ROI Multiple', style: 'metricHeader', fillColor: '#F1F5F9' }
            ],
            [
              { text: formatCurrency(netMonthlyROI * 12), style: 'metricValueHighlight', alignment: 'center' },
              { text: `${paybackMonths.toFixed(1)} months`, style: 'metricValue', alignment: 'center' },
              { text: `${roiMultiple.toFixed(1)}x`, style: 'metricValueHighlight', alignment: 'center' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Methodology',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        text: 'This analysis models revenue impact from three sources: (1) ID Infrastructure improvements that restore addressability in Safari/iOS environments, (2) CAPI capabilities that enhance conversion tracking and match rates, and (3) Media Performance optimization that unlocks premium CPMs. All projections are risk-adjusted based on the selected scenario parameters.',
        style: 'body',
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 2: PORTFOLIO ANALYSIS ====================
      {
        pageBreak: 'before',
        text: 'Portfolio Analysis',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Selected Domains',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Domain', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Monthly Pageviews', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Monthly Impressions', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Safari Share', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Status', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' }
            ],
            ...domainDataRows.map((d: any) => [
              { text: d.name, style: 'tableCell' },
              { text: formatNumber(d.pageviews), style: 'tableCell', alignment: 'right' },
              { text: formatNumber(d.impressions), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage(d.safariShare * 100), style: 'tableCell', alignment: 'right' },
              { text: d.inPoc ? 'POC' : 'Year 1', style: 'tableCell', alignment: 'center' }
            ]),
            [
              { text: 'TOTAL', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: formatNumber(totalSelectedPageviews), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: formatNumber(totalSelectedImpressions), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: formatPercentage(weightedSafariShare * 100), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: '', style: 'tableHeader', fillColor: '#F1F5F9' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Addressability Impact',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Current Safari Addressability', style: 'tableLabel' },
              { text: formatPercentage(currentAddressability), style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Projected Safari Addressability (with Durable ID)', style: 'tableLabel' },
              { text: formatPercentage(improvedAddressability), style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Addressability Improvement', style: 'tableLabel' },
              { text: `+${(improvedAddressability - currentAddressability).toFixed(0)} percentage points`, style: 'tableValueHighlight', alignment: 'right' }
            ],
            [
              { text: 'Newly Addressable Impressions (Monthly)', style: 'tableLabel' },
              { text: formatNumber(newlyAddressableImpressions), style: 'tableValue', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 3: REVENUE IMPACT BREAKDOWN ====================
      {
        pageBreak: 'before',
        text: 'Revenue Impact Breakdown',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Revenue Uplift by Source',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Source', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Monthly Uplift', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Annual Uplift', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: '% of Total', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'ID Infrastructure', style: 'tableCell' },
              { text: formatCurrency(idInfra?.monthlyUplift || 0), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency((idInfra?.monthlyUplift || 0) * 12), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage(breakdown.idInfrastructurePercent), style: 'tableCell', alignment: 'right' }
            ],
            ...(capi && capi.monthlyUplift > 0 ? [[
              { text: 'CAPI Capabilities', style: 'tableCell' },
              { text: formatCurrency(capi.monthlyUplift), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(capi.monthlyUplift * 12), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage(breakdown.capiPercent), style: 'tableCell', alignment: 'right' }
            ]] : []),
            ...(mediaPerf && mediaPerf.monthlyUplift > 0 ? [[
              { text: 'Media Performance', style: 'tableCell' },
              { text: formatCurrency(mediaPerf.monthlyUplift), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(mediaPerf.monthlyUplift * 12), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage(breakdown.performancePercent), style: 'tableCell', alignment: 'right' }
            ]] : []),
            [
              { text: 'TOTAL', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: formatCurrency(monthlyUplift), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: formatCurrency(annualUplift), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: '100%', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      {
        text: 'ID Infrastructure Detail',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Addressability Revenue', style: 'tableLabel' },
              { text: formatCurrency(idInfra?.details?.addressabilityRevenue || 0) + '/month', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CDP Cost Savings', style: 'tableLabel' },
              { text: formatCurrency(idInfra?.details?.cdpSavingsRevenue || 0) + '/month', style: 'tableValue', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },
      ...(capi && capi.monthlyUplift > 0 ? [
        {
          text: 'CAPI Capabilities Detail',
          style: 'h3',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Baseline Campaign Spend', style: 'tableLabel' },
                { text: formatCurrency(capi.baselineCapiSpend) + '/month', style: 'tableValue', alignment: 'right' }
              ],
              [
                { text: 'CAPI-Eligible Spend', style: 'tableLabel' },
                { text: formatCurrency(capi.capiEligibleSpend) + '/month', style: 'tableValue', alignment: 'right' }
              ],
              [
                { text: 'Conversion Improvement Revenue', style: 'tableLabel' },
                { text: formatCurrency(capi.conversionTrackingRevenue) + '/month', style: 'tableValue', alignment: 'right' }
              ],
              [
                { text: 'Service Fees (12.5%)', style: 'tableLabel' },
                { text: '(' + formatCurrency(capi.campaignServiceFees) + ')/month', style: 'tableValue', alignment: 'right' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 0]
        }
      ] : []),

      // ==================== PAGE 4: ROI & COST ANALYSIS ====================
      {
        pageBreak: 'before',
        text: 'ROI & Cost Analysis',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Contract Pricing Summary',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Phase', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Duration', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Platform Fee', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'CAPI Fees', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Total Monthly', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'POC', style: 'tableCell' },
              { text: '3 months', style: 'tableCell' },
              { text: formatCurrency(pocMonthly) + '/mo', style: 'tableCell', alignment: 'right' },
              { text: 'Est. ' + formatCurrency(capiServiceFees) + '/mo', style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(pocMonthly + capiServiceFees) + '/mo', style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Year 1', style: 'tableCell' },
              { text: '12 months', style: 'tableCell' },
              { text: formatCurrency(fullContractMonthly) + '/mo', style: 'tableCell', alignment: 'right' },
              { text: 'Est. ' + formatCurrency(capiServiceFees) + '/mo', style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(fullContractMonthly + capiServiceFees) + '/mo', style: 'tableCell', alignment: 'right' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      {
        text: 'ROI Calculation',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Metric', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'POC Phase', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Full Contract', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'Monthly Benefits', style: 'tableCell' },
              { text: formatCurrency(roiAnalysis?.totalMonthlyBenefits || 0), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(roiAnalysis?.totalMonthlyBenefits || 0), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Monthly Costs', style: 'tableCell' },
              { text: formatCurrency(roiAnalysis?.costs?.pocPhaseMonthly || 0), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(roiAnalysis?.costs?.fullContractMonthly || 0), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Net Monthly ROI', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: formatCurrency(roiAnalysis?.netMonthlyROI?.pocPhase || 0), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: formatCurrency(roiAnalysis?.netMonthlyROI?.fullContract || 0), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'ROI Multiple', style: 'tableCell' },
              { text: (roiAnalysis?.roiMultiple?.pocPhase || 0).toFixed(1) + 'x', style: 'tableCell', alignment: 'right' },
              { text: (roiAnalysis?.roiMultiple?.fullContract || 0).toFixed(1) + 'x', style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Payback Period', style: 'tableCell' },
              { text: (roiAnalysis?.paybackMonths?.pocPhase || 0).toFixed(1) + ' months', style: 'tableCell', alignment: 'right' },
              { text: (roiAnalysis?.paybackMonths?.fullContract || 0).toFixed(1) + ' months', style: 'tableCell', alignment: 'right' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 5: RISK-ADJUSTED PROJECTIONS ====================
      {
        pageBreak: 'before',
        text: 'Risk-Adjusted Projections',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        text: `Selected Scenario: ${riskConfig.label}`,
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        text: riskConfig.description,
        style: 'body',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Risk Adjustment Summary',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Unadjusted Monthly Uplift', style: 'tableLabel' },
              { text: formatCurrency(riskAdjustment?.unadjustedMonthlyUplift || monthlyUplift), style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Risk-Adjusted Monthly Uplift', style: 'tableLabel' },
              { text: formatCurrency(riskAdjustment?.adjustedMonthlyUplift || monthlyUplift), style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Adjustment Factor', style: 'tableLabel' },
              { text: `-${((riskAdjustment?.adjustmentPercentage || 0) * 100).toFixed(0)}%`, style: 'tableValue', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Quarterly Ramp-Up Schedule',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Quarter', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Revenue Factor', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Projected Monthly Uplift', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'Q1 (Months 1-3)', style: 'tableCell' },
              { text: riskScenario === 'conservative' ? '25%' : riskScenario === 'moderate' ? '40%' : '60%', style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.25 : riskScenario === 'moderate' ? 0.40 : 0.60)), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Q2 (Months 4-6)', style: 'tableCell' },
              { text: riskScenario === 'conservative' ? '50%' : riskScenario === 'moderate' ? '70%' : '85%', style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.50 : riskScenario === 'moderate' ? 0.70 : 0.85)), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Q3 (Months 7-9)', style: 'tableCell' },
              { text: riskScenario === 'conservative' ? '75%' : riskScenario === 'moderate' ? '90%' : '100%', style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.75 : riskScenario === 'moderate' ? 0.90 : 1.00)), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Q4 (Months 10-12)', style: 'tableCell' },
              { text: riskScenario === 'conservative' ? '90%' : '100%', style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.90 : 1.00)), style: 'tableCell', alignment: 'right' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 6: POC SUCCESS CRITERIA ====================
      {
        pageBreak: 'before',
        text: 'POC Success Criteria',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'The following KPIs define successful completion of the POC phase, as outlined in the Order Form:',
        style: 'body',
        margin: [0, 0, 0, 20]
      },
      {
        text: '1. ID Deployment Success',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        ul: [
          'ClientID deployed across all POC domains (The Verge, Vox, NYMag cluster)',
          'ClientID passing into GAM as PPID for addressable inventory',
          'ClientID available in Analytics (GA4 or BigQuery) for measurement'
        ],
        style: 'listItem',
        margin: [0, 0, 0, 20]
      },
      {
        text: '2. Addressability Uplift',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        ul: [
          'Safari impressions uplift verified via PPID coverage reports',
          'Cross-domain user deduplication visible in BigQuery',
          'Measurable uplift vs baseline within 30 days of deployment'
        ],
        style: 'listItem',
        margin: [0, 0, 0, 20]
      },
      {
        text: '3. Identity Durability',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        ul: [
          'ID consistency verified across NYMag cluster + Verge/Vox domains',
          'No ID breaks, collisions, or regressions detected during testing',
          'ID persistence validated across user sessions and devices'
        ],
        style: 'listItem',
        margin: [0, 0, 0, 20]
      },
      {
        text: '4. Strategic Objectives (from Scope of Work)',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        ul: [
          'Minimum +20% addressability improvement in Safari ad products',
          'Demonstrate real conversion reporting on Vox campaign reports',
          'Foundation for speaking to 100% of users as though logged in'
        ],
        style: 'listItem',
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 7: ASSUMPTIONS & METHODOLOGY ====================
      {
        pageBreak: 'before',
        text: 'Assumptions & Methodology',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Calculation Methodology',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Revenue calculation', style: 'tableLabel' },
              { text: 'CPM × Addressable Impressions', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Safari baseline addressability', style: 'tableLabel' },
              { text: formatPercentage(currentAddressability), style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Safari addressability with Durable ID', style: 'tableLabel' },
              { text: formatPercentage(improvedAddressability), style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CPM uplift on newly addressable inventory', style: 'tableLabel' },
              { text: formatPercentage((results?.assumptionOverrides?.cpmUpliftFactor || 0.25) * 100), style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CAPI conversion improvement', style: 'tableLabel' },
              { text: '40% (industry benchmark)', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CDP cost reduction', style: 'tableLabel' },
              { text: formatPercentage((results?.assumptionOverrides?.cdpCostReduction || 0.14) * 100), style: 'tableValue', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Key Assumptions Applied',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', '*'],
          body: [
            [
              { text: 'Factor', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Value', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' },
              { text: 'Description', style: 'tableHeader', fillColor: '#F1F5F9' }
            ],
            [
              { text: 'Portfolio Safari Share', style: 'tableCell' },
              { text: formatPercentage(weightedSafariShare * 100), style: 'tableCell', alignment: 'center' },
              { text: 'Impression-weighted average across selected domains', style: 'tableCell' }
            ],
            [
              { text: 'Adoption Rate', style: 'tableCell' },
              { text: formatPercentage(riskConfig.adoptionRate * 100), style: 'tableCell', alignment: 'center' },
              { text: 'Expected portfolio deployment percentage', style: 'tableCell' }
            ],
            [
              { text: 'Ramp-Up Period', style: 'tableCell' },
              { text: `${riskConfig.rampMonths} months`, style: 'tableCell', alignment: 'center' },
              { text: 'Time to reach full projected value', style: 'tableCell' }
            ],
            [
              { text: 'CAPI Line Item Share', style: 'tableCell' },
              { text: formatPercentage((results?.inputs?.capiLineItemShare || 0.60) * 100), style: 'tableCell', alignment: 'center' },
              { text: 'Percentage of campaign budget using CAPI', style: 'tableCell' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Important Caveats',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'This analysis is subject to the following organizational factors which may impact realized ROI:',
        style: 'caveatIntro',
        margin: [0, 0, 0, 8]
      },
      {
        ol: [
          { text: 'Sales Team Readiness: Training, incentives, and active pipeline development directly affect revenue realization.' },
          { text: 'Technical Deployment: DNS setup, consent management, and ad server configuration timeline may extend ramp-up.' },
          { text: 'Advertiser Adoption: Willingness of advertisers to test CAPI and outcome-based buying varies by vertical.' },
          { text: 'Project Ownership: Clear accountability and cross-functional alignment are required for successful execution.' },
          { text: 'Budget Environment: Advertiser spending confidence and market conditions influence campaign volumes.' },
          { text: 'Training & Enablement: Structured training programs for sales and operations teams accelerate adoption.' },
          { text: 'Integration Delays: Dependencies on existing systems and potential deployment friction may impact timelines.' },
          { text: 'Resource Availability: Dedicated engineering and operational resources are critical for implementation success.' }
        ],
        style: 'caveatList',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'All projections assume successful completion of POC KPIs and are based on industry benchmarks as of December 2024. Actual results may vary based on market conditions, advertiser demand, and organizational execution. AdFixus makes no guarantees regarding specific revenue outcomes.',
        style: 'disclaimer',
        margin: [0, 0, 0, 0]
      }
    ],

    styles: {
      headerTitle: {
        fontSize: 10,
        bold: true,
        color: '#1E293B'
      },
      footerText: {
        fontSize: 7,
        color: '#64748B',
        italics: true
      },
      h1: {
        fontSize: 18,
        bold: true,
        color: '#0F172A'
      },
      h3: {
        fontSize: 12,
        bold: true,
        color: '#1E293B'
      },
      metadata: {
        fontSize: 9,
        color: '#64748B'
      },
      body: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.4
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: '#1E293B'
      },
      tableCell: {
        fontSize: 9,
        color: '#475569'
      },
      tableLabel: {
        fontSize: 10,
        color: '#475569'
      },
      tableValue: {
        fontSize: 10,
        color: '#1E293B'
      },
      tableValueHighlight: {
        fontSize: 10,
        bold: true,
        color: '#0D9488'
      },
      metricHeader: {
        fontSize: 9,
        bold: true,
        color: '#1E293B',
        alignment: 'center'
      },
      metricValue: {
        fontSize: 14,
        bold: true,
        color: '#1E293B'
      },
      metricValueHighlight: {
        fontSize: 14,
        bold: true,
        color: '#0D9488'
      },
      listItem: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.5
      },
      caveatIntro: {
        fontSize: 9,
        color: '#475569'
      },
      caveatList: {
        fontSize: 8,
        color: '#64748B',
        lineHeight: 1.4
      },
      disclaimer: {
        fontSize: 8,
        color: '#94A3B8',
        italics: true,
        lineHeight: 1.3
      }
    }
  };

  // Generate PDF buffer for email sending
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBase64(async (base64Data) => {
      try {
        console.log('PDF generated successfully, attempting download and email...');
        
        // Download PDF for user first
        const filename = `Vox_Media_ROI_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
        pdfMake.createPdf(docDefinition).download(filename);
        console.log('PDF download initiated');
        
        // Attempt to send email with PDF
        try {
          await sendPDFByEmail(base64Data, quizResults, calculatorResults, leadData);
          console.log('Email sent successfully');
          resolve({ pdfBase64: base64Data, emailSent: true });
        } catch (emailError: any) {
          console.error('Email sending failed, but PDF was downloaded:', emailError);
          resolve({ pdfBase64: base64Data, emailSent: false, emailError: emailError.message });
        }
        
      } catch (error) {
        console.error('Error in PDF generation:', error);
        reject(error);
      }
    });
  });
};

// Legacy function for backward compatibility
export const generatePDF = buildAdfixusProposalPdf;

// Email sending functionality
export const sendPDFByEmail = async (pdfBase64: string, quizResults: any, calculatorResults: any, leadData?: any) => {
  try {
    console.log('Attempting to send PDF via email...', {
      pdfLength: pdfBase64.length,
      hasQuizResults: !!quizResults,
      hasCalculatorResults: !!calculatorResults,
      hasLeadData: !!leadData,
      leadDataContent: leadData
    });
    
    if (!leadData || !leadData.email) {
      console.warn('No lead data or email found, using default values');
    }
    
    const { data, error } = await supabase.functions.invoke('send-pdf-email', {
      body: {
        pdfBase64,
        contactForm: leadData || {
          firstName: 'Unknown',
          lastName: 'User',
          email: 'unknown@example.com',
          company: 'Unknown Company'
        },
        userContactDetails: leadData || {
          firstName: 'Unknown',
          lastName: 'User',
          email: 'unknown@example.com',
          company: 'Unknown Company'
        },
        quizResults,
        calculatorResults
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Email service error: ${error.message || 'Unknown error'}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error sending PDF email:', error);
    const errorMessage = error.message || 'Failed to send email';
    throw new Error(`Email delivery failed: ${errorMessage}`);
  }
};
