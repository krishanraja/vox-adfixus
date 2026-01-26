import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { formatCurrency, formatNumber, formatPercentage } from './formatting';
import { supabase } from '@/integrations/supabase/client';
import { VOX_MEDIA_DOMAINS, CONTRACT_PRICING } from '@/constants/voxMediaDomains';
import { CAPI_PRICING_MODEL } from '@/constants/industryBenchmarks';
import type { UnifiedResults, TimeframeType } from '@/types/scenarios';
import type { CalculatorResults } from '@/types';
import { getDealBreakdown } from './commercialCalculations';
import { calculateCampaignEconomics, calculateCampaignPortfolio, formatCampaignCurrency } from './campaignEconomicsCalculator';
import { CARSALES_PROOF_POINT, CAPI_ECONOMICS_CONSTANTS } from '@/types/campaignEconomics';

// Initialize pdfMake fonts with correct VFS structure
pdfMake.vfs = pdfFonts.vfs;

// Type guard to check if results are UnifiedResults
const isUnifiedResults = (results: any): results is UnifiedResults => {
  return results && 'idInfrastructure' in results && 'pricing' in results && 'roiAnalysis' in results;
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

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

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

// Risk scenario config
const RISK_SCENARIO_CONFIG = {
  conservative: { label: 'Conservative', adoptionRate: 0.70, rampMonths: 12 },
  moderate: { label: 'Moderate', adoptionRate: 0.75, rampMonths: 9 },
  optimistic: { label: 'Optimistic', adoptionRate: 0.92, rampMonths: 6 }
};

export const buildAdfixusProposalPdf = async (
  quizResults: any,
  calculatorResults: UnifiedResults | CalculatorResults,
  leadData?: any,
  timeframe: TimeframeType = '3-year'
) => {
  // Load logos
  const adfixusLogoDataUrl = await convertImageToBase64('/lovable-uploads/e51c9dd5-2c62-4f48-83ea-2b4cb61eed6c.png');
  const voxLogoDataUrl = await convertImageToBase64('/lovable-uploads/vox-media-logo.png');
  
  // Handle legacy CalculatorResults
  if (!isUnifiedResults(calculatorResults)) {
    return buildLegacyPdf(quizResults, calculatorResults, leadData, adfixusLogoDataUrl);
  }
  
  const results = calculatorResults;
  const generatedDate = formatDate(new Date());
  
  // Get deal breakdown - SINGLE SOURCE OF TRUTH
  const breakdown = getDealBreakdown(results, timeframe);
  
  if (!breakdown.isValid) {
    console.error('PDF VALIDATION FAILED:', breakdown.validationErrors);
  }
  
  // Core metrics from breakdown
  const displayTotal = breakdown.display.total;
  const displayIdInfra = breakdown.display.idInfrastructure;
  const displayCapi = breakdown.display.capi;
  const displayMedia = breakdown.display.mediaPerformance;
  const timeframeLabel = breakdown.display.label;
  
  // Monthly values for context
  const monthlyTotal = breakdown.monthly.total;
  const annualTotal = breakdown.year1.total;
  
  // CAPI configuration and portfolio
  const capiConfig = results.capiCapabilities?.capiConfiguration;
  const yearlyCampaigns = capiConfig?.yearlyCampaigns || 0;
  const avgCampaignSpend = capiConfig?.avgCampaignSpend || 79000;
  const portfolio = calculateCampaignPortfolio(yearlyCampaigns, avgCampaignSpend);
  
  // Risk scenario
  const riskScenario = results.riskScenario || 'moderate';
  const riskConfig = RISK_SCENARIO_CONFIG[riskScenario];
  
  // ROI metrics
  const roiMultiple = results.roiAnalysis?.roiMultiple?.fullContract || 0;
  
  // Selected domains
  const selectedDomains = results.inputs?.selectedDomains || [];
  
  // ID Infrastructure details
  const idInfra = results.idInfrastructure;
  const safariShare = idInfra?.details?.safariShare || 0.35;
  const currentAddressability = idInfra?.details?.currentAddressability || 0;
  const improvedAddressability = idInfra?.details?.improvedAddressability || 0;

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 60],
    
    info: {
      title: 'Vox Media × AdFixus Executive Brief',
      author: 'AdFixus',
      subject: 'Revenue Impact Analysis',
    },

    header: () => ({
      columns: [
        { image: adfixusLogoDataUrl, fit: [90, 24], margin: [40, 25, 0, 0] },
        { text: 'Executive Brief', style: 'headerTitle', alignment: 'center', margin: [0, 28, 0, 0], width: '*' },
        { image: voxLogoDataUrl, fit: [60, 22], alignment: 'right', margin: [0, 24, 40, 0] }
      ]
    }),

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: 'CONFIDENTIAL — Scenario Model', style: 'footerText', margin: [40, 0, 0, 0] },
        { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right', margin: [0, 0, 40, 0] }
      ]
    }),

    content: [
      // ==================== PAGE 1: EXECUTIVE DECISION SUMMARY ====================
      { text: 'Executive Decision Summary', style: 'h1', margin: [0, 0, 0, 15] },
      { text: `Generated: ${generatedDate} | Timeframe: ${timeframeLabel} | Scenario: ${riskConfig.label}`, style: 'metadata', margin: [0, 0, 0, 20] },
      
      // THE DECISION
      {
        table: {
          widths: ['*'],
          body: [[{
            text: [
              { text: 'THE QUESTION: ', bold: true },
              { text: 'Should Vox Media implement AdFixus identity infrastructure with a revenue share alignment model?' }
            ],
            style: 'decisionBox',
            fillColor: '#F0F9FF',
            margin: [15, 15, 15, 15]
          }]]
        },
        layout: { hLineWidth: () => 2, vLineWidth: () => 2, hLineColor: () => '#0EA5E9', vLineColor: () => '#0EA5E9' },
        margin: [0, 0, 0, 25]
      },
      
      // Hero Metrics
      { text: 'Projected Impact', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: `Total Value (${timeframeLabel})`, style: 'metricHeader', fillColor: '#DCFCE7' },
              { text: 'Monthly Incremental', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'ROI Multiple', style: 'metricHeader', fillColor: '#F1F5F9' }
            ],
            [
              { text: formatCurrency(displayTotal), style: 'metricValueHero', alignment: 'center', fillColor: '#F0FDF4' },
              { text: formatCurrency(monthlyTotal), style: 'metricValue', alignment: 'center' },
              { text: `${roiMultiple.toFixed(1)}x`, style: 'metricValue', alignment: 'center' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 20]
      },
      
      // Value Breakdown
      { text: 'Value Breakdown', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Benefit Category', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: `${timeframeLabel} Value`, style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: '% of Total', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'ID Infrastructure (Safari Recovery + CDP Savings)', style: 'tableCell' },
              { text: formatCurrency(displayIdInfra), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage((displayIdInfra / displayTotal) * 100), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'CAPI Capabilities (Conversion Tracking)', style: 'tableCell' },
              { text: formatCurrency(displayCapi), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage((displayCapi / displayTotal) * 100), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Media Performance (Premium Yield)', style: 'tableCell' },
              { text: formatCurrency(displayMedia), style: 'tableCell', alignment: 'right' },
              { text: formatPercentage((displayMedia / displayTotal) * 100), style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'TOTAL', style: 'tableCell', bold: true, fillColor: '#F0FDF4' },
              { text: formatCurrency(displayTotal), style: 'tableCell', bold: true, alignment: 'right', fillColor: '#F0FDF4' },
              { text: '100%', style: 'tableCell', bold: true, alignment: 'right', fillColor: '#F0FDF4' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 20]
      },
      
      // Recommendation Box
      {
        table: {
          widths: ['*'],
          body: [[{
            text: [
              { text: 'RECOMMENDATION: ', bold: true },
              { text: 'Proceed with Revenue Share alignment model. Structural benefits alone (ID Infrastructure + Media Performance) cover platform investment. CAPI upside scales with deployment aggressiveness.' }
            ],
            style: 'recommendationBox',
            fillColor: '#DCFCE7',
            margin: [15, 12, 15, 12]
          }]]
        },
        layout: { hLineWidth: () => 2, vLineWidth: () => 2, hLineColor: () => '#22C55E', vLineColor: () => '#22C55E' },
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 2: STRUCTURAL BENEFITS ====================
      { pageBreak: 'before', text: 'Structural Benefits: The Safe Bet', style: 'h1', margin: [0, 0, 0, 15] },
      { text: 'These benefits are predictable, low-variance, and cover the platform investment alone.', style: 'subtitle', margin: [0, 0, 0, 20] },
      
      // ID Infrastructure
      { text: 'ID Infrastructure', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [{ text: 'Safari Traffic Share', style: 'tableLabel' }, { text: formatPercentage(safariShare * 100), style: 'tableValue', alignment: 'right' }],
            [{ text: 'Current Addressability', style: 'tableLabel' }, { text: formatPercentage(currentAddressability * 100), style: 'tableValue', alignment: 'right' }],
            [{ text: 'Projected Addressability', style: 'tableLabel' }, { text: formatPercentage(improvedAddressability * 100), style: 'tableValue', alignment: 'right', color: '#15803D' }],
            [{ text: 'Addressability Revenue Impact', style: 'tableLabel' }, { text: formatCurrency(idInfra?.addressabilityRecovery || 0) + '/mo', style: 'tableValue', alignment: 'right' }],
            [{ text: 'CDP Cost Savings', style: 'tableLabel' }, { text: formatCurrency(idInfra?.cdpSavings || 0) + '/mo', style: 'tableValue', alignment: 'right' }],
            [{ text: 'ID Infrastructure Total', style: 'tableLabel', bold: true, fillColor: '#F0FDF4' }, { text: formatCurrency(breakdown.monthly.idInfrastructure) + '/mo', style: 'tableValue', bold: true, alignment: 'right', fillColor: '#F0FDF4' }]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 25]
      },
      
      // Media Performance
      { text: 'Media Performance', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            [{ text: 'Premium Inventory Pricing Power', style: 'tableLabel' }, { text: formatCurrency(results.mediaPerformance?.premiumPricingPower || 0) + '/mo', style: 'tableValue', alignment: 'right' }],
            [{ text: 'Make-Good Reduction', style: 'tableLabel' }, { text: formatCurrency(results.mediaPerformance?.makeGoodReduction || 0) + '/mo', style: 'tableValue', alignment: 'right' }],
            [{ text: 'Media Performance Total', style: 'tableLabel', bold: true, fillColor: '#F0FDF4' }, { text: formatCurrency(breakdown.monthly.mediaPerformance) + '/mo', style: 'tableValue', bold: true, alignment: 'right', fillColor: '#F0FDF4' }]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 25]
      },
      
      // Structural Total
      {
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: 'Combined Structural Benefits', style: 'h3', margin: [0, 0, 0, 5] },
              { text: formatCurrency(breakdown.monthly.idInfrastructure + breakdown.monthly.mediaPerformance) + '/month', style: 'heroValue' },
              { text: `${formatCurrency((breakdown.monthly.idInfrastructure + breakdown.monthly.mediaPerformance) * 12)}/year — covers platform investment with margin`, style: 'footnote', margin: [0, 5, 0, 0] }
            ],
            fillColor: '#F0FDF4',
            margin: [15, 15, 15, 15]
          }]]
        },
        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#22C55E', vLineColor: () => '#22C55E' },
        margin: [0, 0, 0, 20]
      },
      
      { text: 'Portfolio Coverage', style: 'h3', margin: [0, 0, 0, 10] },
      { text: `Selected ${selectedDomains.length} of ${VOX_MEDIA_DOMAINS.length} domains: ${selectedDomains.slice(0, 5).map(getDomainName).join(', ')}${selectedDomains.length > 5 ? ` +${selectedDomains.length - 5} more` : ''}`, style: 'body', margin: [0, 0, 0, 0] },

      // ==================== PAGE 3: CAPI OPPORTUNITY ====================
      { pageBreak: 'before', text: 'CAPI Opportunity: The Magic Upside', style: 'h1', margin: [0, 0, 0, 15] },
      { text: 'The more aggressively you deploy CAPI on large advertisers, the better the economics get.', style: 'subtitle', margin: [0, 0, 0, 20] },
      
      // Your CAPI Configuration
      { text: 'Your CAPI Configuration', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Yearly Campaigns', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Avg Campaign Spend', style: 'metricHeader', fillColor: '#F1F5F9' },
              { text: 'Annual Net to Vox', style: 'metricHeader', fillColor: '#DCFCE7' }
            ],
            [
              { text: `${yearlyCampaigns}`, style: 'metricValue', alignment: 'center' },
              { text: formatCurrency(avgCampaignSpend), style: 'metricValue', alignment: 'center' },
              { text: formatCurrency(portfolio.annualNet), style: 'metricValueHero', alignment: 'center', fillColor: '#F0FDF4' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 20]
      },
      
      // The Magic of the Cap
      {
        table: {
          widths: ['*'],
          body: [[{
            text: [
              { text: 'THE MAGIC OF THE $30K CAP: ', bold: true },
              { text: `At ${formatCurrency(CAPI_ECONOMICS_CONSTANTS.CAP_THRESHOLD)} campaign spend, the fee caps at $30K. Every dollar of incremental revenue above that goes 100% to Vox. Bigger campaigns = exponentially better ROI.` }
            ],
            style: 'disclaimerBox',
            fillColor: '#DBEAFE',
            margin: [12, 12, 12, 12]
          }]]
        },
        layout: { hLineWidth: () => 2, vLineWidth: () => 2, hLineColor: () => '#3B82F6', vLineColor: () => '#3B82F6' },
        margin: [0, 0, 0, 20]
      },
      
      // Campaign Economics Table
      { text: 'Campaign Economics by Size', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Campaign Spend', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Incremental (40%)', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Fee', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' },
              { text: 'Net to Vox', style: 'tableHeader', fillColor: '#DCFCE7', alignment: 'right' },
              { text: 'ROI', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' },
              { text: 'Status', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' }
            ],
            ...[79000, 150000, 300000, 500000, 1000000].map(spend => {
              const econ = calculateCampaignEconomics(spend);
              return [
                { text: formatCurrency(spend), style: 'tableCell' },
                { text: formatCurrency(econ.incrementalRevenue), style: 'tableCell', alignment: 'right' },
                { text: formatCurrency(econ.cappedFee), style: 'tableCell', alignment: 'right' },
                { text: formatCurrency(econ.netToPublisher), style: 'tableCell', alignment: 'right', fillColor: '#F0FDF4', bold: true },
                { text: `${econ.roiMultiple.toFixed(1)}x`, style: 'tableCell', alignment: 'center', color: econ.isCapped ? '#15803D' : '#475569' },
                { text: econ.isCapped ? 'CAP ✓' : '', style: 'tableCell', alignment: 'center', color: '#15803D' }
              ];
            })
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 20]
      },
      
      // CarSales Proof Point
      { text: 'Case Study: CarSales', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: `"${CARSALES_PROOF_POINT.quote}"`, style: 'quoteText', italics: true, margin: [0, 0, 0, 10] },
              { text: `— ${CARSALES_PROOF_POINT.author}, ${CARSALES_PROOF_POINT.title}, ${CARSALES_PROOF_POINT.company}`, style: 'quoteAttribution' },
              { text: '\n' },
              { 
                columns: [
                  { text: [{ text: '$1.8M\n', bold: true, fontSize: 14 }, 'New Revenue Won'], alignment: 'center' },
                  { text: [{ text: '100+\n', bold: true, fontSize: 14 }, 'CAPI Campaigns'], alignment: 'center' },
                  { text: [{ text: '$300K→$1M\n', bold: true, fontSize: 14 }, 'Largest Campaign'], alignment: 'center' }
                ]
              }
            ],
            fillColor: '#FFFBEB',
            margin: [15, 15, 15, 15]
          }]]
        },
        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#F59E0B', vLineColor: () => '#F59E0B' },
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 4: ALIGNMENT MODELS ====================
      { pageBreak: 'before', text: 'Alignment Models: Why Revenue Share Wins', style: 'h1', margin: [0, 0, 0, 15] },
      { text: 'The 12.5% revenue share with campaign cap is the only model with full incentive alignment.', style: 'subtitle', margin: [0, 0, 0, 20] },
      
      // Model Comparison Table
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Model', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Upfront Risk', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' },
              { text: 'Alignment', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' },
              { text: 'At Scale', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'center' },
              { text: 'Verdict', style: 'tableHeader', fillColor: '#F1F5F9' }
            ],
            [
              { text: 'Flat Fee ($1M/yr)', style: 'tableCell', bold: true },
              { text: 'HIGH', style: 'tableCell', fillColor: '#FEE2E2', alignment: 'center', color: '#DC2626' },
              { text: 'NONE', style: 'tableCell', fillColor: '#FEE2E2', alignment: 'center', color: '#DC2626' },
              { text: 'WORSE', style: 'tableCell', fillColor: '#FEE2E2', alignment: 'center', color: '#DC2626' },
              { text: 'Pay regardless of success', style: 'tableCell', color: '#DC2626' }
            ],
            [
              { text: 'Annual Cap ($1.2M)', style: 'tableCell', bold: true },
              { text: 'MED', style: 'tableCell', fillColor: '#FEF9C3', alignment: 'center', color: '#CA8A04' },
              { text: 'LIMITED', style: 'tableCell', fillColor: '#FEF9C3', alignment: 'center', color: '#CA8A04' },
              { text: 'CAPPED', style: 'tableCell', fillColor: '#FEF9C3', alignment: 'center', color: '#CA8A04' },
              { text: 'Partner incentive ends at cap', style: 'tableCell', color: '#CA8A04' }
            ],
            [
              { text: 'Revenue Share + Cap ✓', style: 'tableCell', bold: true, color: '#15803D' },
              { text: 'LOW', style: 'tableCell', fillColor: '#DCFCE7', alignment: 'center', color: '#15803D' },
              { text: 'FULL', style: 'tableCell', fillColor: '#DCFCE7', alignment: 'center', color: '#15803D' },
              { text: 'BETTER', style: 'tableCell', fillColor: '#DCFCE7', alignment: 'center', color: '#15803D' },
              { text: 'We only win when you win', style: 'tableCell', color: '#15803D', bold: true }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      
      // Negotiation Highlights
      { text: 'Negotiation Highlights (Extended to Mid-February)', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [[
            { text: [{ text: '23%\n', bold: true, fontSize: 16 }, 'Contract Discount'], style: 'tableCell', alignment: 'center', fillColor: '#DCFCE7' },
            { text: [{ text: '50%\n', bold: true, fontSize: 16 }, 'POC Discount'], style: 'tableCell', alignment: 'center', fillColor: '#DBEAFE' },
            { text: [{ text: '$11.25K\n', bold: true, fontSize: 16 }, 'Onboarding Waived'], style: 'tableCell', alignment: 'center', fillColor: '#F3E8FF' },
            { text: [{ text: '$30K\n', bold: true, fontSize: 16 }, 'Campaign Cap'], style: 'tableCell', alignment: 'center', fillColor: '#FEF3C7' }
          ]]
        },
        layout: { ...tableLayout, paddingTop: () => 12, paddingBottom: () => 12 },
        margin: [0, 0, 0, 25]
      },
      
      // Key Insight
      {
        table: {
          widths: ['*'],
          body: [[{
            text: [
              { text: 'KEY INSIGHT: ', bold: true },
              { text: 'Revenue share creates a partnership where both parties are invested in growth. The other models create vendor relationships with misaligned incentives.' }
            ],
            style: 'disclaimerBox',
            fillColor: '#DCFCE7',
            margin: [12, 12, 12, 12]
          }]]
        },
        layout: { hLineWidth: () => 2, vLineWidth: () => 2, hLineColor: () => '#22C55E', vLineColor: () => '#22C55E' },
        margin: [0, 0, 0, 0]
      },

      // ==================== PAGE 5: IMPLEMENTATION & NEXT STEPS ====================
      { pageBreak: 'before', text: 'Implementation & Next Steps', style: 'h1', margin: [0, 0, 0, 15] },
      
      // Timeline
      { text: 'Implementation Timeline', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['auto', '*', 'auto'],
          body: [
            [
              { text: 'Phase', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Objective', style: 'tableHeader', fillColor: '#F1F5F9' },
              { text: 'Duration', style: 'tableHeader', fillColor: '#F1F5F9', alignment: 'right' }
            ],
            [
              { text: 'Technical Integration', style: 'tableCell', bold: true },
              { text: 'ID deployment + stack integration (GAM, analytics, segments)', style: 'tableCell' },
              { text: '3-6 weeks', style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'POC Phase', style: 'tableCell', bold: true },
              { text: 'Validate addressability uplift on POC domains', style: 'tableCell' },
              { text: 'Months 1-3', style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Scaling Phase', style: 'tableCell', bold: true },
              { text: 'Expand to additional domains, begin CAPI campaigns', style: 'tableCell' },
              { text: 'Months 4-6', style: 'tableCell', alignment: 'right' }
            ],
            [
              { text: 'Value Phase', style: 'tableCell', bold: true },
              { text: 'Full ROI realization, CAPI at scale, premium yield', style: 'tableCell' },
              { text: 'Months 7-12', style: 'tableCell', alignment: 'right' }
            ]
          ]
        },
        layout: tableLayout,
        margin: [0, 0, 0, 25]
      },
      
      // POC Success Criteria
      { text: 'POC Success Criteria', style: 'h3', margin: [0, 0, 0, 10] },
      {
        ol: [
          { text: [{ text: 'ID Deployment: ', bold: true }, 'ClientID deployed across POC domains, passing into GAM as PPID'] },
          { text: [{ text: 'Addressability: ', bold: true }, 'Measurable Safari impressions uplift within 30 days'] },
          { text: [{ text: 'Identity Durability: ', bold: true }, 'ID consistency verified across NYMag cluster + Verge/Vox domains'] },
          { text: [{ text: 'Strategic Foundation: ', bold: true }, 'Real conversion reporting demonstrated on Vox campaign reports'] }
        ],
        style: 'listItem',
        margin: [0, 0, 0, 25]
      },
      
      // Assumptions
      { text: 'Key Assumptions', style: 'h3', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto', '*', 'auto'],
          body: [
            [
              { text: 'Safari Share', style: 'tableLabel' },
              { text: '35%', style: 'tableValue', alignment: 'right' },
              { text: 'CPM Uplift', style: 'tableLabel' },
              { text: '25%', style: 'tableValue', alignment: 'right' }
            ],
            [
              { text: 'Adoption Rate', style: 'tableLabel' },
              { text: formatPercentage(riskConfig.adoptionRate * 100), style: 'tableValue', alignment: 'right' },
              { text: 'CAPI Improvement', style: 'tableLabel' },
              { text: '40%', style: 'tableValue', alignment: 'right' }
            ]
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 25]
      },
      
      // Disclaimer
      { text: 'SCENARIO MODEL DISCLAIMER', style: 'disclaimerHeader', margin: [0, 0, 0, 6] },
      { 
        text: 'This document presents scenario-based projections using industry benchmarks and stated assumptions. All figures are estimates only and do not constitute forecasts or guarantees. Actual results depend on deployment execution, advertiser demand, market conditions, and organizational readiness.',
        style: 'disclaimer',
        margin: [0, 0, 0, 0]
      }
    ],

    styles: {
      headerTitle: { fontSize: 10, bold: true, color: '#1E293B' },
      footerText: { fontSize: 7, color: '#64748B', italics: true },
      h1: { fontSize: 18, bold: true, color: '#0F172A' },
      h3: { fontSize: 12, bold: true, color: '#1E293B' },
      subtitle: { fontSize: 10, color: '#64748B', italics: true },
      metadata: { fontSize: 9, color: '#64748B' },
      body: { fontSize: 10, color: '#475569', lineHeight: 1.4 },
      tableHeader: { fontSize: 9, bold: true, color: '#1E293B' },
      tableCell: { fontSize: 9, color: '#475569' },
      tableLabel: { fontSize: 10, color: '#475569' },
      tableValue: { fontSize: 10, color: '#1E293B' },
      metricHeader: { fontSize: 9, bold: true, color: '#1E293B', alignment: 'center' },
      metricValue: { fontSize: 14, bold: true, color: '#1E293B' },
      metricValueHero: { fontSize: 18, bold: true, color: '#15803D' },
      heroValue: { fontSize: 24, bold: true, color: '#15803D' },
      listItem: { fontSize: 10, color: '#475569', lineHeight: 1.5 },
      footnote: { fontSize: 8, color: '#64748B', italics: true },
      decisionBox: { fontSize: 11, color: '#0369A1', lineHeight: 1.4 },
      recommendationBox: { fontSize: 10, color: '#15803D', lineHeight: 1.4 },
      disclaimerBox: { fontSize: 9, color: '#475569', lineHeight: 1.3 },
      quoteText: { fontSize: 10, color: '#92400E', lineHeight: 1.4 },
      quoteAttribution: { fontSize: 9, color: '#B45309' },
      disclaimerHeader: { fontSize: 9, bold: true, color: '#64748B' },
      disclaimer: { fontSize: 8, color: '#94A3B8', italics: true, lineHeight: 1.3 }
    }
  };

  // Generate and download PDF
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBase64(async (base64Data) => {
      try {
        const filename = `Vox_Media_Executive_Brief_${new Date().toISOString().split('T')[0]}.pdf`;
        pdfMake.createPdf(docDefinition).download(filename);
        
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

// Legacy PDF builder
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
    header: () => ({ columns: [{ image: logoDataUrl, fit: [100, 28], margin: [40, 20, 0, 0] }, { text: 'Identity ROI Analysis', style: 'headerTitle', alignment: 'right', margin: [0, 25, 40, 0] }] }),
    footer: (currentPage: number, pageCount: number) => ({ columns: [{ text: 'CONFIDENTIAL', style: 'footerText', margin: [40, 0, 0, 0] }, { text: `Page ${currentPage} of ${pageCount}`, style: 'footerText', alignment: 'right', margin: [0, 0, 40, 0] }] }),
    content: [
      { text: 'Executive Summary', style: 'h1', margin: [0, 0, 0, 20] },
      { table: { widths: ['*', '*'], body: [[{ text: 'Monthly Uplift', style: 'metricHeader', fillColor: '#F1F5F9' }, { text: 'Annual Projection', style: 'metricHeader', fillColor: '#F1F5F9' }], [{ text: formatCurrency(monthlyUplift), style: 'metricValue', alignment: 'center' }, { text: formatCurrency(annualUplift), style: 'metricValue', alignment: 'center' }]] }, layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#CBD5E1', vLineColor: () => '#CBD5E1', paddingTop: () => 8, paddingBottom: () => 8 }, margin: [0, 0, 0, 20] }
    ],
    styles: { headerTitle: { fontSize: 10, bold: true, color: '#1E293B' }, footerText: { fontSize: 7, color: '#64748B', italics: true }, h1: { fontSize: 18, bold: true, color: '#0F172A' }, metricHeader: { fontSize: 9, bold: true, color: '#1E293B', alignment: 'center' }, metricValue: { fontSize: 14, bold: true, color: '#1E293B' } }
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

// Legacy function for backward compatibility
export const generatePDF = buildAdfixusProposalPdf;

// Email sending functionality
export const sendPDFByEmail = async (pdfBase64: string, quizResults: any, calculatorResults: any, leadData?: any) => {
  try {
    if (!leadData || !leadData.email) {
      console.warn('No lead data or email found');
    }
    
    const { data, error } = await supabase.functions.invoke('send-pdf-email', {
      body: {
        pdfBase64,
        contactForm: leadData || { firstName: 'Unknown', lastName: 'User', email: 'unknown@example.com', company: 'Unknown Company' },
        userContactDetails: leadData || { firstName: 'Unknown', lastName: 'User', email: 'unknown@example.com', company: 'Unknown Company' },
        quizResults,
        calculatorResults
      }
    });

    if (error) throw new Error(`Email service error: ${error.message || 'Unknown error'}`);
    return data;
  } catch (error: any) {
    console.error('Error sending PDF email:', error);
    throw new Error(`Email delivery failed: ${error.message || 'Failed to send email'}`);
  }
};
