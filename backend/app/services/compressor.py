from headroom import compress, CompressConfig
from headroom.transforms.kompress_compressor import KompressCompressor


# ---------------------------------------------------------
# Initialize Kompress once when TokenWise starts
# ---------------------------------------------------------

kompress = KompressCompressor()

try:
    backend = kompress.preload(allow_download=False)
    print(f"Kompress backend loaded: {backend}")
except Exception as e:
    print(f"Kompress preload failed: {e}")


# ---------------------------------------------------------
# TokenWise compression service
# ---------------------------------------------------------

def compress_context(messages: list[dict], model: str):

    config = CompressConfig(
        compress_user_messages=True,
        compress_system_messages=False,
        protect_recent=0,
        min_tokens_to_compress=100,
    )

    result = compress(
        messages,
        model=model,
        config=config,
    )

    return {
        "messages": result.messages,
        "tokens_before": result.tokens_before,
        "tokens_after": result.tokens_after,
        "tokens_saved": result.tokens_saved,
        "compression_ratio": result.compression_ratio,
        "transforms_applied": result.transforms_applied,
    }