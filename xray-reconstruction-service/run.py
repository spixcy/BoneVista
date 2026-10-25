"""Entry point for running the BoneVista X-ray Reconstruction Service.

Usage (from xray-reconstruction-service/ directory):
    .venv/Scripts/python.exe run.py

Or using uvicorn directly:
    .venv/Scripts/uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info",
    )
