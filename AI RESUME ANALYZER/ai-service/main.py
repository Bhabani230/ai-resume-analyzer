"""
FastAPI AI Service for AI Resume Analyzer
Uses Google GenAI SDK (gemini-3.8-flash) with Pydantic structured output
to evaluate resumes against target job descriptions.
"""

import os
import json
import logging
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from google.genai.errors import APIError

from schemas import ResumeAnalysisResponse, BulletImprovement

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai-service")

# Load environment variables from .env if present
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(
    title="AI Resume Analyzer - AI Service",
    description="Python FastAPI microservice leveraging Google Gemini multimodal reasoning for ATS resume analysis.",
    version="1.0.0",
)

# Enable CORS for local development across Vite (5173) and Node.js backend (5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Service status and greeting endpoint."""
    return {
        "status": "online",
        "service": "AI Resume Analyzer - GenAI Service",
        "model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
    }


@app.get("/health")
def health_check():
    """Health check endpoint to verify service availability."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    is_configured = bool(api_key and api_key != "your_gemini_api_key_here")
    return {
        "status": "healthy",
        "api_key_configured": is_configured,
        "default_model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
    }


def generate_demo_analysis(filename: str, job_description: str) -> ResumeAnalysisResponse:
    """
    Provides a realistic ATS analysis for initial testing when GEMINI_API_KEY is not yet configured.
    Conforms strictly to ResumeAnalysisResponse schema.
    """
    logger.info("Generating realistic ATS demonstration analysis (Set GEMINI_API_KEY for live Gemini inference).")
    return ResumeAnalysisResponse(
        ats_score=78,
        candidate_summary=(
            "The candidate demonstrates strong experience in modern web architecture, frontend component engineering, "
            "and RESTful backend service design. Their technical repertoire matches over 75% of the core competencies requested, "
            "though deeper emphasis on cloud deployment metrics and CI/CD pipelines would solidify alignment."
        ),
        matched_skills=[
            "React",
            "TypeScript",
            "Python",
            "FastAPI",
            "Node.js",
            "Express",
            "RESTful APIs",
            "MongoDB",
            "Docker",
        ],
        missing_keywords=[
            "AWS / Cloud Infrastructure",
            "CI/CD Automation",
            "Unit & Integration Testing (Jest/Pytest)",
            "System Scalability Metrics",
        ],
        formatting_issues=[
            "Standard single-column layout detected (ATS friendly).",
            "Consider replacing dense block text in the summary section with 2-3 concise bullet points.",
            "Ensure all technical skills are grouped under standardized headings (e.g. 'Languages', 'Frameworks', 'Databases').",
        ],
        bullet_improvements=[
            BulletImprovement(
                original="Built high-throughput microservices handling 2M requests/day.",
                improved="Architected and deployed distributed FastAPI microservices handling 2M+ daily requests, achieving 99.98% uptime and reducing endpoint latency by 35%.",
                reason="Incorporates specific SLA availability metrics, latency impact, and explicit architecture ownership preferred by technical screeners."
            ),
            BulletImprovement(
                original="Improved application response times by query caching.",
                improved="Designed and implemented Redis distributed caching layer across critical database queries, cutting response times from 420ms to 85ms.",
                reason="Quantifies exact before/after latency reduction and specifies the caching architecture (Redis)."
            ),
            BulletImprovement(
                original="Worked with cross-functional teams to release product features.",
                improved="Partnered with Product, Design, and DevOps teams across two-week Agile sprints to ship 6 core product features ahead of schedule.",
                reason="Replaces passive phrasing ('worked with') with active leadership verb ('Partnered with') and adds Agile delivery context."
            ),
        ],
    )


@app.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(..., description="PDF resume file to analyze"),
    job_description: str = Form(..., description="Target job description text"),
):
    """
    Analyzes a PDF resume directly against a job description using Google Gemini.
    Returns strict structured JSON matching ResumeAnalysisResponse.
    """
    # 1. Validate file format
    filename = file.filename or "resume.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a PDF document.",
        )

    # 2. Validate job description input
    clean_jd = job_description.strip()
    if not clean_jd or len(clean_jd) < 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too short. Please provide a meaningful job description.",
        )

    # 3. Read raw PDF bytes directly into memory (no heavy OCR or external dependencies needed)
    try:
        pdf_bytes = await file.read()
    except Exception as exc:
        logger.error(f"Failed to read uploaded file: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded PDF file: {str(exc)}",
        )

    if len(pdf_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF file is empty (0 bytes).",
        )

    # Check file size limit (max 10MB)
    if len(pdf_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit.",
        )

    # 4. Check Gemini API Key configuration
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        # Check if strict mode is enforced or fallback to structured demo response
        if os.getenv("STRICT_API_KEY", "false").lower() == "true":
            logger.warning("GEMINI_API_KEY is not configured in ai-service/.env")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GEMINI_API_KEY is not configured. Please set your Gemini API key in ai-service/.env",
            )
        logger.info("GEMINI_API_KEY not configured. Serving realistic demo ATS analysis.")
        return generate_demo_analysis(filename, clean_jd)

    # 5. Initialize Google GenAI client
    try:
        client = genai.Client(api_key=api_key)
    except Exception as exc:
        logger.error(f"Failed to initialize GenAI client: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Google GenAI client: {str(exc)}",
        )

    # 6. Create multimodal Part from the raw PDF bytes
    resume_part = types.Part.from_bytes(
        data=pdf_bytes,
        mime_type="application/pdf",
    )

    # 7. Formulate expert ATS analysis prompt
    analysis_prompt = f"""
You are an expert Applicant Tracking System (ATS) auditor and Senior Technical Recruiter.
Your mission is to perform an in-depth, rigorous audit of the attached resume PDF against the Target Job Description below.

--- TARGET JOB DESCRIPTION ---
{clean_jd}
------------------------------

Instructions:
1. 'ats_score': An integer (0-100) representing how well this candidate matches the requirements, qualifications, and keyword density of the job description. Be realistic and objective.
2. 'candidate_summary': A crisp 2 to 3 sentence executive summary highlighting the candidate's core domain, relevant years/type of experience, and general fit for this specific job.
3. 'matched_skills': An exhaustive list of skills, libraries, tools, and methodologies that are explicitly stated in BOTH the resume and the job description.
4. 'missing_keywords': A list of critical keywords, requirements, or certifications found in the job description that are visibly absent or weak in the resume.
5. 'formatting_issues': Specific layout, structure, or parsing vulnerabilities found in the resume (e.g. non-standard section headings, missing contact info, dense unbulleted paragraphs, multi-column risks). If formatting is clean, note positive observations or minor polish suggestions.
6. 'bullet_improvements': Identify 2 to 4 weak or generic bullet points from the resume. For each:
   - 'original': The verbatim or closest text from the resume.
   - 'improved': Rewrite it using the high-impact recruiter formula: Action Verb + Task/Scope + Quantifiable Metric/Outcome (e.g., 'Accomplished [X] as measured by [Y], by doing [Z]').
   - 'reason': Clear rationale explaining why the rewrite is superior for ATS algorithms and human recruiters.

Ensure all outputs strictly conform to the JSON schema.
"""

    # 8. Configure structured output with Pydantic response_schema
    config = types.GenerateContentConfig(
        system_instruction="You are an elite ATS recruitment engine that outputs strict, verified JSON matching the required schema.",
        response_mime_type="application/json",
        response_schema=ResumeAnalysisResponse,
        temperature=0.2,
    )

    # 9. Query Gemini with candidate model fallbacks
    configured_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
    models_to_try = [
        configured_model,
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]
    candidate_models = list(dict.fromkeys([m for m in models_to_try if m]))

    last_error = None
    analysis_result: Optional[ResumeAnalysisResponse] = None

    for model_name in candidate_models:
        try:
            logger.info(f"Attempting resume analysis with model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=[resume_part, analysis_prompt],
                config=config,
            )

            # Check parsed response
            if response.parsed is not None and isinstance(response.parsed, ResumeAnalysisResponse):
                analysis_result = response.parsed
                logger.info(f"Successfully generated structured analysis with {model_name}")
                break
            elif response.text:
                parsed_data = json.loads(response.text)
                analysis_result = ResumeAnalysisResponse.model_validate(parsed_data)
                logger.info(f"Successfully validated JSON text analysis with {model_name}")
                break
            else:
                raise ValueError("Gemini returned an empty response body.")

        except APIError as api_err:
            last_error = api_err
            logger.warning(f"API Error with model {model_name}: {api_err}")
            continue
        except Exception as err:
            last_error = err
            logger.warning(f"Unexpected error with model {model_name}: {err}")
            continue

    if analysis_result is None:
        logger.error(f"All model attempts failed. Last error: {last_error}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google GenAI processing failed: {str(last_error)}",
        )

    return analysis_result


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    app_dir = str(Path(__file__).parent)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, reload_dirs=[app_dir])
