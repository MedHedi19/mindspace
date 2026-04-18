export interface StudentExamMark {
  subject: string;
  score: number;
  max: number;
}

export interface StudentAbsence {
  month: string;
  days: number;
}

export interface StudentTrendPoint {
  label: string;
  value: number;
}

export interface StudentProgressResponse {
  ok: boolean;
  summary: {
    averageScore: number;
    totalAbsences: number;
    attendanceRate: number;
  };
  examMarks: StudentExamMark[];
  absencesByMonth: StudentAbsence[];
  examTrend: StudentTrendPoint[];
}

export interface StudentProgressInsights {
  overview: string;
  performanceSignals: string[];
  attendanceSignals: string[];
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high' | string;
  nextCheck: string;
}

export interface StudentProgressInsightsResponse {
  ok: boolean;
  model: string;
  analysis: StudentProgressInsights;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';

export async function fetchStudentProgress(): Promise<StudentProgressResponse> {
  const response = await fetch(`${BACKEND_URL}/api/student-progress`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to fetch student progress data.');
  }

  return data as StudentProgressResponse;
}

export async function fetchStudentProgressInsights(model?: string): Promise<StudentProgressInsightsResponse> {
  const response = await fetch(`${BACKEND_URL}/api/student-progress-insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(model ? { model } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to generate AI insights for student progress.');
  }

  return data as StudentProgressInsightsResponse;
}
