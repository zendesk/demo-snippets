# Frontend for "Community Roadmap"

This folder contains the frontend for the Zendesk community roadmap project.
The frontend is built with npm and React. It uses the REST APIs of the backend to serve a roadmap view for all users, and administrative capabilities for the roadmap owners.

## Prerequisites

First, make the [backend service](../backend) work for local development.

## Development

The service can be run locally using `npm`.

Run:
```
npm start
```

## Build

Build a distributable script using

```
npm run build
```

Now upload the resulting `build/` folder to a public location so that it can be imported as a script in a Zendesk help center. For example, you can upload your `build/` folder to a Cloudflare "pages" site.
