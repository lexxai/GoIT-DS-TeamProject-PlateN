import logging
from fastapi import APIRouter, WebSocket, HTTPException

from conf.config import settings
from services.face_detection.face_cc import CascadeClassierFun
from services.image_queue import ImageQueue

router = APIRouter(prefix="/cam_modules", tags=["cam_modules"])

logger = logging.getLogger(f"{settings.app_name}.{__name__}")

image_queues: dict[str, ImageQueue | None] = {
    "face_cc": None,
    "face_yn": None,
}


@router.websocket("face_cc", name="face_cc")
async def face_cc(websocket: WebSocket):
    """
    This is the endpoint that we will be sending request to from the
    frontend
    """
    face_cc_image_queue = image_queues.get("face_cc")
    if face_cc_image_queue is None:
        raise HTTPException(
            status_code=500,
            detail=f"Error not ready face_cc_image_queue.",
        )

    try:
        await face_cc_image_queue.loop(websocket)
    except Exception as e:
        # logger.error(e)
        ...


@router.websocket("face_yn", name="face_yn")
async def face_yn(websocket: WebSocket):
    """
    This is the endpoint that we will be sending request to from the
    frontend
    """
    face_yn_image_queue = image_queues.get("face_yn")
    if face_yn_image_queue is None:
        raise HTTPException(
            status_code=500,
            detail=f"Error not ready face_yn_image_queue.",
        )

    try:
        await face_yn_image_queue.loop(websocket)
    except Exception as e:
        # logger.error(e)
        ...


@router.on_event("startup")
async def startup(queues: dict[str, ImageQueue] = None):
    """
    This tells fastapi to load the classifier upon app startup
    so that we don't have to wait for the classifier to be loaded after making a request
    """
    if queues is None:
        queues = image_queues
    cc_func = CascadeClassierFun()
    cc_func.load()
    queues["face_cc"] = ImageQueue(cc_func)
    queues["face_yn"] = ImageQueue(cc_func)
