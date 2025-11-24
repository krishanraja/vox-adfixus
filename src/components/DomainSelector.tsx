import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VOX_MEDIA_DOMAINS, CATEGORY_LABELS, DOMAIN_PRESETS } from '@/constants/voxMediaDomains';
import { aggregateDomainInputs } from '@/utils/domainAggregation';
import { RotateCcw, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface DomainSelectorProps {
  selectedDomains: string[];
  onChange: (domains: string[]) => void;
  pageviewOverrides?: Record<string, number>;
  onPageviewOverrideChange?: (domainId: string, pageviews: number | undefined) => void;
}

export const DomainSelector = ({ selectedDomains, onChange, pageviewOverrides, onPageviewOverrideChange }: DomainSelectorProps) => {
  const [editingDomain, setEditingDomain] = useState<string | null>(null);
  const aggregated = aggregateDomainInputs(selectedDomains, 4.50, 15.00, pageviewOverrides);
  
  const handleToggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      onChange(selectedDomains.filter(id => id !== domainId));
    } else {
      onChange([...selectedDomains, domainId]);
    }
  };
  
  const handleSelectAll = () => {
    onChange(VOX_MEDIA_DOMAINS.map(d => d.id));
  };
  
  const handleDeselectAll = () => {
    onChange([]);
  };
  
  const handlePreset = (preset: keyof typeof DOMAIN_PRESETS) => {
    onChange(DOMAIN_PRESETS[preset]);
  };
  
  // Group domains by category
  const domainsByCategory = VOX_MEDIA_DOMAINS.reduce((acc, domain) => {
    if (!acc[domain.category]) {
      acc[domain.category] = [];
    }
    acc[domain.category].push(domain);
    return acc;
  }, {} as Record<string, typeof VOX_MEDIA_DOMAINS>);
  
  const formatPageviews = (pageviews: number) => {
    return `${(pageviews / 1000000).toFixed(0)}M`;
  };
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Select Domains</h3>
            <p className="text-sm text-muted-foreground">
              Choose which Vox Media properties to include in the calculation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
          </div>
        </div>
        
        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Quick select:</span>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handlePreset('top3')}
          >
            Top 3
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handlePreset('newsNetwork')}
          >
            News Network
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handlePreset('fullPortfolio')}
          >
            Full Portfolio
          </Button>
        </div>
        
        {/* Domain List by Category */}
        <div className="space-y-6">
          {Object.entries(domainsByCategory).map(([category, domains]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domains.map((domain) => {
                  const isSelected = selectedDomains.includes(domain.id);
                  const currentPageviews = pageviewOverrides?.[domain.id] ?? domain.monthlyPageviews;
                  const isOverridden = pageviewOverrides?.[domain.id] !== undefined;
                  const isEditing = editingDomain === domain.id;
                  
                  return (
                    <div
                      key={domain.id}
                      className={`p-4 border-2 rounded-lg transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleToggleDomain(domain.id)}
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 space-y-2">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => handleToggleDomain(domain.id)}
                          >
                            <span className="font-medium">{domain.name}</span>
                          </div>
                          
                          {/* Editable Pageviews */}
                          {isSelected && onPageviewOverrideChange && (
                            <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={currentPageviews}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) {
                                        onPageviewOverrideChange(domain.id, value);
                                      }
                                    }}
                                    className="h-7 text-xs"
                                    step={1000000}
                                    min={0}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingDomain(null)}
                                    className="h-7 px-2"
                                  >
                                    Done
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <Badge variant={isOverridden ? "default" : "secondary"} className="text-xs">
                                    {formatPageviews(currentPageviews)}/mo
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {isOverridden && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onPageviewOverrideChange(domain.id, undefined)}
                                        className="h-6 w-6 p-0"
                                        title="Reset to default"
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingDomain(domain.id)}
                                      className="h-6 w-6 p-0"
                                      title="Edit pageviews"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!isSelected && (
                            <Badge variant="secondary" className="text-xs">
                              {formatPageviews(domain.monthlyPageviews)}/mo
                            </Badge>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Safari: {(domain.audienceProfile.safariShare * 100).toFixed(0)}% of traffic
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        {selectedDomains.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {selectedDomains.length}
                </div>
                <div className="text-xs text-muted-foreground">Domains Selected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {formatPageviews(aggregated.totalMonthlyPageviews)}
                </div>
                <div className="text-xs text-muted-foreground">Total Monthly Pageviews</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
