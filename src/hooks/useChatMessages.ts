import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export const useChatMessages = (projectId: string | undefined) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChatMessages = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // Get ALL searches for this project to build complete chat history
      const { data: searches, error } = await supabase
        .from('searches')
        .select('prompt, raw_response, created_at, status')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat messages:', error);
        return;
      }

      const chatMessages: ChatMessage[] = [];
      
      searches?.forEach((search, index) => {
        const rawResponse = search.raw_response as any;
        
        // Add the user's search query from the search prompt
        const userPrompt = (search as any).prompt;
        if (userPrompt) {
          chatMessages.push({
            id: `user-${index}`,
            content: userPrompt,
            isBot: false,
            timestamp: new Date(search.created_at)
          });
        }

        // Add the bot's response only if search is completed and has a response
        if ((search as any).status === 'completed' && rawResponse?.session?.message) {
          chatMessages.push({
            id: `bot-${index}`,
            content: rawResponse.session.message,
            isBot: true,
            timestamp: new Date(search.created_at)
          });
        }
      });

      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load chat messages from search results
  useEffect(() => {
    loadChatMessages();
  }, [projectId]);

  const addMessage = (content: string, isBot: boolean) => {
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      content,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const reloadMessages = async () => {
    await loadChatMessages();
  };

  return {
    messages,
    loading,
    addMessage,
    reloadMessages
  };
};