import logging
from typing import Callable

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.gpt import GPTTurbo
from routes import router as api_router

load_dotenv()

logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)


def create_start_app_handler(app: FastAPI) -> Callable[[], None]:
    def start_app() -> None:
        GPTTurbo.get_model()

    return start_app


def get_application() -> FastAPI:
    application = FastAPI(title="safecoder API", debug=True, version="0.0.1")
    application.include_router(api_router)
    application.add_event_handler("startup", create_start_app_handler(application))
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return application


app = get_application()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
