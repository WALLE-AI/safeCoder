'''
@Project ：uHotTrace
@File    ：prompt.py.py
@Author  ：jing.gao01
@Date    ：2023/12/20 16:40 
Copyright 2023 Wuhan United Imaging Healthcare Co., Ltd.
All rights reserved.
'''

web_analysise = {
    "system":"""You are an assistant who helps people the brief summary to web page content,Please use chinese response."""
}

user_prompt_huggingface_summary_instruct = [{"role": "user", "content": "Please summarize the above article briefly,The following detailed analysis:"
                                                                        "1、train time 、the size of datasets and how many GPUs are used for training etc, the model importance information to analysis."
                                                                        "2、If the dataset is a card, a detailed analysis of the dataset size, usage instructions, and data sources is required"
                                                                        "3、Please use chinese response."}]
user_prompt_github_summary_instruct = [{"role": "user", "content": "Please summarize the above article briefly,Please use chinese response."}]
user_prompt_arxiv_summary_instruct = [{"role": "user", "content": "Please summarize the above article briefly,Please use chinese response."}]
