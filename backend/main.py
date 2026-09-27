from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.compress import router as compression_router
from app.routes.chat import router as chat_router

app = FastAPI(
    title="TokenWise API",
    description="AI-powered context compression and multi-LLM optimization API",
    version="1.0.0",
)

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to TokenWise",
        "status": "running",
    }

# ---------------------------------------------------------
# Health check
# ---------------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }

# ---------------------------------------------------------
# API routes
# ---------------------------------------------------------

app.include_router(compression_router)
app.include_router(chat_router)