// Addressability Tab - Structural Benefits Deep Dive
// READ-ONLY - Shows ID Infrastructure and Media Performance only
// No controls here - all configuration happens on Summary tab

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, CheckCircle2, Info, Eye, DollarSign, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UnifiedResults, TimeframeType } from '@/types/scenarios';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { getDealBreakdown, formatCommercialCurrency } from '@/utils/commercialCalculations';

interface AddressabilityTabProps {
  results: UnifiedResults;
  timeframe: TimeframeType;
}

export const AddressabilityTab = ({ results, timeframe }: AddressabilityTabProps) => {
  // Use timeframe-aware breakdown - SINGLE SOURCE OF TRUTH
  const breakdown = getDealBreakdown(results, timeframe);
  
  const timeframeLabel = breakdown.display.label;
  const idInfraTotal = breakdown.display.idInfrastructure;
  const mediaTotal = breakdown.display.mediaPerformance;
  const combinedTotal = idInfraTotal + mediaTotal;
  
  const idDetails = results.idInfrastructure?.details;
  const mediaDetails = results.mediaPerformance?.details;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Context Card */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>What this shows:</strong> Structural and operational benefits that are 
              covered by the platform subscription fee. No revenue share applies to these benefits — 
              they're yours to keep 100%.
            </p>
          </div>
        </div>
      </Card>

      {/* Combined Hero */}
      <div className="text-center space-y-2 py-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Addressability Benefits ({timeframeLabel})
        </p>
        <div className="text-4xl md:text-5xl font-bold text-primary">
          {formatCommercialCurrency(combinedTotal)}
        </div>
        <p className="text-sm text-muted-foreground">
          100% retained — no revenue share on structural benefits
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ID Infrastructure Card */}
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">ID Infrastructure</h3>
            </div>
            <Badge variant="secondary">Structural</Badge>
          </div>
          
          <div className="text-3xl font-bold text-primary mb-4">
            {formatCommercialCurrency(idInfraTotal)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({formatCommercialCurrency(breakdown.monthly.idInfrastructure)}/mo)
            </span>
          </div>

          <div className="space-y-4">
            {/* Safari Recovery */}
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Safari Addressability Recovery</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground/70">Safari Traffic</span>
                  <span className="font-medium text-foreground">
                    {formatPercentage((idDetails?.safariShare || 0.35) * 100, 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground/70">Improvement</span>
                  <span className="font-medium text-primary">
                    +{formatPercentage((idDetails?.safariAddressabilityImprovement || 0.30) * 100, 0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Revenue: {formatCurrency(idDetails?.addressabilityRevenue || 0)}/mo
              </p>
            </div>

            {/* CDP Savings */}
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">CDP Cost Reduction</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="block text-muted-foreground/70">ID Deduplication Savings</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(idDetails?.monthlyCdpSavings || 0)}/mo
                </span>
              </div>
            </div>

            {/* Audience Segments */}
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Fuller Audience Segments</span>
              </div>
              <p className="text-xs text-muted-foreground">
                More complete user profiles enable better targeting and higher CPMs across all inventory.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <span>Covered by platform fee — no additional share</span>
          </div>
        </Card>

        {/* Media Performance Card */}
        <Card className="p-6 border-2 border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Media Performance</h3>
            </div>
            <Badge variant="secondary">Operational</Badge>
          </div>
          
          <div className="text-3xl font-bold text-green-600 mb-4">
            {formatCommercialCurrency(mediaTotal)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({formatCommercialCurrency(breakdown.monthly.mediaPerformance)}/mo)
            </span>
          </div>

          <div className="space-y-4">
            {/* Premium Yield */}
            <div className="p-3 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Premium Yield Improvement</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground/70">Premium Inventory</span>
                  <span className="font-medium text-foreground">30%</span>
                </div>
                <div>
                  <span className="block text-muted-foreground/70">Yield Uplift</span>
                  <span className="font-medium text-green-600">+25%</span>
                </div>
              </div>
            </div>

            {/* Make-Good Reduction */}
            <div className="p-3 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Reduced Make-Goods</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground/70">Current Rate</span>
                  <span className="font-medium text-foreground">
                    {formatPercentage((mediaDetails?.baselineMakeGoodRate || 0.08) * 100, 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground/70">Improved Rate</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage((mediaDetails?.improvedMakeGoodRate || 0.03) * 100, 0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Savings: {formatCurrency(mediaDetails?.makeGoodSavings || 0)}/mo
              </p>
            </div>

            {/* Advertiser ROAS */}
            <div className="p-3 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Better Advertiser ROAS</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Advertisers see better returns, leading to increased spend and longer commitments.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Covered by platform fee — no additional share</span>
          </div>
        </Card>
      </div>

      {/* Summary Explanation */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <h4 className="text-sm font-medium mb-2">Why These Benefits Are Structural</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Unlike CAPI revenue (which requires active sales effort and carries execution risk), 
          ID Infrastructure and Media Performance benefits are <strong>automatic outcomes</strong> of 
          deploying AdFixus. Once the technical integration is complete, these benefits materialize 
          naturally from better identity resolution — regardless of how many CAPI campaigns you sell.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This is why they're covered by the platform subscription rather than a revenue share: 
          the value is predictable and doesn't require ongoing partnership investment to realize.
        </p>
      </Card>
    </div>
  );
};
