import os

from openai import OpenAI
from dotenv import load_dotenv


# =========================================================
# Load environment variables
# =========================================================

load_dotenv()


# =========================================================
# Provider configuration
# =========================================================

PROVIDERS = {

    # -----------------------------------------------------
    # OpenAI
    # -----------------------------------------------------

    "openai": {
        "api_key_env": "OPENAI_API_KEY",
        "base_url": None,
    },

    # -----------------------------------------------------
    # Groq
    # -----------------------------------------------------

    "groq": {
        "api_key_env": "GROQ_API_KEY",
        "base_url": "https://api.groq.com/openai/v1",
    },

    # -----------------------------------------------------
    # Google Gemini
    # -----------------------------------------------------

    "gemini": {
        "api_key_env": "GEMINI_API_KEY",
        "base_url": (
            "https://generativelanguage.googleapis.com/"
            "v1beta/openai/"
        ),
    },

    # -----------------------------------------------------
    # OpenRouter
    # -----------------------------------------------------

    "openrouter": {
        "api_key_env": "OPENROUTER_API_KEY",
        "base_url": "https://openrouter.ai/api/v1",
    },
}


# =========================================================
# Available models
# =========================================================

MODEL_CONFIG = {

    # =====================================================
    # OPENAI
    # =====================================================

    "gpt-4o": {
        "provider": "openai",
        "model": "gpt-4o",
        "label": "GPT-4o",
    },

    "gpt-4o-mini": {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "label": "GPT-4o Mini",
    },

    # =====================================================
    # GROQ
    # =====================================================

    "gpt-oss-120b": {
        "provider": "groq",
        "model": "openai/gpt-oss-120b",
        "label": "GPT OSS 120B",
    },

    "gpt-oss-20b": {
        "provider": "groq",
        "model": "openai/gpt-oss-20b",
        "label": "GPT OSS 20B",
    },

    "qwen-3.8-27b": {
        "provider": "groq",
        "model": "qwen/qwen3.8-27b",
        "label": "Qwen 3.8 27B",
    },

    # =====================================================
    # GEMINI
    # =====================================================

    "gemini-3.8-flash": {
        "provider": "gemini",
        "model": "gemini-3.8-flash",
        "label": "Gemini 3.8 Flash",
    },

    "gemini-3.5-flash": {
        "provider": "gemini",
        "model": "gemini-3.5-flash",
        "label": "Gemini 3.5 Flash",
    },

    "gemini-3.5-flash-lite": {
        "provider": "gemini",
        "model": "gemini-3.5-flash-lite",
        "label": "Gemini 3.5 Flash Lite",
    },

    # =====================================================
    # OPENROUTER
    # =====================================================

    "openrouter-free": {
        "provider": "openrouter",
        "model": "openrouter/free",
        "label": "OpenRouter Free",
    },

    "nemotron-3-ultra": {
        "provider": "openrouter",
        "model": "nvidia/nemotron-3-ultra-550b-a55b",
        "label": "Nemotron 3 Ultra",
    },

    "gemma-4-26b": {
        "provider": "openrouter",
        "model": "google/gemma-4-26b-a4b-it:free",
        "label": "Gemma 4 26B",
    },
}


# =========================================================
# Automatic switching order
# =========================================================

FALLBACK_ORDER = [

    "gpt-4o",
    "gpt-4o-mini",

    "gpt-oss-120b",
    "gpt-oss-20b",
    "qwen-3.8-27b",

    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",

    "openrouter-free",
    "nemotron-3-ultra",
    "gemma-4-26b",

]


# =========================================================
# Create provider client
# =========================================================

def get_client(provider: str):

    if provider not in PROVIDERS:

        raise ValueError(
            f"Unsupported provider: {provider}"
        )

    config = PROVIDERS[provider]

    api_key = os.getenv(
        config["api_key_env"]
    )

    if not api_key:

        raise ValueError(
            f"{config['api_key_env']} is not configured."
        )

    if config["base_url"]:

        return OpenAI(
            api_key=api_key,
            base_url=config["base_url"],
        )

    return OpenAI(
        api_key=api_key
    )


# =========================================================
# Determine whether an error should trigger switching
# =========================================================

def is_switchable_error(error: Exception) -> bool:

    status_code = getattr(
        error,
        "status_code",
        None,
    )

    error_code = getattr(
        error,
        "code",
        None,
    )

    error_message = str(error).lower()


    # -----------------------------------------------------
    # HTTP status errors
    # -----------------------------------------------------

    if status_code in {
        408,
        409,
        429,
        500,
        502,
        503,
        504,
    }:

        return True


    # -----------------------------------------------------
    # Common provider error codes
    # -----------------------------------------------------

    if error_code in {
        "insufficient_quota",
        "rate_limit_exceeded",
        "context_length_exceeded",
        "model_not_found",
        "server_error",
    }:

        return True


    # -----------------------------------------------------
    # Fallback detection for provider messages
    # -----------------------------------------------------

    switchable_keywords = [

        "quota",

        "credit_balance_exhausted",

        "rate limit",

        "rate_limit",

        "too many requests",

        "context length",

        "maximum context",

        "token limit",

        "model not found",

        "temporarily unavailable",

        "service unavailable",

        "server error",

        "overloaded",

    ]


    return any(
        keyword in error_message
        for keyword in switchable_keywords
    )


# =========================================================
# Generate response using one model
# =========================================================

def generate_response(
    messages: list[dict],
    model_id: str,
):

    if model_id not in MODEL_CONFIG:

        raise ValueError(
            f"Unsupported model: {model_id}"
        )


    model_config = MODEL_CONFIG[model_id]

    provider = model_config["provider"]

    model = model_config["model"]


    client = get_client(provider)


    response = client.chat.completions.create(
        model=model,
        messages=messages,
    )


    if not response.choices:

        raise ValueError(
            "The selected model returned no response."
        )


    answer = response.choices[0].message.content


    usage = None

    if response.usage:

        usage = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        }


    return {

        "provider": provider,

        "model": model,

        "model_label": model_config["label"],

        "model_id": model_id,

        "response": answer,

        "usage": usage,

    }


# =========================================================
# Automatic model switching
# =========================================================

def generate_response_with_fallback(
    messages: list[dict],
    model_id: str,
    automatic_switching: bool = False,
):

    # -----------------------------------------------------
    # If automatic switching is disabled
    # -----------------------------------------------------

    if not automatic_switching:

        return generate_response(
            messages=messages,
            model_id=model_id,
        )


    # -----------------------------------------------------
    # Build model attempt order
    # -----------------------------------------------------

    models_to_try = [

        model_id

    ] + [

        fallback_model
        for fallback_model in FALLBACK_ORDER

        if fallback_model != model_id

    ]


    attempted_models = []

    errors = []


    # -----------------------------------------------------
    # Try models one by one
    # -----------------------------------------------------

    for current_model in models_to_try:

        attempted_models.append(
            current_model
        )

        try:

            result = generate_response(
                messages=messages,
                model_id=current_model,
            )


            # -------------------------------------------------
            # Successful response
            # -------------------------------------------------

            result["automatic_switching"] = (
                automatic_switching
            )

            result["switched"] = (
                current_model != model_id
            )

            result["original_model_id"] = model_id

            result["attempted_models"] = attempted_models

            return result


        except Exception as error:

            errors.append({

                "model": current_model,

                "error": str(error),

            })


            # -------------------------------------------------
            # Only continue when the error is switchable
            # -------------------------------------------------

            if not is_switchable_error(error):

                raise


            print(
                f"Model {current_model} failed. "
                f"Trying next model..."
            )


    # -----------------------------------------------------
    # Every model failed
    # -----------------------------------------------------

    raise RuntimeError(
        "All configured models failed. "
        f"Attempts: {errors}"
    )