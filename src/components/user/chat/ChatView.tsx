import ChatMessages, { type ChatMessage } from './ChatMessages';
import FeedbackButtons from './FeedbackButtons';

interface ChatViewProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatView({ messages, isTyping }: ChatViewProps) {
  return (
    <div className="w-full flex justify-center px-6 pb-6 animate-[fadeInScale_0.4s_ease-out]">
      <div className="w-full max-w-3xl">
        <ChatMessages messages={messages} isTyping={isTyping} />
        <FeedbackButtons/>
      </div>
    </div>
  );
}

