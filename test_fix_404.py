
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(name, url):
    print(f"Testing {name}: {url}")
    try:
        response = requests.get(url)
        print(f"  Status: {response.status_code}")
        try:
            print(f"  Body: {response.json()}")
        except:
            print(f"  Body: {response.text}")
    except Exception as e:
        print(f"  Error: {e}")
    print("-" * 40)

if __name__ == "__main__":
    # Test passing NAME as CDK
    test_endpoint("Districts/Seoni", f"{BASE_URL}/districts/Seoni")
    
    # Test valid requests again
    test_endpoint("Districts/428", f"{BASE_URL}/districts/428")
