import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface StepGuideProps {
  steps: string[];
}

export function StepGuide({ steps }: StepGuideProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-card/80 mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-mono flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Step-by-Step Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-foreground">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
