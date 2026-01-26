// Campaign Economics Table Component
// Shows per-campaign ROI with cap visualization

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, TrendingUp } from 'lucide-react';
import { 
  calculateCampaignEconomics, 
  formatCampaignCurrency, 
  formatROI 
} from '@/utils/campaignEconomicsCalculator';
import { CAPI_ECONOMICS_CONSTANTS, CARSALES_PROOF_POINT } from '@/types/campaignEconomics';

interface CampaignEconomicsTableProps {
  avgCampaignSpend?: number;
}

// Example campaign sizes to demonstrate the cap benefit
const EXAMPLE_CAMPAIGNS = [
  { label: 'Small Campaign', spend: 79000 },
  { label: 'Medium Campaign', spend: 150000 },
  { label: 'Large Campaign', spend: 300000 },
  { label: 'Enterprise Campaign', spend: 500000 },
  { label: 'Top Advertiser (CarSales example)', spend: 1000000 },
];

export const CampaignEconomicsTable = ({ avgCampaignSpend = 79000 }: CampaignEconomicsTableProps) => {
  const campaignData = useMemo(() => {
    return EXAMPLE_CAMPAIGNS.map(campaign => ({
      ...campaign,
      economics: calculateCampaignEconomics(campaign.spend),
    }));
  }, []);
  
  const capThreshold = CAPI_ECONOMICS_CONSTANTS.CAP_THRESHOLD;
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Campaign Economics</h3>
            <p className="text-xs text-muted-foreground">
              How the $30K campaign cap creates exponential ROI at scale
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Cap: $30K/campaign
          </Badge>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-[180px]">Campaign Size</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Incremental (40%)</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Net to Vox</TableHead>
              <TableHead className="text-right">ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignData.map((campaign, index) => {
              const { economics } = campaign;
              const isAboveCap = economics.isCapped;
              
              return (
                <TableRow 
                  key={index}
                  className={isAboveCap ? 'bg-emerald-500/5' : ''}
                >
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      {campaign.label}
                      {isAboveCap && (
                        <Sparkles className="h-3 w-3 text-emerald-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCampaignCurrency(campaign.spend)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCampaignCurrency(economics.incrementalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    <span className={isAboveCap ? 'text-emerald-600 font-medium' : ''}>
                      {formatCampaignCurrency(economics.cappedFee)}
                      {isAboveCap && <span className="text-xs ml-1">(CAP)</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-emerald-600">
                    {formatCampaignCurrency(economics.netToPublisher)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={isAboveCap ? 'default' : 'secondary'}
                      className={isAboveCap ? 'bg-emerald-500' : ''}
                    >
                      {formatROI(economics.roiMultiple)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Key Insight Callout */}
      <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-700">
              The Magic of the Cap
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              For campaigns above ${formatCampaignCurrency(capThreshold).replace('$', '')}, 
              the fee stays fixed at $30K while your incremental revenue keeps growing. 
              At $1M campaign spend, you keep <strong className="text-emerald-700">$370K net</strong> with 
              only $30K fee — a <strong className="text-emerald-700">13.3x ROI</strong>.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
