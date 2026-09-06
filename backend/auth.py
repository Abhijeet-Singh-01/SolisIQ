from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
import jwt
from fastapi import Header, HTTPException, status
from config import SECRET_KEY


def generate_password_hash(password: str) -> str:
    """Generates a bcrypt hash identical to Flask-Bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def check_password_hash(hashed: str, password: str) -> bool:
    """Verifies a password against a bcrypt hash."""
    if not hashed or not password:
        return False
    try:
        hashed_bytes = hashed.encode("utf-8") if isinstance(hashed, str) else hashed
        return bcrypt.checkpw(password.encode("utf-8"), hashed_bytes)
    except Exception:
        return False


def create_access_token(payload_data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = payload_data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT access token."""
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])


def get_current_user(authorization: Optional[str] = Header(None, alias="Authorization")) -> Dict[str, Any]:
    """FastAPI dependency to protect user routes."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing. Please log in first.",
        )

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired. Please log in again.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Please log in again.",
        )


def get_current_admin(authorization: Optional[str] = Header(None, alias="Authorization")) -> Dict[str, Any]:
    """FastAPI dependency to protect admin routes."""
    payload = get_current_user(authorization)
    if not payload.get("isAdmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return payload


def get_optional_user(authorization: Optional[str] = Header(None, alias="Authorization")) -> Optional[int]:
    """Extracts user_id from token if present and valid, otherwise returns None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        return payload.get("user_id")
    except Exception:
        return None
