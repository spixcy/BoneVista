import sys
from pathlib import Path

# Ensure the xray-reconstruction-service/ root is importable as a package root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
