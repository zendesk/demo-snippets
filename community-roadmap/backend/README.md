# Backend for "Community roadmap"

The service is built as a Cloudflare Worker with a Cloudflare KV data store.

## Prerequisites

You need a Cloudflare account to host the service. It is free to use Cloudflare for personal use, see [Cloudflare's website](https://www.cloudflare.com/) for more information.

You need to install Cloudflare's (wrangler)[https://developers.cloudflare.com/workers/wrangler/] tool. Installation (on MacOS):
```
brew install wrangler
```

You need to have created two KV namespaces in Cloudflare for the data storage of the service. KV namespaces can be created using the Cloudflare UI or with the `wrangler` tool.

Open the file (wrangler.toml)[wrangler.toml] to edit the `id` and `preview_id` fields of the file to match your production and test KV namespace IDs.

## Development

To start a local version of the service, run:
```
npm start
```

The service is now running locally on URL http://127.0.0.1:8787/

## Test

This repo contains a test collection for [Postman](https://www.postman.com/) and the CLI runner [newman](https://learning.postman.com/docs/running-collections/using-newman-cli). If backend behaviour is changed, it is highly recommended to verify that the tests are still working.

Installation:
```
brew install newman
```

The tests makes use of both pre-request scripts and test scripts in the Postman collection.

When the service is running locally, you can run the tests easily, like this:
```
npm run test
```

If you need to run the tests against a production service, you need a Zendesk instance and an instance of the community-roadmap service deployed. The Zendesk instance must have the Help Center Integration Token endpoint feature enabled (currently in EAP, available on URL `/hc/api/v2/integration/token`). You should also go to Admin Center to create an API token for your user.

Example run against production Zendesk and Cloudflare service:
```
export ZENDESK_BASEURL=https://mydomain.zendesk.com
export ZENDESK_USERNAME=john.doe@acme.com/token
export ZENDESK_PASSWORD=kjgfndkj43jk2ncl234
newman run tests/AcceptanceTests.postman_collection.json --env-var "baseUrl=$ZENDESK_BASEURL" --env-var "username=$ZENDESK_USERNAME" --env-var "password=$ZENDESK_PASSWORD"
```

## Deployment

To deploy the code to a production Cloudflare worker, simply run:

```
npm run deploy
```

If you open the Cloudflare UI you will see that you now have a deployed worker called `community-roadmap`.