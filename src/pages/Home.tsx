import { Camera, ClipboardList, Activity, Leaf, ArrowRight, Heart, Shield, Sparkles, ScanFace, Trees, MessageCircleHeart, BarChart3 } from 'lucide-react';
import { Page } from '../types';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    id: 'facial' as Page,
    icon: <ScanFace size={28} />,
    title: 'Facial Emotion Analysis',
    description: 'Capture your current emotional snapshot through real-time facial expression signals and get an immediate breakdown.',
    color: 'from-sky-500 to-cyan-500',
    chip: 'AI Vision',
  },
  {
    id: 'personality' as Page,
    icon: <ClipboardList size={28} />,
    title: 'Personality Quick Test',
    description: 'Run a concise OCEAN-based profile to understand behavior patterns, strengths, and emotional tendencies.',
    color: 'from-amber-500 to-orange-500',
    chip: 'OCEAN',
  },
  {
    id: 'depression' as Page,
    icon: <Activity size={28} />,
    title: 'Depression Level Assessment',
    description: 'Use a PHQ-9 style flow to check your current depression risk level and receive practical, supportive next steps.',
    color: 'from-rose-500 to-pink-500',
    chip: 'PHQ-9',
  },
  {
    id: 'greenspaces' as Page,
    icon: <Trees size={28} />,
    title: 'Monastir Green Spaces',
    description: 'Access real places in Monastir and live nearby discovery to reset stress, calm anxiety, and restore focus outdoors.',
    color: 'from-emerald-500 to-teal-500',
    chip: 'Real Places',
  },
];

const stats = [
  { value: '4', label: 'mental wellness modules connected in one flow' },
  { value: '10', label: 'question quick personality format for better completion' },
  { value: '24/7', label: 'safe-space chat availability for emotional support' },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="page-shell">
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/90 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Heart size={14} />
              AI-driven care + emotional safety
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.05] mb-6">
              Mental Health,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mt-1">Designed Like a Real Product</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl">
              MindSpace combines screening tools, facial emotion signals, safe AI conversation, and Monastir-based nature recommendations in one intentional experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onNavigate('facial')}
                className="brand-button"
              >
                Start Emotional Scan
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => onNavigate('chatbot')}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 transition-all duration-200"
              >
                <MessageCircleHeart size={17} className="text-teal-600" />
                Open Safe Chat
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 sm:p-7 border-emerald-100/80">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Live Journey Map</h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">Guided</span>
            </div>

            <div className="space-y-3">
              {[
                { label: '1. Quick check-in', icon: <Camera size={16} className="text-sky-600" /> },
                { label: '2. Personality pattern', icon: <ClipboardList size={16} className="text-amber-600" /> },
                { label: '3. Mood risk screening', icon: <Activity size={16} className="text-rose-600" /> },
                { label: '4. Green-space reset', icon: <Leaf size={16} className="text-emerald-600" /> },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">{item.icon}</div>
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('student')}
              className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 py-2.5 text-sm font-semibold hover:bg-sky-100 transition-colors"
            >
              <BarChart3 size={16} />
              Open Student Progress Panel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 max-w-4xl">
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 border border-slate-100">
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Core Modules</h2>
            <p className="text-slate-600 max-w-2xl">Choose where to start based on how you feel today. Every module feeds a broader wellbeing picture.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500">
            <Sparkles size={14} />
            Intentional UX, not generic cards
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="group text-left glass-panel rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`p-3 rounded-xl text-white bg-gradient-to-br ${feature.color} shadow-sm`}>
                  {feature.icon}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {feature.chip}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{feature.description}</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 group-hover:gap-2.5 transition-all">
                Get Started <ArrowRight size={15} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden shadow-xl shadow-emerald-100/40">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 w-32 h-32 rounded-full bg-white" />
            <div className="absolute bottom-4 right-8 w-48 h-48 rounded-full bg-white" />
          </div>
          <div className="relative">
            <div className="flex justify-center gap-3 mb-6">
              <Heart size={28} className="text-white/80" />
              <Shield size={28} className="text-white/80" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your data stays private</h2>
            <p className="text-white/80 max-w-xl mx-auto text-base leading-relaxed">
              All assessments are completely anonymous. No personal health data is stored without your consent. MindSpace is a self-reflection tool, not a clinical service.
            </p>
            <p className="text-white/60 text-sm mt-4">
              If you are in crisis, please contact a mental health professional or call your local emergency services.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
