import { RotateCcw, Filter, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChatMessages } from "@/hooks/useChatMessages";
import { getCandidatesByChat } from "@/services/candidates";
import { useToast } from "@/hooks/use-toast";

const BotBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 mb-3">
    <div className="glass-surface text-card-foreground rounded-2xl rounded-tl-sm p-3 text-sm leading-relaxed animate-fade-in max-w-[85%]">
      {children}
    </div>
  </div>
);

const UserBubble = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 mb-3 justify-end">
    <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-2xl rounded-tr-sm p-3 text-sm leading-relaxed max-w-[85%]">
      {children}
    </div>
  </div>
);

const RightSidebar = () => {
  const { projectId } = useParams();
  const { messages, loading, addMessage, reloadMessages } = useChatMessages(projectId);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not on initial load
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !projectId || sendingMessage) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setSendingMessage(true);

    try {
      // Add user message to chat immediately
      addMessage(userMessage, false);

      // Send to API
      const response = await getCandidatesByChat({
        message: userMessage,
        projectId,
        similarRoles: false,
      });

      // Reload chat messages from database to get the bot response
      await reloadMessages();

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
    <aside className="w-96 glass-sidebar h-screen flex flex-col animate-slide-in-right shrink-0">

      {/* Conversation */}
      <div className="flex-1 p-4 overflow-auto min-h-0">
        <div className="space-y-1">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading chat...</div>
          ) : messages.length === 0 ? (
            <BotBubble>
              Hi! I'm here to help you refine your candidate search. Ask me questions or provide additional criteria to find better matches.
            </BotBubble>
          ) : (
            messages.map((message) => (
              message.isBot ? (
                <BotBubble key={message.id}>{message.content}</BotBubble>
              ) : (
                <UserBubble key={message.id}>{message.content}</UserBubble>
              )
            ))
          )}
          {sendingMessage && (
            <div className="text-center text-muted-foreground text-sm py-2">Sending...</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 shrink-0 border-t border-border/50">
        <div className="flex items-center justify-center">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover-scale bg-card-hover border-card-border text-card-foreground hover:bg-card-hover/70"><RotateCcw className="h-4 w-4" /> Reset</Button>
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