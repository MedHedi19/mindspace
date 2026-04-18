import { Brain, Camera, ClipboardList, Activity, Leaf, Menu, X, BarChart3, MessageCircleHeart, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../types';

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
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl border border-emerald-100/70">
        <div className="flex items-center justify-between h-16 px-3 sm:px-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <Brain size={18} className="text-white" />
            </div>
            <div className="text-left leading-tight">
              <p className="font-bold text-slate-900 text-[15px] tracking-tight">MindSpace</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Mental Wellness Suite</p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/90'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <div className="ml-2 pl-2 border-l border-slate-200/80 flex items-center gap-2">
             
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/70 px-4 py-3 space-y-1.5 bg-white/95 rounded-b-2xl">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg bg-slate-50 mb-2 inline-flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-600" />
            Logged in as: {userId}
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
