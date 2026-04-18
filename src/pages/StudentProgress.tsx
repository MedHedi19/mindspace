import { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle, Sparkles } from 'lucide-react';
import { fetchStudentProgress, fetchStudentProgressInsights } from '../services/studentProgressApi';
import type {
  StudentAbsence,
  StudentExamMark,
  StudentProgressInsights,
  StudentTrendPoint,
} from '../services/studentProgressApi';
import { motion } from 'framer-motion';

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

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="page-shell pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-5 py-2 rounded-full text-sm font-bold mb-5 shadow-sm">
            <BarChart3 size={16} />
            Student Progress Section
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Student Intelligence</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">Track marks, attendance, trend patterns, and AI-generated study actions from one unified dynamic dashboard.</p>
          {isLoading && <p className="text-purple-600 text-sm mt-4 font-bold animate-pulse">Loading intelligence data...</p>}
          {error && <p className="text-rose-600 text-sm mt-4 font-bold">{error}</p>}

          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeWithAi}
              disabled={isLoading || !!error || isAnalyzing}
              className="inline-flex items-center gap-2 brand-button px-8 py-3.5 shadow-xl shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {isAnalyzing ? 'Analyzing with AI...' : 'Analyze Data with AI'}
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={slideUp} whileHover={{ y: -5 }} className="glass-panel rounded-[2rem] p-6 border-white/60 shadow-lg">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Average Mark</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600">{averageScore}/20</p>
            <p className="text-sm text-purple-600 font-bold mt-2">Steady performance trend</p>
          </motion.div>
          <motion.div variants={slideUp} whileHover={{ y: -5 }} className="glass-panel rounded-[2rem] p-6 border-white/60 shadow-lg">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Absences</p>
            <p className="text-4xl font-black text-slate-800">{totalAbsences} <span className="text-lg text-slate-500">days</span></p>
            <p className="text-sm text-amber-500 font-bold mt-2">Needs regular monitoring</p>
          </motion.div>
          <motion.div variants={slideUp} whileHover={{ y: -5 }} className="glass-panel rounded-[2rem] p-6 border-white/60 shadow-lg">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Attendance Rate</p>
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">{attendanceRate}%</p>
            <p className="text-sm text-blue-600 font-bold mt-2">School year estimate</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-[2rem] p-8 border-white/60 shadow-lg"
          >
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Exam Marks by Subject</h2>
            <div className="space-y-5">
              {examMarks.map((mark, i) => {
                const percent = Math.round((mark.score / mark.max) * 100);
                return (
                  <div key={mark.subject}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-bold text-slate-700">{mark.subject}</span>
                      <span className="font-black text-slate-900">{mark.score}/{mark.max}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1, type: "spring" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-[2rem] p-8 border-white/60 shadow-lg"
          >
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Absence Chart (Monthly)</h2>
            <div className="flex items-end justify-between gap-2 h-44 px-2">
              {absencesByMonth.map((item, i) => {
                const height = item.days === 0 ? 8 : item.days * 26;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-3">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}px` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                      whileHover={{ scale: 1.1, backgroundColor: "#f43f5e" }}
                      className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-pink-400 to-rose-400 shadow-sm cursor-pointer"
                      title={`${item.days} absence day(s)`}
                    />
                    <span className="text-xs font-bold text-slate-500">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-3 shadow-inner">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-amber-800">Placeholder alert: this chart can trigger AI warnings when absences spike.</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass-panel rounded-[2rem] p-8 border-white/60 shadow-lg"
        >
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">Score Trend Tracker</h2>
          <div className="flex items-end gap-2 h-36 border-b-2 border-slate-100 pb-2">
            {examTrend.map((value, index) => (
              <div key={index} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group cursor-pointer">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${value.value}%` }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.05, type: "spring" }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-400 group-hover:from-purple-500 group-hover:to-pink-400 transition-colors shadow-sm"
                />
                <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6">{value.value}%</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 px-2">
            {examTrend.map((value, index) => (
              <span key={index} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">{value.label}</span>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-4 text-center">Trend values represent actual historical backend database points.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 glass-panel rounded-[2rem] p-8 border-white/60 shadow-xl shadow-fuchsia-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-100 to-purple-100 blur-3xl -z-10 rounded-full" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-600">AI Student Insights</h2>
          {!aiInsights && !isAnalyzing && !aiError && (
            <p className="text-base font-medium text-slate-500 bg-white/50 p-4 rounded-xl border border-slate-100">Click "Analyze Data with AI" to generate real-time predictive insights.</p>
          )}
          {isAnalyzing && (
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl text-purple-600 font-bold animate-pulse">
              <Sparkles size={18} /> Generating intelligence...
            </div>
          )}
          {aiError && <p className="text-sm font-bold text-rose-600 bg-rose-50 p-4 rounded-xl">{aiError}</p>}

          {aiInsights && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-sm text-slate-700 mt-6"
            >
              <p className="text-slate-800 text-lg font-semibold leading-relaxed border-l-4 border-purple-500 pl-4">{aiInsights.overview}</p>
              
              <div className="flex items-center gap-2 bg-white/60 p-3 rounded-xl border border-slate-100 w-max">
                <span className="font-bold text-slate-900">Current Risk Level:</span> 
                <span className={`font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider ${aiInsights.riskLevel.includes('Low') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {aiInsights.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-white/40 p-5 rounded-2xl border border-white">
                  <p className="font-bold text-slate-900 mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-purple-500"/> Performance Signals</p>
                  <ul className="space-y-2">
                    {aiInsights.performanceSignals.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"/>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/40 p-5 rounded-2xl border border-white">
                  <p className="font-bold text-slate-900 mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-fuchsia-500"/> Attendance Signals</p>
                  <ul className="space-y-2">
                    {aiInsights.attendanceSignals.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1.5 shrink-0"/>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-2xl border border-purple-100/50 mt-4">
                <p className="font-extrabold text-purple-900 mb-3 text-lg">Recommended Interventions</p>
                <ul className="space-y-2.5">
                  {aiInsights.recommendations.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 font-semibold text-purple-800 bg-white/60 p-3 rounded-xl border border-purple-100/50">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-xs shrink-0">{index + 1}</div>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center pt-2">Next check scheduled: {aiInsights.nextCheck}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
