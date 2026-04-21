from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from .quiz_service import generate_quiz
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

app = FastAPI(title="QuizAI FastAPI Backend")

# CORS configuration – use same origins as before
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting – 10 quiz generations per minute per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["10/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class QuizRequest(BaseModel):
    subject: str
    topic: str
    difficulty: int = 1
    num_questions: int = 5

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": "2026-04-21T00:00:00Z"}

@app.post("/api/quiz/generate")
@limiter.limit("10/minute")
async def generate(request: QuizRequest, remote_address: str = Depends(get_remote_address)):
    try:
        quiz = await generate_quiz(
            subject=request.subject,
            topic=request.topic,
            difficulty=request.difficulty,
            num_questions=request.num_questions,
        )
        return {"quiz": quiz}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
