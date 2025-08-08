import { RotateCcw, Filter, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Bubble = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-muted text-foreground/80 rounded-xl p-3 text-sm leading-relaxed">{children}</div>
);

const RightSidebar = () => {
  return (
    <aside className="w-96 bg-card border-l border-border h-screen flex flex-col">
      {/* Top tag */}
      <div className="h-14 px-4 flex items-center border-b border-border">
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

        <div className="bg-card border border-border rounded-xl p-3 text-sm italic text-foreground">
          Senior data scientist with a Master's degree in Computer Science from Stanford, currently working at Google in California, with 8 years of experience in machine learning and data analytics, previously at IBM and Amazon, skilled in Python, SQL, and TensorFlow, with a background in software engineering and fintech
        </div>

        <Bubble>Does it sound good or need any refinements?</Bubble>

        <div className="bg-primary/5 text-foreground rounded-xl p-3 text-sm">Sounds good, show me what you have!</div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border space-y-3 relative">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover-scale"><RotateCcw className="h-4 w-4" /> Reset</Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover-scale"><Filter className="h-4 w-4" /> Filters</Button>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Input placeholder="Ask to refine your search.." className="pr-10 text-sm" />
            <Paperclip className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Senior Data Scientist</span>
          </div>
        </div>
        <button aria-label="Send" className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-tag-purple text-tag-purple-text flex items-center justify-center shadow">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
};

export default RightSidebar;