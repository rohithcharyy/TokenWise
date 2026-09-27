from headroom.transforms.content_detector import detect_content_type
import json


records = [
    {
        "user_id": "USER_1",
        "name": "Test User",
        "location": "Hyderabad",
        "device": "Windows Laptop",
        "transaction_amount": 1250,
        "timestamp": "2026-09-23 10:30:00",
        "status": "Completed",
        "activity": "User logged into the application from Hyderabad",
        "previous_activity": "User logged in previously from Hyderabad"
    }
]

content = json.dumps(records)

result = detect_content_type(content)

print("Content:")
print(content)

print("\nDetection result:")
print(result)

print("\nResult type:")
print(type(result))

print("\nResult details:")
print(result.__dict__)