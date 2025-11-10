import type { CalculatorResults } from '@/types';
import type { UnifiedResults } from '@/types/scenarios';

export const generateKeyRecommendations = (
  calculatorResults: CalculatorResults | UnifiedResults
): string[] => {
  const recommendations: string[] = [];
  
  // Check if this is UnifiedResults (new structure) or CalculatorResults (old structure)
  const isUnifiedResults = 'idInfrastructure' in calculatorResults;
  
  if (isUnifiedResults) {
    // New UnifiedResults structure
    const results = calculatorResults as UnifiedResults;
    
    // Use addressability data from ID Infrastructure
    const currentAddressability = results.idInfrastructure?.details?.currentAddressability || 0;
    const improvedAddressability = results.idInfrastructure?.details?.improvedAddressability || 0;
    const addressabilityGap = improvedAddressability - currentAddressability;
    
    if (addressabilityGap > 20) {
      recommendations.push('• Implement comprehensive identity resolution to address significant unaddressable inventory');
    } else if (addressabilityGap > 10) {
      recommendations.push('• Optimize identity resolution to capture remaining unaddressable inventory');
    } else {
      recommendations.push('• Fine-tune identity resolution for maximum addressability rates');
    }
    
    // Domain recommendations
    if (results.inputs?.selectedDomains?.length > 3) {
      recommendations.push('• Implement cross-domain identity resolution for multi-domain operations');
    }
    
    // CAPI recommendations
    if (results.capiCapabilities && results.capiCapabilities.monthlyUplift > 0) {
      recommendations.push('• Leverage CAPI for improved conversion tracking and match rates');
    }
    
    // Media Performance recommendations
    if (results.mediaPerformance && results.mediaPerformance.monthlyUplift > 0) {
      recommendations.push('• Optimize media performance to maximize advertiser ROAS');
    }
    
    // General recommendations
    if (currentAddressability < 70) {
      recommendations.push('• Priority focus on improving overall addressability rates');
    }
    
  } else {
    // Old CalculatorResults structure (keep existing logic)
    const oldResults = calculatorResults as CalculatorResults;
    
    if (oldResults.unaddressableInventory.percentage > 20) {
      recommendations.push('• Implement comprehensive identity resolution to address significant unaddressable inventory');
    } else if (oldResults.unaddressableInventory.percentage > 10) {
      recommendations.push('• Optimize identity resolution to capture remaining unaddressable inventory');
    } else {
      recommendations.push('• Fine-tune identity resolution for maximum addressability rates');
    }

    const safariFirefoxShare = 100 - oldResults.inputs.chromeShare;
    if (safariFirefoxShare > 25) {
      recommendations.push('• Implement Safari/Firefox-specific optimization strategies');
    }
    
    if (oldResults.breakdown.currentAddressability < 70) {
      recommendations.push('• Priority focus on improving overall addressability rates');
    }
    
    if (oldResults.breakdown.salesMix) {
      const { direct, dealIds, openExchange } = oldResults.breakdown.salesMix;
      if (openExchange > 50) {
        recommendations.push('• Consider increasing direct sales and deal ID usage to improve margins');
      }
      if (direct < 30) {
        recommendations.push('• Explore opportunities to grow direct sales relationships');
      }
    }
    
    if (oldResults.inputs.displayVideoSplit < 20) {
      recommendations.push('• Optimize video inventory monetization strategies');
    } else if (oldResults.inputs.displayVideoSplit > 90) {
      recommendations.push('• Consider expanding video inventory opportunities');
    }
    
    if (oldResults.inputs.numDomains > 3) {
      recommendations.push('• Implement cross-domain identity resolution for multi-domain operations');
    }
  }
  
  // Ensure we have at least 3 recommendations
  if (recommendations.length < 3) {
    recommendations.push('• Leverage privacy-compliant targeting to maximize CPMs');
    if (recommendations.length < 3) {
      recommendations.push('• Implement real-time optimization for inventory management');
    }
  }
  
  return recommendations.slice(0, 6);
};