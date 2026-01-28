
import pandas as pd
import collections

RAW_PATH = 'data/processed/district_changes.csv'

def analyze():
    df = pd.read_csv(RAW_PATH)
    
    # 1. Detect Flip-Flops (A -> B -> A)
    # We build a graph of names
    transitions = collections.defaultdict(set)
    for _, row in df.iterrows():
        s = row['source_district'].lower().strip()
        d = row['dest_district'].lower().strip()
        if s != d:
            transitions[s].add(d)
            
    # Check for cycles A -> B and B -> A
    flip_flops = []
    for s, dests in transitions.items():
        for d in dests:
            if d in transitions and s in transitions[d]:
                if s < d: # Avoid Dupes
                    flip_flops.append((s, d))
                    
    print("--- DETECTED FLIP_FLOPS (A <-> B) ---")
    for a, b in flip_flops:
        print(f"'{a}': '{b}',") # Suggest mapping A to B (or vice versa)

    # 2. Detect Common Prefixes (Spelling Variations)
    # e.g. "Ahmednagar" vs "Ahmadnagar"
    names = set(df['source_district'].str.lower().unique()) | set(df['dest_district'].str.lower().unique())
    names = sorted(list(names))
    
    print("\n--- POTENTIAL SPELLING VARIANTS (Manual Review) ---")
    # Simple check: Sort and look at neighbors
    for i in range(len(names)-1):
        n1 = names[i]
        n2 = names[i+1]
        
        # Levenshtein or simple prefix
        if n1[:4] == n2[:4]:
            print(f"'{n1}' vs '{n2}'")

if __name__ == "__main__":
    analyze()
