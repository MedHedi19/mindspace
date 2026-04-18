export interface AssessmentPayload {
  type: 'depression' | 'personality';
  scores: Record<string, number>;
  responses: number[];
  meta?: Record<string, unknown>;
  model?: string;
}

export interface AnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high' | string;
  disclaimer: string;
}

export interface AnalyzeApiResponse {
  ok: boolean;
  model: string;
  createdAt?: string;
  analysis: AnalysisResult;
  saved?: boolean;
  recordId?: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';

export async function analyzeAndSaveAssessment(payload: AssessmentPayload): Promise<AnalyzeApiResponse> {
  const response = await fetch(`${BACKEND_URL}/api/analyze-and-save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Failed to analyze assessment.';
    throw new Error(message);
  }

  return data as AnalyzeApiResponse;
}
