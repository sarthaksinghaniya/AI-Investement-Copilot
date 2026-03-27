from fastapi import APIRouter, HTTPException
from backend.services.copilot_service import generate_copilot_reply
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class CopilotQuery(BaseModel):
    query: str
    stock: Optional[str] = None


class CopilotResponse(BaseModel):
    response: str


@router.post('/copilot/chat', response_model=CopilotResponse)
async def copilot_chat(payload: CopilotQuery):
    """AI Copilot chat endpoint for stock analysis queries."""
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail='Query must be provided.')

    response = await generate_copilot_reply(payload.query, payload.stock)
    return {'response': response}
