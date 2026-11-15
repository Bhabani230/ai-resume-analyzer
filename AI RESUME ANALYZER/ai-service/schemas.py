"""
Pydantic Schemas for AI Resume Analyzer
Defines the strict structured output format returned by Google Gemini.
"""

from typing import List
from pydantic import BaseModel, Field


class BulletImprovement(BaseModel):
    """Represents a specific resume bullet point improvement."""
    original: str = Field(
        description="The original bullet point or weak phrase from the resume."
    )
    improved: str = Field(
        description="The action-oriented, quantified, and high-impact rewritten version."
    )
    reason: str = Field(
        description="Explanation of why the revision improves ATS parsing and recruiter impact."
    )


class ResumeAnalysisResponse(BaseModel):
    """Strict structured JSON response for full resume analysis."""
    ats_score: int = Field(
        ge=0,
        le=100,
        description="Overall ATS compatibility score between 0 and 100 based on keyword match, experience relevance, and formatting."
    )
    candidate_summary: str = Field(
        description="A concise 2 to 3 sentence professional executive summary of the candidate's background and alignment with the target role."
    )
    matched_skills: List[str] = Field(
        default_factory=list,
        description="List of relevant hard skills, soft skills, and technologies explicitly present in both the resume and the job description."
    )
    missing_keywords: List[str] = Field(
        default_factory=list,
        description="List of critical skills, qualifications, certifications, or keywords mentioned in the job description that are missing from the resume."
    )
    formatting_issues: List[str] = Field(
        default_factory=list,
        description="List of detected formatting, structural, layout, or ATS-readability issues (e.g., missing contact details, non-standard section titles, dense blocks of text)."
    )
    bullet_improvements: List[BulletImprovement] = Field(
        default_factory=list,
        description="Actionable before-and-after suggestions for strengthening specific resume bullet points."
    )
