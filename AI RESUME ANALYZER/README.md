# AI Resume Analyzer

An intelligent, multi-tier ATS (Applicant Tracking System) resume auditor and optimizer powered by Google Gemini, FastAPI, Node.js Express, and React (Vite + Tailwind CSS).

---

## Architecture Overview

```
                      ┌─────────────────────────┐
                      │    Vite React Frontend  │ (Port 5173)
                      └────────────┬────────────┘
                                   │ HTTP /api/analyze
                                   ▼
                      ┌─────────────────────────┐
                      │   Node.js Express API   │ (Port 5000)
                      │ (MongoDB / Memory Store)│
                      └────────────┬────────────┘
                                   │ HTTP /analyze (Multipart PDF)
                                   ▼
                      ┌─────────────────────────┐
                      │   FastAPI Python AI     │ (Port 8000)
                      │    (Google Gemini)      │
                      └─────────────────────────┘
```

- **Frontend (`frontend/`)**: React 18, Vite, Tailwind CSS, Lucide icons. Provides interactive PDF upload, target job description entry, circular ATS score gauge, keyword gap cards, and bullet point rewrite comparisons with one-click clipboard copying.
- **Backend (`backend/`)**: Express API with Multer memory storage (processes PDFs in RAM without writing to disk), MongoDB persistence via Mongoose (with automated in-memory store fallback if MongoDB is not running), and forwarder to the AI microservice.
- **AI Service (`ai-service/`)**: Python FastAPI microservice utilizing the official Google GenAI SDK (`google-genai`) with Pydantic structured schemas (`ResumeAnalysisResponse`) and multimodal direct PDF analysis powered by `gemini-3.5-flash`.

---

## Quick Start (Run All Services Together)

### Option 1: Double-Click (Windows)
Double-click **`run.bat`** in the project root folder.

### Option 2: PowerShell
```powershell
.\run.ps1
```

### Option 3: npm
```bash
npm run dev
# or
node dev.js
```

All three services will start simultaneously:
- **Frontend Web UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **FastAPI AI Service**: [http://localhost:8000](http://localhost:8000) (Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs))

---

## Configuration & Environment Variables

### AI Service (`ai-service/.env`)
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
PORT=8000
```
> Obtain your Gemini API key for free from [Google AI Studio](https://aistudio.google.com/).

### Backend (`backend/.env`)
```ini
PORT=5000
AI_SERVICE_URL=http://127.0.0.1:8000
MONGODB_URI=mongodb://127.0.0.1:27017/resume_analyzer
```
*(MongoDB is optional; the backend automatically falls back to in-memory history if MongoDB is offline).*

---

## Manual Service-by-Service Execution (Optional)

If you prefer running services in separate terminals:

1. **AI Service**:
   ```bash
   cd ai-service
   .venv\Scripts\activate      # Windows
   # or source .venv/bin/activate  # macOS/Linux
   python main.py
   ```
2. **Backend**:
   ```bash
   cd backend
   npm run dev
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
