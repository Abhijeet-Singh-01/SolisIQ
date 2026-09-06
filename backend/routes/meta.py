from fastapi import APIRouter, HTTPException, Query, status
from config import SYSTEM_COST_PER_KW
from database import get_db_connection
from services.solar_service import get_state_subsidy

router = APIRouter(tags=["Metadata & Public Telemetry"])


@router.get("/")
def home():
    return {"message": "SolisIQ backend is running"}


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/subsidy-info")
def subsidy_info(
    state: str = Query(..., description="State name"),
    capacity_kw: float = Query(..., description="Rooftop solar capacity in kW"),
):
    clean_state = (state or "").strip()
    if not clean_state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="State is required.",
        )

    if capacity_kw <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rooftop capacity must be greater than zero.",
        )

    info = get_state_subsidy(clean_state)
    system_cost = capacity_kw * SYSTEM_COST_PER_KW
    subsidy_amount = system_cost * info["percent"] / 100.0

    return {
        "state": clean_state,
        "subsidy_percent": info["percent"],
        "subsidy_amount": round(subsidy_amount, 2),
        "scheme_name": info.get("scheme"),
        "system_cost": round(system_cost, 2),
    }


@router.get("/community-stats")
def community_stats():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT COUNT(*) AS total_calculations, "
            "AVG(monthly_savings) AS avg_monthly_savings, "
            "AVG(payback_period) AS avg_payback_period, "
            "AVG(predicted_output) AS avg_predicted_output "
            "FROM calculations"
        )
        overall = cursor.fetchone() or {}

        cursor.execute(
            "SELECT city, COUNT(*) AS calculations, "
            "AVG(monthly_savings) AS avg_monthly_savings, "
            "AVG(payback_period) AS avg_payback_period "
            "FROM calculations "
            "GROUP BY city "
            "ORDER BY calculations DESC "
            "LIMIT 6"
        )
        city_breakdown = cursor.fetchall()

        return {
            "total_calculations": int(overall.get("total_calculations") or 0),
            "avg_monthly_savings": float(overall.get("avg_monthly_savings") or 0),
            "avg_payback_period": float(overall.get("avg_payback_period") or 0),
            "avg_predicted_output": float(overall.get("avg_predicted_output") or 0),
            "top_cities": [
                {
                    "city": row["city"],
                    "calculations": int(row["calculations"] or 0),
                    "avg_monthly_savings": float(row["avg_monthly_savings"] or 0),
                    "avg_payback_period": float(row["avg_payback_period"] or 0),
                }
                for row in city_breakdown
            ],
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
