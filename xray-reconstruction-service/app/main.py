from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routes import health_router, reconstruction_router, jobs_router
from .validation import ReconstructionAPIException


def create_app() -> FastAPI:
    app = FastAPI(
        title="BoneVista X-ray Reconstruction Service",
        version=settings.version,
        description=(
            "Educational/research prototype. Returns AI-estimated 3D bone reconstructions. "
            "NOT clinically validated. Not for diagnosis or treatment decisions."
        ),
        docs_url="/docs",
        redoc_url=None,
    )

    # Restrict CORS to local frontend dev origins only
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Accept"],
    )

    # Register routers
    app.include_router(health_router)
    app.include_router(reconstruction_router)
    app.include_router(jobs_router)

    # -------------------------------------------------------------------
    # Global exception handlers — no stack traces in responses
    # -------------------------------------------------------------------

    @app.exception_handler(ReconstructionAPIException)
    async def reconstruction_exception_handler(
        request: Request, exc: ReconstructionAPIException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message}},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        # Do not expose internals
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}},
        )

    return app


app = create_app()
