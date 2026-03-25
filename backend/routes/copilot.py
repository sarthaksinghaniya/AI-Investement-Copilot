from fastapi import APIRouter, HTTPException
from services.copilot_service import generate_copilot_reply
from pydantic import BaseModel

router = APIRouter()


class CopilotQuery(BaseModel):
    query: str


class CopilotResponse(BaseModel):
    answer: str
    details: dict | None


@router.post('/copilot/chat', response_model=CopilotResponse)
async def copilot_chat(payload: CopilotQuery):
    """Simple AI Copilot chat endpoint for stock intents."""
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail='Query must be provided.')

    response = await generate_copilot_reply(payload.query)
    return response
