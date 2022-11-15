from typing import List
import requests
from requests.auth import HTTPBasicAuth
from requests import Response

class ApiClient:
    def __init__(self, subdomain, username, token):
        self.subdomain = subdomain
        self.username = username
        self.token = token
    def get_articles_with_label(self, label:str = None):
        resp = self.__http_get(f'/api/v2/help_center/articles.json?page[size]=10&label_names={label}')
        keep_running = True
        while keep_running:
            body = resp.json()
            for article in body['articles']:
                yield article
            if body['links'].get('next'):
                resp = self.__http_get(body['links']['next'])
            else:
                keep_running = False
    def get_content_tag_by_name(self, content_tag_name: str):
        resp = self.__http_get(f'/api/v2/guide/content_tags?filter[name_prefix]={content_tag_name}')
        body = resp.json()
        if len(body['records']) == 1:
            return body['records'][0]
        return
    def add_content_tag_to_article(self, article_obj: dict, content_tag_id):
        article_id = article_obj['id']
        content_tag_ids: List = [content_tag_id]
        if article_obj.get('content_tag_ids'):
            content_tag_ids = article_obj['content_tag_ids']
            try:
                content_tag_ids.index(content_tag_id)
                return False #if we get to this point, the content tag was already applied
            except ValueError:
                content_tag_ids.append(content_tag_id)
        article_obj['content_tag_ids'] = content_tag_ids
        resp = self.__http_put(f'/api/v2/help_center/articles/{article_id}', {'article': article_obj})
        if resp.status_code > 299:
            print("Got error from article update: " + str(resp))
            return False
        return True
    def __http_get(self, path: str) -> Response:
        if path.startswith('http'):
            url = path
        else:
            url = self.subdomain + path
        return requests.get(url, auth=HTTPBasicAuth(self.username + "/token", self.token))
    def __http_post(self, path: str, json_body: dict) -> Response:
        if path.startswith('http'):
            url = path
        else:
            url = self.subdomain + path
        return requests.post(url, json=json_body, auth=HTTPBasicAuth(self.username + "/token", self.token))
    def __http_put(self, path: str, json_body: dict) -> Response:
        if path.startswith('http'):
            url = path
        else:
            url = self.subdomain + path
        return requests.put(url, json=json_body, auth=HTTPBasicAuth(self.username + "/token", self.token))
