import { useState } from 'react';
import type { SimplifiedInputs, UnifiedResults, ScenarioState } from '@/types/scenarios';
import { UnifiedCalculationEngine } from '@/utils/unifiedCalculationEngine';

export const useScenarioCalculator = () => {
  const [inputs, setInputs] = useState<SimplifiedInputs>({
    selectedDomains: ['the-verge', 'vox', 'polygon'],
    displayCPM: 4.50,
    videoCPM: 15.00,
    capiCampaignsPerMonth: 10,
    avgCampaignSpend: 100000,
  });

  const [scenario, setScenario] = useState<ScenarioState>({
    deployment: 'multi',
    scope: 'id-capi-performance',
  });

  const [riskScenario, setRiskScenario] = useState<'conservative' | 'moderate' | 'optimistic'>('moderate');
  const [results, setResults] = useState<UnifiedResults | null>(null);

  const calculateResults = () => {
    const calculatedResults = UnifiedCalculationEngine.calculate(inputs, scenario, riskScenario);
    setResults(calculatedResults);
    return calculatedResults;
  };
  
  const updateRiskScenario = (newRisk: 'conservative' | 'moderate' | 'optimistic') => {
    setRiskScenario(newRisk);
    if (results) {
      const updated = UnifiedCalculationEngine.calculate(inputs, scenario, newRisk);
      setResults(updated);
    }
  };

  const reset = () => {
    setInputs({
      selectedDomains: ['the-verge', 'vox', 'polygon'],
      displayCPM: 4.50,
      videoCPM: 15.00,
      capiCampaignsPerMonth: 10,
      avgCampaignSpend: 100000,
    });
    setScenario({
      deployment: 'multi',
      scope: 'id-capi-performance',
    });
    setRiskScenario('moderate');
    setResults(null);
  };

  return {
    inputs,
    setInputs,
    scenario,
    setScenario,
    riskScenario,
    setRiskScenario: updateRiskScenario,
    results,
    calculateResults,
    reset,
  };
};
