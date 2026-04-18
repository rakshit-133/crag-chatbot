import { useState, useRef, useCallback } from 'react';

const API_URL = 'http://localhost:8000';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (query) => {
    if (!query.trim() || isLoading) return;

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setStatuses([]);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') break;

          try {
            const event = JSON.parse(data);

            if (event.type === 'status') {
              setStatuses((prev) => [...prev, { ...event, id: Date.now() + Math.random() }]);
            } else if (event.type === 'action') {
              setStatuses((prev) => [
                ...prev,
                { type: 'action', action: event.action, id: Date.now() + Math.random() },
              ]);
            } else if (event.type === 'answer') {
              const botMsg = {
                id: Date.now() + 1,
                role: 'bot',
                content: event.content,
              };
              setMessages((prev) => [...prev, botMsg]);
            } else if (event.type === 'error') {
              const errMsg = {
                id: Date.now() + 1,
                role: 'bot',
                content: event.message,
                isError: true,
              };
              setMessages((prev) => [...prev, errMsg]);
            }
          } catch {
            // Ignore malformed JSON
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errMsg = {
          id: Date.now() + 1,
          role: 'bot',
          content: `Connection error: ${err.message}. Make sure the backend is running on ${API_URL}.`,
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, statuses, sendMessage, stopGeneration };
}
