import { useState, type ReactNode } from 'react';
import { useChatHistory } from '../hooks/useChatHistory';
import { ChatContext } from './chatContextDefinition';

export type { ChatContextType } from './chatContextDefinition';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatting, setIsChatting] = useState(false);
  const chatHistory = useChatHistory();

  return (
    <ChatContext.Provider
      value={{
        isChatting,
        setIsChatting,
        ...chatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
