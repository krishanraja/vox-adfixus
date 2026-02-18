// Scenario Modeler - Main Page
// Three-tab architecture: Summary (controls + PDF), CAPI (sales-led), Addressability (structural)

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { SimplifiedInputsForm } from '@/components/SimplifiedInputs';
import { SummaryTab } from '@/components/SummaryTab';
import { CapiTab } from '@/components/CapiTab';
import { AddressabilityTab } from '@/components/AddressabilityTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScenarioCalculator } from '@/hooks/useScenarioCalculator';
import { useAuth } from '@/contexts/AuthContext';
import type { LeadData } from '@/types';
import type { TimeframeType, PdfExportConfig } from '@/types/scenarios';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { generatePDF } from '@/utils/pdfGenerator';

type StepType = 'hero' | 'inputs' | 'results';
type ResultsTab = 'summary' | 'capi' | 'addressability';

const ScenarioModeler = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('hero');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultsTab>('summary');
  const [timeframe, setTimeframe] = useState<TimeframeType>('3-year');
  const [pendingPdfConfig, setPendingPdfConfig] = useState<PdfExportConfig | null>(null);
  
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

  const handleDownloadPDF = (config: PdfExportConfig) => {
    setPendingPdfConfig(config);
    setShowLeadCapture(true);
  };

  const handleLeadCapture = async (data: LeadData) => {
    try {
      localStorage.setItem('leadData', JSON.stringify(data));
      
      toast({
        title: 'Generating PDF...',
        description: 'Creating your executive report...',
      });
      
      // Generate consolidated PDF with export config
      await generatePDF(null, results!, data, timeframe, pendingPdfConfig || undefined);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your executive report has been downloaded.',
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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ResultsTab)} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-xl grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="capi">CAPI</TabsTrigger>
                  <TabsTrigger value="addressability">Addressability</TabsTrigger>
                </TabsList>
              </div>
              
              {/* Tab 1: Summary - Executive Dashboard with all controls */}
              <TabsContent value="summary">
                <SummaryTab
                  results={results}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  riskScenario={riskScenario}
                  onRiskScenarioChange={setRiskScenario}
                  assumptionOverrides={assumptionOverrides}
                  onAssumptionOverridesChange={setAssumptionOverrides}
                  onDownloadPDF={handleDownloadPDF}
                />
              </TabsContent>
              
              {/* Tab 2: CAPI - Sales-Led Revenue (Read-Only) */}
              <TabsContent value="capi">
                <div className="text-center space-y-2 mb-6">
                  <h1 className="text-2xl font-bold">CAPI Commercial Models</h1>
                  <p className="text-muted-foreground text-sm">
                    Compare alignment models for CAPI revenue share
                  </p>
                </div>
                <CapiTab results={results} timeframe={timeframe} />
              </TabsContent>
              
              {/* Tab 3: Addressability - Structural Benefits */}
              <TabsContent value="addressability">
                <div className="text-center space-y-2 mb-6">
                  <h1 className="text-2xl font-bold">Addressability Benefits</h1>
                  <p className="text-muted-foreground text-sm">
                    ID Infrastructure and Media Performance — 100% retained
                  </p>
                </div>
                <AddressabilityTab 
                  results={results} 
                  timeframe={timeframe}
                  assumptionOverrides={assumptionOverrides}
                  onAssumptionOverridesChange={setAssumptionOverrides}
                />
              </TabsContent>
            </Tabs>
            
            {/* Back to Inputs button - visible on all tabs */}
            <div className="flex justify-center mt-8">
              <Button onClick={() => setCurrentStep('inputs')} variant="outline">
                Adjust Inputs
              </Button>
            </div>
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
