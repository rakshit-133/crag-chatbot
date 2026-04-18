import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useChat } from './hooks/useChat';

function App() {
  const { messages, isLoading, statuses, sendMessage } = useChat();

  return (
    <div className="app">
      <header className="header">
        <div className="header__logo">C</div>
        <div>
          <div className="header__title">CRAG Chatbot</div>
          <div className="header__subtitle">Corrective Retrieval Augmented Generation</div>
        </div>
      </header>

      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        statuses={statuses}
        onHintClick={sendMessage}
      />

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}

export default App;
