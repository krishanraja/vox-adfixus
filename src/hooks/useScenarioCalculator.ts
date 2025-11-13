import { useState } from 'react';
import type { SimplifiedInputs, UnifiedResults, ScenarioState, AssumptionOverrides } from '@/types/scenarios';
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
  const [assumptionOverrides, setAssumptionOverrides] = useState<AssumptionOverrides | undefined>(undefined);
  const [results, setResults] = useState<UnifiedResults | null>(null);

  const calculateResults = () => {
    const calculatedResults = UnifiedCalculationEngine.calculate(inputs, scenario, riskScenario, assumptionOverrides);
    setResults(calculatedResults);
    return calculatedResults;
  };
  
  const updateRiskScenario = (newRisk: 'conservative' | 'moderate' | 'optimistic') => {
    setRiskScenario(newRisk);
    if (results) {
      const updated = UnifiedCalculationEngine.calculate(inputs, scenario, newRisk, assumptionOverrides);
      setResults(updated);
    }
  };
  
  const updateAssumptionOverrides = (overrides: AssumptionOverrides | undefined) => {
    setAssumptionOverrides(overrides);
    if (results) {
      const updated = UnifiedCalculationEngine.calculate(inputs, scenario, riskScenario, overrides);
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
    setAssumptionOverrides(undefined);
    setResults(null);
  };

  return {
    inputs,
    setInputs,
    scenario,
    setScenario,
    riskScenario,
    setRiskScenario: updateRiskScenario,
    assumptionOverrides,
    setAssumptionOverrides: updateAssumptionOverrides,
    results,
    calculateResults,
    reset,
  };
};
