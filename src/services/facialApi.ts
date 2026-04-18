import type { Emotion } from '../types';

interface FacialAnalyzeResponse {
  ok: boolean;
  emotions: Emotion[];
  faceCount: number;
  source: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000';

export async function analyzeFacialImage(imageBase64: string): Promise<FacialAnalyzeResponse> {
  const response = await fetch(`${BACKEND_URL}/api/facial-analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64 }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Facial analysis failed.');
  }

  return data as FacialAnalyzeResponse;
}
