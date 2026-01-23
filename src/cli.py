import argparse
import sys
from .etl import run_etl
from .visualizations.manager import run_visualizations

def main():
    parser = argparse.ArgumentParser(description="District Evolution CLI Tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: run-pipeline
    subparsers.add_parser("run-pipeline", help="Run the full ETL and Visualization pipeline")
    
    # Command: etl
    subparsers.add_parser("etl", help="Run only the Data ETL process")
    
    # Command: viz
    subparsers.add_parser("viz", help="Run only Visualization generation")

    args = parser.parse_args()

    if args.command == "etl":
        run_etl()
    elif args.command == "viz":
        run_visualizations()
    elif args.command == "run-pipeline":
        print("--- Step 1: Data ETL ---")
        if run_etl():
            print("\n--- Step 2: Visualizations ---")
            run_visualizations()
            print("\nPipeline execution complete.")
        else:
            print("ETL failed, aborting pipeline.")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
