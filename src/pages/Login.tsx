import { useState, type FormEvent } from 'react';
import { LockKeyhole, UserRound, Brain, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (credentials: { userId: string; password: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function Login({ onLogin, loading, error }: LoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onLogin({ userId: userId.trim().toUpperCase(), password });
  };

  return (
    <div className="page-shell px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-emerald-100/80 shadow-2xl p-7 sm:p-8 relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-4">
            <Sparkles size={12} />
            ID-Based Secure Access
          </div>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <Brain size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            Sign in with your user ID code, not email. Example: <span className="font-semibold text-slate-800">254JMT3946</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div>
            <label htmlFor="userId" className="block text-sm font-semibold text-slate-700 mb-1.5">
              User ID
            </label>
            <div className="relative">
              <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="userId"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="254JMT3946"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 uppercase"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200/90 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !userId.trim() || !password}
            className="w-full brand-button disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-600" />
            Session is protected with secure token authentication
          </div>
        </form>
      </div>
    </div>
  );
}
