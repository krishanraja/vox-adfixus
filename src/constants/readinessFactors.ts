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
}

export const READINESS_PRESETS: Record<'weak' | 'moderate' | 'strong', ReadinessFactors> = {
  weak: {
    salesReadiness: 0.5,
    technicalDeploymentMonths: 18,
    advertiserBuyIn: 0.6,
    organizationalOwnership: 0.6,
    marketConditions: 0.7,
  },
  moderate: {
    salesReadiness: 0.75,
    technicalDeploymentMonths: 12,
    advertiserBuyIn: 0.8,
    organizationalOwnership: 0.8,
    marketConditions: 0.85,
  },
  strong: {
    salesReadiness: 1.0,
    technicalDeploymentMonths: 6,
    advertiserBuyIn: 1.0,
    organizationalOwnership: 1.0,
    marketConditions: 1.0,
  },
};

// Convert readiness factors to risk scenario (for reference)
export function readinessToRiskScenario(factors: ReadinessFactors): RiskScenario {
  const avgReadiness = (
    factors.salesReadiness + 
    factors.advertiserBuyIn + 
    factors.organizationalOwnership + 
    factors.marketConditions
  ) / 4;
  
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
};
