import math
from typing import Optional, Dict, Any
from config import (
    PANEL_WATTAGE_W,
    PANEL_CAPACITY_KW,
    PANEL_AREA_SQFT,
    USABLE_AREA_FACTOR,
    SYSTEM_COST_PER_KW,
    STATE_SUBSIDIES,
)
from database import get_db_connection


def get_state_subsidy(state_name: str) -> Dict[str, Any]:
    subsidy_info = STATE_SUBSIDIES.get(state_name)
    if subsidy_info:
        return subsidy_info
    return {
        "percent": 10,
        "scheme": "National rooftop solar subsidy",
    }


def calculate_solar_roi(
    monthly_bill: float,
    rooftop_area: float,
    tariff_rate: float,
    state: str,
    city: str = "Unknown",
    predicted_output: float = 0.0,
    user_id: Optional[int] = None,
) -> Dict[str, Any]:
    subsidy_info = get_state_subsidy(state)
    subsidy_percent = subsidy_info["percent"]

    # 1. Energy consumption requirement (demand-driven)
    monthly_units_kwh = monthly_bill / tariff_rate
    daily_units_kwh = monthly_units_kwh / 30.0
    # Solar generation benchmark: 1 kW system produces approx 4.0 kWh/day
    required_capacity_kw = daily_units_kwh / 4.0
    required_panels = max(1, int(math.ceil(required_capacity_kw / PANEL_CAPACITY_KW)))

    # 2. Rooftop physical capacity limit (geometry & area-driven)
    usable_roof_area_sqft = rooftop_area * USABLE_AREA_FACTOR
    max_physical_panels = max(1, int(usable_roof_area_sqft // PANEL_AREA_SQFT))
    max_physical_capacity_kw = round(max_physical_panels * PANEL_CAPACITY_KW, 2)

    # 3. Authoritative recommended system: NEVER exceed physical rooftop capacity
    is_roof_constrained = required_panels > max_physical_panels
    recommended_panel_count = min(required_panels, max_physical_panels)
    recommended_capacity_kw = round(recommended_panel_count * PANEL_CAPACITY_KW, 2)

    # 4. Required array footprint
    roof_area_required_sq_ft = round(recommended_panel_count * PANEL_AREA_SQFT, 1)

    # 5. Financial & generation metrics based strictly on authoritative recommended capacity
    monthly_generation_kwh = recommended_capacity_kw * 120.0  # 30 days * 4.0 kWh/kW/day
    estimated_monthly_savings = min(monthly_bill, monthly_generation_kwh * tariff_rate)

    system_cost = recommended_capacity_kw * SYSTEM_COST_PER_KW
    annual_savings = estimated_monthly_savings * 12.0
    annual_generation = monthly_generation_kwh * 12.0
    lifetime_savings_25_years = annual_savings * 25.0
    roi_percent = (
        ((lifetime_savings_25_years - system_cost) / system_cost * 100.0)
        if system_cost > 0
        else 0.0
    )
    payback_years = system_cost / annual_savings if annual_savings > 0 else 0.0

    green_offset_percent = (
        min(100.0, round((recommended_capacity_kw / required_capacity_kw) * 100.0, 1))
        if required_capacity_kw > 0
        else 100.0
    )

    constraint_message = (
        "Your rooftop area limits the recommended system size."
        if is_roof_constrained
        else ""
    )

    # Optional history persistence for authenticated user
    if user_id:
        conn = None
        cursor = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO calculations (user_id, city, monthly_bill, predicted_output, monthly_savings, payback_period) VALUES (%s, %s, %s, %s, %s, %s)",
                (
                    user_id,
                    city,
                    monthly_bill,
                    predicted_output,
                    estimated_monthly_savings,
                    round(payback_years, 2),
                ),
            )
            conn.commit()
        except Exception as exc:
            print(f"Warning: could not save calculation: {exc}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    return {
        "system_size": recommended_capacity_kw,
        "recommended_capacity_kw": recommended_capacity_kw,
        "required_panel_capacity_kw": recommended_capacity_kw,
        "required_capacity_kw": round(required_capacity_kw, 2),
        "max_physical_capacity_kw": max_physical_capacity_kw,
        "roof_capacity_kw": max_physical_capacity_kw,
        "panel_count": recommended_panel_count,
        "number_of_panels": recommended_panel_count,
        "max_physical_panels": max_physical_panels,
        "required_panels": required_panels,
        "panel_wattage": PANEL_WATTAGE_W,
        "panel_area_sqft": PANEL_AREA_SQFT,
        "usable_roof_area_sqft": round(usable_roof_area_sqft, 1),
        "usable_area_factor": USABLE_AREA_FACTOR,
        "is_roof_constrained": is_roof_constrained,
        "constraint_message": constraint_message,
        "green_offset_percent": green_offset_percent,
        "system_cost": round(system_cost, 2),
        "monthly_units_kwh": round(monthly_units_kwh, 2),
        "annual_savings": round(annual_savings, 2),
        "annual_generation": round(annual_generation, 2),
        "lifetime_savings_25_years": round(lifetime_savings_25_years, 2),
        "roi_percent": round(roi_percent, 2),
        "roof_area_required_sq_ft": roof_area_required_sq_ft,
        "estimated_monthly_savings": round(estimated_monthly_savings, 2),
        "payback_period": round(payback_years, 2),
        "payback_period_years": round(payback_years, 2),
        "state_subsidy_percent": subsidy_percent,
    }
