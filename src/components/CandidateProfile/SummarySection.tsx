import { BrainCircuit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SummarySectionProps {
  displayData: any;
}

export function SummarySection({ displayData }: SummarySectionProps) {
  const summaryText = displayData?.ai_summary || displayData?.standout || displayData?.bio;
  
  if (!summaryText) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No summary available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Summary</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {summaryText}
      </p>
    </div>
  );
}