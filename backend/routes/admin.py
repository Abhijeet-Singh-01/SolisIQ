from fastapi import APIRouter, HTTPException, Depends, status
from auth import get_current_admin
from database import get_db_connection

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats")
def admin_stats(current_admin: dict = Depends(get_current_admin)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM calculations")
        total_calculations = cursor.fetchone()[0]

        cursor.execute(
            "SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        )
        new_registrations_this_week = cursor.fetchone()[0]

        return {
            "total_users": total_users,
            "total_calculations": total_calculations,
            "new_registrations_this_week": new_registrations_this_week,
        }
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


@router.get("/users")
def admin_users(current_admin: dict = Depends(get_current_admin)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC"
        )
        users = cursor.fetchall()
        return {"users": users}
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


@router.delete("/user/{user_id}")
@router.delete("/users/{user_id}")
def delete_admin_user(user_id: int, current_admin: dict = Depends(get_current_admin)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        affected = cursor.rowcount
        conn.commit()

        if affected == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        return {"message": "User deleted."}
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
