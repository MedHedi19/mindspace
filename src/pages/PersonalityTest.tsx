import { useState } from 'react';
import { ClipboardList, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { personalityQuestions } from '../data/PersonalityQuestion';
import type { PersonalityResult } from '../types';
import type { AnalysisResult } from '../services/analysisApi';
import { analyzeAndSaveAssessment } from '../services/analysisApi';

const scaleLabels = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

const traitInfo: Record<keyof PersonalityResult, { label: string; color: string; barColor: string; description: string; high: string; low: string }> = {
  openness: {
    label: 'Openness',
    color: 'text-violet-700 bg-violet-50 border-violet-200',
    barColor: 'bg-violet-500',
    description: 'Curiosity, creativity, and openness to new experiences.',
    high: 'Highly creative, curious, and open to new ideas and experiences.',
    low: 'Prefers routine, conventional, and familiar activities.',
  },
  conscientiousness: {
    label: 'Conscientiousness',
    color: 'text-sky-700 bg-sky-50 border-sky-200',
    barColor: 'bg-sky-500',
    description: 'Organization, discipline, and goal-directed behavior.',
    high: 'Organized, dependable, and highly self-disciplined.',
    low: 'More flexible and spontaneous, may struggle with structure.',
  },
  extraversion: {
    label: 'Extraversion',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    barColor: 'bg-amber-500',
    description: 'Sociability, assertiveness, and emotional positivity.',
    high: 'Outgoing, energetic, and thrives in social environments.',
    low: 'Introverted, prefers solitude and deep one-on-one interactions.',
  },
  agreeableness: {
    label: 'Agreeableness',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    barColor: 'bg-emerald-500',
    description: 'Compassion, cooperation, and trust in others.',
    high: 'Empathetic, cooperative, and highly considerate of others.',
    low: 'More competitive, skeptical, and prioritizes personal goals.',
  },
  neuroticism: {
    label: 'Neuroticism',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    barColor: 'bg-rose-500',
    description: 'Emotional instability, anxiety, and mood fluctuations.',
    high: 'Prone to stress, anxiety, and emotional reactivity.',
    low: 'Emotionally stable, calm, and resilient under pressure.',
  },
};

export default function PersonalityTest() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);

  const activeQuestion = personalityQuestions[currentQuestion];
  const activeAnswer = answers[activeQuestion.id];
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / personalityQuestions.length) * 100;

  const setAnswer = (id: number, val: number) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const calculateResult = async () => {
    const traitSums: Record<string, number[]> = { openness: [], conscientiousness: [], extraversion: [], agreeableness: [], neuroticism: [] };
    personalityQuestions.forEach(q => {
      if (answers[q.id] !== undefined) traitSums[q.trait].push(answers[q.id]);
    });
    const res: PersonalityResult = {
      openness: Math.round((traitSums.openness.reduce((a, b) => a + b, 0) / (traitSums.openness.length * 5)) * 100),
      conscientiousness: Math.round((traitSums.conscientiousness.reduce((a, b) => a + b, 0) / (traitSums.conscientiousness.length * 5)) * 100),
      extraversion: Math.round((traitSums.extraversion.reduce((a, b) => a + b, 0) / (traitSums.extraversion.length * 5)) * 100),
      agreeableness: Math.round((traitSums.agreeableness.reduce((a, b) => a + b, 0) / (traitSums.agreeableness.length * 5)) * 100),
      neuroticism: Math.round((traitSums.neuroticism.reduce((a, b) => a + b, 0) / (traitSums.neuroticism.length * 5)) * 100),
    };
    setResult(res);

    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);

    try {
      const orderedResponses = personalityQuestions.map((question) => answers[question.id] ?? 0);
      const response = await analyzeAndSaveAssessment({
        type: 'personality',
        scores: {
          openness: res.openness,
          conscientiousness: res.conscientiousness,
          extraversion: res.extraversion,
          agreeableness: res.agreeableness,
          neuroticism: res.neuroticism,
        },
        responses: orderedResponses,
        meta: {
          source: 'mindspace-personality-test',
        },
      });

      setAiAnalysis(response.analysis);
      setRecordId(response.recordId ?? null);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to generate AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
    setAiAnalysis(null);
    setAiError(null);
    setIsAnalyzing(false);
    setRecordId(null);
  };

  if (result) {
    const dominant = (Object.entries(result) as [keyof PersonalityResult, number][]).reduce((a, b) => a[1] > b[1] ? a : b);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Personality Profile</h1>
            <p className="text-slate-500">Based on the Big Five (OCEAN) personality model</p>
          </div>

          <div className={`rounded-2xl p-5 border mb-6 ${traitInfo[dominant[0]].color}`}>
            <div className="text-sm font-semibold mb-1">Dominant Trait</div>
            <div className="text-2xl font-bold">{traitInfo[dominant[0]].label}</div>
            <p className="text-sm mt-1 opacity-80">{dominant[1] >= 60 ? traitInfo[dominant[0]].high : traitInfo[dominant[0]].low}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5 mb-6">
            {(Object.entries(result) as [keyof PersonalityResult, number][]).map(([trait, score]) => {
              const info = traitInfo[trait];
              return (
                <div key={trait}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-slate-800">{info.label}</span>
                      <p className="text-xs text-slate-500">{info.description}</p>
                    </div>
                    <span className="text-lg font-bold text-slate-700">{score}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${info.barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{score >= 60 ? info.high : info.low}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-bold text-slate-900 mb-3">AI Analysis (Ollama)</h3>

            {isAnalyzing && <p className="text-sm text-slate-500">Analyzing your profile...</p>}

            {aiError && <p className="text-sm text-rose-600">{aiError}</p>}

            {aiAnalysis && (
              <div className="space-y-3 text-sm text-slate-700">
                <p className="text-slate-800 leading-relaxed">{aiAnalysis.summary}</p>
                <p>
                  <span className="font-semibold">Risk level:</span> {aiAnalysis.riskLevel}
                </p>
                <div>
                  <p className="font-semibold text-slate-900 mb-1">Key insights</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {aiAnalysis.insights.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-1">Suggested actions</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {aiAnalysis.recommendations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-slate-500">{aiAnalysis.disclaimer}</p>
              </div>
            )}
          </div>

          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-amber-200"
          >
            <RotateCcw size={18} />
            Retake Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <ClipboardList size={14} />
            OCEAN Personality Test
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Personality Assessment</h1>
          <p className="text-slate-500">Answer honestly — there are no right or wrong answers.</p>
        </div>

        <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center justify-between px-4 py-2 mb-2">
            <span className="text-sm font-medium text-slate-600">
              Question {currentQuestion + 1} of {personalityQuestions.length}
            </span>
            <span className="text-sm font-semibold text-amber-600">
              {totalAnswered}/{personalityQuestions.length} answered
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full mx-4 mb-1 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <p className="font-medium text-slate-800 mb-4 leading-relaxed">
              <span className="text-amber-500 font-bold mr-2">{currentQuestion + 1}.</span>
              {activeQuestion.text}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {scaleLabels.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setAnswer(activeQuestion.id, s.value)}
                  title={s.label}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all duration-150 ${
                    activeAnswer === s.value
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <span className="font-bold text-sm">{s.value}</span>
                  <span className="text-[9px] leading-tight text-center hidden sm:block opacity-70">{s.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion(q => q - 1)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold transition-all"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          {currentQuestion < personalityQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(q => q + 1)}
              disabled={activeAnswer === undefined}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-amber-200"
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={calculateResult}
              disabled={totalAnswered < personalityQuestions.length}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200"
            >
              View My Results
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
