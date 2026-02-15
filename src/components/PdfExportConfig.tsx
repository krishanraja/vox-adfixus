import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Shield, Target, TrendingUp, FileText } from 'lucide-react';
import type { UnifiedResults, TimeframeType, PdfExportConfig } from '@/types/scenarios';
import { getDealBreakdown, formatCommercialCurrency } from '@/utils/commercialCalculations';

interface PdfExportConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: UnifiedResults;
  timeframe: TimeframeType;
  onExport: (config: PdfExportConfig) => void;
}

const DEFAULT_CONFIG: PdfExportConfig = {
  includeIdInfrastructure: true,
  includeCapiRevenue: true,
  includeMediaPerformance: true,
  includeCampaignEconomics: true,
  includeCarSalesProofPoint: true,
};

export const PdfExportConfigSheet = ({
  open,
  onOpenChange,
  results,
  timeframe,
  onExport,
}: PdfExportConfigProps) => {
  const [config, setConfig] = useState<PdfExportConfig>(DEFAULT_CONFIG);

  const breakdown = getDealBreakdown(results, timeframe);

  // Calculate filtered total based on selected streams
  const filteredTotal = useMemo(() => {
    let total = 0;
    if (config.includeIdInfrastructure) total += breakdown.display.idInfrastructure;
    if (config.includeCapiRevenue) total += breakdown.display.capi;
    if (config.includeMediaPerformance) total += breakdown.display.mediaPerformance;
    return total;
  }, [config, breakdown]);

  const handleCapiToggle = (checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      includeCapiRevenue: checked,
      includeCampaignEconomics: checked,
      includeCarSalesProofPoint: checked,
    }));
  };

  // Determine which pages will be included
  const pageList = useMemo(() => {
    const pages: string[] = ['Executive Decision Summary'];
    if (config.includeIdInfrastructure || config.includeMediaPerformance) {
      pages.push('Structural Benefits');
    }
    if (config.includeCapiRevenue) {
      pages.push('CAPI Opportunity');
      pages.push('Alignment Models');
    }
    pages.push('Implementation & Next Steps');
    return pages;
  }, [config]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure PDF Export</SheetTitle>
          <SheetDescription>
            Select which revenue streams to include in the executive report.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Revenue Stream Toggles */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revenue Streams</h4>

            {/* ID Infrastructure - always on */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
              <Checkbox
                id="id-infra"
                checked={config.includeIdInfrastructure}
                disabled
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="id-infra" className="flex items-center gap-2 font-medium text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  ID Infrastructure
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Safari recovery + CDP savings — foundation, always included</p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {formatCommercialCurrency(breakdown.display.idInfrastructure)}
                </p>
              </div>
            </div>

            {/* CAPI Revenue - toggleable */}
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.includeCapiRevenue ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/30 border-border'}`}>
              <Checkbox
                id="capi"
                checked={config.includeCapiRevenue}
                onCheckedChange={(checked) => handleCapiToggle(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="capi" className="flex items-center gap-2 font-medium text-sm cursor-pointer">
                  <Target className={`h-4 w-4 ${config.includeCapiRevenue ? 'text-amber-600' : 'text-muted-foreground'}`} />
                  CAPI Revenue
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Conversion tracking, campaign economics, CarSales proof point</p>
                <p className={`text-sm font-semibold mt-1 ${config.includeCapiRevenue ? 'text-amber-600' : 'text-muted-foreground line-through'}`}>
                  {formatCommercialCurrency(breakdown.display.capi)}
                </p>
              </div>
            </div>

            {/* Media Performance - toggleable */}
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.includeMediaPerformance ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/30 border-border'}`}>
              <Checkbox
                id="media"
                checked={config.includeMediaPerformance}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeMediaPerformance: checked === true }))}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="media" className="flex items-center gap-2 font-medium text-sm cursor-pointer">
                  <TrendingUp className={`h-4 w-4 ${config.includeMediaPerformance ? 'text-green-600' : 'text-muted-foreground'}`} />
                  Media Performance
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Premium yield, make-good reduction, ROAS improvements</p>
                <p className={`text-sm font-semibold mt-1 ${config.includeMediaPerformance ? 'text-green-600' : 'text-muted-foreground line-through'}`}>
                  {formatCommercialCurrency(breakdown.display.mediaPerformance)}
                </p>
              </div>
            </div>
          </div>

          {/* Live Total Preview */}
          <div className="p-4 rounded-lg bg-muted/50 border text-center space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              PDF Total ({breakdown.display.label})
            </p>
            <p className="text-3xl font-bold text-primary">
              {formatCommercialCurrency(filteredTotal)}
            </p>
          </div>

          {/* Pages to Include */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pages Included</h4>
            <div className="space-y-1">
              {pageList.map((page, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>Page {i + 1}: {page}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={() => onExport(config)} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Generate PDF ({pageList.length} pages)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
