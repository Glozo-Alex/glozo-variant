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

  // Load chat messages from search results
  useEffect(() => {
    if (!projectId) return;

    const loadChatMessages = async () => {
      setLoading(true);
      try {
        // Get the latest search for this project to extract chat messages
        const { data: searches, error } = await supabase
          .from('searches')
          .select('raw_response, created_at')
          .eq('project_id', projectId)
          .eq('status', 'completed')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading chat messages:', error);
          return;
        }

        const chatMessages: ChatMessage[] = [];
        
        searches?.forEach((search, index) => {
          const rawResponse = search.raw_response as any;
          
          // Add the user's search query
          if (rawResponse?.prompt) {
            chatMessages.push({
              id: `user-${index}`,
              content: rawResponse.prompt,
              isBot: false,
              timestamp: new Date(search.created_at)
            });
          }

          // Add the bot's response
          if (rawResponse?.session?.message) {
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

  return {
    messages,
    loading,
    addMessage
  };
};