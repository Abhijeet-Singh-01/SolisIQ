import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Response, status
from auth import get_optional_user
from config import COMPARISON_PATH
from schemas import (
    PredictRequest,
    RoiCalculationRequest,
    CarbonFootprintRequest,
    GenerateReportRequest,
)
from services.solar_service import calculate_solar_roi
from services.weather_service import get_live_weather
from services.ml_service import predict_energy_output, get_seasonal_breakdown
from services.pdf_service import generate_solar_pdf

router = APIRouter(tags=["Solar & Energy Analytics"])


@router.get("/weather")
def weather_lookup(city: str = Query(..., description="City name for weather lookup")):
    clean_city = (city or "").strip()
    if not clean_city:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a city name.",
        )

    weather_data = get_live_weather(clean_city)
    status_code = weather_data.pop("status_code", 200)
    if status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=weather_data.get("error", f"No results found for city: {clean_city}."),
        )

    return weather_data


@router.post("/predict")
def predict(req: PredictRequest):
    try:
        output = predict_energy_output(
            temperature=req.temperature,
            cloudcover=req.cloudcover,
            humidity=req.humidity,
            windspeed=req.windspeed,
            radiation=req.radiation,
        )
        return {"predicted_energy_output_kwh": output}
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction error: {exc}",
        )


@router.post("/calculate-roi")
def calculate_roi(
    req: RoiCalculationRequest,
    user_id: Optional[int] = Depends(get_optional_user),
):
    if req.monthlyBill <= 0 or req.rooftopArea <= 0 or req.tariffRate <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="monthlyBill, rooftopArea, and tariffRate must be positive numbers.",
        )

    clean_state = (req.state or "").strip()
    clean_city = (req.city or "").strip() or "Unknown"

    return calculate_solar_roi(
        monthly_bill=req.monthlyBill,
        rooftop_area=req.rooftopArea,
        tariff_rate=req.tariffRate,
        state=clean_state,
        city=clean_city,
        predicted_output=float(req.predicted_output or 0.0),
        user_id=user_id,
    )


@router.post("/carbon-footprint")
def carbon_footprint(req: CarbonFootprintRequest):
    if req.energyOutputKwh < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="energyOutputKwh cannot be negative.",
        )

    co2_saved_kg = req.energyOutputKwh * 0.82
    tree_equivalent = co2_saved_kg / 21.0

    return {
        "co2_saved_kg": round(co2_saved_kg, 2),
        "tree_equivalent": round(tree_equivalent, 2),
    }


@router.get("/seasonal-breakdown")
def seasonal_breakdown(city: str = Query("", description="City name for seasonal forecast")):
    clean_city = (city or "").strip() or "Historical average"
    try:
        return get_seasonal_breakdown(clean_city)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Historical weather dataset not found.",
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(val_err),
        )


@router.get("/model-comparison")
def model_comparison():
    if not os.path.exists(COMPARISON_PATH):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model comparison data not found. Train the model first.",
        )

    try:
        with open(COMPARISON_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        return Response(content=content, media_type="application/json")
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not read comparison data: {exc}",
        )


@router.post("/generate-report")
def generate_report(req: GenerateReportRequest):
    pdf_bytes = generate_solar_pdf(req.model_dump())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=ai_solar_advisor_report.pdf"
        },
    )


@router.get("/report/{user_id}")
def report_stub(user_id: str):
    return {
        "message": f"Report stub for user {user_id}",
        "status": "coming soon",
    }
