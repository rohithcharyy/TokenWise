from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.compressor import compress_context
from app.services.llm import generate_response_with_fallback


router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)


# =========================================================
# Request model
# =========================================================

class ChatRequest(BaseModel):

    messages: list[dict]

    model: str

    automatic_switching: bool = False


# =========================================================
# Chat endpoint
# =========================================================

@router.post("/chat")
def chat(request: ChatRequest):

    try:

        # =================================================
        # Step 1: Compress context
        # =================================================

        compression = compress_context(
            messages=request.messages,
            model=request.model,
        )


        optimized_messages = compression["messages"]


        # =================================================
        # Step 2: Generate response
        # =================================================

        llm_result = generate_response_with_fallback(

            messages=optimized_messages,

            model_id=request.model,

            automatic_switching=
                request.automatic_switching,

        )


        # =================================================
        # Step 3: Return complete TokenWise result
        # =================================================

        return {

            "response":
                llm_result["response"],

            "provider":
                llm_result["provider"],

            "model":
                llm_result["model"],

            "model_label":
                llm_result["model_label"],

            "model_id":
                llm_result["model_id"],

            "switched":
                llm_result.get(
                    "switched",
                    False,
                ),

            "original_model_id":
                llm_result.get(
                    "original_model_id",
                    request.model,
                ),

            "attempted_models":
                llm_result.get(
                    "attempted_models",
                    [request.model],
                ),

            "automatic_switching":
                llm_result.get(
                    "automatic_switching",
                    request.automatic_switching,
                ),

            "optimization": {

                "tokens_before":
                    compression["tokens_before"],

                "tokens_after":
                    compression["tokens_after"],

                "tokens_saved":
                    compression["tokens_saved"],

                "compression_ratio":
                    compression["compression_ratio"],

                "transforms_applied":
                    compression["transforms_applied"],

            },

            "usage":
                llm_result["usage"],

        }


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e),

        )