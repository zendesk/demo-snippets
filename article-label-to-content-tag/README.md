# Convert an article label to a content tag

This is a simple utility built in Python that converts an [article label](https://support.zendesk.com/hc/en-us/articles/4408835056154) into a public-facing [content tag](https://support.zendesk.com/hc/en-us/articles/4848925672730).

## Requirements

This tool requires Python 3.x and the [requests](https://pypi.org/project/requests/) library installed.

If you already have `pip`, simply install like this:

```
pip install requests
```

## Usage

This is a command line tool. Invoke it like this:

```
python main.py -d {subdomain} -u {email_address} -t {api_token}  --label {article_label} --tag {content_tag}
```

Where:

 * `{subdomain}` is your Zendesk subdomain
 * `{email_address}` is your email address for Zendesk login
 * `{api_token}` is your Zendesk API token
 * `{article_label}` is the name of the label used on articles
 * `{content_tag}` is the name of the content tag to apply. This tag must exist before running the tool.
