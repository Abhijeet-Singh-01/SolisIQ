from fastapi import APIRouter, HTTPException, Depends, status
from auth import get_current_user
from database import get_db_connection

router = APIRouter(tags=["Calculation History"])


@router.get("/my-calculations")
def get_my_calculations(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, city, monthly_bill, predicted_output, monthly_savings, payback_period, created_at FROM calculations WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
        )
        records = cursor.fetchall()
        return {
            "calculations": records,
            "history": records,
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


@router.delete("/my-calculations/{calculation_id}")
@router.delete("/calculation/{calculation_id}")
def delete_my_calculation(calculation_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM calculations WHERE id = %s AND user_id = %s",
            (calculation_id, user_id),
        )
        affected = cursor.rowcount
        conn.commit()

        if affected == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Calculation not found or not owned by this user.",
            )

        return {"message": "Calculation deleted."}
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
