import { RotateCcw, Filter, Trash2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RightSidebar = () => {
  return (
    <div className="w-80 bg-card border-l border-border h-screen flex flex-col">
      {/* Fintech tag */}
      <div className="p-4 border-b border-border">
        <span className="inline-block bg-tag-blue text-tag-blue-text px-3 py-1 rounded-full text-sm font-medium">
          fintech
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          I found <span className="font-semibold text-foreground">5 candidates</span> matching your criteria. Would you like to refine your search further?
        </p>

        <p className="text-sm text-muted-foreground">
          I need more versions from related areas and professions
        </p>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            So, let me confirm with you the final version of the search request:
          </p>
          <p className="text-sm font-medium text-foreground italic">
            Senior data scientist with a Master's degree in Computer Science from Stanford, currently working at Google in California, with 8 years of experience in machine learning and data analytics, previously at IBM and Amazon, skilled in Python, SQL, and TensorFlow, with a background in software engineering and fintech
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Does it sound good or need any refinements?
        </p>

        <p className="text-sm text-muted-foreground">
          Sounds good, show me what you have!
        </p>
      </div>

      {/* Bottom controls */}
      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Input 
            placeholder="Ask to refine your search.." 
            className="text-sm"
          />
          <div className="flex items-center justify-between">
            <select className="text-sm text-muted-foreground bg-transparent border-none">
              <option>Senior Data Scientist</option>
            </select>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;