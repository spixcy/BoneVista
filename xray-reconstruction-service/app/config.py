import os
from pathlib import Path
from pydantic import BaseModel


class Settings(BaseModel):
    service_name: str = "bonevista-xray-reconstruction"
    version: str = "1.1"
    host: str = os.getenv("BONEVISTA_RECON_HOST", "127.0.0.1")
    port: int = int(os.getenv("BONEVISTA_RECON_PORT", "8000"))
    
    # Per-image upload limit: 25 MiB (26,214,400 bytes)
    max_upload_bytes: int = int(os.getenv("BONEVISTA_MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))
    
    # Permitted CORS origins for local frontend development
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "BONEVISTA_RECON_CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
        ).split(",")
        if origin.strip()
    ]
    
    # Sandboxed storage directories
    base_dir: Path = Path(__file__).resolve().parent.parent
    checkpoints_dir: Path = base_dir / "checkpoints"
    temp_dir: Path = base_dir / "temp_uploads"
    outputs_dir: Path = base_dir / "outputs"


settings = Settings()

# Ensure directories exist safely
settings.checkpoints_dir.mkdir(parents=True, exist_ok=True)
settings.temp_dir.mkdir(parents=True, exist_ok=True)
settings.outputs_dir.mkdir(parents=True, exist_ok=True)
