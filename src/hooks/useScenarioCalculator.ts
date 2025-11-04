import { useState } from 'react';
import type { SimplifiedInputs, UnifiedResults, ScenarioState } from '@/types/scenarios';
import { UnifiedCalculationEngine } from '@/utils/unifiedCalculationEngine';

export const useScenarioCalculator = () => {
  const [inputs, setInputs] = useState<SimplifiedInputs>({
    monthlyPageviews: 50000000,
    displayCPM: 4.50,
    videoCPM: 12,
    displayVideoSplit: 80,
    capiCampaignsPerMonth: 10,
    avgCampaignSpend: 100000,
  });

  const [scenario, setScenario] = useState<ScenarioState>({
    deployment: 'multi',
    scope: 'id-capi-performance',
  });

  const [results, setResults] = useState<UnifiedResults | null>(null);

  const calculateResults = () => {
    const calculatedResults = UnifiedCalculationEngine.calculate(inputs, scenario);
    setResults(calculatedResults);
    return calculatedResults;
  };

  const reset = () => {
    setInputs({
      monthlyPageviews: 50000000,
      displayCPM: 4.50,
      videoCPM: 12,
      displayVideoSplit: 80,
      capiCampaignsPerMonth: 10,
      avgCampaignSpend: 100000,
    });
    setScenario({
      deployment: 'multi',
      scope: 'id-capi-performance',
    });
    setResults(null);
  };

  return {
    inputs,
    setInputs,
    scenario,
    setScenario,
    results,
    calculateResults,
    reset,
  };
};
