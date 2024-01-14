import datetime
def create_markdown(date, filename,type):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("## " + date +" "+ type + " Trending\n")
def create_markdown_output(file_name,type='Github'):
    today_str = datetime.datetime.now().strftime('%Y-%m-%d')
    filename = 'markdowns/{date}-{file_name}.md'.format(date=today_str,file_name=file_name)

    # create markdowns file
    create_markdown(today_str, filename,type)
    return filename