
import requests
import time

URL = "http://localhost:8000/api/v1/analysis/efficiency"
params = {
    "cdk": "UP_agra_1981",
    "crop": "wheat",
    "year": 2017
}

print(f"Testing {URL} with {params}")
try:
    response = requests.get(URL, params=params)
    print(f"Status: {response.status_code}")
    print(f"Content: {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")
