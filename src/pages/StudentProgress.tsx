import { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';
import { fetchStudentProgress, fetchStudentProgressInsights } from '../services/studentProgressApi';
import type {
  StudentAbsence,
  StudentExamMark,
  StudentProgressInsights,
  StudentTrendPoint,
} from '../services/studentProgressApi';

export default function StudentProgress() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageScore, setAverageScore] = useState(0);
  const [totalAbsences, setTotalAbsences] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [examMarks, setExamMarks] = useState<StudentExamMark[]>([]);
  const [absencesByMonth, setAbsencesByMonth] = useState<StudentAbsence[]>([]);
  const [examTrend, setExamTrend] = useState<StudentTrendPoint[]>([]);
  const [aiInsights, setAiInsights] = useState<StudentProgressInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchStudentProgress();
        if (!mounted) return;

        setAverageScore(response.summary.averageScore);
        setTotalAbsences(response.summary.totalAbsences);
        setAttendanceRate(response.summary.attendanceRate);
        setExamMarks(response.examMarks);
        setAbsencesByMonth(response.absencesByMonth);
        setExamTrend(response.examTrend);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Could not load student progress data.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const analyzeWithAi = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const response = await fetchStudentProgressInsights();
      setAiInsights(response.analysis);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate AI insights.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/40 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <BarChart3 size={14} />
            Student Progress Section
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Student Exam & Absence Snapshot</h1>
          <p className="text-slate-500 max-w-2xl">A dedicated section for marks, absences, and chart-style analytics. You can connect this data to AI recommendations later.</p>
          {isLoading && <p className="text-sky-700 text-sm mt-3">Loading student data...</p>}
          {error && <p className="text-rose-600 text-sm mt-3">{error}</p>}

          <div className="mt-4">
            <button
              onClick={analyzeWithAi}
              disabled={isLoading || !!error || isAnalyzing}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              {isAnalyzing ? 'Analyzing with AI...' : 'Analyze Student Data with AI'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Average Mark</p>
            <p className="text-3xl font-bold text-slate-900">{averageScore}/20</p>
            <p className="text-sm text-emerald-600 mt-2">Steady performance trend</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Total Absences</p>
            <p className="text-3xl font-bold text-slate-900">{totalAbsences} days</p>
            <p className="text-sm text-amber-600 mt-2">Needs regular monitoring</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Attendance Rate</p>
            <p className="text-3xl font-bold text-slate-900">{attendanceRate}%</p>
            <p className="text-sm text-sky-600 mt-2">School year estimate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Exam Marks by Subject</h2>
            <div className="space-y-4">
              {examMarks.map((mark) => {
                const percent = Math.round((mark.score / mark.max) * 100);
                return (
                  <div key={mark.subject}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{mark.subject}</span>
                      <span className="font-semibold text-slate-900">{mark.score}/{mark.max}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-sky-500 rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Absence Chart (Monthly)</h2>
            <div className="flex items-end gap-3 h-44">
              {absencesByMonth.map((item) => {
                const height = item.days === 0 ? 8 : item.days * 26;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-rose-400/80 hover:bg-rose-500 transition-colors"
                      style={{ height: `${height}px` }}
                      title={`${item.days} absence day(s)`}
                    />
                    <span className="text-xs font-medium text-slate-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Placeholder alert: this chart can trigger AI warnings when absences spike.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Score Trend Chart</h2>
          <div className="flex items-end gap-2 h-32">
            {examTrend.map((value, index) => (
              <div key={index} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-sky-500 to-emerald-400"
                  style={{ height: `${value.value}%` }}
                />
                <span className="text-[10px] text-slate-500">{value.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">Trend values are loaded from your backend database.</p>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-3">AI Student Insights</h2>
          {!aiInsights && !isAnalyzing && !aiError && (
            <p className="text-sm text-slate-500">Click "Analyze Student Data with AI" to generate insights from current marks and absences.</p>
          )}
          {isAnalyzing && <p className="text-sm text-slate-500">Generating insights...</p>}
          {aiError && <p className="text-sm text-rose-600">{aiError}</p>}

          {aiInsights && (
            <div className="space-y-4 text-sm text-slate-700">
              <p className="text-slate-800 leading-relaxed">{aiInsights.overview}</p>
              <p>
                <span className="font-semibold">Risk level:</span> {aiInsights.riskLevel}
              </p>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Performance signals</p>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.performanceSignals.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Attendance signals</p>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.attendanceSignals.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Recommendations</p>
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.recommendations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-slate-500">Next check: {aiInsights.nextCheck}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
