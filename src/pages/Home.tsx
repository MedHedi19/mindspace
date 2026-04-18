import { Camera, ClipboardList, Activity, Leaf, ArrowRight, Heart, Shield, Sparkles, ScanFace, Trees, MessageCircleHeart, BarChart3 } from 'lucide-react';
import type { Page } from '../types';
import { motion } from 'framer-motion';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    id: 'facial' as Page,
    icon: <ScanFace size={34} />,
    title: 'Facial Emotion Analysis',
    description: 'Capture your current emotional snapshot through real-time facial expression signals and get an immediate breakdown.',
    color: 'from-fuchsia-500 to-purple-600',
    chip: 'AI Vision',
  },
  {
    id: 'personality' as Page,
    icon: <ClipboardList size={34} />,
    title: 'Personality Quick Test',
    description: 'Run a concise OCEAN-based profile to understand behavior patterns, strengths, and emotional tendencies.',
    color: 'from-amber-400 to-orange-500',
    chip: 'OCEAN',
  },
  {
    id: 'depression' as Page,
    icon: <Activity size={34} />,
    title: 'Depression Level Assessment',
    description: 'Use a PHQ-9 style flow to check your current depression risk level and receive practical, supportive next steps.',
    color: 'from-rose-500 to-pink-500',
    chip: 'PHQ-9',
  },
  {
    id: 'greenspaces' as Page,
    icon: <Trees size={34} />,
    title: 'Monastir Green Spaces',
    description: 'Access real places in Monastir and live nearby discovery to reset stress, calm anxiety, and restore focus outdoors.',
    color: 'from-emerald-400 to-teal-500',
    chip: 'Real Places',
  },
];

const stats = [
  { value: '4', label: 'Mental wellness modules connected in one flow' },
  { value: '10', label: 'Question quick personality format for better completion' },
  { value: '24/7', label: 'Safe-space chat availability for emotional support' },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="page-shell overflow-hidden">
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-white/90 border border-fuchsia-200 text-fuchsia-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8 shadow-md"
            >
              <Sparkles size={16} className="text-fuchsia-500" />
              Dynamic AI-Driven Care
            </motion.div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Mental Health,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 mt-2">Redesigned</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl font-medium">
              MindSpace connects intelligent screening, dynamic visual analysis, and holistic real-world recovery into a seamless, beautiful experience. 
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('facial')}
                className="brand-button w-full sm:w-auto text-lg px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-xl shadow-purple-500/30"
              >
                Scan Emotions
                <ArrowRight size={22} className="ml-2" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('chatbot')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 px-8 py-4 rounded-2xl font-bold border-2 border-slate-100 shadow-lg shadow-slate-200/50 transition-all"
              >
                <MessageCircleHeart size={22} className="text-pink-500" />
                Safe AI Chat
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5, delay: 0.2 }}
            className="glass-panel rounded-[2rem] p-8 border-white/50 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-300/20 to-purple-300/20 blur-3xl -z-10 rounded-full" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-slate-900">Your Journey</h3>
              <motion.span 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="text-xs font-black uppercase tracking-wider text-fuchsia-700 bg-fuchsia-100 border border-fuchsia-200 px-3 py-1.5 rounded-xl"
              >
                Live
              </motion.span>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Emotion Snapshot', icon: <Camera size={20} className="text-purple-600" /> },
                { label: 'Core Personality', icon: <ClipboardList size={20} className="text-amber-500" /> },
                { label: 'Wellbeing Risks', icon: <Activity size={20} className="text-rose-500" /> },
                { label: 'Nature Reset', icon: <Leaf size={20} className="text-emerald-500" /> },
              ].map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  whileHover={{ scale: 1.03, x: 5 }}
                  key={item.label} 
                  className="flex items-center gap-4 rounded-2xl border-2 border-white/60 bg-white/40 backdrop-blur-md px-4 py-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">{item.icon}</div>
                  <p className="text-base font-bold text-slate-700">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('student')}
              className="w-full mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white py-4 text-base font-bold shadow-xl shadow-slate-900/20"
            >
              <BarChart3 size={20} />
              View Dashboard
            </motion.button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-5xl"
        >
          {stats.map((stat, i) => (
            <motion.div 
              whileHover={{ y: -10, rotate: i % 2 === 0 ? 2 : -2 }}
              key={i} 
              className="glass-panel rounded-3xl p-8 border-2 border-white/50 text-center"
            >
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500 mb-3">{stat.value}</div>
              <div className="text-base font-semibold text-slate-500 leading-snug px-4">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Explore Modules</h2>
          <p className="text-lg text-slate-600 font-medium">Interact with our dynamic tools designed for modern mental wellness tracking.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, type: "spring", bounce: 0.4 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="group text-left glass-panel rounded-[2rem] p-8 border-2 border-white/60 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10" />
              <div className="flex items-start justify-between mb-8">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`p-4 rounded-2xl text-white bg-gradient-to-br ${feature.color} shadow-lg shadow-current`}
                >
                  {feature.icon}
                </motion.div>
                <span className="text-sm font-bold px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {feature.chip}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-base leading-relaxed mb-6 font-medium">{feature.description}</p>
              <div className="flex items-center gap-2 text-base font-bold text-purple-600">
                Launch Module <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ArrowRight size={18} /></motion.div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[3rem] p-12 sm:p-20 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500 to-transparent rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500 to-transparent rounded-full blur-3xl mix-blend-screen" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-center gap-4 mb-8">
              <motion.div whileHover={{ scale: 1.2, rotate: -10 }}><Heart size={40} className="text-pink-400" /></motion.div>
              <motion.div whileHover={{ scale: 1.2, rotate: 10 }}><Shield size={40} className="text-purple-400" /></motion.div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Safe, Secure & Private</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              We treat your data like our own. Completely anonymous screening. No unnecessary data storage. A purely reflective environment.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
