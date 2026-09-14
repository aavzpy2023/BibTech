#!/bin/bash
echo "Cleaning up orphans (skipping main.py to allow concurrency)..."
# pkill -f "src.cli_bootstrap" || true
# pkill -f "python main.py" || true
echo "Done. Run make up."