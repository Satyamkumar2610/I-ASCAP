"""
Security middleware for I-ASCAP API.
Adds security headers and implements security best practices.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses.
    Implements OWASP security header recommendations.
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Enable XSS filtering
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Content Security Policy (restrictive for API)
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (restrict browser features)
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Remove server header for security
        if "server" in response.headers:
            del response.headers["server"]
        
        return response


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add HSTS header for HTTPS enforcement.
    Only applies in production (when not localhost).
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Only add HSTS for production requests
        host = request.headers.get("host", "")
        if "localhost" not in host and "127.0.0.1" not in host:
            # Strict Transport Security (1 year)
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        return response


# Security configuration constants
class SecurityConfig:
    """Security-related configuration."""
    
    # Maximum request body size (10 MB)
    MAX_BODY_SIZE = 10 * 1024 * 1024
    
    # Request timeout (30 seconds)
    REQUEST_TIMEOUT = 30
    
    # Allowed content types
    ALLOWED_CONTENT_TYPES = [
        "application/json",
        "application/x-www-form-urlencoded",
        "multipart/form-data",
    ]
    
    # Sensitive headers to strip from logs
    SENSITIVE_HEADERS = [
        "authorization",
        "cookie",
        "x-api-key",
    ]


from starlette.responses import JSONResponse
from app.config import get_settings

settings = get_settings()

class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Middleware to enforce API Key authentication.
    """
    # Public paths that do not require authentication
    PUBLIC_PATHS = {
        "/", 
        "/docs", 
        "/redoc", 
        "/openapi.json", 
        "/health", 
        "/health/ready",
        "/favicon.ico"
    }

    async def dispatch(self, request: Request, call_next):
        # Allow public paths
        if request.url.path in self.PUBLIC_PATHS:
            return await call_next(request)
            
        # Check API Key
        api_key = request.headers.get("X-API-Key")
        if not api_key or api_key != settings.api_key:
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid or missing API Key",
                        "status_code": 401
                    }
                }
            )
            
        return await call_next(request)


def sanitize_headers_for_logging(headers: dict) -> dict:
    """Remove sensitive information from headers before logging."""
    sanitized = {}
    for key, value in headers.items():
        if key.lower() in SecurityConfig.SENSITIVE_HEADERS:
            sanitized[key] = "[REDACTED]"
        else:
            sanitized[key] = value
    return sanitized
