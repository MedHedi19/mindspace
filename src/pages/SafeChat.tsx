import { useState } from 'react';
import { Shield, Send, RefreshCcw, HeartHandshake } from 'lucide-react';
import { resetSupportChatSession, sendSupportChatMessage } from '../services/chatApi';

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  text: string;
}

const welcomeText =
  "Hey, I'm here with you. If your heart feels heavy, you can talk to me slowly, one thought at a time. Maybe things can get better if you let it out little by little, and you do not have to carry everything alone.";

export default function SafeChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', text: welcomeText },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || isSending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsSending(true);
    setError(null);

    try {
      const response = await sendSupportChatMessage(text, sessionId ?? undefined);
      setSessionId(response.sessionId);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send your message.');
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      try {
        await resetSupportChatSession(sessionId);
      } catch {
        // Ignore reset failure and still clear local state.
      }
    }

    setSessionId(null);
    setMessages([{ id: 'welcome', role: 'assistant', text: welcomeText }]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <HeartHandshake size={14} />
            Safe Space Chat
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Talk to AI Safe Chat</h1>
          <p className="text-slate-500 max-w-3xl">
            This space is private and judgment-free. If talking to people feels hard, you can start here and express your thoughts at your own pace.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield size={16} className="text-teal-600" />
              Supportive, non-judgmental conversation
            </div>
            <button
              onClick={clearChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw size={12} />
              New conversation
            </button>
          </div>

          <div className="h-[460px] overflow-y-auto p-5 space-y-4 bg-slate-50/40">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto bg-teal-500 text-white'
                    : 'mr-auto bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {message.text}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[85%] mr-auto bg-white border border-slate-200 text-slate-500 rounded-2xl px-4 py-3 text-sm">
                Thinking...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100">
            {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write what you feel..."
                rows={3}
                className="flex-1 resize-none rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-300 px-3 py-2 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !draft.trim()}
                className="self-end inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                <Send size={14} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
