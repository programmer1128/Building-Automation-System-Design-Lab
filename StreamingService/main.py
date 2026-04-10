import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
def root():
    logger.info("API endpoint / hit")
    return {"message": "Hello there!"}
