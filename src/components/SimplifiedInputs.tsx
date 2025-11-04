import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import type { SimplifiedInputs } from '@/types/scenarios';
import { formatNumberWithCommas } from '@/utils/formatting';

interface SimplifiedInputsProps {
  inputs: SimplifiedInputs;
  onChange: (inputs: SimplifiedInputs) => void;
}

export const SimplifiedInputsForm = ({ inputs, onChange }: SimplifiedInputsProps) => {
  const handlePageviewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    const numValue = parseInt(value) || 0;
    onChange({ ...inputs, monthlyPageviews: numValue });
  };

  const handleDisplayCPMChange = (value: number[]) => {
    onChange({ ...inputs, displayCPM: value[0] });
  };

  const handleVideoCPMChange = (value: number[]) => {
    onChange({ ...inputs, videoCPM: value[0] });
  };

  const handleSplitChange = (value: number[]) => {
    onChange({ ...inputs, displayVideoSplit: value[0] });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <Label htmlFor="pageviews" className="text-base font-semibold mb-2 block">
            Monthly Pageviews
          </Label>
          <Input
            id="pageviews"
            type="text"
            value={formatNumberWithCommas(inputs.monthlyPageviews)}
            onChange={handlePageviewsChange}
            className="text-lg"
            placeholder="e.g., 50,000,000"
          />
          <p className="text-sm text-muted-foreground mt-1">Total monthly pageviews across your property(ies)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Display CPM: ${inputs.displayCPM.toFixed(2)}
            </Label>
            <Slider
              value={[inputs.displayCPM]}
              onValueChange={handleDisplayCPMChange}
              min={2}
              max={15}
              step={0.25}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">Average CPM for display ads</p>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">
              Video CPM: ${inputs.videoCPM.toFixed(2)}
            </Label>
            <Slider
              value={[inputs.videoCPM]}
              onValueChange={handleVideoCPMChange}
              min={8}
              max={100}
              step={1}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">Average CPM for video ads</p>
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-2 block">
            Display/Video Split: {inputs.displayVideoSplit}% / {100 - inputs.displayVideoSplit}%
          </Label>
          <Slider
            value={[inputs.displayVideoSplit]}
            onValueChange={handleSplitChange}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Display</span>
            <span>Video</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
