import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { SimplifiedInputsForm } from '@/components/SimplifiedInputs';
import { SimplifiedResults } from '@/components/SimplifiedResults';
import { CommercialScenarios, TotalDealSummary } from '@/components/commercial';
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
// Tab types for results view
type ResultsTab = 'total-deal' | 'capi-alignment' | 'detailed-roi';

const ScenarioModeler = () => {
  const [currentStep, setCurrentStep] = useState<StepType>('hero');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultsTab>('total-deal');
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
        description: activeTab === 'capi-alignment' ? 'Creating your CAPI analysis...' : 'Creating your ROI report...',
      });
      
      if (activeTab === 'capi-alignment') {
        await generateCommercialPDF(results!, data);
      } else {
        // generatePDF expects (quizResults, calculatorResults, leadData)
        await generatePDF(null, results!, data);
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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ResultsTab)} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="total-deal">Total Deal Value</TabsTrigger>
                  <TabsTrigger value="capi-alignment">CAPI Alignment</TabsTrigger>
                  <TabsTrigger value="detailed-roi">Detailed ROI</TabsTrigger>
                </TabsList>
              </div>
              
              {/* Tab 1: Total Deal Value - 36 month unified view */}
              <TabsContent value="total-deal">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-3xl font-bold">Total 3-Year Deal Value</h1>
                  <p className="text-muted-foreground">Complete breakdown: ID Infrastructure + CAPI + Media Performance</p>
                </div>
                <TotalDealSummary results={results} />
                <div className="flex justify-center gap-4 mt-8">
                  <Button onClick={handleDownloadPDF} className="gap-2">
                    Download PDF Report
                  </Button>
                  <Button onClick={() => setCurrentStep('inputs')} variant="outline">
                    Adjust Inputs
                  </Button>
                </div>
              </TabsContent>
              
              {/* Tab 2: CAPI Alignment Models - Revenue share comparison */}
              <TabsContent value="capi-alignment">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-3xl font-bold">CAPI Alignment Models</h1>
                  <p className="text-muted-foreground">Compare commercial alignment models for CAPI revenue share</p>
                </div>
                <CommercialScenarios 
                  results={results} 
                  assumptionOverrides={assumptionOverrides}
                  onAssumptionOverridesChange={setAssumptionOverrides}
                  onReset={() => setCurrentStep('inputs')}
                  onDownloadPDF={handleDownloadPDF}
                />
              </TabsContent>
              
              {/* Tab 3: Detailed ROI - Full breakdown with charts */}
              <TabsContent value="detailed-roi">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-3xl font-bold">Detailed ROI Analysis</h1>
                  <p className="text-muted-foreground">12-month projection with component breakdown and risk scenarios</p>
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
