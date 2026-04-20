import logging
import os
import asyncio

import httpx
import cv2
import numpy as np
import mediapipe as mp

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

model_path = 'blaze_face_short_range.tflite'
BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions

options = FaceDetectorOptions(
    base_options=BaseOptions(model_asset_path=model_path),
    running_mode=mp.tasks.vision.RunningMode.IMAGE
)

if options:
    logger.info("Successfully loaded blaze face detection model")

detector = FaceDetector.create_from_options(options)

def process_frame(raw_frame: np.ndarray) -> bytes:
    """
    Converts raw frame to rgb frame, runs the detection model on it, returns the processed image.
    """
    rgb_frame = cv2.cvtColor(raw_frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

    detection_result = detector.detect(mp_image)
    # TODO: Draw rectangles around detected faces
    success, encoded_img = cv2.imencode('.jpg', raw_frame)
    if not success:
        return b""

    return encoded_img.tobytes()

@app.websocket("/ws/stream/{cam_id}")
async def websocket_endpoint(websocket: WebSocket, cam_id: str):
    await websocket.accept()

    target_url = DROIDCAM_URL.get(cam_id)
    if not target_url:
        await websocket.close(code=1008)
        return

    frame_count = 0
    # buffer to accumulate MJPEG frames
    buffer = b""

    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("GET", target_url, timeout=None) as response:
                async for chunk in response.aiter_bytes():
                    buffer += chunk
                    
                    # Slice along JPEG markers
                    start = buffer.find(b'\xff\xd8') # JPEG Start
                    end = buffer.find(b'\xff\xd9')   # JPEG End

                    if start != -1 and end != -1 and end > start:
                        jpg_data = buffer[start:end + 2]
                        buffer = buffer[end + 2:]    # Advance buffer

                        if not jpg_data:
                            continue

                        # Decode the binary JPEG into a CV2-accessible array
                        nparr = np.frombuffer(jpg_data, np.uint8)
                        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                        if frame is not None:
                            # Call our new processing skeleton
                            processed_bytes = process_frame(frame)

                            if processed_bytes:
                                await websocket.send_bytes(processed_bytes)
                                await asyncio.sleep(0.01) # Small sleep for stability


                    # Emergency buffer clear (5MB limit)
                    if len(buffer) > 5 * 1024 * 1024:
                        buffer = b""
        
        except WebSocketDisconnect:
            logger.info(f"Client disconnected from {cam_id} with frame count {frame_count}")
        except Exception as e:
            logger.error(f"Error: {e}")
