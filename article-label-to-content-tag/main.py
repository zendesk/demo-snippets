import sys, getopt, datetime
from datetime import datetime, timedelta
from dataclasses import dataclass
from api_client import ApiClient

@dataclass(init=False)
class Arguments:
    subdomain: str = None
    username: str = None
    token: str = None
    label: str = None
    tag: str = None

def run_main(args: Arguments):
    api = ApiClient(args.subdomain, args.username, args.token)
    content_tag = api.get_content_tag_by_name(args.tag)
    if content_tag:
        content_tag_id = content_tag['id']
        print(f'Content tag resolved: {content_tag_id}')
        articles = api.get_articles_with_label(args.label)
        for article in articles:
            updated = api.add_content_tag_to_article(article, content_tag_id)
            if updated:
                print("Applied to article: " + str(article.get('id')))
            else:
                print("Skipped article because it is already tagged: " + str(article.get('id')))
    else:
        print("ERROR: No such content tag: " + args.tag)

def main(argv):
    HELP_LINE = 'main.py -d <subdomain> -u <username> --label <label> --tag <tag>'
    arguments = Arguments()
    opts = []
    try:
        opts, args = getopt.getopt(argv,"ho:d:u:t:",["subdomain=","username=","token=","label=","tag="])
    except getopt.GetoptError as e:
        print(e)
        print(HELP_LINE)
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-h", "--help", "--usage", "-?"):
            print(HELP_LINE)
            sys.exit()
        elif opt in ("-d", "--subdomain"):
            subdomain = arg
            if not '.' in subdomain:
                subdomain = subdomain + '.zendesk.com'
            if not subdomain.startswith('http'):
                subdomain = 'https://' + subdomain
            arguments.subdomain = subdomain
        elif opt in ("-u", "--username"):
            arguments.username = arg
        elif opt in ("-p", "--password"):
            arguments.password = arg
        elif opt in ("-t", "--token"):
            arguments.token = arg
        elif opt in ("--tag"):
            arguments.tag = arg
        elif opt in ("--label"):
            arguments.label = arg
    if not arguments.username or not arguments.tag or not arguments.subdomain or not arguments.label:
        print(HELP_LINE)
        return
    run_main(arguments)

if __name__ == "__main__":
   main(sys.argv[1:])
