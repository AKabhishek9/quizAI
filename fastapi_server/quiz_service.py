# fastapi_server/quiz_service.py
"""Quiz generation service for FastAPI.

This mirrors the logic in `server/src/services/ai.service.ts` but is written in Python
so the FastAPI endpoint can call it directly.
"""
import os
import json
import time
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, ValidationError, validator

# Load environment variables (project root)
load_dotenv(dotenv_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "server", ".env")))

# OpenRouter configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
PRIMARY_MODEL = os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct:free")
FALLBACK_MODEL = os.getenv("OPENROUTER_FALLBACK_MODEL", "meta-llama/llama-3-8b-instruct:free")

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set in .env")

client = OpenAI(api_key=OPENROUTER_API_KEY, base_url=OPENROUTER_BASE_URL)

# System prompt – identical to the TS version
SYSTEM_PROMPT = """You are an expert technical assessor generating high-quality multiple choice questions.
Your ONLY output must be valid JSON — no markdown, no explanation, no code fences.

Use this exact structure:
{
  \"questions\": [
    {
      \"question\": \"A clear, unambiguous question text\",
      \"options\": [\"A\", \"B\", \"C\", \"D\"],
      \"answer\": 2,
      \"explanation\": \"A concise explanation of why the answer is correct and why others are wrong.\",
      \"topic\": \"General topic (e.g., Arrays)\",
      \"concept\": \"Precise sub-topic tested (e.g., Two Pointer Technique)\"
    }
  ]
}

Rules:
1. Provide exactly the number of questions requested.
2. \"answer\" MUST be the 0-indexed integer of the correct option in the options array.
3. Keep difficulty strictly to the requested level (1=Beginner, 5=Expert).
4. Distribute questions evenly across the provided topics.
5. Options must be distinct, plausible, and only one unarguably correct.
6. Output ONLY the JSON object — absolutely no markdown, no ```json, no surrounding text.
7. All questions must be unique — do NOT reuse common textbook examples.
"""

class AIQuestion(BaseModel):
    question: str
    options: List[str]
    answer: int
    explanation: str
    topic: str
    concept: str

    @validator("question")
    def q_len(cls, v):
        if len(v) < 5:
            raise ValueError("question too short")
        return v

    @validator("options")
    def opts_len(cls, v):
        if not (2 <= len(v) <= 6):
            raise ValueError("options length must be 2-6")
        return v

    @validator("answer")
    def answer_range(cls, v, values):
        opts = values.get("options", [])
        if not (0 <= v < len(opts)):
            raise ValueError("answer index out of range")
        return v

    @validator("explanation")
    def expl_len(cls, v):
        if len(v) < 10:
            raise ValueError("explanation too short")
        return v

class QuizResponse(BaseModel):
    questions: List[AIQuestion]

def _call_model(model: str, user_prompt: str) -> str:
    """Call OpenRouter model and return raw content string.
    Includes an 8‑second hard timeout.
    """
    try:
        # Use a simple timeout via Python's time module – OpenAI SDK does not expose a timeout param directly.
        start = time.time()
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
            temperature=0.7,
            max_tokens=2048,
            stream=False,
        )
        elapsed = time.time() - start
        if elapsed > 8:
            raise TimeoutError(f"OpenRouter API timeout after {elapsed:.1f}s ({model})")
        content = response.choices[0].message.content or ""
        # Strip stray markdown fences
        content = content.replace("```json", "").replace("```", "").strip()
        return content
    except Exception as e:
        raise e

def generate_quiz(subject: str, topic: str, difficulty: int = 1, num_questions: int = 5) -> List[Dict[str, Any]]:
    """Public wrapper used by FastAPI.
    It builds the user prompt, tries primary then fallback model, and validates the JSON.
    """
    user_prompt = f"Generate {num_questions} multiple choice questions.\n- Subject: {subject}\n- Topic: {topic}\n- Difficulty Level (1-5): {difficulty}"
    last_error = None
    for model in (PRIMARY_MODEL, FALLBACK_MODEL):
        try:
            raw = _call_model(model, user_prompt)
            data = json.loads(raw)
            validated = QuizResponse(**data)
            # Attach extra metadata expected by downstream code (optional)
            return [q.dict() for q in validated.questions]
        except (json.JSONDecodeError, ValidationError, Exception) as err:
            last_error = err
            # Continue to next model
    # If both models failed, raise the last error
    raise RuntimeError(f"Quiz generation failed: {last_error}")

# End of file
