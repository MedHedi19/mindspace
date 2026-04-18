import { useState } from 'react';
import { Activity, RotateCcw, AlertTriangle, CheckCircle, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { depressionQuestions, depressionFrequencies } from '../data/DepressionQuestion';
import type { Page } from '../types';
import type { AnalysisResult } from '../services/analysisApi';
import { analyzeAndSaveAssessment } from '../services/analysisApi';

interface DepressionDetectionProps {
  onNavigate: (page: Page) => void;
}

interface LevelInfo {
  label: string;
  color: string;
  barColor: string;
  bgGradient: string;
  icon: React.ReactNode;
  description: string;
  recommendations: string[];
  professional: boolean;
}

const levelInfo: LevelInfo[] = [
  {
    label: 'Minimal or No Depression',
    color: 'text-emerald-700',
    barColor: 'bg-emerald-500',
    bgGradient: 'from-emerald-50 to-teal-50 border-emerald-200',
    icon: <CheckCircle size={24} className="text-emerald-600" />,
    description: 'Your responses suggest little to no signs of depression at this time. You appear to be coping well with daily life.',
    recommendations: [
      'Maintain your current healthy habits and routines',
      'Continue engaging in activities that bring you joy',
      'Stay connected with supportive friends and family',
      'Regular exercise and good sleep hygiene are protective factors',
    ],
    professional: false,
  },
  {
    label: 'Mild Depression',
    color: 'text-yellow-700',
    barColor: 'bg-yellow-500',
    bgGradient: 'from-yellow-50 to-amber-50 border-yellow-200',
    icon: <Info size={24} className="text-yellow-600" />,
    description: 'You show some signs of mild depression. While not severe, these feelings deserve attention and self-care.',
    recommendations: [
      'Practice daily mindfulness or meditation for 10-15 minutes',
      'Increase physical activity — even short walks help significantly',
      'Spend time in natural green spaces to boost your mood',
      'Talk to a trusted friend or family member about how you feel',
      'Limit alcohol and ensure quality sleep (7-9 hours)',
    ],
    professional: false,
  },
  {
    label: 'Moderate Depression',
    color: 'text-orange-700',
    barColor: 'bg-orange-500',
    bgGradient: 'from-orange-50 to-amber-50 border-orange-200',
    icon: <AlertTriangle size={24} className="text-orange-600" />,
    description: 'Your responses indicate moderate depression symptoms. Professional support would be highly beneficial at this level.',
    recommendations: [
      'Consult a mental health professional — therapy is very effective here',
      'Explore cognitive behavioral therapy (CBT) techniques',
      'Build a consistent daily routine to create structure',
      'Prioritize nature exposure and regular outdoor activity',
      'Consider joining a support group or community program',
    ],
    professional: true,
  },
  {
    label: 'Moderately Severe Depression',
    color: 'text-red-700',
    barColor: 'bg-red-500',
    bgGradient: 'from-red-50 to-rose-50 border-red-200',
    icon: <AlertTriangle size={24} className="text-red-600" />,
    description: 'Your symptoms suggest moderately severe depression. Professional intervention is strongly recommended.',
    recommendations: [
      'Seek professional mental health care as soon as possible',
      'Discuss treatment options (therapy, medication) with a doctor',
      'Do not isolate — maintain daily social contact if possible',
      'Remove access to anything that could cause self-harm',
      'Emergency contacts: call a crisis line or trusted person',
    ],
    professional: true,
  },
  {
    label: 'Severe Depression',
    color: 'text-red-900',
    barColor: 'bg-red-700',
    bgGradient: 'from-red-100 to-rose-100 border-red-300',
    icon: <AlertTriangle size={24} className="text-red-800" />,
    description: 'This score indicates severe depression. Please reach out to a mental health professional or emergency services immediately.',
    recommendations: [
      'Contact a crisis helpline immediately if you feel unsafe',
      'Go to the nearest emergency room if you have thoughts of self-harm',
      'Tell someone you trust about how you are feeling right now',
      'Seek immediate professional psychiatric evaluation',
      'You are not alone — help is available and recovery is possible',
    ],
    professional: true,
  },
];

function getLevel(score: number): LevelInfo {
  if (score <= 4) return levelInfo[0];
  if (score <= 9) return levelInfo[1];
  if (score <= 14) return levelInfo[2];
  if (score <= 19) return levelInfo[3];
  return levelInfo[4];
}

export default function DepressionDetection({ onNavigate }: DepressionDetectionProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<{ score: number; level: LevelInfo } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);

  const totalAnswered = Object.keys(answers).length;
  const allAnswered = totalAnswered === depressionQuestions.length;
  const activeQuestion = depressionQuestions[currentQuestion];
  const activeAnswer = answers[activeQuestion.id];
  const progress = (totalAnswered / depressionQuestions.length) * 100;

  const setAnswer = (id: number, val: number) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const calculate = async () => {
    const score = Object.values(answers).reduce((a, b) => a + b, 0);
    setResult({ score, level: getLevel(score) });

    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysis(null);

    try {
      const orderedResponses = depressionQuestions.map((question) => answers[question.id] ?? 0);
      const response = await analyzeAndSaveAssessment({
        type: 'depression',
        scores: { phq9: score },
        responses: orderedResponses,
        meta: {
          source: 'mindspace-depression-test',
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
    const pct = Math.round((result.score / 27) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50/20 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Results</h1>
            <p className="text-slate-500 text-sm">PHQ-9 Depression Screening — for informational purposes only</p>
          </div>

          <div className={`rounded-2xl p-6 border bg-gradient-to-br mb-6 ${result.level.bgGradient}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.level.icon}
              <div>
                <div className="font-bold text-lg text-slate-900">{result.level.label}</div>
                <div className="text-sm text-slate-600">Score: {result.score} / 27</div>
              </div>
            </div>
            <div className="h-3 bg-white/60 rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full ${result.level.barColor} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{result.level.description}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-bold text-slate-900 mb-4">Recommendations</h3>
            <ul className="space-y-3">
              {result.level.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-emerald-700 font-bold text-[10px]">{i + 1}</span>
                  </div>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-bold text-slate-900 mb-3">AI Analysis (Ollama)</h3>

            {isAnalyzing && <p className="text-sm text-slate-500">Analyzing your results...</p>}

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
                {recordId && <p className="text-xs text-emerald-700">Saved in database with record #{recordId}.</p>}
              </div>
            )}
          </div>

          {result.level.professional && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800 text-sm mb-1">Professional support recommended</p>
                <p className="text-rose-700 text-xs leading-relaxed">This tool is not a clinical diagnosis. Please consult a qualified mental health professional for proper evaluation and treatment.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-all"
            >
              <RotateCcw size={18} />
              Retake
            </button>
            <button
              onClick={() => onNavigate('greenspaces')}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200"
            >
              See Green Spaces
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50/20 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Activity size={14} />
            PHQ-9 Depression Screening
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Depression Assessment</h1>
          <p className="text-slate-500 mb-4">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-sm leading-relaxed">
              This is a self-screening tool based on the validated PHQ-9 questionnaire. It is not a clinical diagnosis. Please consult a mental health professional if you have concerns.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center justify-between px-4 py-2 mb-2">
            <span className="text-sm font-medium text-slate-600">
              Question {currentQuestion + 1} of {depressionQuestions.length}
            </span>
            <span className="text-sm font-semibold text-rose-600">
              {totalAnswered}/{depressionQuestions.length} answered
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full mx-4 mb-1 overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <p className="text-sm font-medium text-slate-800 mb-4 leading-relaxed">
            <span className="text-rose-500 font-bold mr-1.5">{currentQuestion + 1}.</span>
            {activeQuestion.text}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {depressionFrequencies.map(f => (
              <button
                key={f.value}
                onClick={() => setAnswer(activeQuestion.id, f.value)}
                className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  activeAnswer === f.value
                    ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                <span className="font-bold text-base">{f.value}</span>
                <span className="leading-tight text-center mt-0.5 opacity-80 text-[10px]">{f.label}</span>
              </button>
            ))}
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

          {currentQuestion < depressionQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(q => q + 1)}
              disabled={activeAnswer === undefined}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-rose-200"
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={calculate}
              disabled={!allAnswered}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-rose-200"
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
