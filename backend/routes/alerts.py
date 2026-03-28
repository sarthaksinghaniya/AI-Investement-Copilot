from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.alerts_service import generate_alerts

router = APIRouter()


class AlertItem(BaseModel):
    symbol: str
    signal: str
    confidence: int
    strength: str | None = None
    message: str
    reason: str | None = None
    price: float | None = None
    timestamp: str


class AlertsResponse(BaseModel):
    count: int
    alerts: list[AlertItem]


@router.get('/alerts', response_model=AlertsResponse)
async def get_alerts() -> dict[str, Any]:
    """Retrieve active proactive alerts for the stock universe."""
    return await generate_alerts()