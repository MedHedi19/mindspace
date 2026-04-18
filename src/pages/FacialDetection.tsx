import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import type { Emotion } from '../types';
import { analyzeFacialImage } from '../services/facialApi';

const moodAdvice: Record<string, { message: string; tip: string; color: string }> = {
  Happy: { message: "You're radiating positive energy!", tip: "Channel this joy into something creative or share it with someone who needs a lift.", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  Calm: { message: "You're in a peaceful state of mind.", tip: "This is the perfect moment for deep reflection or meditation.", color: "text-teal-600 bg-teal-50 border-teal-200" },
  Neutral: { message: "You appear balanced and composed.", tip: "Use this stable state to plan ahead or tackle challenging tasks.", color: "text-slate-600 bg-slate-50 border-slate-200" },
  Anxious: { message: "Some stress or worry detected.", tip: "Try a 4-7-8 breathing exercise: inhale 4 counts, hold 7, exhale 8.", color: "text-orange-600 bg-orange-50 border-orange-200" },
  Sad: { message: "You seem to be carrying some sadness.", tip: "Be gentle with yourself. Consider reaching out to a trusted friend or taking a walk outside.", color: "text-blue-600 bg-blue-50 border-blue-200" },
  Angry: { message: "Some tension or frustration detected.", tip: "Step away for 5 minutes and take deep slow breaths to calm your nervous system.", color: "text-red-600 bg-red-50 border-red-200" },
  Disgust: { message: "You may be feeling discomfort right now.", tip: "Create a little distance from the trigger, then take a few slow breaths.", color: "text-lime-700 bg-lime-50 border-lime-200" },
  Thoughtful: { message: "You're in a reflective state.", tip: "Journaling right now could help you process your thoughts effectively.", color: "text-violet-600 bg-violet-50 border-violet-200" },
  Surprised: { message: "Something caught you off guard!", tip: "Embrace the unexpected — novelty and surprise can spark creativity.", color: "text-sky-600 bg-sky-50 border-sky-200" },
};

export default function FacialDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [emotions, setEmotions] = useState<Emotion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraActive(true);
      setEmotions(null);
    } catch {
      setError("Camera access denied. Please allow camera permissions and try again.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraActive(false);
    setEmotions(null);
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  const runAnalysis = () => {
    if (!videoRef.current) {
      setError('Camera preview is not ready. Please try again.');
      return;
    }

    setAnalyzing(true);
    setEmotions(null);
    setError(null);
    setCountdown(3);

    let count = 3;
    const countInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countInterval);
        setCountdown(null);

        const videoEl = videoRef.current;
        if (!videoEl) {
          setAnalyzing(false);
          setError('Camera preview is unavailable.');
          return;
        }

        const width = videoEl.videoWidth || 640;
        const height = videoEl.videoHeight || 480;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setAnalyzing(false);
          setError('Could not capture camera frame.');
          return;
        }

        ctx.drawImage(videoEl, 0, 0, width, height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);

        analyzeFacialImage(imageBase64)
          .then((response) => {
            setEmotions(response.emotions);
          })
          .catch((err) => {
            const message = err instanceof Error ? err.message : 'Real facial analysis failed.';
            setError(message);
          })
          .finally(() => {
            setAnalyzing(false);
          });
      }
    }, 1000);
  };

  const dominantEmotion = emotions ? emotions.reduce((a, b) => a.score > b.score ? a : b) : null;
  const advice = dominantEmotion ? moodAdvice[dominantEmotion.label] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/30 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Camera size={14} />
            AI Facial Analysis
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Emotion Detection</h1>
          <p className="text-slate-500 max-w-xl">Activate your camera to run real facial emotion analysis from a live captured frame.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-xl">
              {cameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {analyzing && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                      {countdown !== null ? (
                        <div className="text-7xl font-bold text-white animate-pulse">{countdown}</div>
                      ) : (
                        <>
                          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-white text-sm font-medium">Analyzing emotions...</p>
                        </>
                      )}
                    </div>
                  )}
                  {!analyzing && emotions && (
                    <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <CheckCircle size={12} />
                      Analysis Complete
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-500/80 backdrop-blur px-2.5 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-xs font-medium">LIVE</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 p-8">
                  <Camera size={48} className="mx-auto mb-3 text-slate-600 opacity-50" />
                  <p className="text-sm font-medium">Camera inactive</p>
                  <p className="text-xs mt-1 text-slate-600">Click below to start</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-sky-200"
                >
                  <Camera size={18} />
                  Activate Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200"
                  >
                    <Zap size={18} />
                    {analyzing ? 'Analyzing...' : 'Analyze Now'}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all"
                  >
                    <RefreshCw size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {emotions ? (
              <>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Emotion Breakdown</h3>
                  <div className="space-y-3">
                    {emotions.map((emotion) => (
                      <div key={emotion.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{emotion.label}</span>
                          <span className="text-slate-500">{emotion.score}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${emotion.color} rounded-full transition-all duration-700`}
                            style={{ width: `${emotion.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {advice && dominantEmotion && (
                  <div className={`rounded-2xl p-5 border ${advice.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={18} />
                      <span className="font-bold">Dominant: {dominantEmotion.label}</span>
                    </div>
                    <p className="font-medium text-sm mb-2">{advice.message}</p>
                    <p className="text-sm opacity-80">{advice.tip}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-60">
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-4">
                  <Camera size={32} className="text-sky-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Ready to Analyze</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Activate your camera and click "Analyze Now" to detect your current emotional state.
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3 w-full">
                  {['Happy', 'Calm', 'Focused', 'Anxious', 'Sad', 'Angry'].map((e) => (
                    <div key={e} className="bg-slate-50 rounded-lg py-2 px-3 text-xs text-slate-500 font-medium text-center border border-slate-100">
                      {e}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
