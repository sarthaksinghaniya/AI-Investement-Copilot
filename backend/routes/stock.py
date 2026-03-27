from fastapi import APIRouter, HTTPException
from backend.services.stock_service import fetch_stock_data
from fastapi import status
from pydantic import BaseModel
from typing import Optional
from backend.utils import normalize_stock_symbol

router = APIRouter()


class StockResponse(BaseModel):
    symbol: str
    price: float
    signal: str
    confidence: float
    reason: str
    top_factors: list
    probabilities: dict
    historical_data: list
    indicators: dict


@router.get('/stock/{symbol}', response_model=StockResponse)
async def get_stock(symbol: str):
    """Get stock data for the requested symbol."""
    try:
        # Normalize symbol for Indian stocks (add .NS suffix if needed)
        normalized_symbol = normalize_stock_symbol(symbol)

        data = await fetch_stock_data(normalized_symbol)

        # Transform backend data to frontend format
        signal_data = data.get('signal', {})
        return {
            'symbol': data['symbol'],
            'price': data['latest_price'],
            'signal': signal_data.get('type', 'WATCH'),
            'confidence': signal_data.get('confidence', 0.0),
            'reason': signal_data.get('reason', ''),
            'top_factors': signal_data.get('top_factors', []),
            'probabilities': signal_data.get('probabilities', {'buy': 0, 'sell': 0, 'watch': 1}),
            'historical_data': data['historical_data'],
            'indicators': data['indicators']
        }
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Internal server error')
