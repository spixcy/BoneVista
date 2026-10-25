import io
from PIL import Image

from .config import settings


class ReconstructionAPIException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class UploadTooLargeError(ReconstructionAPIException):
    def __init__(self, detail: str = "Image upload exceeds maximum allowed size (25 MiB)."):
        super().__init__(code="UPLOAD_TOO_LARGE", message=detail, status_code=400)


class InvalidImageError(ReconstructionAPIException):
    def __init__(self, detail: str = "The uploaded file is not a valid JPEG, PNG, or WebP image."):
        super().__init__(code="INVALID_IMAGE", message=detail, status_code=400)


class MissingViewError(ReconstructionAPIException):
    def __init__(self, detail: str = "Both AP and lateral views are required for reconstruction."):
        super().__init__(code="MISSING_VIEW", message=detail, status_code=400)


class UnsupportedAnatomyError(ReconstructionAPIException):
    def __init__(self, detail: str = "The requested anatomy is not supported by the configured model."):
        super().__init__(code="UNSUPPORTED_ANATOMY", message=detail, status_code=400)


class ModelUnavailableError(ReconstructionAPIException):
    def __init__(self, detail: str = "No verified inference checkpoint is configured."):
        super().__init__(code="MODEL_UNAVAILABLE", message=detail, status_code=503)


def detect_image_format(data: bytes) -> str | None:
    """Detect image format by signature/magic bytes."""
    if len(data) < 12:
        return None
    if data.startswith(b"\xff\xd8\xff"):
        return "JPEG"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "PNG"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "WEBP"
    return None


def validate_image_bytes(data: bytes, view_name: str) -> None:
    """Strictly validate image bytes size and content."""
    if not data or len(data) == 0:
        raise InvalidImageError(f"Uploaded {view_name} image is empty.")

    if len(data) > settings.max_upload_bytes:
        raise UploadTooLargeError(
            f"{view_name} image exceeds {settings.max_upload_bytes} bytes limit."
        )

    fmt = detect_image_format(data)
    if fmt is None:
        raise InvalidImageError(f"{view_name} image is not a recognized JPEG, PNG, or WebP file.")

    # Use Pillow to ensure image structure is parseable without decoding entire pixel payload
    try:
        with Image.open(io.BytesIO(data)) as img:
            img.verify()
    except Exception as e:
        raise InvalidImageError(f"Corrupted or invalid {view_name} image data: {str(e)}")
