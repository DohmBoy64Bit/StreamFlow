from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.config import settings
from app.core.database import engine
from app.models.db_models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup (if needed)


app = FastAPI(
    title="StreamFlow API",
    description="A Netflix-style streaming application API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
