export interface ChatReplyResponse {
  ok: boolean;
  sessionId: string;
  model: string;
  reply: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';

export async function sendSupportChatMessage(message: string, sessionId?: string): Promise<ChatReplyResponse> {
  const response = await fetch(`${BACKEND_URL}/api/chat-support`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sessionId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to send message to support chatbot.');
  }

  return data as ChatReplyResponse;
}

export async function resetSupportChatSession(sessionId: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/chat-support/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.error ?? 'Failed to reset chatbot session.');
  }
}
