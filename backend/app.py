import base64
import json
import logging
import os
import time
from io import BytesIO
from typing import Any, Dict, Optional, Tuple
from uuid import uuid4

import mysql.connector
import numpy as np
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

try:
    from fer import FER
except Exception:  # pragma: no cover - optional dependency at runtime
    FER = None

load_dotenv()

app = Flask(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5173")
CORS(
    app,
    resources={r"/api/*": {"origins": [frontend_origin, "http://localhost:5173"]}},
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5")
OLLAMA_TIMEOUT_SECONDS = int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "180"))
OLLAMA_RETRIES = int(os.getenv("OLLAMA_RETRIES", "1"))
IDENTITY_KEYS = {"user", "user_id", "userid", "account_id", "session_id", "email", "username"}

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "mindspace")
CHAT_MEMORY_TURNS = int(os.getenv("CHAT_MEMORY_TURNS", "8"))

CHAT_SESSIONS: Dict[str, list] = {}
FACIAL_LABEL_COLORS = {
    "Happy": "bg-yellow-400",
    "Neutral": "bg-slate-400",
    "Sad": "bg-blue-400",
    "Anxious": "bg-orange-400",
    "Angry": "bg-red-400",
    "Surprised": "bg-sky-400",
}


def mysql_connection(include_database: bool = True) -> mysql.connector.MySQLConnection:
    config = {
        "host": DB_HOST,
        "port": DB_PORT,
        "user": DB_USER,
        "password": DB_PASSWORD,
        "autocommit": True,
    }
    if include_database:
        config["database"] = DB_NAME
    return mysql.connector.connect(**config)


def initialize_database() -> None:
    conn = mysql_connection(include_database=False)
    cursor = conn.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    cursor.close()
    conn.close()

    conn = mysql_connection(include_database=True)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS assessment_runs (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            assessment_type VARCHAR(50) NOT NULL,
            model_name VARCHAR(120) NOT NULL,
            score_json JSON NOT NULL,
            responses_json JSON NOT NULL,
            meta_json JSON,
            analysis_json JSON,
            risk_level VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS student_exam_marks (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            subject VARCHAR(120) NOT NULL UNIQUE,
            score INT NOT NULL,
            max_score INT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS student_absences (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            month_order INT NOT NULL UNIQUE,
            month_label VARCHAR(20) NOT NULL,
            days INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS student_exam_trends (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            term_order INT NOT NULL UNIQUE,
            term_label VARCHAR(20) NOT NULL,
            value INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """
    )

    cursor.execute("SELECT COUNT(*) FROM student_exam_marks")
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            "INSERT INTO student_exam_marks (subject, score, max_score) VALUES (%s, %s, %s)",
            [
                ("Mathematics", 17, 20),
                ("Science", 15, 20),
                ("English", 18, 20),
                ("History", 14, 20),
                ("Computer", 19, 20),
            ],
        )

    cursor.execute("SELECT COUNT(*) FROM student_absences")
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            "INSERT INTO student_absences (month_order, month_label, days) VALUES (%s, %s, %s)",
            [
                (1, "Jan", 1),
                (2, "Feb", 2),
                (3, "Mar", 0),
                (4, "Apr", 3),
                (5, "May", 1),
            ],
        )

    cursor.execute("SELECT COUNT(*) FROM student_exam_trends")
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            "INSERT INTO student_exam_trends (term_order, term_label, value) VALUES (%s, %s, %s)",
            [
                (1, "T1", 65),
                (2, "T2", 72),
                (3, "T3", 78),
                (4, "T4", 75),
                (5, "T5", 84),
                (6, "T6", 88),
            ],
        )

    cursor.close()
    conn.close()


def fetch_student_progress() -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    try:
        conn = mysql_connection(include_database=True)
    except mysql.connector.Error as exc:
        return None, f"Database connection failed: {exc}"

    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT subject, score, max_score FROM student_exam_marks ORDER BY id ASC"
        )
        exam_rows = cursor.fetchall()
        exam_marks = [
            {
                "subject": row["subject"],
                "score": int(row["score"]),
                "max": int(row["max_score"]),
            }
            for row in exam_rows
        ]

        cursor.execute(
            "SELECT month_label, days FROM student_absences ORDER BY month_order ASC"
        )
        absence_rows = cursor.fetchall()
        absences_by_month = [
            {"month": row["month_label"], "days": int(row["days"])} for row in absence_rows
        ]

        cursor.execute(
            "SELECT term_label, value FROM student_exam_trends ORDER BY term_order ASC"
        )
        trend_rows = cursor.fetchall()
        exam_trend = [
            {"label": row["term_label"], "value": int(row["value"])} for row in trend_rows
        ]

        cursor.close()
        conn.close()

        average_score = (
            round(sum(item["score"] for item in exam_marks) / max(len(exam_marks), 1), 1)
            if exam_marks
            else 0
        )
        total_absences = sum(item["days"] for item in absences_by_month)
        attendance_rate = max(0, 100 - total_absences)

        return {
            "summary": {
                "averageScore": average_score,
                "totalAbsences": total_absences,
                "attendanceRate": attendance_rate,
            },
            "examMarks": exam_marks,
            "absencesByMonth": absences_by_month,
            "examTrend": exam_trend,
        }, None
    except mysql.connector.Error as exc:
        conn.close()
        return None, f"Failed to fetch student progress: {exc}"


def build_system_prompt() -> str:
    return (
        "You are a psychology-oriented mental wellness assistant for a student self-reflection app, similar to a supportive psychologist coach. "
        "Never provide medical diagnosis, and never present yourself as a doctor. "
        "Use calm and compassionate language. "
        "If responses indicate elevated risk, explicitly recommend contacting local emergency services or a licensed mental health professional immediately. "
        "Output valid JSON only, no markdown."
    )


def build_chat_system_prompt() -> str:
    return (
        "You are MindSpace Safe Chat, and you speak like a real caring person, not like a robot. "
        "Your role is to be a gentle safe space for users who are scared, lonely, anxious, overwhelmed, or afraid to talk to people. "
        "Use warm emotional language, short natural sentences, and compassionate tone. "
        "Validate feelings first, then offer one or two simple next steps. "
        "The user should feel truly heard. "
        "You can use lines like: 'I hear you', 'You are not weak for feeling this', 'Maybe things can get better if you talk about it little by little', and 'You do not have to carry this alone'. "
        "Do not diagnose medical or psychiatric disorders, and do not claim to be a licensed therapist. "
        "If the user mentions self-harm, suicide, abuse, or immediate danger, give urgent safety guidance: tell them to contact local emergency services now and reach a trusted person immediately. "
        "Keep replies supportive and practical in 4-8 sentences, with simple words and no clinical jargon."
    )


def build_user_prompt(payload: Dict[str, Any]) -> str:
    test_type = str(payload.get("type", "general")).lower()
    scores = payload.get("scores", {})
    responses = payload.get("responses", [])
    meta = payload.get("meta", {})

    base = [
        "Analyze the following mental-wellness assessment results and produce practical guidance.",
        f"Assessment type: {test_type}",
        f"Scores: {scores}",
        f"Responses: {responses}",
        f"Meta: {meta}",
        "",
        "Return STRICT JSON with this schema:",
        "{",
        '  "summary": "short supportive explanation in 2-3 sentences",',
        '  "insights": ["3 to 5 key insights"],',
        '  "recommendations": ["5 practical actions"],',
        '  "riskLevel": "low|moderate|high",',
        '  "disclaimer": "non-clinical disclaimer"',
        "}",
    ]

    if test_type == "depression":
        base.append(
            "Context: This includes PHQ-9 style scoring. Risk guidance: 0-4 low, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 high. "
            "If risk is moderate or high, include immediate support and professional help recommendation."
        )
    elif test_type == "personality":
        base.append(
            "Context: This includes OCEAN personality traits. Focus on strengths, blind spots, and actionable personal growth suggestions."
        )

    return "\n".join(base)


def call_ollama(model: str, system_prompt: str, user_prompt: str) -> Tuple[Dict[str, Any], int]:
    url = f"{OLLAMA_BASE_URL}/api/generate"
    body = {
        "model": model,
        "system": system_prompt,
        "prompt": user_prompt,
        "stream": False,
        "format": "json",
        "keep_alive": "30m",
        "options": {
            "temperature": 0.4,
        },
    }

    attempts = max(1, OLLAMA_RETRIES + 1)
    last_error = None
    response = None

    for attempt in range(1, attempts + 1):
        try:
            app.logger.info("[ollama] generate start (attempt=%s/%s, model=%s)", attempt, attempts, model)
            response = requests.post(url, json=body, timeout=OLLAMA_TIMEOUT_SECONDS)
            break
        except requests.RequestException as exc:
            last_error = exc
            app.logger.warning("[ollama] request failed (attempt=%s/%s): %s", attempt, attempts, exc)

    if response is None:
        return {
            "error": "Ollama connection failed",
            "details": str(last_error),
        }, 503

    if response.status_code != 200:
        return {
            "error": "Ollama returned non-200 response",
            "status": response.status_code,
            "details": response.text,
        }, 502

    try:
        raw = response.json()
    except ValueError:
        return {
            "error": "Invalid JSON response from Ollama",
            "details": response.text,
        }, 502

    return raw, 200


def call_ollama_chat(model: str, messages: list) -> Tuple[Dict[str, Any], int]:
    url = f"{OLLAMA_BASE_URL}/api/chat"
    body = {
        "model": model,
        "messages": messages,
        "stream": False,
        "keep_alive": "30m",
        "options": {
            "temperature": 0.6,
        },
    }

    attempts = max(1, OLLAMA_RETRIES + 1)
    last_error = None
    response = None

    for attempt in range(1, attempts + 1):
        try:
            app.logger.info("[ollama-chat] start (attempt=%s/%s, model=%s)", attempt, attempts, model)
            response = requests.post(url, json=body, timeout=OLLAMA_TIMEOUT_SECONDS)
            break
        except requests.RequestException as exc:
            last_error = exc
            app.logger.warning("[ollama-chat] request failed (attempt=%s/%s): %s", attempt, attempts, exc)

    if response is None:
        return {
            "error": "Ollama chat connection failed",
            "details": str(last_error),
        }, 503

    if response.status_code != 200:
        return {
            "error": "Ollama chat returned non-200 response",
            "status": response.status_code,
            "details": response.text,
        }, 502

    try:
        raw = response.json()
    except ValueError:
        return {
            "error": "Invalid JSON response from Ollama chat",
            "details": response.text,
        }, 502

    return raw, 200


def parse_analysis_json(raw_model_response: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_model_response)
        if isinstance(parsed, dict):
            return parsed
    except ValueError:
        pass

    return {
        "summary": raw_model_response.strip() or "No analysis generated.",
        "insights": [],
        "recommendations": [],
        "riskLevel": "moderate",
        "disclaimer": "This is not a clinical diagnosis. Please consult a qualified professional for medical advice.",
    }


def parse_student_progress_analysis(raw_model_response: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_model_response)
        if isinstance(parsed, dict):
            return parsed
    except ValueError:
        pass

    return {
        "overview": raw_model_response.strip() or "No analysis generated.",
        "performanceSignals": [],
        "attendanceSignals": [],
        "recommendations": [],
        "riskLevel": "moderate",
        "nextCheck": "Review this profile again in two weeks.",
    }


def decode_base64_image(image_base64: str) -> Tuple[Optional[np.ndarray], Optional[str]]:
    if not image_base64:
        return None, "imageBase64 is required"

    raw_data = image_base64
    if "," in image_base64:
        raw_data = image_base64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw_data)
    except (ValueError, TypeError) as exc:
        return None, f"Invalid base64 image payload: {exc}"

    try:
        with Image.open(BytesIO(image_bytes)) as pil_img:
            rgb = pil_img.convert("RGB")
            image_np = np.array(rgb)
    except Exception as exc:
        return None, f"Failed to parse image: {exc}"

    return image_np, None


def normalize_emotion_scores(raw_scores: Dict[str, float]) -> list:
    angry = float(raw_scores.get("angry", 0.0))
    disgust = float(raw_scores.get("disgust", 0.0))
    fear = float(raw_scores.get("fear", 0.0))
    happy = float(raw_scores.get("happy", 0.0))
    sad = float(raw_scores.get("sad", 0.0))
    surprise = float(raw_scores.get("surprise", 0.0))
    neutral = float(raw_scores.get("neutral", 0.0))

    mapped = {
        "Happy": happy,
        "Neutral": neutral,
        "Sad": sad,
        "Anxious": fear + (disgust * 0.25),
        "Angry": angry + (disgust * 0.75),
        "Surprised": surprise,
    }

    total = sum(mapped.values())
    if total <= 0:
        return []

    normalized = []
    for label, value in mapped.items():
        percent = int(round((value / total) * 100))
        normalized.append(
            {
                "label": label,
                "score": percent,
                "color": FACIAL_LABEL_COLORS.get(label, "bg-slate-400"),
            }
        )

    normalized.sort(key=lambda item: item["score"], reverse=True)
    return normalized


def analyze_facial_emotions(image_np: np.ndarray) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    if FER is None:
        return None, "Facial model dependency is missing. Install backend requirements to enable real analysis."

    try:
        detector = FER(mtcnn=False)
        detections = detector.detect_emotions(image_np)
    except Exception as exc:
        return None, f"Emotion detection failed: {exc}"

    if not detections:
        return None, "No face detected. Please face the camera clearly and try again."

    dominant_face = max(
        detections,
        key=lambda item: (item.get("box", [0, 0, 0, 0])[2] * item.get("box", [0, 0, 0, 0])[3]),
    )
    raw_scores = dominant_face.get("emotions", {})
    normalized = normalize_emotion_scores(raw_scores)
    if not normalized:
        return None, "Could not compute emotion scores from the detected face."

    return {
        "emotions": normalized,
        "faceCount": len(detections),
    }, None


def sanitize_single_user_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    clean = dict(payload)

    for key in list(clean.keys()):
        if key.lower() in IDENTITY_KEYS:
            clean.pop(key, None)

    meta = clean.get("meta")
    if isinstance(meta, dict):
        clean_meta = dict(meta)
        for key in list(clean_meta.keys()):
            if key.lower() in IDENTITY_KEYS:
                clean_meta.pop(key, None)
        clean["meta"] = clean_meta

    return clean


def create_assessment_submission(payload: Dict[str, Any], model: str) -> Tuple[Optional[int], Optional[str]]:
    try:
        conn = mysql_connection(include_database=True)
    except mysql.connector.Error as exc:
        return None, f"Database connection failed: {exc}"

    try:
        cursor = conn.cursor()
        assessment_type = str(payload.get("type", "general"))
        scores = payload.get("scores", {})
        responses = payload.get("responses", [])
        meta = payload.get("meta", {})

        cursor.execute(
            """
            INSERT INTO assessment_runs (
                assessment_type,
                model_name,
                score_json,
                responses_json,
                meta_json,
                analysis_json,
                risk_level
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                assessment_type,
                model,
                json.dumps(scores),
                json.dumps(responses),
                json.dumps(meta),
                json.dumps({"status": "pending"}),
                None,
            ),
        )
        inserted_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return inserted_id, None
    except mysql.connector.Error as exc:
        conn.close()
        return None, f"Failed to create assessment submission: {exc}"


def update_assessment_analysis(record_id: int, analysis: Dict[str, Any]) -> Optional[str]:
    try:
        conn = mysql_connection(include_database=True)
    except mysql.connector.Error as exc:
        return f"Database connection failed: {exc}"

    try:
        cursor = conn.cursor()
        risk_level = str(analysis.get("riskLevel", "")).lower() or None
        cursor.execute(
            """
            UPDATE assessment_runs
            SET analysis_json = %s,
                risk_level = %s
            WHERE id = %s
            """,
            (
                json.dumps(analysis),
                risk_level,
                record_id,
            ),
        )
        cursor.close()
        conn.close()
        return None
    except mysql.connector.Error as exc:
        conn.close()
        return f"Failed to update assessment analysis: {exc}"


@app.get("/api/health")
def health() -> Any:
    db_ok = True
    db_error = None
    try:
        conn = mysql_connection(include_database=True)
        conn.close()
    except mysql.connector.Error as exc:
        db_ok = False
        db_error = str(exc)

    return jsonify(
        {
            "ok": True,
            "service": "mindspace-ollama-api",
            "ollamaBaseUrl": OLLAMA_BASE_URL,
            "defaultModel": OLLAMA_MODEL,
            "database": {
                "ok": db_ok,
                "name": DB_NAME,
                "host": DB_HOST,
                "error": db_error,
            },
        }
    )


@app.get("/api/models")
def models() -> Any:
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=20)
    except requests.RequestException as exc:
        return jsonify({"error": "Failed to reach Ollama", "details": str(exc)}), 503

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch models", "details": response.text}), 502

    return jsonify(response.json())


@app.get("/api/student-progress")
def student_progress() -> Any:
    data, error = fetch_student_progress()
    if error:
        return jsonify({"error": error}), 500
    return jsonify({"ok": True, **(data or {})})


@app.post("/api/facial-analyze")
def facial_analyze() -> Any:
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid JSON payload"}), 400

    image_base64 = str(payload.get("imageBase64", "")).strip()
    image_np, decode_error = decode_base64_image(image_base64)
    if decode_error:
        return jsonify({"error": decode_error}), 400

    analysis, detect_error = analyze_facial_emotions(image_np)
    if detect_error:
        status = 422 if "No face detected" in detect_error else 503
        return jsonify({"error": detect_error}), status

    return jsonify(
        {
            "ok": True,
            "emotions": analysis["emotions"],
            "faceCount": analysis["faceCount"],
            "source": "fer",
        }
    )


@app.post("/api/student-progress-insights")
def student_progress_insights() -> Any:
    req = request.get_json(silent=True) or {}
    selected_model = OLLAMA_MODEL
    if isinstance(req, dict) and req.get("model"):
        selected_model = str(req.get("model"))

    data, error = fetch_student_progress()
    if error:
        return jsonify({"error": error}), 500

    if not data:
        return jsonify({"error": "No student progress data available."}), 404

    system_prompt = (
        "You are an educational psychology-oriented student performance coach. "
        "Analyze marks and absences with supportive language. "
        "Do not provide medical diagnosis. "
        "Return valid JSON only."
    )

    user_prompt = "\n".join(
        [
            "Analyze this student progress dataset:",
            f"Summary: {data.get('summary')}",
            f"Exam marks: {data.get('examMarks')}",
            f"Absences by month: {data.get('absencesByMonth')}",
            f"Exam trend: {data.get('examTrend')}",
            "",
            "Return STRICT JSON with schema:",
            "{",
            '  "overview": "2-3 sentence summary",',
            '  "performanceSignals": ["3 concise observations"],',
            '  "attendanceSignals": ["2-3 concise observations"],',
            '  "recommendations": ["5 actionable study/support steps"],',
            '  "riskLevel": "low|moderate|high",',
            '  "nextCheck": "when to review again"',
            "}",
        ]
    )

    result, status = call_ollama(selected_model, system_prompt, user_prompt)
    if status != 200:
        return jsonify(result), status

    raw_analysis = str(result.get("response", "")).strip()
    analysis_json = parse_student_progress_analysis(raw_analysis)

    return jsonify(
        {
            "ok": True,
            "model": selected_model,
            "analysis": analysis_json,
            "createdAt": result.get("created_at"),
            "usage": {
                "promptEvalCount": result.get("prompt_eval_count"),
                "evalCount": result.get("eval_count"),
                "totalDuration": result.get("total_duration"),
            },
        }
    )


@app.post("/api/analyze")
def analyze() -> Any:
    return process_assessment(save_to_db=False)


@app.post("/api/analyze-and-save")
def analyze_and_save() -> Any:
    return process_assessment(save_to_db=True)


def process_assessment(save_to_db: bool) -> Any:
    started_at = time.perf_counter()
    payload = request.get_json(silent=True) or {}

    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid JSON payload"}), 400

    payload = sanitize_single_user_payload(payload)

    model = payload.get("model") or OLLAMA_MODEL
    assessment_type = str(payload.get("type", "general"))
    app.logger.info("[assessment] start type=%s save_to_db=%s model=%s", assessment_type, save_to_db, model)

    record_id = None
    db_error = None
    if save_to_db:
        app.logger.info("[assessment] creating DB submission")
        record_id, db_error = create_assessment_submission(payload, model)
        if db_error:
            app.logger.error("[assessment] DB create failed: %s", db_error)
            return jsonify({"error": db_error}), 500
        app.logger.info("[assessment] DB submission created id=%s", record_id)

    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(payload)

    app.logger.info("[assessment] calling Ollama")
    result, status = call_ollama(model, system_prompt, user_prompt)
    if status != 200:
        app.logger.error("[assessment] Ollama call failed status=%s details=%s", status, result)
        return (
            jsonify(
                {
                    **result,
                    "saved": bool(save_to_db and record_id is not None),
                    "recordId": record_id,
                }
            ),
            status,
        )

    raw_analysis = str(result.get("response", "")).strip()
    analysis_json = parse_analysis_json(raw_analysis)
    app.logger.info("[assessment] Ollama response parsed")

    if save_to_db and record_id is not None:
        app.logger.info("[assessment] updating DB row id=%s with analysis", record_id)
        update_error = update_assessment_analysis(record_id, analysis_json)
        if update_error:
            app.logger.error("[assessment] DB update failed id=%s error=%s", record_id, update_error)
            return jsonify({"error": update_error, "recordId": record_id}), 500

    elapsed_ms = int((time.perf_counter() - started_at) * 1000)
    app.logger.info("[assessment] success type=%s record_id=%s duration_ms=%s", assessment_type, record_id, elapsed_ms)

    return jsonify(
        {
            "ok": True,
            "model": model,
            "createdAt": result.get("created_at"),
            "analysis": analysis_json,
            "saved": bool(save_to_db),
            "recordId": record_id,
            "durationMs": elapsed_ms,
            "usage": {
                "promptEvalCount": result.get("prompt_eval_count"),
                "evalCount": result.get("eval_count"),
                "totalDuration": result.get("total_duration"),
            },
        }
    )


@app.post("/api/debug-ollama")
def debug_ollama() -> Any:
    model = request.get_json(silent=True) or {}
    selected_model = model.get("model") if isinstance(model, dict) else None
    selected_model = selected_model or OLLAMA_MODEL

    result, status = call_ollama(
        selected_model,
        "You are a JSON-only assistant.",
        "Return this exact JSON: {\"ok\":true,\"message\":\"ollama reachable\"}",
    )

    if status != 200:
        return jsonify(result), status

    parsed = parse_analysis_json(str(result.get("response", "")).strip())
    return jsonify({"ok": True, "model": selected_model, "response": parsed})


@app.post("/api/chat-support")
def chat_support() -> Any:
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid JSON payload"}), 400

    user_message = str(payload.get("message", "")).strip()
    if not user_message:
        return jsonify({"error": "message is required"}), 400

    model = str(payload.get("model") or OLLAMA_MODEL)
    session_id = str(payload.get("sessionId") or uuid4())

    history = CHAT_SESSIONS.get(session_id, [])
    messages = [{"role": "system", "content": build_chat_system_prompt()}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    result, status = call_ollama_chat(model, messages)
    if status != 200:
        return jsonify(result), status

    assistant_message = (
        result.get("message", {}).get("content", "")
        if isinstance(result.get("message"), dict)
        else ""
    )

    if not assistant_message:
        return jsonify({"error": "Empty assistant response from Ollama chat."}), 502

    updated_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": assistant_message},
    ]
    max_messages = max(2, CHAT_MEMORY_TURNS * 2)
    CHAT_SESSIONS[session_id] = updated_history[-max_messages:]

    return jsonify(
        {
            "ok": True,
            "sessionId": session_id,
            "model": model,
            "reply": assistant_message,
            "usage": {
                "promptEvalCount": result.get("prompt_eval_count"),
                "evalCount": result.get("eval_count"),
                "totalDuration": result.get("total_duration"),
            },
        }
    )


@app.post("/api/chat-support/reset")
def chat_support_reset() -> Any:
    payload = request.get_json(silent=True) or {}
    session_id = str(payload.get("sessionId", "")) if isinstance(payload, dict) else ""
    if not session_id:
        return jsonify({"error": "sessionId is required"}), 400

    CHAT_SESSIONS.pop(session_id, None)
    return jsonify({"ok": True, "sessionId": session_id})


if __name__ == "__main__":
    try:
        initialize_database()
    except mysql.connector.Error as exc:
        print(f"[startup] database initialization warning: {exc}")

    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "8000"))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host=host, port=port, debug=debug)
