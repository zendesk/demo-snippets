# Community Roadmap for Zendesk Help Center

This project contains a service that maps Zendesk community posts to product roadmap items. The service is built as a Cloudflare Worker with a Cloudflare KV data store.

## Development

The service can be run locally using Cloudflare's `wrangler` tool.

Installation:
```
brew install wrangler
```

Run:
```
wrangler dev --env dev
```
or just:
```
npm start
```

## Test

Tests are created using Postman (and the CLI runner `newman`).

Installation:
```
brew install newman
```

The tests makes use of both pre-request scripts and test scripts in the Postman collection.

The collection runs against a Zendesk instance and an instance of the community-roadmap service. The Zendesk instance must have the Help Center Integration Token endpoint feature enabled (on URL `/hc/api/v2/integration/token`). You should also go to Admin Center to create an API token for your user.

Example prerequisites to run:
```
export ZENDESK_BASEURL=https://mydomain.zendesk.com
export ZENDESK_USERNAME=john.doe@acme.com/token
export ZENDESK_PASSWORD=kjgfndkj43jk2ncl234
```

Run:
```
newman run tests/AcceptanceTests.postman_collection.json --env-var "baseUrl=$ZENDESK_BASEURL" --env-var "username=$ZENDESK_USERNAME" --env-var "password=$ZENDESK_PASSWORD"
```
or just:
```
npm run test
```

## Deployment

```
wrangler publish --env production
```
or just:
```
npm run deploy
```