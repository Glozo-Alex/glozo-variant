import { ChevronLeft } from "lucide-react";

const Rail = () => {
  return (
    <div className="w-8 border-r border-sidebar-border h-screen flex items-start justify-center pt-4">
      <button aria-label="Collapse" className="w-6 h-6 rounded-full bg-muted text-foreground/70 flex items-center justify-center">
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Rail;