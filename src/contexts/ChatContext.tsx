import { createContext, useContext, useState, type ReactNode } from 'react';

interface ChatContextType {
  isChatting: boolean;
  setIsChatting: (value: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatting, setIsChatting] = useState(false);

  return (
    <ChatContext.Provider value={{ isChatting, setIsChatting }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
