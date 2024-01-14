#!/usr/bin/python3
# -*- coding:utf-8 -*-
# backend
# PyCharm
# @Author:gaojing
# @Time: 2023/10/31 23:13
import multiprocessing
import openai
DEFAULT_N_THREADS = max(multiprocessing.cpu_count() // 2, 1)
openai.api_key = "xxxxx"


class GPTTurbo(object):
    model = None
    @classmethod
    def generate(
            cls,
            messages: list,
            temperature: float = 0.2,
            top_p: float = 0.95,
            n: int = 1,
            stream: bool = False,
            max_tokens: int = 256,
            stop: list = None,
            n_threads: int = DEFAULT_N_THREADS,
            **kwargs,
    ):

        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-16k",
            messages=messages,
            temperature= temperature,
            top_p = top_p,
            n = n,
            stop = stop,
            stream= stream,
            max_tokens = max_tokens)
        return completion
    @classmethod
    def get_model(cls):
        if cls.model is None:
            cls.model="gpt-3.5"
        return cls.model
