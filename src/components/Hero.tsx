
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Shield, Globe, TrendingUp } from 'lucide-react';
import { INDUSTRY_BENCHMARKS } from '@/constants';

interface HeroProps {
  onStartQuiz: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartQuiz }) => {
  return (
    <Card className="max-w-6xl mx-auto mt-12 shadow-lg bg-card/50 backdrop-blur-sm border border-border/50">
      <CardContent className="p-8 lg:p-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
        <div className="mb-8">
          <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-black text-foreground mb-4">
            AdFixus ROI Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Calculate your potential revenue uplift from improved addressability, CAPI capabilities, 
            and premium media performance. Model your ROI with realistic risk scenarios.
          </p>
        </div>
        
        <Button 
          onClick={onStartQuiz}
          size="lg"
          className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Start Your ROI Analysis
        </Button>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6 text-center">
            <Globe className="w-12 h-12 text-brand-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Domain Selection
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Select from your Vox Media properties and configure your 
              CPM rates to get tailored revenue projections.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Risk Scenario Modeling
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Choose between conservative, moderate, or optimistic scenarios 
              to account for implementation challenges and adoption timelines.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Revenue Projection
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              See your monthly, annual, and 3-year uplift from ID infrastructure, 
              CAPI capabilities, and enhanced media performance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="bg-card rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8">
          Key Value Drivers
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-revenue-gain mb-2">65%</div>
            <div className="text-muted-foreground text-sm">Safari Addressability Gain</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">25%</div>
            <div className="text-muted-foreground text-sm">CPM Uplift on Premium</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">35%</div>
            <div className="text-muted-foreground text-sm">CDP Cost Reduction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-brand-secondary mb-2">12.5%</div>
            <div className="text-muted-foreground text-sm">CAPI Service Fees</div>
          </div>
        </div>
        <p className="text-xs italic text-muted-foreground mt-6 text-center">
          *Industry benchmarks based on AdFixus deployments and publisher performance data
        </p>
      </div>
      </CardContent>
    </Card>
  );
};
