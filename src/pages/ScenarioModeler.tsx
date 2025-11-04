import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { SimplifiedInputsForm } from '@/components/SimplifiedInputs';
import { ScenarioToggle } from '@/components/ScenarioToggle';
import { SimplifiedResults } from '@/components/SimplifiedResults';
import { Button } from '@/components/ui/button';
import { useScenarioCalculator } from '@/hooks/useScenarioCalculator';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, LogOut } from 'lucide-react';
import type { LeadData } from '@/types';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type StepType = 'hero' | 'inputs' | 'scenarios' | 'results';

const ScenarioModeler = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('hero');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const { inputs, setInputs, scenario, setScenario, riskScenario, setRiskScenario, results, calculateResults, reset } = useScenarioCalculator();
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
    
    // Auto-determine scope based on CAPI configuration
    const scope = inputs.capiCampaignsPerMonth > 0 ? 'id-capi-performance' : 'id-only';
    
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
      // Store lead data for future PDF generation
      localStorage.setItem('leadData', JSON.stringify(data));
      
      toast({
        title: 'Information Saved',
        description: 'Your details have been saved. PDF generation coming soon.',
      });
      
      setShowLeadCapture(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save information. Please try again.',
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
      <Navigation currentStep={navStep} onReset={handleReset} />
      
      <div className="absolute top-4 right-4 z-50">
        <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
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
              <h1 className="text-3xl font-bold">Your ROI Projection</h1>
              <p className="text-muted-foreground">Based on your inputs and selected scenario</p>
            </div>

            <SimplifiedResults 
              results={results} 
              riskScenario={riskScenario}
              onRiskScenarioChange={setRiskScenario}
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
