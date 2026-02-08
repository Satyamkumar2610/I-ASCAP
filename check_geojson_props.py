import json

with open("frontend/public/data/districts.json", "r") as f:
    data = json.load(f)
    print(data['features'][0]['properties'].keys())
    print(data['features'][0]['properties'])
