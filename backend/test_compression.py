from app.services.compressor import compress_context


def test_compression(name, messages):
    print(f"\n{'=' * 60}")
    print(name)
    print("=" * 60)

    result = compress_context(
        messages=messages,
        model="gpt-4o"
    )

    print(f"Tokens before : {result['tokens_before']}")
    print(f"Tokens after  : {result['tokens_after']}")
    print(f"Tokens saved  : {result['tokens_saved']}")
    print(f"Compression   : {result['compression_ratio']:.2%}")


# ---------------------------------------------------------
# TEST 1 — Normal text
# ---------------------------------------------------------

text_messages = [
    {
        "role": "user",
        "content": """
        Analyze this dataset and identify unusual patterns.
        The dataset contains user activity, timestamps, login locations,
        transaction amounts, device information, and historical activity records.
        """
    }
]

test_compression("TEST 1 — Normal Text", text_messages)


# ---------------------------------------------------------
# TEST 2 — Repetitive JSON-like data
# ---------------------------------------------------------

json_messages = [
    {
        "role": "user",
        "content": """
        Analyze the following user activity records:

        [
            {"user_id": 1001, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1002, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1003, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1004, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1005, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1006, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1007, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1008, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1009, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"},
            {"user_id": 1010, "location": "Hyderabad", "device": "Windows", "amount": 4500, "status": "success"}
        ]
        """
    }
]

test_compression("TEST 2 — Repetitive JSON", json_messages)


# ---------------------------------------------------------
# TEST 3 — Large repetitive content
# ---------------------------------------------------------

large_content = """
User activity log:

user_id=1001 location=Hyderabad device=Windows status=success amount=4500
user_id=1002 location=Hyderabad device=Windows status=success amount=4500
user_id=1003 location=Hyderabad device=Windows status=success amount=4500
user_id=1004 location=Hyderabad device=Windows status=success amount=4500
user_id=1005 location=Hyderabad device=Windows status=success amount=4500
user_id=1006 location=Hyderabad device=Windows status=success amount=4500
user_id=1007 location=Hyderabad device=Windows status=success amount=4500
user_id=1008 location=Hyderabad device=Windows status=success amount=4500
user_id=1009 location=Hyderabad device=Windows status=success amount=4500
user_id=1010 location=Hyderabad device=Windows status=success amount=4500
""" * 50

large_messages = [
    {
        "role": "user",
        "content": large_content
    }
]

test_compression("TEST 3 — Large Repetitive Content", large_messages)