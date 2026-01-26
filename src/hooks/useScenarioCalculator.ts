import { useState, useCallback } from 'react';
import type { SimplifiedInputs, UnifiedResults, ScenarioState, AssumptionOverrides } from '@/types/scenarios';
import { UnifiedCalculationEngine } from '@/utils/unifiedCalculationEngine';

export const useScenarioCalculator = () => {
  const [inputs, setInputs] = useState<SimplifiedInputs>({
    selectedDomains: ['the-verge', 'vox', 'polygon'],
    displayCPM: 4.50,
    videoCPM: 15.00,
    capiLineItemShare: 0.60,
  });

  const [scenario, setScenario] = useState<ScenarioState>({
    deployment: 'multi',
    scope: 'id-capi-performance',
  });

  const [riskScenario, setRiskScenario] = useState<'conservative' | 'moderate' | 'optimistic'>('moderate');
  const [assumptionOverrides, setAssumptionOverrides] = useState<AssumptionOverrides | undefined>(undefined);
  const [results, setResults] = useState<UnifiedResults | null>(null);

  const calculateResults = useCallback(() => {
    const calculatedResults = UnifiedCalculationEngine.calculate(inputs, scenario, riskScenario, assumptionOverrides);
    setResults(calculatedResults);
    return calculatedResults;
  }, [inputs, scenario, riskScenario, assumptionOverrides]);
  
  const updateRiskScenario = useCallback((newRisk: 'conservative' | 'moderate' | 'optimistic') => {
    setRiskScenario(newRisk);
    // Recalculate with new risk scenario
    const updated = UnifiedCalculationEngine.calculate(inputs, scenario, newRisk, assumptionOverrides);
    setResults(updated);
  }, [inputs, scenario, assumptionOverrides]);
  
  const updateAssumptionOverrides = useCallback((overrides: AssumptionOverrides | undefined) => {
    setAssumptionOverrides(overrides);
    // Recalculate with new overrides
    const updated = UnifiedCalculationEngine.calculate(inputs, scenario, riskScenario, overrides);
    setResults(updated);
  }, [inputs, scenario, riskScenario]);

  const reset = useCallback(() => {
    setInputs({
      selectedDomains: ['the-verge', 'vox', 'polygon'],
      displayCPM: 4.50,
      videoCPM: 15.00,
      capiLineItemShare: 0.60,
    });
    setScenario({
      deployment: 'multi',
      scope: 'id-capi-performance',
    });
    setRiskScenario('moderate');
    setAssumptionOverrides(undefined);
    setResults(null);
  }, []);

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
