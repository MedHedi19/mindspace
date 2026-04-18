import { useState, type FormEvent } from 'react';
import { LockKeyhole, UserRound, Brain, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="page-shell px-4 py-10 flex items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 25 }}
        className="w-full max-w-md glass-panel rounded-[2rem] border-2 border-white/60 shadow-2xl shadow-purple-500/20 p-8 relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-fuchsia-400/20 to-purple-400/20 blur-3xl -z-10 rounded-full" />
        
        <div className="text-center mb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 text-xs font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 rounded-full px-4 py-1.5 mb-5 shadow-sm"
          >
            <Sparkles size={14} className="text-fuchsia-500" />
            ID-Based Secure Access
          </motion.div>
          
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mb-5 shadow-xl shadow-purple-500/40"
          >
            <Brain size={38} className="text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Welcome Back
          </motion.h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label htmlFor="userId" className="block text-sm font-bold text-slate-700 mb-2 pl-1">
              User ID
            </label>
            <div className="relative group">
              <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                id="userId"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="254JMT3946"
                autoComplete="username"
                className="w-full rounded-2xl border-2 border-slate-200/90 bg-white/50 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all uppercase"
                required
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2 pl-1">
              Password
            </label>
            <div className="relative group">
              <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full rounded-2xl border-2 border-slate-200/90 bg-white/50 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm font-semibold focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all"
                required
              />
            </div>
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm font-bold text-rose-600 bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !userId.trim() || !password}
            className="w-full brand-button mt-4 py-4 rounded-2xl text-base shadow-xl shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-4 text-xs font-bold text-slate-500 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} className="text-purple-600" />
            End-to-End Secure Session
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
