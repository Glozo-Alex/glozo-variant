import { useState } from "react";
import { RotateCcw, Filter, Paperclip, Send, Sparkles, Wand2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  isUser?: boolean;
  timestamp?: Date;
  type?: 'suggestion' | 'result' | 'question';
}

const messages: Message[] = [
  {
    id: '1',
    content: 'I found 5 candidates matching your criteria. Would you like to refine your search further?',
    type: 'result'
  },
  {
    id: '2',
    content: 'I need more versions from related areas and professions',
    isUser: true
  },
  {
    id: '3',
    content: 'So, let me confirm with you the final version of the search request:',
    type: 'question'
  },
  {
    id: '4',
    content: 'Does it sound good or need any refinements?',
    type: 'question'
  },
  {
    id: '5',
    content: 'Sounds good, show me what you have!',
    isUser: true
  }
];

const Bubble = ({ message }: { message: Message }) => {
  const isUser = message.isUser;
  const baseClasses = "rounded-2xl p-4 text-sm leading-relaxed max-w-[85%] animate-slide-up";
  
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className={`${baseClasses} bg-gradient-primary text-white shadow-glow ml-8`}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[85%]">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow shrink-0 mt-1">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className={`${baseClasses} glass-surface border border-glass-border/50`}>
          {message.content}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex gap-3 max-w-[85%]">
      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow shrink-0 mt-1">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="glass-surface border border-glass-border/50 rounded-2xl p-4">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const SearchSummary = () => (
  <div className="glass-card border border-card-border/50 rounded-xl p-4 text-sm mx-4 my-3">
    <div className="flex items-center gap-2 mb-3">
      <TrendingUp className="h-4 w-4 text-primary" />
      <span className="font-semibold text-card-foreground">Current Search</span>
    </div>
    <p className="text-muted-foreground italic leading-relaxed">
      Senior data scientist with a Master's degree in Computer Science from Stanford, currently working at Google in California, with 8 years of experience in machine learning and data analytics, previously at IBM and Amazon, skilled in Python, SQL, and TensorFlow, with a background in software engineering and fintech
    </p>
  </div>
);

const SmartSuggestions = () => (
  <div className="px-4 space-y-2">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Smart Suggestions</p>
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" className="h-8 text-xs btn-glass hover-glow">
        Add AWS skills
      </Button>
      <Button size="sm" variant="outline" className="h-8 text-xs btn-glass hover-glow">
        Include remote workers
      </Button>
      <Button size="sm" variant="outline" className="h-8 text-xs btn-glass hover-glow">
        Expand to 10+ years exp
      </Button>
    </div>
  </div>
);

const ModernRightSidebar = () => {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (inputValue.trim()) {
      setIsTyping(true);
      // Simulate AI response delay
      setTimeout(() => setIsTyping(false), 2000);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="w-96 glass-sidebar h-screen flex flex-col border-l border-sidebar-border/30">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-sidebar-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Wand2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-card-foreground">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Smart Search Helper</p>
          </div>
        </div>
        <Badge className="bg-tag-blue text-tag-blue-text border-tag-blue-glow/20 tag-glow">
          fintech
        </Badge>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}
          
          <SearchSummary />
          
          {isTyping && <TypingIndicator />}
        </div>
        
        <SmartSuggestions />
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-sidebar-border/30 space-y-4 bg-gradient-glass">
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="btn-glass hover-glow gap-2 flex-1">
            <RotateCcw className="h-4 w-4" />
            Reset Search
          </Button>
          <Button variant="outline" size="sm" className="btn-glass hover-glow gap-2 flex-1">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Search Status */}
        <div className="glass-surface border border-glass-border/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-card-foreground">Active Search</span>
          </div>
          <p className="text-xs text-muted-foreground">Senior Data Scientist • 5 matches found</p>
        </div>

        {/* Input Area */}
        <div className="relative">
          <Input
            placeholder="Refine your search criteria..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-20 bg-input/50 backdrop-blur-sm border-input-border/50 focus:border-primary/50 focus:ring-primary/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              className="h-7 w-7 btn-gradient hover-glow"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Tips */}
        <p className="text-xs text-muted-foreground text-center">
          Try: "Add React developers" or "Include remote candidates"
        </p>
      </div>
    </aside>
  );
};

export default ModernRightSidebar;