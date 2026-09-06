import csv
from datetime import datetime
from typing import Dict, Any, List
import requests
from config import WEATHER_CSV_PATH


def get_local_weather_fallback() -> Dict[str, float]:
    totals = {
        "temperature": 0.0,
        "cloudcover": 0.0,
        "humidity": 0.0,
        "windspeed": 0.0,
        "radiation": 0.0,
    }
    row_count = 0

    with open(WEATHER_CSV_PATH, newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            row_count += 1
            totals["temperature"] += (
                float(row["temperature_2m_max"]) + float(row["temperature_2m_min"])
            ) / 2
            totals["cloudcover"] += float(row["cloudcover_mean"])
            totals["humidity"] += float(row["relative_humidity_2m_mean"])
            totals["windspeed"] += float(row["windspeed_10m_max"])
            totals["radiation"] += float(row["shortwave_radiation_sum"])

    if row_count == 0:
        raise ValueError("No local weather data available for fallback.")

    return {key: round(value / row_count, 2) for key, value in totals.items()}


def get_live_weather(city: str) -> Dict[str, Any]:
    try:
        # Step 1: Open-Meteo geocoding
        geocode_url = "https://geocoding-api.open-meteo.com/v1/search"
        geocode_response = requests.get(
            geocode_url, params={"name": city, "count": 1}, timeout=5
        )
        geocode_response.raise_for_status()
        geocode_data = geocode_response.json()

        if not geocode_data.get("results"):
            return {
                "error": f"No results found for city: {city}. Please try another name.",
                "status_code": 404,
            }

        result = geocode_data["results"][0]
        lat = result["latitude"]
        lon = result["longitude"]

        # Step 2: Open-Meteo current forecast
        forecast_url = "https://api.open-meteo.com/v1/forecast"
        forecast_response = requests.get(
            forecast_url,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,cloud_cover,relative_humidity_2m,wind_speed_10m,shortwave_radiation",
                "timezone": "auto",
            },
            timeout=5,
        )
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()
        current = forecast_data.get("current", {})

        return {
            "temperature": round(float(current.get("temperature_2m", 25)), 2),
            "cloudcover": round(float(current.get("cloud_cover", 20)), 2),
            "humidity": round(float(current.get("relative_humidity_2m", 60)), 2),
            "windspeed": round(float(current.get("wind_speed_10m", 10)), 2),
            "radiation": round(float(current.get("shortwave_radiation", 20)), 2),
            "status_code": 200,
        }
    except (requests.Timeout, requests.RequestException):
        fallback = get_local_weather_fallback()
        fallback["status_code"] = 200
        return fallback


def get_average_monthly_weather() -> List[Dict[str, Any]]:
    monthly_aggregate = {
        month: {
            "temperature_2m_max": 0.0,
            "temperature_2m_min": 0.0,
            "shortwave_radiation_sum": 0.0,
            "cloudcover_mean": 0.0,
            "relative_humidity_2m_mean": 0.0,
            "windspeed_10m_max": 0.0,
            "count": 0,
        }
        for month in range(1, 13)
    }

    with open(WEATHER_CSV_PATH, newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            raw_date = (row.get("date") or "").strip()
            if not raw_date:
                continue

            try:
                month = datetime.strptime(raw_date, "%Y-%m-%d").month
            except ValueError:
                continue

            try:
                monthly_aggregate[month]["temperature_2m_max"] += float(
                    row["temperature_2m_max"]
                )
                monthly_aggregate[month]["temperature_2m_min"] += float(
                    row["temperature_2m_min"]
                )
                monthly_aggregate[month]["shortwave_radiation_sum"] += float(
                    row["shortwave_radiation_sum"]
                )
                monthly_aggregate[month]["cloudcover_mean"] += float(
                    row["cloudcover_mean"]
                )
                monthly_aggregate[month]["relative_humidity_2m_mean"] += float(
                    row["relative_humidity_2m_mean"]
                )
                monthly_aggregate[month]["windspeed_10m_max"] += float(
                    row["windspeed_10m_max"]
                )
                monthly_aggregate[month]["count"] += 1
            except (TypeError, ValueError, KeyError):
                continue

    monthly_averages = []
    for month in range(1, 13):
        data = monthly_aggregate[month]
        count = data["count"]
        if count == 0:
            continue

        monthly_averages.append(
            {
                "month": month,
                "temperature_2m_max": round(data["temperature_2m_max"] / count, 2),
                "temperature_2m_min": round(data["temperature_2m_min"] / count, 2),
                "shortwave_radiation_sum": round(
                    data["shortwave_radiation_sum"] / count, 2
                ),
                "cloudcover_mean": round(data["cloudcover_mean"] / count, 2),
                "relative_humidity_2m_mean": round(
                    data["relative_humidity_2m_mean"] / count, 2
                ),
                "windspeed_10m_max": round(data["windspeed_10m_max"] / count, 2),
            }
        )

    return monthly_averages
