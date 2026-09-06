import os
import pathlib

# Load environment variables from the single root .env file
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_ENV_PATH = os.path.join(ROOT_DIR, ".env")

try:
    from dotenv import load_dotenv
    if os.path.exists(ROOT_ENV_PATH):
        load_dotenv(ROOT_ENV_PATH)
except ImportError:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "solar_model.pkl")
COMPARISON_PATH = os.path.join(BASE_DIR, "model", "model_comparison.json")
WEATHER_CSV_PATH = os.path.join(BASE_DIR, "data", "weather_data.csv")
SQLITE_DB_PATH = os.path.join(BASE_DIR, "data", "solar_advisor.db")

# Secret keys
SECRET_KEY = (
    os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET") or "dev-secret-key"
)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

# Database configuration
DB_HOST = (os.getenv("DB_HOST") or "127.0.0.1").strip()
try:
    DB_PORT = int(str(os.getenv("DB_PORT", "3306")).strip())
except (ValueError, TypeError):
    DB_PORT = 3306
DB_USER = (os.getenv("DB_USER") or "root").strip()
DB_PASSWORD = (os.getenv("DB_PASSWORD") or "").strip()
DB_NAME = (os.getenv("DB_NAME") or "solar_advisor").strip()
try:
    DB_CONNECTION_TIMEOUT = int(str(os.getenv("DB_CONNECTION_TIMEOUT", "10")).strip())
except (ValueError, TypeError):
    DB_CONNECTION_TIMEOUT = 10
USE_SSL = (
    str(os.getenv("USE_SSL") or os.getenv("DB_SSL") or "true").strip().lower()
    in ("true", "1", "yes")
)

is_aiven = "aivencloud.com" in DB_HOST or DB_PORT != 3306

DB_CONFIG = {
    "host": DB_HOST,
    "port": DB_PORT,
    "user": DB_USER,
    "password": DB_PASSWORD,
    "database": DB_NAME,
    "charset": "utf8mb4",
    "autocommit": True,
    "connection_timeout": max(DB_CONNECTION_TIMEOUT, 5),
}

if is_aiven or USE_SSL:
    DB_CONFIG["ssl_disabled"] = False
    DB_CONFIG["ssl_verify_cert"] = False
    DB_CONFIG["ssl_verify_identity"] = False

# Centralized Solar Panel Physical Specifications (Modern 400W Monocrystalline PERC)
SYSTEM_COST_PER_KW = 60000
PANEL_WATTAGE_W = 400
PANEL_CAPACITY_KW = PANEL_WATTAGE_W / 1000.0  # 0.4 kW
PANEL_WIDTH_FT = 3.72  # ~1.134 m
PANEL_HEIGHT_FT = 5.65  # ~1.722 m
PANEL_AREA_SQFT = round(PANEL_WIDTH_FT * PANEL_HEIGHT_FT, 2)  # 21.02 sq ft (~1.95 m²)
USABLE_AREA_FACTOR = 0.70  # 70% usable rooftop after setbacks/walkways

STATE_SUBSIDIES = {
    "Delhi": {"percent": 40, "scheme": "Delhi Rooftop Solar Subsidy"},
    "Maharashtra": {"percent": 20, "scheme": "Maharashtra Solar Support"},
    "Gujarat": {"percent": 40, "scheme": "Gujarat Solar Initiative"},
    "Tamil Nadu": {"percent": 25, "scheme": "Tamil Nadu Rooftop Subsidy"},
    "Karnataka": {"percent": 20, "scheme": "Karnataka Green Energy Subsidy"},
    "Uttar Pradesh": {"percent": 15, "scheme": "UP Solar Promotion"},
    "Rajasthan": {"percent": 30, "scheme": "Rajasthan Solar Initiative"},
    "Punjab": {"percent": 20, "scheme": "Punjab Solar Subsidy"},
}

MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]
