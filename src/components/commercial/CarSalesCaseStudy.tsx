// CarSales Case Study Card
// Proof point with quantified campaign economics

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, TrendingUp, Target, DollarSign } from 'lucide-react';
import { CARSALES_PROOF_POINT } from '@/types/campaignEconomics';
import { formatCampaignCurrency } from '@/utils/campaignEconomicsCalculator';

interface CarSalesCaseStudyProps {
  compact?: boolean;
}

export const CarSalesCaseStudy = ({ compact = false }: CarSalesCaseStudyProps) => {
  const { quote, author, title, company, stats } = CARSALES_PROOF_POINT;
  
  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              "{quote}"
            </p>
            <p className="text-xs mt-2 text-amber-700 font-medium">
              — {author}, {title}, {company}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <span className="font-semibold">Case Study: {company}</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            100+ CAPI Campaigns
          </Badge>
        </div>
      </div>
      
      {/* Quote */}
      <div className="p-5 border-b">
        <div className="flex items-start gap-3">
          <Quote className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              "{quote}"
            </p>
            <p className="text-sm mt-3 font-medium">
              — {author}
            </p>
            <p className="text-xs text-muted-foreground">
              {title}, {company}
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x">
        <div className="p-4 text-center">
          <DollarSign className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-600">
            {formatCampaignCurrency(stats.newRevenueWon)}
          </p>
          <p className="text-xs text-muted-foreground">New Revenue Won</p>
        </div>
        
        <div className="p-4 text-center">
          <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-600">
            {stats.largestCampaign.growth}
          </p>
          <p className="text-xs text-muted-foreground">Largest Campaign Growth</p>
        </div>
        
        <div className="p-4 text-center">
          <Target className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-600">
            {stats.totalCampaigns}+
          </p>
          <p className="text-xs text-muted-foreground">Active Campaigns</p>
        </div>
      </div>
      
      {/* Campaign Economics Callout */}
      <div className="p-4 bg-emerald-500/10 border-t">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-700">
              Largest Campaign: ${formatCampaignCurrency(stats.largestCampaign.before).replace('$', '')} → ${formatCampaignCurrency(stats.largestCampaign.after).replace('$', '')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              At $1M spend: <strong className="text-emerald-700">${formatCampaignCurrency(stats.largestCampaignEconomics.netToPublisher).replace('$', '')} net</strong> to 
              publisher ({formatCampaignCurrency(stats.largestCampaignEconomics.fee)} capped fee = {stats.largestCampaignEconomics.roi.toFixed(1)}x ROI)
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
