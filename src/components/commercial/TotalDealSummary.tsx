// Total Deal Summary Component
// Shows the complete deal breakdown with clear component isolation
// Ensures all numbers reconcile and are bulletproof
// NOTE: This component uses 3-Year view by default (legacy behavior)

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CheckCircle2, TrendingUp, Target, Shield } from 'lucide-react';
import { UnifiedResults } from '@/types/scenarios';
import { getDealBreakdown, formatCommercialCurrency } from '@/utils/commercialCalculations';
import { NegotiationHighlights } from './NegotiationHighlights';

interface TotalDealSummaryProps {
  results: UnifiedResults;
}

export const TotalDealSummary = ({ results }: TotalDealSummaryProps) => {
  // Use 3-year view for this legacy component
  const breakdown = getDealBreakdown(results, '3-year');
  
  // Calculate percentages for visual representation
  const total = breakdown.threeYear.total;
  const idPct = total > 0 ? (breakdown.threeYear.idInfrastructure / total) * 100 : 0;
  const capiPct = total > 0 ? (breakdown.threeYear.capi / total) * 100 : 0;
  const mediaPct = total > 0 ? (breakdown.threeYear.mediaPerformance / total) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Negotiation Highlights */}
      <NegotiationHighlights context="total-deal" />
      
      {/* Hero Number */}
      <div className="text-center space-y-3 py-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Total 3-Year Deal Value
        </p>
        <div className="text-5xl md:text-7xl font-bold text-primary">
          {formatCommercialCurrency(total)}
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Incremental revenue over 36 months from ID Infrastructure, CAPI, and Media Performance combined
        </p>
      </div>
      
      {/* Deal Breakdown Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* ID Infrastructure */}
        <Card className="p-5 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">ID Infrastructure</h3>
            </div>
            <Badge variant="secondary" className="text-xs">Structural</Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatCommercialCurrency(breakdown.threeYear.idInfrastructure)}
              </p>
              <p className="text-xs text-muted-foreground">over 36 months</p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatCommercialCurrency(breakdown.monthly.idInfrastructure)}/mo at steady state
            </div>
            
            <div className="pt-2 border-t space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span>Safari addressability recovery</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span>CDP cost reduction</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                <span>Fuller audience segments</span>
              </div>
            </div>
            
            <div className="pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-xs text-primary underline cursor-help">
                    Covered by platform fee →
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      ID Infrastructure benefits are covered by the platform subscription ($19.9K/mo full contract). 
                      No additional revenue share is taken on these structural benefits.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
        
        {/* CAPI Revenue */}
        <Card className="p-5 border-2 border-accent/40 bg-accent/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-sm">CAPI Revenue</h3>
            </div>
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Sales-Led</Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-accent">
                {formatCommercialCurrency(breakdown.threeYear.capi)}
              </p>
              <p className="text-xs text-muted-foreground">over 36 months</p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatCommercialCurrency(breakdown.monthly.capi)}/mo at steady state
            </div>
            
            <div className="pt-2 border-t space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-accent" />
                <span>Conversion tracking revenue</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-accent" />
                <span>Advertiser premium spend</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-accent" />
                <span>Net-new campaign revenue</span>
              </div>
            </div>
            
            <div className="pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-xs text-accent underline cursor-help">
                    12.5% revenue share applies →
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      CAPI incremental revenue is subject to a 12.5% revenue share (with campaign cap). 
                      This is the only component with a revenue share - your sales team drives this upside.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
        
        {/* Media Performance */}
        <Card className="p-5 border-2 border-green-500/30 bg-green-500/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-sm">Media Performance</h3>
            </div>
            <Badge variant="secondary" className="text-xs">Operational</Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCommercialCurrency(breakdown.threeYear.mediaPerformance)}
              </p>
              <p className="text-xs text-muted-foreground">over 36 months</p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatCommercialCurrency(breakdown.monthly.mediaPerformance)}/mo at steady state
            </div>
            
            <div className="pt-2 border-t space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>Premium yield improvement</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>Reduced make-goods</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>Better advertiser ROAS</span>
              </div>
            </div>
            
            <div className="pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-xs text-green-600 underline cursor-help">
                    Covered by platform fee →
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Media performance improvements are a natural outcome of better identity data. 
                      Covered by the platform subscription - no additional share is taken.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Stacked Bar Visualization */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-medium">Value Composition</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  ID Infrastructure and Media Performance are structural benefits covered by the platform fee. 
                  CAPI is the sales-led component with a revenue share model.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="h-8 flex rounded-lg overflow-hidden">
          <div 
            className="bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
            style={{ width: `${idPct}%` }}
          >
            {idPct > 15 && `${idPct.toFixed(0)}%`}
          </div>
          <div 
            className="bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground"
            style={{ width: `${capiPct}%` }}
          >
            {capiPct > 15 && `${capiPct.toFixed(0)}%`}
          </div>
          <div 
            className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${mediaPct}%` }}
          >
            {mediaPct > 15 && `${mediaPct.toFixed(0)}%`}
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span>ID Infra ({idPct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-accent" />
            <span>CAPI ({capiPct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
            <span>Media ({mediaPct.toFixed(0)}%)</span>
          </div>
        </div>
      </Card>
      
      {/* Plain English Explanation */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <h4 className="text-sm font-medium mb-2">How This Works</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The total deal value of <strong>{formatCommercialCurrency(total)}</strong> over 36 months comes from three sources:
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>
            <strong>ID Infrastructure ({formatCommercialCurrency(breakdown.threeYear.idInfrastructure)})</strong>: 
            Structural benefits from making your Safari inventory addressable again. This happens automatically once AdFixus is deployed - 
            it's the foundation that makes everything else possible.
          </li>
          <li>
            <strong>CAPI Revenue ({formatCommercialCurrency(breakdown.threeYear.capi)})</strong>: 
            Incremental revenue from advertisers who pay a premium for conversion tracking. This is sales-led - 
            your team must actively sell CAPI-enabled campaigns. Higher risk, higher upside, subject to 12.5% revenue share.
          </li>
          <li>
            <strong>Media Performance ({formatCommercialCurrency(breakdown.threeYear.mediaPerformance)})</strong>: 
            Operational improvements from better data - fewer make-goods, higher yield, happier advertisers. 
            Emerges naturally from better identity resolution.
          </li>
        </ul>
      </Card>
    </div>
  );
};
