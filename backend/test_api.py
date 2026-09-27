import requests


API_URL = "http://127.0.0.1:8000/api/compress"


# ---------------------------------------------------------
# Create large repetitive content
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
""" * 100


messages = [
    {
        "role": "user",
        "content": large_content
    }
]


# ---------------------------------------------------------
# Request data
# ---------------------------------------------------------

request_data = {
    "model": "gpt-4o",
    "messages": messages
}


print("=" * 60)
print("TOKENWISE API COMPRESSION TEST")
print("=" * 60)

print("Sending large repetitive context...")
print()


# ---------------------------------------------------------
# Send request to TokenWise
# ---------------------------------------------------------

response = requests.post(
    API_URL,
    json=request_data
)


# ---------------------------------------------------------
# Check response
# ---------------------------------------------------------

if response.status_code != 200:
    print("API ERROR")
    print("Status code:", response.status_code)
    print(response.text)
    exit()


result = response.json()


# ---------------------------------------------------------
# Display compression metrics
# ---------------------------------------------------------

print("=" * 60)
print("COMPRESSION RESULT")
print("=" * 60)

print(f"Tokens before : {result['tokens_before']}")
print(f"Tokens after  : {result['tokens_after']}")
print(f"Tokens saved  : {result['tokens_saved']}")

print(
    f"Compression   : "
    f"{result['compression_ratio'] * 100:.2f}%"
)

print()

print("Transforms applied:")

for transform in result.get("transforms_applied", []):
    print(f"  - {transform}")

print("=" * 60)