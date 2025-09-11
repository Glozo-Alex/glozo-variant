import { Table, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewPreference, CandidateView } from '@/hooks/useViewPreference';

export function ViewToggle() {
  const { view, setViewPreference } = useViewPreference();

  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewPreference('grid')}
        className="h-8 px-3"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewPreference('table')}
        className="h-8 px-3"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}