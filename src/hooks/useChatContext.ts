import { useContext } from 'react';
import { ChatContext, type ChatContextType } from '../contexts/chatContextDefinition';

export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext phải được sử dụng trong ChatProvider');
  }
  return context;
}
