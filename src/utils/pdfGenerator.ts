import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { formatCurrency, formatNumber, formatPercentage } from './formatting';
import { generateKeyRecommendations } from './recommendations';
import { getGrade } from './grading';
import { supabase } from '@/integrations/supabase/client';

// Initialize pdfMake fonts with correct VFS structure
pdfMake.vfs = pdfFonts.vfs;

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

export const buildAdfixusProposalPdf = async (
  quizResults: any,
  calculatorResults: any,
  leadData?: any
) => {
  const logoDataUrl = await convertImageToBase64('/lovable-uploads/e51c9dd5-2c62-4f48-83ea-2b4cb61eed6c.png');
  
  // Extract data from unified results structure (new scenario modeler format)
  const results = calculatorResults;
  const monthlyUplift = results?.totals?.totalMonthlyUplift || 0;
  const annualUplift = results?.totals?.totalAnnualUplift || 0;
  const threeYearProjection = results?.totals?.threeYearProjection || 0;
  
  // Extract component uplifts
  const idInfraMonthly = results?.idInfrastructure?.monthlyUplift || 0;
  const capiMonthly = results?.capiCapabilities?.monthlyUplift || 0;
  const performanceMonthly = results?.mediaPerformance?.monthlyUplift || 0;
  
  // Get risk scenario info
  const riskScenario = results?.riskScenario || 'moderate';
  const riskScenarioLabels = {
    conservative: 'Conservative (60% adoption, 18-month ramp)',
    moderate: 'Moderate (80% adoption, 12-month ramp)',
    optimistic: 'Optimistic (100% adoption, 6-month ramp)'
  };
  
  // Get selected domains
  const selectedDomains = results?.inputs?.selectedDomains || [];
  const domainNames = selectedDomains.map((id: string) => {
    const domainMap: Record<string, string> = {
      'the-verge': 'The Verge',
      'vox': 'Vox',
      'polygon': 'Polygon',
      'eater': 'Eater',
      'curbed': 'Curbed',
      'thrillist': 'Thrillist',
      'popsugar': 'PopSugar',
      'nymag': 'New York Magazine',
      'vulture': 'Vulture',
      'the-cut': 'The Cut',
      'grub-street': 'Grub Street',
      'intelligencer': 'Intelligencer'
    };
    return domainMap[id] || id;
  });
  
  const recommendations = generateKeyRecommendations(calculatorResults);

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    header: function(currentPage: number) {
      return {
        columns: [
          {
            image: logoDataUrl,
            fit: [100, 28],
            margin: [40, 20, 0, 0]
          },
          {
            text: 'AdFixus - Vox Media ID ROI',
            style: 'reportTitle',
            alignment: 'right',
            margin: [0, 25, 40, 0]
          }
        ]
      };
    },

    footer: function(currentPage: number, pageCount: number) {
      return {
        columns: [
          {
            text: 'CONFIDENTIAL - Executive Use Only',
            style: 'footer',
            margin: [40, 0, 0, 0]
          },
          {
            text: `${currentPage} of ${pageCount}`,
            style: 'footer',
            alignment: 'right',
            margin: [0, 0, 40, 0]
          }
        ]
      };
    },

    content: [
      // Page 1: Executive Summary
      {
        stack: [
          {
            text: 'Executive Summary',
            style: 'h1',
            margin: [0, 10, 0, 20]
          },
          {
            text: 'Current State: Revenue at Risk',
            style: 'h2',
            margin: [0, 0, 0, 10]
          },
          {
            text: domainNames.length > 0 
              ? `Your selected Vox Media properties (${domainNames.join(', ')}) face significant addressability challenges in Safari and privacy-focused browsers. Third-party cookie deprecation has reduced conversion tracking accuracy, leading to suboptimal campaign performance and revenue leakage across your advertising inventory.`
              : 'Your Vox Media properties face significant addressability challenges in Safari and privacy-focused browsers. Third-party cookie deprecation has reduced conversion tracking accuracy, leading to suboptimal campaign performance and revenue leakage across your advertising inventory.',
            style: 'body',
            margin: [0, 0, 0, 15]
          },
          {
            text: 'AdFixus Solution: Identity Infrastructure for Premium Publishers',
            style: 'h2',
            margin: [0, 10, 0, 10]
          },
          {
            text: 'AdFixus provides durable identity resolution that restores addressability in Safari/iOS environments, enables precision conversion tracking through CAPI, and unlocks premium CPMs through improved targeting. Our solution delivers measurable revenue uplift through enhanced ID infrastructure, CAPI capabilities, and media performance optimization.',
            style: 'body',
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Revenue Impact Projection',
            style: 'h2',
            margin: [0, 10, 0, 10]
          },
          {
            text: `Implementation of AdFixus across your selected properties is projected to generate ${formatCurrency(monthlyUplift)} in monthly incremental revenue, translating to ${formatCurrency(annualUplift)} annually.`,
            style: 'body',
            margin: [0, 0, 0, 15]
          },
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { text: 'Monthly Incremental Revenue', style: 'tableHeader', fillColor: '#F8FAFC' },
                  { text: 'Annual Projection', style: 'tableHeader', fillColor: '#F8FAFC' },
                  { text: '3-Year Projection', style: 'tableHeader', fillColor: '#F8FAFC' }
                ],
                [
                  { text: formatCurrency(monthlyUplift), style: 'tableValue', alignment: 'center' },
                  { text: formatCurrency(annualUplift), style: 'tableValue', alignment: 'center' },
                  { text: formatCurrency(threeYearProjection), style: 'tableValue', alignment: 'center' }
                ]
              ]
            },
            layout: {
              hLineWidth: function (i: number, node: any) { return 1; },
              vLineWidth: function (i: number, node: any) { return 1; },
              hLineColor: function (i: number, node: any) { return '#E2E8F0'; },
              vLineColor: function (i: number, node: any) { return '#E2E8F0'; },
              paddingTop: function(i: number) { return 8; },
              paddingBottom: function(i: number) { return 8; }
            },
            margin: [0, 0, 0, 25]
          },
          {
            text: 'Contact AdFixus Sales Team',
            style: 'h2',
            margin: [0, 10, 0, 10]
          },
          {
            text: 'Email: sales@adfixus.com',
            style: 'body',
            margin: [0, 0, 0, 5]
          },
          {
            text: 'Book A Call',
            style: 'link',
            link: import.meta.env.VITE_MEETING_BOOKING_URL || 'https://outlook.office.com/book/SalesTeambooking@adfixus.com',
            margin: [0, 0, 0, 0]
          }
        ]
      },

      // Page 2: Detailed Revenue Analysis
      {
        pageBreak: 'before',
        stack: [
          {
            text: 'Detailed Revenue Analysis',
            style: 'h1',
            margin: [0, 10, 0, 20]
          },
          {
            text: 'Current Risk Assessment',
            style: 'h2',
            margin: [0, 0, 0, 10]
          },
          {
            text: `This analysis is based on the ${riskScenarioLabels[riskScenario]} scenario, which accounts for implementation challenges, sales enablement requirements, and advertiser adoption timelines. All projections reflect realistic deployment constraints.`,
            style: 'body',
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Revenue Impact by Source',
            style: 'h2',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                [
                  { text: 'Revenue Source', style: 'tableHeader', fillColor: '#F8FAFC' },
                  { text: 'Monthly Uplift', style: 'tableHeader', fillColor: '#F8FAFC' },
                  { text: 'Annual Uplift', style: 'tableHeader', fillColor: '#F8FAFC' }
                ],
                ...(idInfraMonthly > 0 ? [[
                  { text: 'ID Infrastructure', style: 'body' },
                  { text: formatCurrency(idInfraMonthly), style: 'body', alignment: 'right' },
                  { text: formatCurrency(idInfraMonthly * 12), style: 'body', alignment: 'right' }
                ]] : []),
                ...(capiMonthly > 0 ? [[
                  { text: 'CAPI Capabilities', style: 'body' },
                  { text: formatCurrency(capiMonthly), style: 'body', alignment: 'right' },
                  { text: formatCurrency(capiMonthly * 12), style: 'body', alignment: 'right' }
                ]] : []),
                ...(performanceMonthly > 0 ? [[
                  { text: 'Media Performance', style: 'body' },
                  { text: formatCurrency(performanceMonthly), style: 'body', alignment: 'right' },
                  { text: formatCurrency(performanceMonthly * 12), style: 'body', alignment: 'right' }
                ]] : []),
                [
                  { text: 'TOTAL', style: 'tableHeader', fillColor: '#F8FAFC' },
                  { text: formatCurrency(monthlyUplift), style: 'tableHeader', fillColor: '#F8FAFC', alignment: 'right' },
                  { text: formatCurrency(annualUplift), style: 'tableHeader', fillColor: '#F8FAFC', alignment: 'right' }
                ]
              ]
            },
            layout: {
              hLineWidth: function (i: number, node: any) { return 1; },
              vLineWidth: function (i: number, node: any) { return 1; },
              hLineColor: function (i: number, node: any) { return '#E2E8F0'; },
              vLineColor: function (i: number, node: any) { return '#E2E8F0'; },
              paddingTop: function(i: number) { return 6; },
              paddingBottom: function(i: number) { return 6; }
            },
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Key Implementation Benefits',
            style: 'h2',
            margin: [0, 10, 0, 10]
          },
          {
            ul: [
              'Restored addressability in Safari/iOS through durable ID technology',
              'Enhanced conversion tracking via server-side CAPI integration',
              'Premium CPM uplift through improved audience targeting',
              'Reduced CDP/martech costs through optimized identity management',
              'Future-proof revenue stream against evolving privacy regulations'
            ].map(item => ({ text: item, style: 'body', margin: [0, 0, 0, 5] })),
            margin: [0, 0, 0, 0]
          }
        ]
      },

      // Page 3: Strategic Action Plan
      {
        pageBreak: 'before',
        stack: [
          {
            text: 'Strategic Action Plan',
            style: 'h1',
            margin: [0, 10, 0, 20]
          },
          {
            text: 'Priority Recommendations',
            style: 'h2',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto'],
              body: [
                [
                  { text: 'Priority', style: 'tableHeader', fillColor: '#F8FAFC' },
                  { text: 'Recommendation', style: 'tableHeader', fillColor: '#F8FAFC' },
                  { text: 'Timeline', style: 'tableHeader', fillColor: '#F8FAFC' }
                ],
                [
                  { text: 'HIGH', style: 'priorityHigh', bold: true },
                  { text: 'Immediate AdFixus deployment on top revenue-generating domains', style: 'body' },
                  { text: 'Week 1-2', style: 'body' }
                ],
                [
                  { text: 'MEDIUM', style: 'priorityMedium', bold: true },
                  { text: 'Sales team enablement and advertiser demand optimization', style: 'body' },
                  { text: 'Week 3-4', style: 'body' }
                ],
                [
                  { text: 'LOW', style: 'priorityLow', bold: true },
                  { text: 'Advanced attribution modeling and audience expansion', style: 'body' },
                  { text: 'Week 5-8', style: 'body' }
                ]
              ]
            },
            layout: {
              hLineWidth: function (i: number, node: any) { return 1; },
              vLineWidth: function (i: number, node: any) { return 1; },
              hLineColor: function (i: number, node: any) { return '#E2E8F0'; },
              vLineColor: function (i: number, node: any) { return '#E2E8F0'; },
              paddingTop: function(i: number) { return 6; },
              paddingBottom: function(i: number) { return 6; }
            },
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Implementation Roadmap',
            style: 'h2',
            margin: [0, 10, 0, 10]
          },
          {
            ol: [
              'Week 1: Technical integration and initial AdFixus ID setup',
              'Week 2-3: Quality assurance testing and gradual traffic ramp',
              'Week 4: Full deployment and advertiser demand optimization',
              'Week 5-6: Performance monitoring and fine-tuning',
              'Week 7-8: Advanced features rollout and reporting setup'
            ].map(item => ({ text: item, style: 'body', margin: [0, 0, 0, 5] })),
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Immediate Next Steps',
            style: 'h2',
            margin: [0, 10, 0, 10]
          },
          {
            ol: [
              'Secure executive approval for AdFixus implementation',
              'Confirm pilot domain selection and technical requirements',
              'Establish baseline KPI measurement and reporting framework',
              'Contact AdFixus implementation team to schedule technical onboarding',
              'Define go-live timeline and success metrics'
            ].map(item => ({ text: item, style: 'body', margin: [0, 0, 0, 5] })),
            margin: [0, 0, 0, 25]
          },
          {
            text: 'Contact AdFixus Sales Team',
            style: 'h2',
            margin: [0, 10, 0, 10]
          },
          {
            text: 'Email: sales@adfixus.com',
            style: 'body',
            margin: [0, 0, 0, 5]
          },
          {
            text: 'Book A Call',
            style: 'link',
            link: import.meta.env.VITE_MEETING_BOOKING_URL || 'https://outlook.office.com/book/SalesTeambooking@adfixus.com',
            margin: [0, 0, 0, 0]
          }
        ]
      }
    ],

    styles: {
      reportTitle: {
        fontSize: 11,
        bold: true,
        color: '#1E293B'
      },
      h1: {
        fontSize: 18,
        bold: true,
        color: '#1E293B'
      },
      h2: {
        fontSize: 14,
        bold: true,
        color: '#1E293B'
      },
      body: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.5
      },
      footer: {
        fontSize: 8,
        color: '#64748B',
        italics: true
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: '#1E293B'
      },
      tableValue: {
        fontSize: 12,
        bold: true,
        color: '#0891b2'
      },
      link: {
        fontSize: 10,
        color: '#0891b2',
        decoration: 'underline'
      },
      priorityHigh: {
        fontSize: 9,
        color: '#DC2626',
        bold: true
      },
      priorityMedium: {
        fontSize: 9,
        color: '#F59E0B',
        bold: true
      },
      priorityLow: {
        fontSize: 9,
        color: '#10B981',
        bold: true
      }
    }
  };

  // Generate PDF buffer for email sending
  return new Promise((resolve, reject) => {
    pdfMake.createPdf(docDefinition).getBase64(async (base64Data) => {
      try {
        console.log('PDF generated successfully, attempting download and email...');
        
        // Download PDF for user first (this should always work)
        pdfMake.createPdf(docDefinition).download('AdFixus - Vox Media ID ROI.pdf');
        console.log('PDF download initiated');
        
        // Attempt to send email with PDF
        try {
          await sendPDFByEmail(base64Data, quizResults, calculatorResults, leadData);
          console.log('Email sent successfully');
          resolve({ pdfBase64: base64Data, emailSent: true });
        } catch (emailError) {
          console.error('Email sending failed, but PDF was downloaded:', emailError);
          // Resolve anyway since PDF download succeeded
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
    
    // Validate lead data structure
    if (!leadData || !leadData.email) {
      console.warn('No lead data or email found, using default values');
    }
    
    const { data, error } = await supabase.functions.invoke('send-pdf-email', {
      body: {
        pdfBase64,
        // Send both formats for backward compatibility
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
      console.error('Error details:', {
        message: error.message,
        context: error.context,
        hint: error.hint,
        details: error.details
      });
      throw new Error(`Email service error: ${error.message || 'Unknown error'}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error sending PDF email:', error);
    console.error('Full error object:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Provide more specific error information
    const errorMessage = error.message || 'Failed to send email';
    throw new Error(`Email delivery failed: ${errorMessage}`);
  }
};
