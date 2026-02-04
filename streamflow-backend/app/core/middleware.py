import os
from collections.abc import Callable
from typing import Any

from fastapi import Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

is_testing = os.getenv("TESTING", "false").lower() == "true"


class NoOpLimiter:
    """A no-op rate limiter for testing that doesn't actually limit anything."""

    def limit(self, *args: Any, **kwargs: Any) -> Callable[[Callable], Callable]:
        """Return a no-op decorator."""

        def decorator(func: Callable) -> Callable:
            return func

        return decorator


if is_testing:
    limiter: Any = NoOpLimiter()
else:
    limiter = Limiter(key_func=get_remote_address)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
