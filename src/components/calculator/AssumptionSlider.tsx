import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Info, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AssumptionSliderProps {
  label: string;
  description: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
  tooltipContent?: string;
}

export const AssumptionSlider = ({
  label,
  description,
  value,
  defaultValue,
  min,
  max,
  step,
  formatValue,
  onChange,
  tooltipContent,
}: AssumptionSliderProps) => {
  const isModified = Math.abs(value - defaultValue) > 0.001;
  
  return (
    <div className="space-y-2 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {tooltipContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isModified ? 'text-accent' : 'text-foreground'}`}>
            {formatValue(value)}
          </span>
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(defaultValue)}
              className="h-6 w-6 p-0"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={min}
        max={max}
        step={step}
        className="mt-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};
