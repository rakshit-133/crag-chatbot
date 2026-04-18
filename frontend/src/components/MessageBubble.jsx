export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message message--${isUser ? 'user' : 'bot'}`}>
      <div className="message__avatar">
        {isUser ? '👤' : '🔍'}
      </div>
      <div className="message__content">
        <div
          className="message__bubble"
          style={message.isError ? { borderColor: 'rgba(239, 68, 68, 0.3)' } : {}}
        >
          {message.isError && <span style={{ marginRight: 6 }}>⚠️</span>}
          {message.content.split('\n').map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : null
          )}
        </div>
      </div>
    </div>
  );
}
