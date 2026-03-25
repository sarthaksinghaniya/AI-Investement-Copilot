from fastapi import FastAPI
from backend.routes.stock import router as stock_router
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title='AI Stock Advisor API', version='1.0.0')

from backend.routes.copilot import router as copilot_router
from backend.routes.alerts import router as alerts_router

app.include_router(stock_router, prefix='')
app.include_router(copilot_router, prefix='')
app.include_router(alerts_router, prefix='')


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.warning('Validation error: %s', exc)
    return JSONResponse(status_code=422, content={'detail': exc.errors()})


@app.get('/')
async def health_check():
    """Health check endpoint."""
    logger.info('Health check request received.')
    return {'status': 'ok'}
