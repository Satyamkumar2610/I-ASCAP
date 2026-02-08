import requests
import json

def verify():
    print("Fetching Metrics for Rice 2001...")
    # URL for local backend (assuming port 8000 based on uvicorn command)
    # The uvicorn command was run in 'backend' dir, likely on 8000.
    url = "http://localhost:8000/api/v1/metrics?year=2001&crop=rice&metric=yield"
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            return
            
        data = response.json()
        print(f"Received {len(data)} records.")
        
        # Check for State Average method
        estimated = [d for d in data if d.get('method') == 'State Average']
        print(f"Found {len(estimated)} estimated records.")
        
        if estimated:
            print("Sample Estimated Record:")
            print(estimated[0])
            
        # Check specific district: Sikar (Rajasthan)
        sikar = next((d for d in data if 'sikar' in d['cdk'].lower()), None)
        if sikar:
            print("\nSikar Record:")
            print(sikar)
        else:
            print("\nSikar record not found in response.")

    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    verify()
