import { RotateCcw, Filter, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Bubble = ({ children }: { children: React.ReactNode }) => (
  <div className="glass-surface text-card-foreground rounded-xl p-3 text-sm leading-relaxed animate-fade-in">{children}</div>
);

const RightSidebar = () => {
  return (
    <aside className="w-96 glass-sidebar h-screen flex flex-col animate-slide-in-right">
      {/* Top tag */}
      <div className="h-14 px-4 flex items-center border-b border-sidebar-border/30">
        <span className="inline-block bg-tag-blue text-tag-blue-text px-3 py-1 rounded-full text-sm font-medium">fintech</span>
      </div>

      {/* Conversation */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        <Bubble>
          I found <span className="font-semibold text-foreground">5 candidates</span> matching your criteria. Would you like to refine your search further?
        </Bubble>

        <Bubble>I need more versions from related areas and professions</Bubble>

        <Bubble>
          So, let me confirm with you the final version of the search request:
        </Bubble>

        <div className="glass-card border border-card-border rounded-xl p-3 text-sm italic text-card-foreground">
          Senior data scientist with a Master's degree in Computer Science from Stanford, currently working at Google in California, with 8 years of experience in machine learning and data analytics, previously at IBM and Amazon, skilled in Python, SQL, and TensorFlow, with a background in software engineering and fintech
        </div>

        <Bubble>Does it sound good or need any refinements?</Bubble>

        <div className="bg-gradient-to-r from-primary/20 to-primary/10 text-card-foreground rounded-xl p-3 text-sm border border-primary/20">Sounds good, show me what you have!</div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-sidebar-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover-scale bg-card-hover border-card-border text-card-foreground hover:bg-card-hover/70"><RotateCcw className="h-4 w-4" /> Reset</Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover-scale bg-card-hover border-card-border text-card-foreground hover:bg-card-hover/70"><Filter className="h-4 w-4" /> Filters</Button>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Input placeholder="Ask to refine your search.." className="pr-20 text-sm" />
            <Paperclip className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button aria-label="Send" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-tag-purple text-tag-purple-text flex items-center justify-center shadow">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Senior Data Scientist</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;