export default function StatusIndicator({ statuses }) {
  if (!statuses.length) return null;

  const getStatusClass = (item) => {
    if (item.type === 'action') {
      return `status--${item.action.toLowerCase()}`;
    }
    return 'status--info';
  };

  const getLabel = (item) => {
    if (item.type === 'action') {
      const icons = {
        CORRECT: '✅',
        INCORRECT: '❌',
        AMBIGUOUS: '⚠️',
      };
      return `${icons[item.action] || ''} CRAG Action: ${item.action}`;
    }
    return item.message;
  };

  return (
    <div className="status-group">
      {statuses.map((item) => (
        <div key={item.id} className={`status ${getStatusClass(item)}`}>
          {item.type !== 'action' && <span className="status__dot" />}
          <span>{getLabel(item)}</span>
        </div>
      ))}
    </div>
  );
}
