# MindSpace Flask + Ollama API

## 1) Setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Environment

Copy `.env.example` to `.env` and adjust values if needed.

Required defaults already work for local Ollama:
- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=qwen2.5`
- `OLLAMA_TIMEOUT_SECONDS=180`
- `OLLAMA_RETRIES=1`

MySQL is required for persistence:
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=your_mysql_password`
- `DB_NAME=mindspace`

The app creates database/table automatically at startup.

Single-user mode:
- No users table is used.
- No user_id/account_id/session_id is stored.
- All assessment runs are stored in one table: `assessment_runs`.

Analyze-and-save flow:
1. Save raw user test responses in MySQL first.
2. Send saved test payload to Ollama for analysis.
3. Update the same DB row with AI analysis + risk level.

Student progress data:
- Additional tables are auto-created and seeded on startup:
  - `student_exam_marks`
  - `student_absences`
  - `student_exam_trends`
- Frontend page consumes `GET /api/student-progress` for dynamic data.

## 3) Run

```bash
python app.py
```

API runs on `http://127.0.0.1:8000` by default.

## 4) Endpoints

- `GET /api/health`
- `GET /api/models`
- `POST /api/analyze`
- `POST /api/analyze-and-save`
- `POST /api/debug-ollama`
- `GET /api/student-progress`

## 5) Example analyze request

```bash
curl -X POST http://127.0.0.1:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "depression",
    "scores": { "phq9": 14 },
    "responses": [2,2,1,3,1,2,2,1,0],
    "meta": { "lang": "en" },
    "model": "qwen2.5"
  }'
```

## 6) Example analyze + save request

```bash
curl -X POST http://127.0.0.1:8000/api/analyze-and-save \
  -H "Content-Type: application/json" \
  -d '{
    "type": "personality",
    "scores": {
      "openness": 72,
      "conscientiousness": 61,
      "extraversion": 55,
      "agreeableness": 78,
      "neuroticism": 43
    },
    "responses": [4,5,4,3,2],
    "meta": { "source": "mindspace-ui" }
  }'
```

## 7) Frontend integration example (fetch)

```ts
const res = await fetch('http://127.0.0.1:8000/api/analyze-and-save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'personality',
    scores: {
      openness: 72,
      conscientiousness: 61,
      extraversion: 55,
      agreeableness: 78,
      neuroticism: 43,
    },
    responses: [],
    meta: { source: 'mindspace-ui' },
  }),
});

const data = await res.json();
```

## 8) Quick debug commands (PowerShell)

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health"
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/models"
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/debug-ollama" -Method Post -ContentType "application/json" -Body "{}"
```

If `/api/analyze-and-save` fails, check Flask logs:
- `[assessment] creating DB submission`
- `[assessment] calling Ollama`
- `[assessment] updating DB row ...`
