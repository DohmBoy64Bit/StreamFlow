from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes.auth import router as auth_router
from app.api.routes.lists import router as lists_router
from app.api.routes.movies import router as movies_router
from app.api.routes.stats import router as stats_router
from app.api.routes.tv import router as tv_router
from app.api.routes.vidsrc import router as vidsrc_router
from app.api.routes.watch import router as watch_router
from app.config import settings
from app.core.database import engine
from app.core.middleware import global_exception_handler, limiter
from app.models.db_models import Base


import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")

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

app.mount("/api/v1/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(lists_router, prefix="/api/v1/lists", tags=["lists"])
app.include_router(movies_router, prefix="/api/v1/movies", tags=["movies"])
app.include_router(stats_router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(tv_router, prefix="/api/v1/tv", tags=["tv"])
app.include_router(watch_router, prefix="/api/v1/watch", tags=["watch"])
app.include_router(vidsrc_router, prefix="/api/v1/vidsrc", tags=["vidsrc"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Serve frontend static files (must be after all API routes)
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(__file__), "frontend-dist")

if os.path.exists(frontend_dist):
    # Mount static assets
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="frontend-assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend SPA - fallback to index.html for client-side routing."""
        # Try to serve the requested file
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Fallback to index.html for SPA routing
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        return {"error": "Frontend not built"}
