from fastapi import APIRouter
from pydantic import BaseModel

from app.services.compressor import compress_context


router = APIRouter(
    prefix="/api",
    tags=["Compression"],
)


# =========================================================
# Request model
# =========================================================

class CompressRequest(BaseModel):
    messages: list[dict]
    model: str


# =========================================================
# Compression endpoint
# =========================================================

@router.post("/compress")
def compress_messages(request: CompressRequest):

    return compress_context(
        messages=request.messages,
        model=request.model,
    )