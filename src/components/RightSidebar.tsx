import { RotateCcw, Filter, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useChatMessages } from "@/hooks/useChatMessages";
import { getCandidatesByChat } from "@/services/candidates";
import { useToast } from "@/hooks/use-toast";

const Bubble = ({ children }: { children: React.ReactNode }) => (
  <div className="glass-surface text-card-foreground rounded-xl p-3 text-sm leading-relaxed animate-fade-in">{children}</div>
);

const RightSidebar = () => {
  const { projectId } = useParams();
  const { messages, loading, addMessage } = useChatMessages(projectId);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !projectId || sendingMessage) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setSendingMessage(true);

    try {
      // Add user message to chat
      addMessage(userMessage, false);

      // Send to API
      const response = await getCandidatesByChat({
        message: userMessage,
        projectId,
        similarRoles: false,
      });

      // Add bot response to chat
      if (response?.session?.message) {
        addMessage(response.session.message, true);
      }

      // Show success toast if new candidates found
      if (response?.candidates?.length > 0) {
        toast({
          title: "Search updated",
          description: `Found ${response.candidates.length} candidates`,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside className="w-96 glass-sidebar h-full flex flex-col animate-slide-in-right">
      {/* Top tag */}
      <div className="h-14 px-4 flex items-center">
        <span className="inline-block bg-tag-blue text-tag-blue-text px-3 py-1 rounded-full text-sm font-medium">AI Chat</span>
      </div>

      {/* Conversation */}
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading chat...</div>
        ) : messages.length === 0 ? (
          <Bubble>
            Hi! I'm here to help you refine your candidate search. Ask me questions or provide additional criteria to find better matches.
          </Bubble>
        ) : (
          messages.map((message) => (
            message.isBot ? (
              <Bubble key={message.id}>{message.content}</Bubble>
            ) : (
              <div key={message.id} className="bg-gradient-to-r from-primary/20 to-primary/10 text-card-foreground rounded-xl p-3 text-sm border border-primary/20">
                {message.content}
              </div>
            )
          ))
        )}
        {sendingMessage && (
          <div className="text-center text-muted-foreground text-sm">Sending...</div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover-scale bg-card-hover border-card-border text-card-foreground hover:bg-card-hover/70"><RotateCcw className="h-4 w-4" /> Reset</Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover-scale bg-card-hover border-card-border text-card-foreground hover:bg-card-hover/70"><Filter className="h-4 w-4" /> Filters</Button>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <Input 
              placeholder="Ask to refine your search.." 
              className="pr-20 text-sm" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendingMessage}
            />
            <Paperclip className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button 
              aria-label="Send" 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendingMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-tag-purple text-tag-purple-text flex items-center justify-center shadow disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;