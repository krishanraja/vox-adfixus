import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { SimplifiedInputsForm } from '@/components/SimplifiedInputs';
import { SimplifiedResults } from '@/components/SimplifiedResults';
import { CommercialScenarios } from '@/components/commercial';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScenarioCalculator } from '@/hooks/useScenarioCalculator';
import { useAuth } from '@/contexts/AuthContext';
import type { LeadData } from '@/types';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { generateCommercialPDF } from '@/utils/commercialPdfGenerator';
import { generatePDF } from '@/utils/pdfGenerator';

type StepType = 'hero' | 'inputs' | 'results';

const ScenarioModeler = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('hero');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [activeTab, setActiveTab] = useState<'capi' | 'addressability'>('capi');
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
    const numDomains = inputs.selectedDomains.length;
    const deployment = numDomains === 1 ? 'single' : numDomains <= 5 ? 'multi' : 'full';
    const scope = 'id-capi-performance';
    
    setScenario({ deployment, scope });
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
        description: activeTab === 'capi' ? 'Creating your CAPI analysis...' : 'Creating your ROI report...',
      });
      
      if (activeTab === 'capi') {
        await generateCommercialPDF(results!, data);
      } else {
        await generatePDF(results!, data);
      }
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your analysis has been downloaded.',
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

  const navStep = currentStep === 'hero' ? 'hero' : 
                  currentStep === 'inputs' ? 'calculator' : 'results';

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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'capi' | 'addressability')} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="capi">CAPI Commercials</TabsTrigger>
                  <TabsTrigger value="addressability">Addressability ROI</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="capi">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-3xl font-bold">CAPI Alignment Models</h1>
                  <p className="text-muted-foreground">Compare commercial alignment models side-by-side</p>
                </div>
                <CommercialScenarios 
                  results={results} 
                  assumptionOverrides={assumptionOverrides}
                  onAssumptionOverridesChange={setAssumptionOverrides}
                  onReset={() => setCurrentStep('inputs')}
                  onDownloadPDF={handleDownloadPDF}
                />
              </TabsContent>
              
              <TabsContent value="addressability">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-3xl font-bold">Addressability ROI</h1>
                  <p className="text-muted-foreground">Overall ID + CAPI + Media Performance impact</p>
                </div>
                <SimplifiedResults
                  results={results}
                  riskScenario={riskScenario}
                  onRiskScenarioChange={setRiskScenario}
                  assumptionOverrides={assumptionOverrides}
                  onAssumptionOverridesChange={setAssumptionOverrides}
                  onInputChange={(field, value) => setInputs({ ...inputs, [field]: value })}
                  onReset={() => setCurrentStep('inputs')}
                  onDownloadPDF={handleDownloadPDF}
                />
              </TabsContent>
            </Tabs>
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
