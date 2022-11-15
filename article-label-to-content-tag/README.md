# Zendesk Gather example API client for user contribution stats

This is a simple utility built in Python that converts an Article Label into a public-facing Content Tags

## Requirements

This tool requires Python 3.x and the [requests](https://pypi.org/project/requests/) library installed.

If you already have `pip`, simply install like this:

```
pip install requests
```

## Usage

This is a command line tool. Invoke it like this:

```
python main.py -d <subdomain> -u <username> -t <token> -o <output_file> --from=<from> --to=<to>
```

Where:

 * `<subdomain>` is your zendesk subdomain
 * `<username>` is your username
 * `<token>` is your API token
 * `<label>` is the name of the label used on articles
 * `<tag>` is the name of the tag to apply
