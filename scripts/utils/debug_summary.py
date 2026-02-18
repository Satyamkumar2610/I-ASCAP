import urllib.request
import json
import sys

url = "http://localhost:8000/api/v1/analysis/split-impact/summary"

try:
    # Create request with headers to mimic browser/frontend if needed, 
    # but basic GET should work for this endpoint
    req = urllib.request.Request(url)
    
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Headers: {response.headers}")
        
        body = response.read().decode('utf-8')
        print(f"Body Length: {len(body)}")
        
        if len(body) > 0:
            try:
                data = json.loads(body)
                print("JSON Decode: Success")
                print(f"States Count: {len(data.get('states', []))}")
                print(f"States: {data.get('states', [])[:5]}") # Print first 5 states
                print("Stats keys:", list(data.get('stats', {}).keys())[:5])
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")
                print("Raw Body Preview:", body[:500])
        else:
            print("Response Body is EMPTY")

except Exception as e:
    print(f"Error: {e}")
