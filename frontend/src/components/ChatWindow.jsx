import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import StatusIndicator from './StatusIndicator';

export default function ChatWindow({ messages, isLoading, statuses, onHintClick }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages/statuses
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statuses, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-window">
        <div className="welcome">
          <div className="welcome__icon">🔍</div>
          <h2>CRAG Chatbot</h2>
          <p>
            Powered by Corrective Retrieval Augmented Generation.
            Ask me anything — I'll search the web, evaluate sources,
            and give you a well-grounded answer.
          </p>
          <div className="welcome__hints">
            <button
              className="welcome__hint"
              onClick={() => onHintClick('What is the history of Clash of Clans?')}
            >
              🎮 History of Clash of Clans
            </button>
            <button
              className="welcome__hint"
              onClick={() => onHintClick('Explain quantum entanglement')}
            >
              ⚛️ Quantum entanglement
            </button>
            <button
              className="welcome__hint"
              onClick={() => onHintClick('Who won the 2024 Nobel Prize in Physics?')}
            >
              🏆 2024 Nobel Prize in Physics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window" id="chat-window">
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <>
            <StatusIndicator statuses={statuses} />
            {statuses.length === 0 && (
              <div className="typing-indicator">
                <div className="typing-indicator__avatar">🔍</div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
