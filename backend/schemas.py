from typing import Optional, Any, Union
from pydantic import BaseModel, Field


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class PredictRequest(BaseModel):
    temperature: float
    cloudcover: float
    humidity: float
    windspeed: float
    radiation: float


class RoiCalculationRequest(BaseModel):
    monthlyBill: float
    rooftopArea: float
    tariffRate: float
    state: str
    city: Optional[str] = ""
    predicted_output: Optional[float] = 0.0


class CarbonFootprintRequest(BaseModel):
    energyOutputKwh: float


class GenerateReportRequest(BaseModel):
    city: Optional[str] = None
    location: Optional[str] = None
    monthlyBill: Optional[Any] = None
    predictedOutput: Optional[Any] = None
    monthlySavings: Optional[Any] = None
    annualSavings: Optional[Any] = None
    paybackPeriod: Optional[Any] = None
    co2SavedKg: Optional[Any] = None
    treeEquivalent: Optional[Any] = None
    rooftopArea: Optional[Any] = None
    state: Optional[str] = "N/A"
