from fastapi import APIRouter, HTTPException
from backend.services.stock_service import fetch_stock_data
from fastapi import status
from pydantic import BaseModel

router = APIRouter()


class StockResponse(BaseModel):
    symbol: str
    latest_price: float
    historical_data: list
    indicators: dict
    signal: str
    confidence: int
    reasoning: list


@router.get('/stock/{symbol}', response_model=StockResponse)
async def get_stock(symbol: str):
    """Get stock data for the requested symbol."""
    try:
        result = await fetch_stock_data(symbol)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Internal server error')
