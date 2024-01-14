#!/usr/bin/python3
# -*- coding:utf-8 -*-
# backend
# PyCharm
# @Author:gaojing
# @Time: 2024/1/14 19:53
import datetime
from itertools import islice
from typing import List

import urllib3
from duckduckgo_search import DDGS

WEBSEARCH_PTOMPT_TEMPLATE = """\
Web search results:

{web_results}
Current date: {current_date}

Instructions: Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using [[number](URL)] notation after the reference. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject.
Query: {query}
Reply in Chinese
"""
from loguru import logger


def replace_today(prompt):
    today = datetime.datetime.today().strftime("%Y-%m-%d")
    return prompt.replace("{current_date}", today)


def add_source_numbers(lst, source_name="Source", use_source=True):
    if use_source:
        return [
            f'[{idx + 1}]\t "{item[0]}"\n{source_name}: {item[1]}'
            for idx, item in enumerate(lst)
        ]
    else:
        return [f'[{idx + 1}]\t "{item}"' for idx, item in enumerate(lst)]


def ddg_search_text(messages: List, max_results=5):
    end_message = messages[-1]['content']
    search_results = []
    reference_results = []
    with DDGS() as ddgs:
        ddgs_gen = ddgs.text(end_message, backend="lite")
        for r in islice(ddgs_gen, max_results):
            search_results.append(r)
    for idx, result in enumerate(search_results):
        logger.debug(f"搜索结果{idx + 1}：{result}")
        reference_results.append([result["body"], result["href"]])

    reference_results = add_source_numbers(reference_results)
    prepare_result = (
        replace_today(WEBSEARCH_PTOMPT_TEMPLATE)
            .replace("{query}", end_message)
            .replace("{web_results}", "\n\n".join(reference_results))
    )
    messages[-1]['content'] = prepare_result
    return messages
