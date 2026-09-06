import os
from typing import Dict, Any, List, Optional
import joblib
from config import MODEL_PATH, MONTH_NAMES
from services.weather_service import get_average_monthly_weather

model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
except Exception as err:
    print(f"Warning: could not load ML model: {err}")
    model = None


def predict_energy_output(
    temperature: float,
    cloudcover: float,
    humidity: float,
    windspeed: float,
    radiation: float,
) -> float:
    if model is None:
        raise ValueError("Model file not found. Please train the model first.")

    features = [
        [
            temperature,
            temperature,
            radiation,
            cloudcover,
            humidity,
            windspeed,
        ]
    ]
    prediction = model.predict(features)[0]
    return round(float(prediction), 3)


def get_seasonal_breakdown(city: Optional[str] = None) -> Dict[str, Any]:
    if model is None:
        raise ValueError("Model file not found. Please train the model first.")

    monthly_weather = get_average_monthly_weather()
    features = [
        [
            month_data["temperature_2m_max"],
            month_data["temperature_2m_min"],
            month_data["shortwave_radiation_sum"],
            month_data["cloudcover_mean"],
            month_data["relative_humidity_2m_mean"],
            month_data["windspeed_10m_max"],
        ]
        for month_data in monthly_weather
    ]

    predicted_values = model.predict(features)
    monthly_breakdown = [
        {
            "month": MONTH_NAMES[index],
            "predicted_energy_output_kwh": round(float(predicted_values[index]), 3),
        }
        for index in range(len(predicted_values))
    ]

    return {
        "city": city or "Historical average",
        "monthly_breakdown": monthly_breakdown,
    }
