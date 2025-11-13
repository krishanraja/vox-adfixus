import type { RiskScenario } from './riskScenarios';

// Business readiness factors that impact ROI realization
export interface ReadinessFactors {
  // 1. Sales & Commercial Execution (0-1 scale)
  salesReadiness: number; // 0.5 = not trained, 1.0 = fully trained & incentivized
  
  // 2. Technical Deployment Speed (months)
  technicalDeploymentMonths: number; // 3 = fast, 6 = normal, 12+ = slow
  
  // 3. Advertiser Adoption Rate
  advertiserBuyIn: number; // 0.6 = skeptical, 0.8 = interested, 1.0 = committed
  
  // 4. Organizational Ownership (0-1 scale)
  organizationalOwnership: number; // 0.6 = split ownership, 1.0 = dedicated owner
  
  // 5. Market Conditions
  marketConditions: number; // 0.7 = recession/cautious, 1.0 = growth mode
  
  // 6. Training Gaps (0-1 scale)
  trainingGaps: number; // 0.5 = no training plan, 1.0 = comprehensive training
  
  // 7. Integration Complexity (0-1 scale)
  integrationComplexity: number; // 0.6 = many dependencies, 1.0 = clean integration
  
  // 8. Data Quality (0-1 scale)
  dataQuality: number; // 0.6 = fragmented data, 1.0 = clean first-party data
  
  // 9. Resource Availability (0-1 scale)
  resourceAvailability: number; // 0.6 = shared resources, 1.0 = dedicated team
}

export const READINESS_PRESETS: Record<'conservative' | 'normal' | 'optimistic', ReadinessFactors> = {
  conservative: {
    salesReadiness: 0.5,
    technicalDeploymentMonths: 18,
    advertiserBuyIn: 0.6,
    organizationalOwnership: 0.6,
    marketConditions: 0.7,
    trainingGaps: 0.5,
    integrationComplexity: 0.6,
    dataQuality: 0.6,
    resourceAvailability: 0.6,
  },
  normal: {
    salesReadiness: 0.75,
    technicalDeploymentMonths: 12,
    advertiserBuyIn: 0.8,
    organizationalOwnership: 0.8,
    marketConditions: 0.85,
    trainingGaps: 0.75,
    integrationComplexity: 0.8,
    dataQuality: 0.8,
    resourceAvailability: 0.75,
  },
  optimistic: {
    salesReadiness: 1.0,
    technicalDeploymentMonths: 6,
    advertiserBuyIn: 1.0,
    organizationalOwnership: 1.0,
    marketConditions: 1.0,
    trainingGaps: 1.0,
    integrationComplexity: 1.0,
    dataQuality: 1.0,
    resourceAvailability: 1.0,
  },
};

// Convert readiness factors to risk scenario (for reference)
export function readinessToRiskScenario(factors: ReadinessFactors): RiskScenario {
  const avgReadiness = (
    factors.salesReadiness + 
    factors.advertiserBuyIn + 
    factors.organizationalOwnership + 
    factors.marketConditions +
    (factors.trainingGaps ?? 0.75) +
    (factors.integrationComplexity ?? 0.8) +
    (factors.dataQuality ?? 0.8) +
    (factors.resourceAvailability ?? 0.75)
  ) / 8;
  
  if (avgReadiness >= 0.9) return 'optimistic';
  if (avgReadiness >= 0.7) return 'moderate';
  return 'conservative';
}

export const READINESS_DESCRIPTIONS = {
  salesReadiness: {
    title: 'Sales Team Readiness',
    description: 'Training, incentives, and active pipeline',
    tooltip: 'Are sellers trained on addressable products? Are incentives aligned? Do you have active RFPs for outcome-based campaigns?',
    low: '🔴 Not Trained',
    medium: '🟡 Basic Training',
    high: '🟢 Fully Enabled',
  },
  technicalDeploymentMonths: {
    title: 'Deployment Timeline',
    description: 'Time to full cross-domain deployment',
    tooltip: 'DNS setup, consent management, ad server config. Fast = 3mo (dedicated eng), Normal = 6-12mo, Slow = 12+ mo (resource constrained)',
  },
  advertiserBuyIn: {
    title: 'Advertiser Adoption',
    description: 'Willingness to test CAPI & outcome-based buying',
    tooltip: 'Do advertisers trust publisher IDs? Are agencies onboarded? Can buyers ingest AdFixus IDs into their attribution?',
    low: '🔴 Skeptical',
    medium: '🟡 Interested',
    high: '🟢 Committed',
  },
  organizationalOwnership: {
    title: 'Project Ownership',
    description: 'Clear accountability and cross-functional alignment',
    tooltip: 'Is there a single owner? Are sales, tech, and data teams aligned? Do you have exec sponsorship?',
    low: '🔴 Split Teams',
    medium: '🟡 Shared Ownership',
    high: '🟢 Dedicated Owner',
  },
  marketConditions: {
    title: 'Budget Environment',
    description: 'Advertiser spending confidence and risk appetite',
    tooltip: 'Are advertisers in growth mode or cutting budgets? Is there confidence in new publisher tech investments?',
    low: '🔴 Cautious',
    medium: '🟡 Stable',
    high: '🟢 Growth Mode',
  },
  trainingGaps: {
    title: 'Training & Enablement',
    description: 'Comprehensive training plan for sales and operations',
    tooltip: 'Do you have a structured training program? Are there regular enablement sessions? Can your team articulate the value proposition?',
    low: '🔴 No Training Plan',
    medium: '🟡 Basic Training',
    high: '🟢 Comprehensive Program',
  },
  integrationComplexity: {
    title: 'Integration Complexity',
    description: 'Technical dependencies and system integration difficulty',
    tooltip: 'How many systems need updates? Are APIs well-documented? Do you have test environments? Clean integration = few dependencies.',
    low: '🔴 Many Dependencies',
    medium: '🟡 Moderate Complexity',
    high: '🟢 Clean Integration',
  },
  dataQuality: {
    title: 'First-Party Data Quality',
    description: 'Cleanliness and completeness of user data',
    tooltip: 'Is your user data clean and well-structured? Do you have good email coverage? Are authentication rates high?',
    low: '🔴 Fragmented Data',
    medium: '🟡 Decent Quality',
    high: '🟢 High Quality',
  },
  resourceAvailability: {
    title: 'Resource Availability',
    description: 'Dedicated engineering and operational resources',
    tooltip: 'Do you have dedicated engineers for this project? Or are resources shared across multiple initiatives?',
    low: '🔴 Shared Resources',
    medium: '🟡 Part-Time Dedication',
    high: '🟢 Dedicated Team',
  },
};
