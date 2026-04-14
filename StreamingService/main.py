import logging
import os

import httpx
import cv2
import numpy as np

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

DROIDCAM_URL = {
    'camera2': "http://192.168.0.116:4747/video",
    'camera1': "http://10.168.237.163:81/stream"
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change this to your specific IP/domain in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],
)

logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%I:%M:%S %p'
)

logger = logging.getLogger(__name__)

logger.info("CWD: " + os.getcwd())

@app.websocket("/ws/stream/{cam_id}")
async def websocket_endpoint(websocket: WebSocket, cam_id: str):
    await websocket.accept()

    target_url = DROIDCAM_URL.get(cam_id)
    if not target_url:
        await websocket.close(code=1008)
        return

    frame_count = 0
    buffer = b""

    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("GET", target_url, timeout=None) as response:
                logger.info(f"Connected to {cam_id}")")     
        except WebSocketDisconnect:
            logger.info(f"Client disconnected from {cam_id}")
        except Exception as e:
            logger.error(f"Error: {e}")
