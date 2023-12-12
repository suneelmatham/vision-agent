from dotenv import load_dotenv
load_dotenv()

import logging
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, HTTPException, Request
import pprint
from app.providers.llava import generate_llava_response
from app.providers.openai import stream_openai_text_response
from app.providers.bakllava_gguf import stream_bakllava_text_response
from app.api_models import ChatGPTConversationsModel
from typing import Literal

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S')
logger = logging.getLogger(__name__)

app = FastAPI(docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/response/{type}")
async def response_completion(type: Literal['llava', 'openai', "bakllava"], query: ChatGPTConversationsModel):
    try:
        # Response will be sent as a text stream but it will be decoded as json on client and processed out
        # print('Conversations History', pprint.pprint(query))
        if type == "openai":
            return StreamingResponse(stream_openai_text_response(query), media_type="text/eventstream")
        if type == "bakllava":
            return StreamingResponse(stream_bakllava_text_response(query), media_type="text/eventstream")

        if type == "llava":
            return StreamingResponse(generate_llava_response(query), media_type="text/eventstream")
    except Exception as e:
        logger.exception(e)
