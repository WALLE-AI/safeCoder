import json
import openai
import requests
from openai import OpenAI

from prompt import web_analysise

API_KEY = 'xxx'
client = OpenAI(api_key=API_KEY)

system_prompt = [{"role": "system", "content": web_analysise['system']}]


def generate_chunk_code_chat(messages, model, stream):
    if model != 'local':
        predictions = client.chat.completions.create(
            model=model,
            stream=stream,
            messages=messages,
            max_tokens=8096,
            top_p=0.2,
            frequency_penalty=1.3)
        return predictions
    else:
        return local_chat_model_completion(messages)


def build_prompt_messages(messages: str, instruct):
    user_prompt = [{"role": "user", "content": messages}]
    messages = system_prompt + user_prompt + instruct
    return messages


def get_gpt_model_predict(messages, instruct=None, stream=False, model='gpt-3.5-turbo-16k'):
    messages = build_prompt_messages(messages, instruct)
    if stream:
        response = generate_chunk_code_chat(messages, model, stream)
    else:
        response = generate_chunk_code_chat(messages, model, stream)
        ##返回的接口发生的改变
        if model != 'local':
            return response.choices[0].message.content
        else:
            return response["choices"][0]['message']['content']



def local_chat_model_completion(messages):
    '''
    调用MaaS平台模型API
    :return:
    '''
    local_model_url = "xxxxxxlocal"
    headers = {"Content-Type": "application/json"}
    data = {
        "messages": messages,
        "temperature": 0.1,
        "frequency_penalty": 0.2,
        "stream": False,
        "max_tokens": 10000
    }
    response = requests.post(local_model_url, data=json.dumps(data), headers=headers)
    return json.loads(response.text)
