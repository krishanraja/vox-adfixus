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
    description: '70% adoption rate, 12-month sales ramp. Technical integration: 3-6 weeks.',
    rampMonths: 12,
    adoptionRate: 0.70
  },
  moderate: {
    label: 'Moderate',
    description: '75% adoption rate, 9-month sales ramp. Technical integration: 3-6 weeks.',
    rampMonths: 9,
    adoptionRate: 0.75
  },
  optimistic: {
    label: 'Optimistic',
    description: '92% adoption rate, 6-month sales ramp. Technical integration: 3-6 weeks.',
    rampMonths: 6,
    adoptionRate: 0.92
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
          text: 'CONFIDENTIAL — Scenario Model for Planning Purposes Only',
          style: 'footerText',
          margin: [40, 0, 0, 0]
        },
        {
          text: `All figures are modeled projections  |  Page ${currentPage} of ${pageCount}`,
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
      // SCENARIO MODEL DISCLAIMER BOX
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: [
                  { text: 'SCENARIO MODEL DISCLAIMER: ', bold: true },
                  { text: 'This document presents modeled projections based on stated assumptions and industry benchmarks. All figures are indicative estimates subject to variables including market conditions, deployment execution, advertiser behavior, and organizational readiness. This analysis does not constitute a guarantee or commitment of specific outcomes.' }
                ],
                style: 'disclaimerBox',
                fillColor: '#F8FAFC',
                margin: [10, 10, 10, 10]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#E2E8F0',
          vLineColor: () => '#E2E8F0',
        },
        margin: [0, 0, 0, 20]
      },
      {
        text: `Generated: ${generatedDate}`,
        style: 'metadata',
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
        text: 'Scenario Model Summary',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Modeled Monthly Uplift*', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Modeled Annual Opportunity*', style: 'metricHeader', fillColor: '#F1F5F9' }
            ],
            [
              { text: formatCurrency(monthlyUplift), style: 'metricValue', alignment: 'center' },
              { text: formatCurrency(annualUplift), style: 'metricValue', alignment: 'center' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 8]
      },
      {
        text: '*Modeled projections based on stated assumptions. See Assumptions & Methodology for details.',
        style: 'footnote',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Methodology',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        text: 'This scenario model estimates potential revenue impact from three sources: (1) ID Infrastructure improvements that may restore addressability in Safari/iOS environments, (2) CAPI capabilities that may enhance conversion tracking and match rates, and (3) Media Performance optimization that may unlock premium CPMs. All projections are illustrative, risk-adjusted based on selected scenario parameters, and contingent on successful deployment, market conditions, and organizational execution. These figures do not represent commitments or guarantees.',
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
        text: 'Safari Addressability (POC Focus)',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Safari Traffic Share', style: 'tableLabel' },
              { text: '35%', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Current Safari Tracking', style: 'tableLabel' },
              { text: 'Limited (ITP restrictions)', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'POC Target', style: 'tableLabel' },
              { text: 'Measurable addressability improvement on Safari inventory', style: 'tableValueHighlight', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 3: REVENUE IMPACT BREAKDOWN ====================
      {
        pageBreak: 'before',
        text: 'Modeled Revenue Impact Breakdown',
        style: 'h1',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Modeled Revenue Uplift by Source*',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Revenue Category', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Modeled Monthly', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Modeled Annual', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: '% of Total', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'Net New Revenue: Safari/iOS Inventory Recovery', style: 'tableCell' },
              { text: formatCurrency(idInfra?.monthlyUplift || 0), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency((idInfra?.monthlyUplift || 0) * 12), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage(breakdown.idInfrastructurePercent), style: 'tableCell', alignment: 'right' }
            ],
            ...(capi && capi.monthlyUplift > 0 ? [[
              { text: 'Yield Lift: Outcome-Based Campaign Revenue', style: 'tableCell' },
              { text: formatCurrency(capi.monthlyUplift), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(capi.monthlyUplift * 12), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage(breakdown.capiPercent), style: 'tableCell', alignment: 'right' }
            ]] : []),
            ...(mediaPerf && mediaPerf.monthlyUplift > 0 ? [[
              { text: 'Sales Efficiency: Reduced Make-Goods & Premium Yield', style: 'tableCell' },
              { text: formatCurrency(mediaPerf.monthlyUplift), style: 'tableCell', alignment: 'right' },
              { text: formatCurrency(mediaPerf.monthlyUplift * 12), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage(breakdown.performancePercent), style: 'tableCell', alignment: 'right' }
            ]] : []),
            [
              { text: 'MODELED TOTAL', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: formatCurrency(monthlyUplift), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: formatCurrency(annualUplift), style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: '100%', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 8]
      },
      {
        text: '*All figures are modeled projections. Actual results will depend on deployment, market conditions, and organizational execution.',
        style: 'footnote',
        margin: [0, 0, 0, 15]
      },
      // Defensive value callout
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: [
                  { text: 'DEFENSIVE VALUE: ', bold: true },
                  { text: `Without AdFixus, Vox Media leaves approximately ${formatCurrency((idInfra?.details?.addressabilityRevenue || 0) * 12)}/year on the table from unaddressable Safari/iOS inventory. This is revenue that competitors with first-party identity solutions are already capturing.` }
                ],
                style: 'disclaimerBox',
                fillColor: '#FEF3C7',
                margin: [10, 10, 10, 10]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#F59E0B',
          vLineColor: () => '#F59E0B',
        },
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Net New Revenue: Safari/iOS Inventory Recovery',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Addressability Revenue (CPM uplift on recovered inventory)', style: 'tableLabel' },
              { text: formatCurrency(idInfra?.details?.addressabilityRevenue || 0) + '/month', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CDP Cost Savings (ID deduplication)', style: 'tableLabel' },
              { text: formatCurrency(idInfra?.details?.cdpSavingsRevenue || 0) + '/month', style: 'tableValue', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },
      ...(capi && capi.monthlyUplift > 0 ? [
        {
          text: 'Conversion API capability to compete with walled gardens',
          style: 'h3',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'CAPI Campaign Projection (Based on Business Readiness)',
          style: 'h4',
          margin: [0, 0, 0, 8]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', '*', 'auto'],
            body: [
              [
                { text: 'Metric', style: 'tableHeader', fillColor: '#F1F5F9' },
                { text: 'Value', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
                { text: 'Metric', style: 'tableHeader', fillColor: '#F1F5F9' },
                { text: 'Value', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
              ],
              [
                { text: 'Year 1 Campaigns', style: 'tableCell' },
                { text: `${capi.capiConfiguration?.yearlyCampaigns || 12}`, style: 'tableValueHighlight', alignment: 'right' },
                { text: 'POC Campaigns (M1-3)', style: 'tableCell' },
                { text: `${capi.capiConfiguration?.pocCampaigns || 2}`, style: 'tableValueHighlight', alignment: 'right' }
              ],
              [
                { text: 'Avg Campaign Spend', style: 'tableCell' },
                { text: formatCurrency(capi.capiConfiguration?.avgCampaignSpend || 75000), style: 'tableCell', alignment: 'right' },
                { text: 'Monthly CAPI Spend (Avg)', style: 'tableCell' },
                { text: formatCurrency(capi.baselineCapiSpend), style: 'tableCell', alignment: 'right' }
              ]
            ]
          },
          layout: tableLayout,
          margin: [0, 0, 0, 10]
        },
        {
          text: 'Campaign volume and spend are calculated from Business Readiness factors (Sales Readiness, Training, Advertiser Buy-In, Budget Environment).',
          style: 'footnote',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'CAPI Net Monthly Benefit', style: 'tableLabel' },
                { text: formatCurrency(capi.monthlyUplift) + '/month', style: 'tableValueHighlight', alignment: 'right' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 6]
        },
        {
          text: 'Includes conversion improvement revenue, labor savings, net of service fees.',
          style: 'footnote',
          margin: [0, 0, 0, 0]
        }
      ] : []),

      // ==================== PAGE 4: TIME HORIZON & PROJECTIONS ====================
      {
        pageBreak: 'before',
        text: 'Time Horizon & Value Realization',
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
        margin: [0, 0, 0, 15]
      },
      // Time Horizon Phases
      {
        text: 'Value Realization Phases',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto'],
          body: [
            [
              { text: 'Phase', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Months', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' },
              { text: 'Goal', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Expected ROI', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'POC Phase', style: 'tableCell', bold: true },
              { text: '1-3', style: 'tableCell', alignment: 'center' },
              { text: 'Prove it doesn\'t break things; validate addressability uplift', style: 'tableCell' },
              { text: '1-2x', style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Scaling Phase', style: 'tableCell', bold: true },
              { text: '4-6', style: 'tableCell', alignment: 'center' },
              { text: 'Early upside; expand to additional domains; sales enablement', style: 'tableCell' },
              { text: '2-4x', style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Value Phase', style: 'tableCell', bold: true },
              { text: '7-12', style: 'tableCell', alignment: 'center' },
              { text: 'Full ROI realization; CAPI campaigns at scale; premium yield', style: 'tableCell' },
              { text: '5-9x', style: 'tableCell', alignment: 'right' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Implementation Timeline',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        table: {
          widths: ['auto', '*'],
          body: [
            [
              { text: 'Technical Integration', style: 'tableLabel', bold: true },
              { text: '3-6 weeks — ID deployment + stack integration (ad server, analytics, reports, segments)', style: 'tableValue' }
            ],
            [
              { text: 'Sales Enablement Ramp', style: 'tableLabel', bold: true },
              { text: `${riskConfig.rampMonths} months — Training, advertiser outreach, and campaign adoption`, style: 'tableValue' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 15]
      },
      {
        text: 'Business Readiness Assumptions',
        style: 'h3',
        margin: [0, 0, 0, 8]
      },
      {
        ul: [
          { text: [{ text: 'Advertiser Adoption: ', bold: true }, 'Interested (testing CAPI & outcome-based buying)'] },
          { text: [{ text: 'Project Ownership: ', bold: true }, 'Shared Ownership (cross-functional alignment in place)'] },
          { text: [{ text: 'Budget Environment: ', bold: true }, 'Stable (advertiser confidence at moderate levels)'] },
        ],
        style: 'body',
        margin: [0, 0, 0, 8]
      },
      {
        text: 'These factors adjust theoretical maximum projections to realistic expected outcomes.',
        style: 'footnote',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Illustrative Quarterly Ramp-Up Schedule*',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: (() => {
            // Calculate cumulative CAPI campaigns per quarter
            const yearlyCampaigns = capi?.capiConfiguration?.yearlyCampaigns || 12;
            const pocCampaigns = capi?.capiConfiguration?.pocCampaigns || 2;
            const q2Campaigns = Math.max(2, Math.round(yearlyCampaigns * 0.20)); // ~20% of year
            const q3Campaigns = Math.max(3, Math.round(yearlyCampaigns * 0.30)); // ~30% of year
            const q4Campaigns = Math.max(3, Math.round(yearlyCampaigns * 0.35)); // ~35% of year
            
            return [
              [
                { text: 'Quarter', style: 'tableHeader', fillColor: '#F1F5F9' },
                { text: 'Phase', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' },
                { text: '% of Full Value', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
                { text: 'Modeled Monthly Uplift', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
                { text: 'CAPI Campaigns', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
              ],
              [
                { text: 'Q1 (Months 1-3)', style: 'tableCell' },
                { text: 'POC', style: 'tableCell', alignment: 'center', color: '#0D9488' },
                { text: riskScenario === 'conservative' ? '25%' : riskScenario === 'moderate' ? '40%' : '60%', style: 'tableCell', alignment: 'right' },
                { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.25 : riskScenario === 'moderate' ? 0.40 : 0.60)), style: 'tableCell', alignment: 'right' },
                { text: `${pocCampaigns}`, style: 'tableCell', alignment: 'right' }
              ],
              [
                { text: 'Q2 (Months 4-6)', style: 'tableCell' },
                { text: 'Scaling', style: 'tableCell', alignment: 'center', color: '#2563EB' },
                { text: riskScenario === 'conservative' ? '50%' : riskScenario === 'moderate' ? '70%' : '85%', style: 'tableCell', alignment: 'right' },
                { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.50 : riskScenario === 'moderate' ? 0.70 : 0.85)), style: 'tableCell', alignment: 'right' },
                { text: `${q2Campaigns}`, style: 'tableCell', alignment: 'right' }
              ],
              [
                { text: 'Q3 (Months 7-9)', style: 'tableCell' },
                { text: 'Value', style: 'tableCell', alignment: 'center', color: '#7C3AED' },
                { text: riskScenario === 'conservative' ? '75%' : riskScenario === 'moderate' ? '90%' : '100%', style: 'tableCell', alignment: 'right' },
                { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.75 : riskScenario === 'moderate' ? 0.90 : 1.00)), style: 'tableCell', alignment: 'right' },
                { text: `${q3Campaigns}`, style: 'tableCell', alignment: 'right' }
              ],
              [
                { text: 'Q4 (Months 10-12)', style: 'tableCell' },
                { text: 'Value', style: 'tableCell', alignment: 'center', color: '#7C3AED' },
                { text: riskScenario === 'conservative' ? '90%' : '100%', style: 'tableCell', alignment: 'right' },
                { text: formatCurrency(monthlyUplift * (riskScenario === 'conservative' ? 0.90 : 1.00)), style: 'tableCell', alignment: 'right' },
                { text: `${q4Campaigns}`, style: 'tableCell', alignment: 'right' }
              ]
            ];
          })()
        },
        layout: tableLayout,
        margin: [0, 0, 0, 8]
      },
      {
        text: '*Ramp-up schedule is illustrative. CAPI campaigns ramp with sales readiness and advertiser adoption. Actual timeline depends on deployment pace and organizational readiness.',
        style: 'footnote',
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
          'Target: measurable addressability improvement in Safari ad products',
          'Demonstrate real conversion reporting on Vox campaign reports',
          'Foundation for speaking to more users as addressable inventory'
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
        text: 'Key Assumptions',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Safari Traffic Share', style: 'tableLabel' },
              { text: '35%', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Current Safari Tracking', style: 'tableLabel' },
              { text: 'Limited (ITP restrictions)', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'POC Target', style: 'tableLabel' },
              { text: 'Measurable addressability improvement', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CPM uplift on newly addressable', style: 'tableLabel' },
              { text: '25%', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CAPI conversion improvement', style: 'tableLabel' },
              { text: '40%', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'CDP Monthly Savings', style: 'tableLabel' },
              { text: '$3,500', style: 'tableValue', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Scenario Parameters',
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
              { text: 'Adoption Rate', style: 'tableCell' },
              { text: formatPercentage(riskConfig.adoptionRate * 100), style: 'tableCell', alignment: 'center' },
              { text: 'Expected portfolio deployment percentage', style: 'tableCell' }
            ],
            [
              { text: 'Ramp-Up Period', style: 'tableCell' },
              { text: `${riskConfig.rampMonths} months`, style: 'tableCell', alignment: 'center' },
              { text: 'Time to reach full projected value', style: 'tableCell' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Important Caveats & Risk Factors',
        style: 'h3',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'This scenario model is subject to the following organizational factors which may significantly impact any realized outcomes:',
        style: 'caveatIntro',
        margin: [0, 0, 0, 8]
      },
      {
        ol: [
          { text: 'Sales Team Readiness: Training, incentives, and active pipeline development directly affect any revenue realization.' },
          { text: 'Technical Deployment: DNS setup, consent management, and ad server configuration timeline may extend ramp-up periods.' },
          { text: 'Advertiser Adoption: Willingness of advertisers to test CAPI and outcome-based buying varies by vertical and market conditions.' },
          { text: 'Project Ownership: Clear accountability and cross-functional alignment are required for successful execution.' },
          { text: 'Budget Environment: Advertiser spending confidence and market conditions influence campaign volumes and willingness to pay premium CPMs.' },
          { text: 'Training & Enablement: Structured training programs for sales and operations teams accelerate adoption but require investment.' },
          { text: 'Integration Delays: Dependencies on existing systems and potential deployment friction may impact timelines significantly.' },
          { text: 'Resource Availability: Dedicated engineering and operational resources are critical for implementation success.' }
        ],
        style: 'caveatList',
        margin: [0, 0, 0, 15]
      },
      {
        text: 'MODELING DISCLAIMER',
        style: 'disclaimerHeader',
        margin: [0, 0, 0, 6]
      },
      {
        text: 'This document presents scenario-based projections using industry benchmarks and stated assumptions as of December 2024. All figures are estimates only and do not constitute forecasts, commitments, or guarantees of performance. Actual results will depend on factors including but not limited to: deployment execution, advertiser demand, market conditions, sales team performance, and organizational readiness. AdFixus accepts no liability for variance between modeled projections and actual outcomes. This analysis is provided for planning and evaluation purposes only.',
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
      tableSubheader: {
        fontSize: 10,
        bold: true,
        color: '#475569',
        italics: true
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
      footnote: {
        fontSize: 8,
        color: '#64748B',
        italics: true
      },
      disclaimerBox: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.3
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
      disclaimerHeader: {
        fontSize: 9,
        bold: true,
        color: '#64748B'
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
