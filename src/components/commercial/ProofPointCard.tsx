// Proof Point Card
// Static testimonial anchoring projections in real-world proof

import { Star, Quote } from 'lucide-react';
import { getProofPoint } from '@/utils/commercialCalculations';

interface ProofPointCardProps {
  compact?: boolean;
}

export const ProofPointCard = ({ compact = false }: ProofPointCardProps) => {
  const proofPoint = getProofPoint();
  
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs text-foreground leading-relaxed italic">
              "{proofPoint.quote}"
            </p>
            <div className="text-[10px] text-muted-foreground">
              — {proofPoint.author}, {proofPoint.title}, {proofPoint.company}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/20 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Proof Point
        </span>
      </div>
      
      <blockquote className="relative">
        <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
        <p className="text-sm md:text-base text-foreground leading-relaxed pl-6">
          "{proofPoint.quote}"
        </p>
      </blockquote>
      
      <div className="flex items-center gap-3 pt-2 border-t border-primary/10">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {proofPoint.author.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <div className="text-sm font-medium">{proofPoint.author}</div>
          <div className="text-xs text-muted-foreground">
            {proofPoint.title}, {proofPoint.company}
          </div>
        </div>
      </div>
    </div>
  );
};
