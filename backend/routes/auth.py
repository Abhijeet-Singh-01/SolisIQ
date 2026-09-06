from fastapi import APIRouter, HTTPException, Depends, status
from auth import (
    generate_password_hash,
    check_password_hash,
    create_access_token,
    get_current_user,
)
from database import get_db_connection
from schemas import SignupRequest, LoginRequest, AdminLoginRequest

router = APIRouter(tags=["Authentication"])


@router.post("/signup")
def signup(req: SignupRequest):
    username = (req.username or "").strip()
    email = (req.email or "").strip().lower()
    password = req.password or ""

    if not username or not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username, email, and password are required.",
        )

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        existing = cursor.fetchone()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered.",
            )

        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_password),
        )
        conn.commit()
        return {"message": "User registered successfully."}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {exc}",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.post("/login")
def login(req: LoginRequest):
    email = (req.email or "").strip().lower()
    password = req.password or ""

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, username, email, password FROM users WHERE email = %s", (email,)
        )
        user = cursor.fetchone()

        if not user or not check_password_hash(user["password"], password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        payload = {
            "user_id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "isAdmin": False,
        }
        token = create_access_token(payload)

        return {
            "message": "Login successful.",
            "token": token,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {exc}",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.post("/admin/login")
def admin_login(req: AdminLoginRequest):
    username = (req.username or "").strip()
    password = req.password or ""

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required.",
        )

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, username, email, password_hash FROM admins WHERE username = %s",
            (username,),
        )
        admin = cursor.fetchone()

        if not admin or not check_password_hash(admin["password_hash"], password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin credentials.",
            )

        payload = {
            "user_id": admin["id"],
            "username": admin["username"],
            "email": admin["email"],
            "isAdmin": True,
        }
        token = create_access_token(payload)

        return {
            "message": "Admin login successful.",
            "token": token,
            "isAdmin": True,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {exc}",
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.get("/profile")
def profile(current_user: dict = Depends(get_current_user)):
    return {"message": "Authenticated", "user": current_user}
