#!/usr/bin/env python3
"""
Fix CDK Identifier Inconsistencies in district_master.csv

This script corrects state code prefixes that don't match the standard
two-letter codes used in the primary dataset section.

Mappings identified from data analysis:
- RA -> RJ (Rajasthan)
- MA -> MH (Maharashtra)  
- GU -> GJ (Gujarat)
- KE -> KL (Kerala)
- WE -> WB (West Bengal)
- TA -> TN (Tamil Nadu)
- PU -> PB (Punjab)
- HI -> HP (Himachal Pradesh)
- DA -> DD (Dadra & Nagar Haveli)
- MI -> MZ (Mizoram)
- LA -> LD (Lakshadweep)
- JA -> JK (Jammu & Kashmir)
- BI -> BR (Bihar)
- AN -> AP for Adilabad (special case - it's in Telangana now)
"""

import pandas as pd
import os
from pathlib import Path

# State code mappings (incorrect -> correct)
STATE_CODE_FIXES = {
    'RA': 'RJ',  # Rajasthan
    'MA': 'MH',  # Maharashtra (but MH already exists, need to merge)
    'GU': 'GJ',  # Gujarat
    'KE': 'KL',  # Kerala
    'WE': 'WB',  # West Bengal
    'TA': 'TN',  # Tamil Nadu
    'PU': 'PB',  # Punjab
    'HI': 'HP',  # Himachal Pradesh
    'DA': 'DD',  # Dadra & Nagar Haveli
    'MI': 'MZ',  # Mizoram
    'LA': 'LD',  # Lakshadweep
    'JA': 'JK',  # Jammu & Kashmir
    'BI': 'BR',  # Bihar
}

def fix_cdk(cdk: str) -> str:
    """Fix the CDK prefix if it uses a non-standard state code."""
    if pd.isna(cdk) or not isinstance(cdk, str):
        return cdk
    
    parts = cdk.split('_')
    if len(parts) < 2:
        return cdk
    
    prefix = parts[0]
    if prefix in STATE_CODE_FIXES:
        parts[0] = STATE_CODE_FIXES[prefix]
        return '_'.join(parts)
    
    return cdk


def main():
    # Paths - scripts/ is directly under DistrictEvolution/
    base_dir = Path(__file__).parent.parent  # scripts -> DistrictEvolution
    input_path = base_dir / 'data' / 'v1' / 'district_master.csv'
    backup_path = base_dir / 'data' / 'v1' / 'district_master_backup.csv'
    output_path = input_path  # Overwrite in place
    
    print(f"Reading from: {input_path}")
    
    # Read CSV
    df = pd.read_csv(input_path)
    original_count = len(df)
    print(f"Total rows: {original_count}")
    
    # Backup
    df.to_csv(backup_path, index=False)
    print(f"Backup saved to: {backup_path}")
    
    # Count fixes before applying
    fix_counts = {}
    for old_code in STATE_CODE_FIXES:
        count = df['cdk'].str.startswith(f'{old_code}_', na=False).sum()
        if count > 0:
            fix_counts[old_code] = count
    
    print(f"\nFixes to apply:")
    for old_code, count in fix_counts.items():
        print(f"  {old_code} -> {STATE_CODE_FIXES[old_code]}: {count} rows")
    
    # Apply fixes
    df['cdk'] = df['cdk'].apply(fix_cdk)
    
    # Validate - check for duplicates
    duplicates = df[df.duplicated(subset=['cdk'], keep=False)]
    if len(duplicates) > 0:
        print(f"\n⚠️  Warning: {len(duplicates)} potential duplicate CDKs after fix:")
        print(duplicates[['cdk', 'district_name', 'state_name']].head(20))
    
    # Remove exact duplicates (same CDK, same district name)
    before_dedup = len(df)
    df = df.drop_duplicates(subset=['cdk', 'district_name'], keep='first')
    after_dedup = len(df)
    if before_dedup != after_dedup:
        print(f"\n🧹 Removed {before_dedup - after_dedup} exact duplicates")
    
    # Save
    df.to_csv(output_path, index=False)
    print(f"\n✅ Fixed CSV saved to: {output_path}")
    print(f"Final row count: {len(df)}")
    
    # Verify
    remaining_issues = 0
    for old_code in STATE_CODE_FIXES:
        count = df['cdk'].str.startswith(f'{old_code}_', na=False).sum()
        if count > 0:
            remaining_issues += count
            print(f"  ⚠️  Still found {count} rows with {old_code}_ prefix")
    
    if remaining_issues == 0:
        print("✅ All state code prefixes have been fixed!")


if __name__ == '__main__':
    main()
