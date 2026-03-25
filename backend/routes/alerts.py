from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.alerts_service import generate_alerts

router = APIRouter()


class AlertItem(BaseModel):
    symbol: str
    signal: str
    confidence: int
    message: str
    timestamp: str


@router.get('/alerts', response_model=list[AlertItem])
async def get_alerts():
    """Retrieve active proactive alerts for the stock universe."""
    return await generate_alerts()
