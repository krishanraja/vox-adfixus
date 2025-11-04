import { Card } from './ui/card';
import { Label } from './ui/label';
import { Building, Network, Chrome, Globe, CheckCircle, Layers, TrendingUp, Zap } from 'lucide-react';
import type { ScenarioState, DeploymentType, AddressabilityType, ScopeType } from '@/types/scenarios';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ScenarioToggleProps {
  scenario: ScenarioState;
  onChange: (scenario: ScenarioState) => void;
}

export const ScenarioToggle = ({ scenario, onChange }: ScenarioToggleProps) => {
  const handleDeploymentChange = (deployment: DeploymentType) => {
    onChange({ ...scenario, deployment });
  };

  const handleAddressabilityChange = (addressability: AddressabilityType) => {
    onChange({ ...scenario, addressability });
  };

  const handleScopeChange = (scope: ScopeType) => {
    onChange({ ...scenario, scope });
  };

  return (
    <div className="space-y-6">
      {/* Deployment Scenario */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">Deployment Scale</Label>
            <Tooltip>
              <TooltipTrigger>
                <div className="ml-2 h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-xs text-muted-foreground">?</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Choose your deployment scale: single domain, multi-domain portfolio (5-10), or full network (15+)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleDeploymentChange('single')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.deployment === 'single'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Building className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">Single Domain</div>
              <div className="text-xs text-muted-foreground mt-1">1 property</div>
            </button>

            <button
              onClick={() => handleDeploymentChange('multi')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.deployment === 'multi'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Building className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">Multi-Domain</div>
              <div className="text-xs text-muted-foreground mt-1">5-10 properties</div>
            </button>

            <button
              onClick={() => handleDeploymentChange('full')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.deployment === 'full'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Network className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">Full Network</div>
              <div className="text-xs text-muted-foreground mt-1">15+ properties</div>
            </button>
          </div>
        </div>
      </Card>

      {/* Addressability Target */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">Addressability Target</Label>
            <Tooltip>
              <TooltipTrigger>
                <div className="ml-2 h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-xs text-muted-foreground">?</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Target addressability across browsers: Chrome only, partial Safari coverage, or full coverage</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleAddressabilityChange('limited')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.addressability === 'limited'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Chrome className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">Limited</div>
              <div className="text-xs text-muted-foreground mt-1">Chrome only (~50%)</div>
            </button>

            <button
              onClick={() => handleAddressabilityChange('partial')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.addressability === 'partial'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Globe className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">Partial</div>
              <div className="text-xs text-muted-foreground mt-1">Chrome + some Safari (~70%)</div>
            </button>

            <button
              onClick={() => handleAddressabilityChange('full')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.addressability === 'full'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <CheckCircle className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">Full</div>
              <div className="text-xs text-muted-foreground mt-1">All browsers (100%)</div>
            </button>
          </div>
        </div>
      </Card>

      {/* Capability Scope */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">Capability Scope</Label>
            <Tooltip>
              <TooltipTrigger>
                <div className="ml-2 h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-xs text-muted-foreground">?</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Select which AdFixus capabilities to model: ID infrastructure only, plus CAPI, or all features</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleScopeChange('id-only')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.scope === 'id-only'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Layers className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">ID Only</div>
              <div className="text-xs text-muted-foreground mt-1">Identity infrastructure</div>
            </button>

            <button
              onClick={() => handleScopeChange('id-capi')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.scope === 'id-capi'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <TrendingUp className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">ID + CAPI</div>
              <div className="text-xs text-muted-foreground mt-1">Plus conversion API</div>
            </button>

            <button
              onClick={() => handleScopeChange('id-capi-performance')}
              className={`p-4 rounded-lg border-2 transition-all ${
                scenario.scope === 'id-capi-performance'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Zap className="h-6 w-6 mb-2 mx-auto text-primary" />
              <div className="font-semibold">Full Platform</div>
              <div className="text-xs text-muted-foreground mt-1">Plus media performance</div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
