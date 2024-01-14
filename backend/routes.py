#!/usr/bin/python3
# -*- coding:utf-8 -*-
# backend
# PyCharm
# @Author:gaojing
# @Time: 2023/10/31 23:04
import json
import multiprocessing
import uuid
from datetime import datetime as dt
from typing import List, Optional, Union

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.gpt import GPTTurbo
from pydantic import BaseModel

from web_search.ddg_search import ddg_search_text


class ChatCompletionInput(BaseModel):
    messages: List[dict]
    temperature: float = 0.2
    top_p: float = 0.95
    n: int = 1
    stream: bool = False
    stop: Optional[Union[str, List[str]]] = []
    max_tokens: int = 256
    presence_penalty: float = 0.0
    frequence_penalty: float = 0.0
    logit_bias: Optional[dict] = {}
    user: str = ""
    n_threads: int = max(multiprocessing.cpu_count() // 2, 1)
    web_search: bool =False


class ChatCompletionResponse(BaseModel):
    id: str = uuid.uuid4()
    model: str
    object: str = "chat.completion"
    created: int = int(dt.now().timestamp())
    choices: List[dict]
    usage: dict = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}


class HealthResponse(BaseModel):
    status: bool


router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health():
    return HealthResponse(status=True)

async def generate_chunk_based_response(body):
    if body.web_search:
         messages = ddg_search_text(body.messages)
    else:
        messages = body.messages
    chunks = GPTTurbo.generate(
        messages=messages,
        temperature=body.temperature,
        top_p=body.top_p,
        n=body.n,
        stream=body.stream,
        max_tokens=body.max_tokens,
        stop=body.stop,
        presence_penalty=body.presence_penalty,
        frequence_penalty=body.frequence_penalty,
        logit_bias=body.logit_bias,
        n_threads=body.n_threads,
    )
    for chunk in chunks:
        yield f"event: completion\ndata: {json.dumps(chunk)}\n\n"
    yield "event: done\ndata: [DONE]\n\n"


@router.post("/gpt-3.5-turbo-16k/v1/code/chat/completions", response_model=ChatCompletionResponse)
async def chat_completions(body: ChatCompletionInput):
    try:
        if body.stream:
            return StreamingResponse(generate_chunk_based_response(body), media_type="text/event-stream")
        return GPTTurbo.generate(
            messages=body.messages,
            temperature=body.temperature,
            top_p=body.top_p,
            n=body.n,
            stream=body.stream,
            max_tokens=body.max_tokens,
            stop=body.stop,
            presence_penalty=body.presence_penalty,
            frequence_penalty=body.frequence_penalty,
            logit_bias=body.logit_bias,
            n_threads=body.n_threads,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail={"message": str(error)},
        )

@router.post("/mistral/v1/code/chat/completions", response_model=ChatCompletionResponse)
async def chat_completions(body: ChatCompletionInput):
    try:
        if body.stream:
            return StreamingResponse(generate_chunk_based_response(body), media_type="text/event-stream")
        return GPTTurbo.generate(
            messages=body.messages,
            temperature=body.temperature,
            top_p=body.top_p,
            n=body.n,
            stream=body.stream,
            max_tokens=body.max_tokens,
            stop=body.stop,
            presence_penalty=body.presence_penalty,
            frequence_penalty=body.frequence_penalty,
            logit_bias=body.logit_bias,
            n_threads=body.n_threads,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail={"message": str(error)},
        )