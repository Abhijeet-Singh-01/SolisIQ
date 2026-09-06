import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from config import CORS_ORIGINS
from database import init_db
from routes.meta import router as meta_router
from routes.auth import router as auth_router
from routes.solar import router as solar_router
from routes.history import router as history_router
from routes.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed default admin on application startup
    try:
        init_db()
    except Exception as exc:
        print(f"Database initialization warning on startup: {exc}")
    yield


app = FastAPI(
    title="SolisIQ API",
    description="High-performance AI-driven solar intelligence and rooftop sizing API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
cors_origins_env = CORS_ORIGINS.strip()
if cors_origins_env == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    origins_list = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Exception handler to preserve strict frontend error compatibility
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": detail, "message": detail, "detail": detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Formulate friendly error string from validation errors
    errors = [f"{e['loc'][-1]}: {e['msg']}" for e in exc.errors()]
    error_msg = f"Validation error: {', '.join(errors)}"
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": error_msg, "message": error_msg, "detail": exc.errors()},
    )


# Register all modular route groups
app.include_router(meta_router)
app.include_router(auth_router)
app.include_router(solar_router)
app.include_router(history_router)
app.include_router(admin_router)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_ENV") == "development"

    print(f"Starting FastAPI server on port {port} (reload={debug_mode})")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=debug_mode)
