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
    future_predictions: list = []  # NEW: 15-day future predictions


@router.get('/stock/{symbol}', response_model=StockResponse)
async def get_stock(symbol: str):
    """Get stock data for the requested symbol."""
    try:
        # Normalize symbol for Indian stocks (add .NS suffix if needed)
        normalized_symbol = normalize_stock_symbol(symbol)

        data = await fetch_stock_data(normalized_symbol)

        # Transform backend data to frontend format
        signal_data = data.get('signal', {})
        raw_probabilities = signal_data.get('probabilities', {'buy': 0, 'sell': 0, 'watch': 1})

        probabilities = {
            'BUY': raw_probabilities.get('BUY', raw_probabilities.get('buy', 0)),
            'SELL': raw_probabilities.get('SELL', raw_probabilities.get('sell', 0)),
            'WATCH': raw_probabilities.get('WATCH', raw_probabilities.get('watch', 1)),
        }

        return {
            'symbol': data['symbol'],
            'price': data['latest_price'],
            'signal': signal_data.get('type', 'WATCH'),
            'confidence': signal_data.get('confidence', 0.0),
            'reason': signal_data.get('reason', ''),
            'top_factors': signal_data.get('top_factors', []),
            'probabilities': probabilities,
            'historical_data': data['historical_data'],
            'indicators': data['indicators'],
            'future_predictions': data['prediction']['future_predictions']  # NEW: 15-day future predictions
        }
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Internal server error')
