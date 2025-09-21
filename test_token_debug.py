#!/usr/bin/env python3
"""
Debug script to test login and profile API with valid and invalid tokens
"""

import requests
import json

BASE_URL = "http://localhost:5000"
TEST_USER = {
    "email": "test1@gmail.com",  # replace with your test user email
    "password": "Test@123456"   # replace with your test user password
}

def test_profile_with_debug():
    print("🔍 Testing Profile API with Debug Info")
    print("=" * 50)

    # 1️⃣ Test server connectivity
    print("1. Testing server connectivity...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   ✅ Server is running: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Server not running: {e}")
        return

    # 2️⃣ Test OPTIONS request (CORS preflight)
    print("\n2. Testing OPTIONS request...")
    response = requests.options(f"{BASE_URL}/api/auth/profile")
    print(f"   Status: {response.status_code}")
    print(f"   Headers: {dict(response.headers)}")

    # 3️⃣ Test login to get valid token
    print("\n3. Logging in to get valid token...")
    login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
    if login_response.status_code == 200:
        access_token = login_response.json().get("access_token")
        print(f"   ✅ Login successful. Access token obtained.")
    else:
        print(f"   ❌ Login failed: {login_response.status_code} {login_response.text}")
        return

    # 4️⃣ Test /profile with valid token
    print("\n4. Testing /profile with valid token...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")

    # 5️⃣ Test /profile with invalid token
    print("\n5. Testing /profile with invalid token...")
    headers = {"Authorization": "Bearer invalid_token_123"}
    response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text}")

    # 6️⃣ Test /profile without token
    print("\n6. Testing /profile without token...")
    response = requests.get(f"{BASE_URL}/api/auth/profile")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text}")

    # 7️⃣ Test /profile with malformed Authorization header
    print("\n7. Testing /profile with malformed Authorization header...")
    headers = {"Authorization": "InvalidFormat"}
    response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text}")

    print("\n" + "=" * 50)
    print("✅ Debug test completed")

if __name__ == "__main__":
    test_profile_with_debug()
