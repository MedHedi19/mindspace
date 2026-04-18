import { Camera, ClipboardList, Activity, Leaf, ArrowRight, Heart, Shield, Sparkles } from 'lucide-react';
import { Page } from '../types';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const features = [
  {
    id: 'facial' as Page,
    icon: <Camera size={28} />,
    title: 'Facial Emotion Analysis',
    description: 'Use your camera to detect real-time emotional states and gain insights into your current mental mood through advanced facial recognition.',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    accent: 'bg-sky-500',
    tag: 'AI Powered',
  },
  {
    id: 'personality' as Page,
    icon: <ClipboardList size={28} />,
    title: 'Personality Test',
    description: 'Discover your Big Five personality profile — Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    accent: 'bg-amber-500',
    tag: 'OCEAN Model',
  },
  {
    id: 'depression' as Page,
    icon: <Activity size={28} />,
    title: 'Depression Level Assessment',
    description: 'Take a clinically validated PHQ-9 screening to understand your current depression level and receive personalized guidance.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    accent: 'bg-rose-500',
    tag: 'PHQ-9 Validated',
  },
  {
    id: 'greenspaces' as Page,
    icon: <Leaf size={28} />,
    title: 'Green Space Recommendations',
    description: 'Explore curated natural environments near you specifically chosen to support mental wellness, stress relief, and emotional recovery.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    accent: 'bg-emerald-500',
    tag: 'Nature Therapy',
  },
];

const stats = [
  { value: '80%', label: 'of people feel calmer after spending time in nature' },
  { value: '60%', label: 'reduction in stress with regular mindfulness practice' },
  { value: '1 in 4', label: 'people experience mental health challenges each year' },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-sky-50/20">
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles size={14} />
            Your Mental Wellness Companion
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Understand Your Mind,
            <span className="text-emerald-500 block mt-1">Nurture Your Soul</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            MindSpace brings together AI-powered emotional analysis, scientifically-backed assessments, and nature-based therapy recommendations to support your mental health journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('facial')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5"
            >
              Start Analysis
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('depression')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold border border-slate-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              Take Assessment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center bg-white/80 backdrop-blur rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-500 leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything You Need</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Four powerful tools designed to give you a complete picture of your mental wellbeing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => onNavigate(feature.id)}
              className="group text-left bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${feature.color}`}>
                  {feature.icon}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${feature.color} border`}>
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{feature.description}</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 group-hover:gap-2.5 transition-all">
                Get Started <ArrowRight size={15} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Need Student Progress Insights?</h2>
          <p className="text-slate-500 mb-6 max-w-2xl mx-auto">
            Open the dedicated Student Progress section from the navigation bar to view marks, absences, and chart placeholders ready for AI integration.
          </p>
          <button
            onClick={() => onNavigate('student')}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-sky-200"
          >
            Open Student Progress
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden">
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
