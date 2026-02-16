"""
Unified CLI runner for I-ASCAP data pipeline.

Usage:
    python -m scripts etl         Run core ETL pipeline
    python -m scripts ingest      Run multi-stage data ingestion
    python -m scripts verify      Run verification checks
    python -m scripts maint       Run maintenance scripts
    python -m scripts pipeline    Run full pipeline (etl + ingest + verify)
"""

import argparse
import sys
import subprocess
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))


def run_etl():
    """Run core ETL pipeline."""
    print("=" * 60)
    print("  Stage: ETL Pipeline")
    print("=" * 60)
    from scripts.etl import DistrictETL
    
    raw = os.path.join(BASE_DIR, 'data', 'raw', 'district_proliferation_1951_2024.xlsx')
    processed = os.path.join(BASE_DIR, 'data', 'processed', 'district_changes.csv')
    
    etl = DistrictETL(raw, processed)
    etl.run()
    return True


def run_ingest():
    """Run multi-stage ingestion pipeline."""
    print("=" * 60)
    print("  Stage: Data Ingestion Pipeline")
    print("=" * 60)
    try:
        from scripts.ingest.pipeline import run_pipeline
        run_pipeline()
        return True
    except ImportError:
        print("  [WARN] Ingestion pipeline module not found.")
        print("  Skipping ingestion stage.")
        return True
    except Exception as e:
        print(f"  [ERROR] Ingestion failed: {e}")
        return False


def run_verify():
    """Run all verification scripts."""
    print("=" * 60)
    print("  Stage: Data Verification")
    print("=" * 60)
    verify_dir = os.path.join(SCRIPTS_DIR, 'verification')
    scripts = sorted([
        f for f in os.listdir(verify_dir) 
        if f.endswith('.py') and not f.startswith('_')
    ])
    
    results = {}
    for script in scripts:
        script_path = os.path.join(verify_dir, script)
        print(f"\n  Running: {script}")
        print("-" * 40)
        try:
            result = subprocess.run(
                [sys.executable, script_path],
                cwd=BASE_DIR,
                capture_output=False,
                timeout=120,
            )
            results[script] = "PASS" if result.returncode == 0 else "FAIL"
        except subprocess.TimeoutExpired:
            results[script] = "TIMEOUT"
        except Exception as e:
            results[script] = f"ERROR: {e}"
    
    # Summary
    print("\n" + "=" * 60)
    print("  Verification Summary")
    print("=" * 60)
    for script, status in results.items():
        icon = "✅" if status == "PASS" else "❌"
        print(f"  {icon} {script}: {status}")
    
    return all(s == "PASS" for s in results.values())


def run_maint():
    """Run maintenance scripts."""
    print("=" * 60)
    print("  Stage: Maintenance")
    print("=" * 60)
    maint_dir = os.path.join(SCRIPTS_DIR, 'maint')
    scripts = sorted([
        f for f in os.listdir(maint_dir) 
        if f.endswith('.py') and not f.startswith('_')
    ])
    
    print(f"  Available maintenance scripts: {len(scripts)}")
    for script in scripts:
        print(f"    - {script}")
    print("\n  To run a specific script:")
    print(f"    python {os.path.join('scripts', 'maint', '<script_name>.py')}")


def run_full_pipeline():
    """Run the full pipeline: ETL → Ingest → Verify."""
    print("🚀 Starting Full I-ASCAP Data Pipeline")
    print("=" * 60)
    
    steps = [
        ("ETL", run_etl),
        ("Ingest", run_ingest),
        ("Verify", run_verify),
    ]
    
    for name, func in steps:
        print(f"\n{'=' * 60}")
        print(f"  ▶ {name}")
        print(f"{'=' * 60}")
        success = func()
        if not success:
            print(f"\n❌ Pipeline failed at: {name}")
            sys.exit(1)
    
    print("\n✅ Full pipeline completed successfully!")


def main():
    parser = argparse.ArgumentParser(
        prog="python -m scripts",
        description="I-ASCAP Data Pipeline CLI",
    )
    subparsers = parser.add_subparsers(dest="command", help="Pipeline commands")

    subparsers.add_parser("etl", help="Run core ETL pipeline")
    subparsers.add_parser("ingest", help="Run multi-stage data ingestion")
    subparsers.add_parser("verify", help="Run data verification checks")
    subparsers.add_parser("maint", help="Run/list maintenance scripts")
    subparsers.add_parser("pipeline", help="Run full pipeline (etl + ingest + verify)")

    args = parser.parse_args()

    commands = {
        "etl": run_etl,
        "ingest": run_ingest,
        "verify": run_verify,
        "maint": run_maint,
        "pipeline": run_full_pipeline,
    }

    if args.command in commands:
        commands[args.command]()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
