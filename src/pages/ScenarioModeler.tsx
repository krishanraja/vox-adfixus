import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { SimplifiedInputsForm } from '@/components/SimplifiedInputs';
import { CommercialScenarios } from '@/components/commercial';
import { Button } from '@/components/ui/button';
import { useScenarioCalculator } from '@/hooks/useScenarioCalculator';
import { useAuth } from '@/contexts/AuthContext';
import type { LeadData } from '@/types';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { generateCommercialPDF } from '@/utils/commercialPdfGenerator';

type StepType = 'hero' | 'inputs' | 'scenarios' | 'results';

const ScenarioModeler = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('hero');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const { 
    inputs, 
    setInputs, 
    scenario, 
    setScenario, 
    riskScenario, 
    setRiskScenario,
    assumptionOverrides,
    setAssumptionOverrides,
    results, 
    calculateResults, 
    reset 
  } = useScenarioCalculator();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartModeler = () => {
    setCurrentStep('inputs');
  };

  const handleInputsComplete = () => {
    // Auto-determine deployment based on number of domains
    const numDomains = inputs.selectedDomains.length;
    const deployment = numDomains === 1 ? 'single' : numDomains <= 5 ? 'multi' : 'full';
    
    // Always use full scope with CAPI and performance (CAPI volume determined by readiness factors)
    const scope = 'id-capi-performance';
    
    setScenario({ deployment, scope });
    calculateResults();
    setCurrentStep('results');
  };

  const handleScenariosComplete = () => {
    calculateResults();
    setCurrentStep('results');
  };

  const handleReset = () => {
    reset();
    setCurrentStep('hero');
  };

  const handleDownloadPDF = () => {
    setShowLeadCapture(true);
  };

  const handleLeadCapture = async (data: LeadData) => {
    try {
      localStorage.setItem('leadData', JSON.stringify(data));
      
      toast({
        title: 'Generating PDF...',
        description: 'Creating your commercial analysis...',
      });
      
      await generateCommercialPDF(results!, data);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your commercial analysis has been downloaded.',
      });
      
      setShowLeadCapture(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate PDF.',
        variant: 'destructive',
      });
    }
  };

  // Map to existing StepType for Navigation
  const navStep = currentStep === 'hero' ? 'hero' : 
                  currentStep === 'inputs' || currentStep === 'scenarios' ? 'calculator' : 
                  'results';

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentStep={navStep} onReset={handleReset} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        {currentStep === 'hero' && (
          <Hero onStartQuiz={handleStartModeler} />
        )}

        {currentStep === 'inputs' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">Configure Your Inputs</h1>
              <p className="text-muted-foreground">Enter your basic metrics to model your ROI</p>
            </div>

            <SimplifiedInputsForm 
              inputs={inputs} 
              onInputChange={(field, value) => setInputs({ ...inputs, [field]: value })}
              onCalculate={handleInputsComplete}
            />

            <div className="flex justify-center gap-4">
              <Button onClick={() => setCurrentStep('hero')} variant="outline">
                Back
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'results' && results && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold">Commercial Scenarios</h1>
              <p className="text-muted-foreground">Compare alignment models side-by-side</p>
            </div>

            <CommercialScenarios 
              results={results} 
              assumptionOverrides={assumptionOverrides}
              onAssumptionOverridesChange={setAssumptionOverrides}
              onReset={() => setCurrentStep('inputs')}
              onDownloadPDF={handleDownloadPDF}
            />
          </div>
        )}
      </div>

      <LeadCaptureModal
        open={showLeadCapture}
        onOpenChange={setShowLeadCapture}
        onSubmitSuccess={handleLeadCapture}
      />
    </div>
  );
};

export default ScenarioModeler;
