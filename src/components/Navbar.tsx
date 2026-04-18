import { Brain, Camera, ClipboardList, Activity, Leaf, Menu, X, BarChart3, MessageCircleHeart, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userId: string;
  onLogout: () => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Brain size={18} /> },
  { id: 'facial', label: 'Facial Analysis', icon: <Camera size={18} /> },
  { id: 'personality', label: 'Personality', icon: <ClipboardList size={18} /> },
  { id: 'depression', label: 'Psychological Tests', icon: <Activity size={18} /> },
  { id: 'greenspaces', label: 'Green Spaces', icon: <Leaf size={18} /> },
  { id: 'student', label: 'Student Progress', icon: <BarChart3 size={18} /> },
  { id: 'chatbot', label: 'Safe Place', icon: <MessageCircleHeart size={18} /> },
];

export default function Navbar({ currentPage, onNavigate, userId, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 pt-3">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="max-w-7xl mx-auto glass-panel rounded-[1.5rem] border border-white/50 shadow-lg shadow-purple-500/10"
      >
        <div className="flex items-center justify-between h-16 px-3 sm:px-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain size={20} className="text-white" />
            </div>
            <div className="text-left leading-tight hidden xs:block">
              <p className="font-extrabold text-slate-900 text-[15px] tracking-tight">MindSpace</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-600">Wellness</p>
            </div>
          </motion.button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all relative ${
                    isActive
                      ? 'text-purple-700'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-purple-100 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {item.icon}
                  {item.label}
                </motion.button>
              );
            })}

            <div className="ml-2 pl-2 border-l-2 border-slate-200/50 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
              >
                <LogOut size={16} />
                Logout
              </motion.button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-2 px-4 py-4 space-y-2 glass-panel rounded-2xl shadow-xl border border-white/50"
          >
            <div className="px-3 py-2 text-xs font-bold text-slate-500 border border-purple-100 rounded-xl bg-purple-50/50 mb-4 inline-flex items-center gap-2 w-full">
              <ShieldCheck size={14} className="text-purple-600" />
              User: {userId}
            </div>
            {navItems.map((item) => (
              <motion.button
                whileTap={{ scale: 0.98 }}
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </motion.button>
            ))}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onLogout();
                setMobileOpen(false);
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
