# -*- coding: utf-8 -*-
import datetime
import os
from codecs import open

import pandas as pd
import requests
from pyquery import PyQuery
from create_markdonw import create_markdown_output

from gpt import get_gpt_model_predict
from prompt import user_prompt_github_summary_instruct

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:11.0) Gecko/20100101 Firefox/11.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip,deflate,sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8'
}
def git_add_commit_push(date, filename):
    cmd_git_add = 'git add {filename}'.format(filename=filename)
    cmd_git_commit = 'git commit -m "{date}"'.format(date=date)
    cmd_git_push = 'git push -u origin master'

    os.system(cmd_git_add)
    os.system(cmd_git_commit)
    os.system(cmd_git_push)


def create_markdown(date, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("## " + date + " Github Trending\n")

def get_github_repo_description(link):
    url = link
    r = requests.get(url, headers=HEADERS)
    assert r.status_code == 200
    d = PyQuery(r.content)
    items = d('article')
    text = ""
    for item in items:
        i = PyQuery(item)
        text = i.text()
    predict = get_gpt_model_predict(messages=text,instruct=user_prompt_github_summary_instruct)
    return predict


def scrape(language, filename, topk=5):
    url = 'https://github.com/trending/{language}'.format(language=language)
    r = requests.get(url, headers=HEADERS)
    assert r.status_code == 200

    d = PyQuery(r.content)
    items = d('div.Box article.Box-row')
    ds = []
    for item in items:
        i = PyQuery(item)
        title = i(".lh-condensed a").text()
        description = i("p.col-9").text()
        url = i(".lh-condensed a").attr("href")
        url = "https://github.com" + url
        star_fork = i(".f6 a").text().strip()
        star, fork = star_fork.split()
        new_star = i(".f6 svg.octicon-star").parent().text().strip().split()[1]
        star = int(star.replace(',', ''))
        fork = int(fork.replace(',', ''))
        new_star = int(new_star.replace(',', ''))
        gpt_summary = get_github_repo_description(url)
        ds.append([title, url, description, star, fork, new_star,gpt_summary])

    save_to_md(ds, filename, language, topk)


def save_to_md(ds, filename, language, topk=5):
    df = pd.DataFrame(ds, columns=['title', 'url', 'description', 'star', 'fork', 'new_star','gpt_summary'])
    df.sort_values(by=['new_star', 'star', 'fork'], ascending=False, inplace=True)
    df.reset_index(drop=True, inplace=True)
    df = df.head(topk)
    with open(filename, "a", "utf-8") as f:
        f.write('\n {language}\n'.format(language=language))

        for i in range(len(df)):
            title = df.iloc[i]['title']
            url = df.iloc[i]['url']
            description = df.iloc[i]['description']
            star = df.iloc[i]['star']
            fork = df.iloc[i]['fork']
            new_star = df.iloc[i]['new_star']
            gpt_summary = df.iloc[i]['gpt_summary']

            out = "### [{title}]({url})\n* Star:{stars}\n* Fork:{fork}\n* Today stars:{new_star}\n* Description: {gpt_summary}\n".format(
                title=title, url=url, description=description, stars=star, fork=fork, new_star=new_star,gpt_summary=gpt_summary)
            f.write(out)


def job():

    filename = create_markdown_output('github')


    # write markdowns
    scrape('', filename, topk=10)  # full_url = 'https://github.com/trending?since=daily'
    # scrape('python', filename)
    # scrape('java', filename)
    # scrape('javascript', filename)
    # scrape('go', filename)
    print('save markdowns file to {filename}'.format(filename=filename))