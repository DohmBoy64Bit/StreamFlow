from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes.auth import router as auth_router
from app.api.routes.movies import router as movies_router
from app.api.routes.tv import router as tv_router
from app.api.routes.vidsrc import router as vidsrc_router
from app.api.routes.watch import router as watch_router
from app.config import settings
from app.core.database import engine
from app.core.middleware import global_exception_handler, limiter
from app.models.db_models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="StreamFlow API",
    description="A Netflix-style streaming application API",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(Exception, global_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(movies_router, prefix="/api/v1/movies", tags=["movies"])
app.include_router(tv_router, prefix="/api/v1/tv", tags=["tv"])
app.include_router(watch_router, prefix="/api/v1/watch", tags=["watch"])
app.include_router(vidsrc_router, prefix="/api/v1/vidsrc", tags=["vidsrc"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
